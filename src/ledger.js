import { EventEmitter } from 'events';
import HDKey from 'hdkey';
import * as ethUtil from 'ethereumjs-util';
import * as sigUtil from 'eth-sig-util';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import LedgerEth from '@ledgerhq/hw-app-eth';
import { bufferToHex } from 'ethereumjs-util';

const pathBase = 'm';
const hdPathString = `${pathBase}/44'/60'/0'`;
const type = 'Ledger Hardware';

const BRIDGE_URL = 'https://rabbyhub.github.io/eth-ledger-bridge-keyring';

const MAX_INDEX = 1000;
const NETWORK_API_URLS = {
  ropsten: 'http://api-ropsten.etherscan.io',
  kovan: 'http://api-kovan.etherscan.io',
  rinkeby: 'https://api-rinkeby.etherscan.io',
  mainnet: 'https://api.etherscan.io',
};

class LedgerBridgeKeyring extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.accountDetails = {};
    this.bridgeUrl = null;
    this.type = type;
    this.page = 0;
    this.perPage = 5;
    this.unlockedAccount = 0;
    this.hdk = new HDKey();
    this.paths = {};
    this.iframe = null;
    this.network = 'mainnet';
    this.implementFullBIP44 = false;
    this.deserialize(opts);
    this.msgQueue = [];
    this.isWebUSB = true;
    this.transport = null;
    this.app = null;
  }

  serialize() {
    return Promise.resolve({
      hdPath: this.hdPath,
      accounts: this.accounts,
      accountDetails: this.accountDetails,
      bridgeUrl: this.bridgeUrl,
      implementFullBIP44: false,
      isWebUSB: this.isWebUSB,
    });
  }

  deserialize(opts = {}) {
    this.hdPath = opts.hdPath || hdPathString;
    this.bridgeUrl = BRIDGE_URL;
    this.accounts = opts.accounts || [];
    this.accountDetails = opts.accountDetails || {};
    this.isWebUSB = opts.isWebUSB;
    if (this.isWebUSB) {
      this.makeApp();
    }
    if (!opts.accountDetails) {
      this._migrateAccountDetails(opts);
    }

    this.implementFullBIP44 = opts.implementFullBIP44 || false;

    // Remove accounts that don't have corresponding account details
    this.accounts = this.accounts.filter((account) =>
      Object.keys(this.accountDetails).includes(
        ethUtil.toChecksumAddress(account)
      )
    );

    return Promise.resolve();
  }

  _migrateAccountDetails(opts) {
    if (this._isLedgerLiveHdPath() && opts.accountIndexes) {
      for (const account of Object.keys(opts.accountIndexes)) {
        this.accountDetails[account] = {
          bip44: true,
          hdPath: this._getPathForIndex(opts.accountIndexes[account]),
        };
      }
    }

    // try to migrate non-LedgerLive accounts too
    if (!this._isLedgerLiveHdPath()) {
      this.accounts
        .filter(
          (account) =>
            !Object.keys(this.accountDetails).includes(
              ethUtil.toChecksumAddress(account)
            )
        )
        .forEach((account) => {
          try {
            this.accountDetails[ethUtil.toChecksumAddress(account)] = {
              bip44: false,
              hdPath: this._pathFromAddress(account),
            };
          } catch (e) {
            console.log(`failed to migrate account ${account}`);
          }
        });
    }
  }

  isUnlocked() {
    return Boolean(this.hdk && this.hdk.publicKey);
  }

  setAccountToUnlock(index) {
    this.unlockedAccount = parseInt(index, 10);
  }

  setHdPath(hdPath) {
    // Reset HDKey if the path changes
    if (this.hdPath !== hdPath) {
      this.hdk = new HDKey();
    }
    this.hdPath = hdPath;
  }

  async makeApp(signing = false) {
    if (!this.app && this.isWebUSB) {
      try {
        this.transport = await TransportWebUSB.create();
        this.app = new LedgerEth(this.transport);
      } catch (e) {
        if (signing) {
          if (
            e.name === 'TransportWebUSBGestureRequired' ||
            e.name === 'TransportOpenUserCancelled'
          ) {
            return new Promise((resolve, reject) => {
              const permissionWindow = window.open(
                './index.html#/request-permission?type=ledger'
              );
              permissionWindow?.addEventListener('message', ({ data }) => {
                if (data.success) {
                  this.makeApp().then(() => {
                    resolve(null);
                  });
                } else {
                  reject(new Error('Permission Rejected'));
                }
                permissionWindow.close();
              });
            });
          }
        }
      }
    }
  }

  cleanUp() {
    this.app = null;
    if (this.transport) this.transport.close();
    this.transport = null;
  }

  async unlock(hdPath) {
    if (this.isUnlocked() && !hdPath) {
      return 'already unlocked';
    }
    const path = hdPath ? this._toLedgerPath(hdPath) : this.hdPath;
    await this.makeApp();
    const res = await this.app.getAddress(path, false, true);
    console.log('hdPath', path);
    console.log('res', res);
    const { address, publicKey, chainCode } = res;
    this.hdk.publicKey = Buffer.from(publicKey, 'hex');
    this.hdk.chainCode = Buffer.from(chainCode, 'hex');
    console.log('unlock publicKey', bufferToHex(this.hdk.publicKey))
    return address;
  }

  addAccounts(n = 1) {
    return new Promise((resolve, reject) => {
      this.unlock()
        .then(async (_) => {
          const from = this.unlockedAccount;
          const to = from + n;
          for (let i = from; i < to; i++) {
            const path = this._getPathForIndex(i);
            let address;
            if (this._isLedgerLiveHdPath()) {
              address = await this.unlock(path);
            } else {
              address = this._addressFromIndex(pathBase, i);
            }
            this.accountDetails[ethUtil.toChecksumAddress(address)] = {
              // TODO: consider renaming this property, as the current name is misleading
              // It's currently used to represent whether an account uses the Ledger Live path.
              bip44: this._isLedgerLiveHdPath(),
              hdPath: path,
            };

            if (!this.accounts.includes(address)) {
              this.accounts.push(address);
            }
            this.page = 0;
          }
          resolve(this.accounts);
        })
        .catch(reject);
    });
  }

  getFirstPage() {
    this.page = 0;
    return this.__getPage(1);
  }

  getNextPage() {
    return this.__getPage(1);
  }

  getPreviousPage() {
    return this.__getPage(-1);
  }

  getAccounts() {
    return Promise.resolve(this.accounts.slice());
  }

  removeAccount(address) {
    if (
      !this.accounts.map((a) => a.toLowerCase()).includes(address.toLowerCase())
    ) {
      throw new Error(`Address ${address} not found in this keyring`);
    }
    this.accounts = this.accounts.filter(
      (a) => a.toLowerCase() !== address.toLowerCase()
    );
    delete this.accountDetails[ethUtil.toChecksumAddress(address)];
  }

  updateTransportMethod(useLedgerLive = false) {
    return new Promise((resolve, reject) => {
      // If the iframe isn't loaded yet, let's store the desired useLedgerLive value and
      // optimistically return a successful promise
      if (!this.iframeLoaded) {
        this.delayedPromise = {
          resolve,
          reject,
          useLedgerLive,
        };
        return;
      }

      this._sendMessage(
        {
          action: 'ledger-update-transport',
          params: { useLedgerLive },
        },
        ({ success }) => {
          if (success) {
            resolve(true);
          } else {
            reject(new Error('Ledger transport could not be updated'));
          }
        }
      );
    });
  }

  signMessage(withAccount, data) {
    return this.signPersonalMessage(withAccount, data);
  }

  // For personal_sign, we need to prefix the message:
  async signPersonalMessage(withAccount, message) {
    try {
      await this.makeApp(true);
      const hdPath = await this.unlockAccountByAddress(withAccount);
      const res = await this.app.signPersonalMessage(
        hdPath,
        ethUtil.stripHexPrefix(message)
      );
      let v = res.v - 27;
      v = v.toString(16);
      if (v.length < 2) {
        v = `0${v}`;
      }
      const signature = `0x${res.r}${res.s}${v}`;
      const addressSignedWith = sigUtil.recoverPersonalSignature({
        data: message,
        sig: signature,
      });
      if (
        ethUtil.toChecksumAddress(addressSignedWith) !==
        ethUtil.toChecksumAddress(withAccount)
      ) {
        throw new Error(
          'Ledger: The signature doesnt match the right address'
        );
      }
      return signature;
    } catch (e) {
      throw new Error(
        e.toString() || 'Ledger: Unknown error while signing message'
      );
    } finally {
      this.cleanUp();
    }
  }

  async unlockAccountByAddress(address) {
    const checksummedAddress = ethUtil.toChecksumAddress(address);
    if (!Object.keys(this.accountDetails).includes(checksummedAddress)) {
      throw new Error(
        `Ledger: Account for address '${checksummedAddress}' not found`
      );
    }
    const { hdPath } = this.accountDetails[checksummedAddress];
    const unlockedAddress = await this.unlock(hdPath);

    // unlock resolves to the address for the given hdPath as reported by the ledger device
    // if that address is not the requested address, then this account belongs to a different device or seed
    if (unlockedAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(
        `Ledger: Account ${address} does not belong to the connected device`
      );
    }
    return hdPath;
  }

  async signTypedData(withAccount, data, options = {}) {
    const isV4 = options.version === 'V4';
    if (!isV4) {
      throw new Error(
        'Ledger: Only version 4 of typed data signing is supported'
      );
    }

    const {
      domain,
      types,
      primaryType,
      message,
    } = sigUtil.TypedDataUtils.sanitizeData(data);
    const domainSeparatorHex = sigUtil.TypedDataUtils.hashStruct(
      'EIP712Domain',
      domain,
      types,
      isV4
    ).toString('hex');
    const hashStructMessageHex = sigUtil.TypedDataUtils.hashStruct(
      primaryType,
      message,
      types,
      isV4
    ).toString('hex');

    const hdPath = await this.unlockAccountByAddress(withAccount);
    if (this.isWebUSB) {
      try {
        await this.makeApp(true);
        const res = await this.app.signEIP712HashedMessage(
          hdPath,
          domainSeparatorHex,
          hashStructMessageHex
        );
        let v = res.v - 27;
        v = v.toString(16);
        if (v.length < 2) {
          v = `0${v}`;
        }
        const signature = `0x${res.r}${res.s}${v}`;
        const addressSignedWith = sigUtil.recoverTypedSignature_v4({
          data,
          sig: signature,
        });
        if (
          ethUtil.toChecksumAddress(addressSignedWith) !==
          ethUtil.toChecksumAddress(withAccount)
        ) {
          throw new Error(
            'Ledger: The signature doesnt match the right address'
          );
        }
        return signature;
      } catch (e) {
        throw new Error(
          e.toString() || 'Ledger: Unknown error while signing message'
        );
      } finally {
        this.cleanUp();
      }
    } else {
      const { success, payload } = await new Promise((resolve) => {
        this._sendMessage(
          {
            action: 'ledger-sign-typed-data',
            params: {
              hdPath,
              domainSeparatorHex,
              hashStructMessageHex,
            },
          },
          (result) => resolve(result)
        );
      });

      if (success) {
        let v = payload.v - 27;
        v = v.toString(16);
        if (v.length < 2) {
          v = `0${v}`;
        }
        const signature = `0x${payload.r}${payload.s}${v}`;
        const addressSignedWith = sigUtil.recoverTypedSignature_v4({
          data,
          sig: signature,
        });
        if (
          ethUtil.toChecksumAddress(addressSignedWith) !==
          ethUtil.toChecksumAddress(withAccount)
        ) {
          throw new Error(
            'Ledger: The signature doesnt match the right address'
          );
        }
        return signature;
      }
      throw new Error(
        payload.error || 'Ledger: Unknown error while signing message'
      );
    }
  }

  exportAccount() {
    throw new Error('Not supported on this device');
  }

  forgetDevice() {
    this.accounts = [];
    this.page = 0;
    this.unlockedAccount = 0;
    this.paths = {};
    this.accountDetails = {};
    this.hdk = new HDKey();
  }

  restart() {
    if (this.iframe) {
      this.iframeLoaded = false;
      this.iframe.remove();
    }
    this._setupIframe();
  }

  useWebUSB(value) {
    this.isWebUSB = value;
  }

  /* PRIVATE METHODS */

  _setupIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.bridgeUrl;
    this.iframe.onload = async () => {
      // If the ledger live preference was set before the iframe is loaded,
      // set it after the iframe has loaded
      this.iframeLoaded = true;
      if (this.delayedPromise) {
        try {
          const result = await this.updateTransportMethod(
            this.delayedPromise.useLedgerLive
          );
          this.delayedPromise.resolve(result);
        } catch (e) {
          this.delayedPromise.reject(e);
        } finally {
          delete this.delayedPromise;
        }
      }
      if (this.msgQueue.length > 0) {
        this.msgQueue.forEach((fn) => fn());
      }
    };
    document.body.appendChild(this.iframe);
  }

  _getOrigin() {
    const tmp = this.bridgeUrl.split('/');
    tmp.splice(-1, 1);
    return tmp.join('/');
  }

  _sendMessage(msg, cb) {
    msg.target = 'LEDGER-IFRAME';
    if (!this.iframeLoaded) {
      this.msgQueue.push(() => {
        this.iframe?.contentWindow?.postMessage(msg, '*');
      });
    } else {
      this.iframe?.contentWindow?.postMessage(msg, '*');
    }
    const eventListener = ({ origin, data }) => {
      if (origin !== this._getOrigin()) {
        return false;
      }

      if (data && data.action && data.action === `${msg.action}-reply` && cb) {
        cb(data);
        return undefined;
      }

      window.removeEventListener('message', eventListener);
      return undefined;
    };
    window.addEventListener('message', eventListener);
  }

  async __getPage(increment) {
    this.page += increment;

    if (this.page <= 0) {
      this.page = 1;
    }
    const from = (this.page - 1) * this.perPage;
    const to = from + this.perPage;

    await this.unlock();
    let accounts;
    if (this._isLedgerLiveHdPath()) {
      // TODO: why webusb have to use bip44?
      accounts = await this._getAccountsBIP44(from, to);
    } else {
      accounts = this._getAccountsLegacy(from, to);
    }
    return accounts;
  }

  async _getAccountsBIP44(from, to) {
    const accounts = [];

    for (let i = from; i < to; i++) {
      const path = this._getPathForIndex(i);
      const address = await this.unlock(path);
      const valid = this.implementFullBIP44
        ? await this._hasPreviousTransactions(address)
        : true;
      accounts.push({
        address,
        balance: null,
        index: i,
      });
      // PER BIP44
      // "Software should prevent a creation of an account if
      // a previous account does not have a transaction history
      // (meaning none of its addresses have been used before)."
      if (!valid) {
        break;
      }
    }
    return accounts;
  }

  _getAccountsLegacy(from, to) {
    const accounts = [];

    for (let i = from; i < to; i++) {
      const address = this._addressFromIndex(pathBase, i);
      accounts.push({
        address,
        balance: null,
        index: i,
      });
      this.paths[ethUtil.toChecksumAddress(address)] = i;
    }
    return accounts;
  }

  _padLeftEven(hex) {
    return hex.length % 2 === 0 ? hex : `0${hex}`;
  }

  _normalize(buf) {
    return this._padLeftEven(ethUtil.bufferToHex(buf).toLowerCase());
  }

  // eslint-disable-next-line no-shadow
  _addressFromIndex(pathBase, i) {
    console.log('generate via publicKey:', ethUtil.bufferToHex(this.hdk.publicKey));
    const dkey = this.hdk.derive(`${pathBase}/${i}`);
    const address = ethUtil
      .publicToAddress(dkey.publicKey, true)
      .toString('hex');
    return ethUtil.toChecksumAddress(`0x${address}`);
  }

  _pathFromAddress(address) {
    const checksummedAddress = ethUtil.toChecksumAddress(address);
    let index = this.paths[checksummedAddress];
    if (typeof index === 'undefined') {
      for (let i = 0; i < MAX_INDEX; i++) {
        if (checksummedAddress === this._addressFromIndex(pathBase, i)) {
          index = i;
          break;
        }
      }
    }

    if (typeof index === 'undefined') {
      throw new Error('Unknown address');
    }
    return this._getPathForIndex(index);
  }

  _toAscii(hex) {
    let str = '';
    let i = 0;
    const l = hex.length;
    if (hex.substring(0, 2) === '0x') {
      i = 2;
    }
    for (; i < l; i += 2) {
      const code = parseInt(hex.substr(i, 2), 16);
      str += String.fromCharCode(code);
    }

    return str;
  }

  _getPathForIndex(index) {
    // Check if the path is BIP 44 (Ledger Live)
    return this._isLedgerLiveHdPath()
      ? `m/44'/60'/${index}'/0/0`
      : `${this.hdPath}/${index}`;
  }

  _isLedgerLiveHdPath() {
    return this.hdPath === "m/44'/60'/0'/0/0";
  }

  _toLedgerPath(path) {
    return path.toString().replace('m/', '');
  }

  async _hasPreviousTransactions(address) {
    const apiUrl = this._getApiUrl();
    const response = await window.fetch(
      `${apiUrl}/api?module=account&action=txlist&address=${address}&tag=latest&page=1&offset=1`
    );
    const parsedResponse = await response.json();
    if (parsedResponse.status !== '0' && parsedResponse.result.length > 0) {
      return true;
    }
    return false;
  }

  _getApiUrl() {
    return NETWORK_API_URLS[this.network] || NETWORK_API_URLS.mainnet;
  }
}

LedgerBridgeKeyring.type = type;
export default LedgerBridgeKeyring;
