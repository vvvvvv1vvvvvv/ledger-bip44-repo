import { useState } from 'react';
import * as ethUtil from 'ethereumjs-util';
import { stringToHex } from 'web3-utils';
import Ledger from './ledger';

const BIP44_PATH = "m/44'/60'/0'/0";
const keyring = new Ledger();

function normalizeAddress(input){
  if (!input) {
    return '';
  }

  if (typeof input === 'number') {
    const buffer = ethUtil.toBuffer(input);
    input = ethUtil.bufferToHex(buffer);
  }

  if (typeof input !== 'string') {
    let msg = 'eth-sig-util.normalize() requires hex string or integer input.';
    msg += ` received ${typeof input}: ${input}`;
    throw new Error(msg);
  }

  return ethUtil.addHexPrefix(input);
}

function App() {
  const [addresses, setAddresses] = useState([]);
  
  const getAddress = async () => {
    await keyring.setHdPath(BIP44_PATH);
    await keyring.unlock();
    const addresses = await keyring.getFirstPage();
    setAddresses(addresses);
    await keyring.setAccountToUnlock(0);
    keyring.addAccounts(1);
  };

  const sign = async () => {
    const currentAddress = addresses[0];
    await keyring.signPersonalMessage(normalizeAddress(currentAddress.address), stringToHex('test'));
    alert('sign success');
  }

  return (
    <div className="App">
      <div>
        <button onClick={getAddress}>Get Addresses</button>
        <button onClick={sign}>Sign Message</button>
      </div>
      <ul>
        {
          addresses.map(item => (<li>{item.address}</li>))
        }
      </ul>
      
    </div>
  );
}

export default App;
