(this["webpackJsonpledger-bip44-repo"]=this["webpackJsonpledger-bip44-repo"]||[]).push([[0],{211:function(e,t,n){"use strict";(function(e){var r=n(2),s=n.n(r),a=n(21),i=n(3),c=n(4),o=n(6),u=n(5),h=n(24),d=n(87),l=n.n(d),p=n(13),f=n(45),g=n(212),v=n(215),k="m",m="".concat(k,"/44'/60'/0'"),b="Ledger Hardware",x="https://rabbyhub.github.io/eth-ledger-bridge-keyring",y={ropsten:"http://api-ropsten.etherscan.io",kovan:"http://api-kovan.etherscan.io",rinkeby:"https://api-rinkeby.etherscan.io",mainnet:"https://api.etherscan.io"},w=function(t){Object(o.a)(r,t);var n=Object(u.a)(r);function r(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return Object(i.a)(this,r),(e=n.call(this)).accountDetails={},e.bridgeUrl=null,e.type=b,e.page=0,e.perPage=5,e.unlockedAccount=0,e.hdk=new l.a,e.paths={},e.iframe=null,e.network="mainnet",e.implementFullBIP44=!1,e.deserialize(t),e.msgQueue=[],e.isWebUSB=!0,e.transport=null,e.app=null,e}return Object(c.a)(r,[{key:"serialize",value:function(){return Promise.resolve({hdPath:this.hdPath,accounts:this.accounts,accountDetails:this.accountDetails,bridgeUrl:this.bridgeUrl,implementFullBIP44:!1,isWebUSB:this.isWebUSB})}},{key:"deserialize",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this.hdPath=t.hdPath||m,this.bridgeUrl=x,this.accounts=t.accounts||[],this.accountDetails=t.accountDetails||{},this.isWebUSB=t.isWebUSB,this.isWebUSB&&this.makeApp(),t.accountDetails||this._migrateAccountDetails(t),this.implementFullBIP44=t.implementFullBIP44||!1,this.accounts=this.accounts.filter((function(t){return Object.keys(e.accountDetails).includes(p.toChecksumAddress(t))})),Promise.resolve()}},{key:"_migrateAccountDetails",value:function(e){var t=this;if(this._isLedgerLiveHdPath()&&e.accountIndexes)for(var n=0,r=Object.keys(e.accountIndexes);n<r.length;n++){var s=r[n];this.accountDetails[s]={bip44:!0,hdPath:this._getPathForIndex(e.accountIndexes[s])}}this._isLedgerLiveHdPath()||this.accounts.filter((function(e){return!Object.keys(t.accountDetails).includes(p.toChecksumAddress(e))})).forEach((function(e){try{t.accountDetails[p.toChecksumAddress(e)]={bip44:!1,hdPath:t._pathFromAddress(e)}}catch(n){console.log("failed to migrate account ".concat(e))}}))}},{key:"isUnlocked",value:function(){return Boolean(this.hdk&&this.hdk.publicKey)}},{key:"setAccountToUnlock",value:function(e){this.unlockedAccount=parseInt(e,10)}},{key:"setHdPath",value:function(e){this.hdPath!==e&&(this.hdk=new l.a),this.hdPath=e}},{key:"makeApp",value:function(){var e=Object(a.a)(s.a.mark((function e(){var t,n=this,r=arguments;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(t=r.length>0&&void 0!==r[0]&&r[0],this.app||!this.isWebUSB){e.next=14;break}return e.prev=2,e.next=5,g.a.create();case 5:this.transport=e.sent,this.app=new v.a(this.transport),e.next=14;break;case 9:if(e.prev=9,e.t0=e.catch(2),!t){e.next=14;break}if("TransportWebUSBGestureRequired"!==e.t0.name&&"TransportOpenUserCancelled"!==e.t0.name){e.next=14;break}return e.abrupt("return",new Promise((function(e,t){var r=window.open("./index.html#/request-permission?type=ledger");null===r||void 0===r||r.addEventListener("message",(function(s){s.data.success?n.makeApp().then((function(){e(null)})):t(new Error("Permission Rejected")),r.close()}))})));case 14:case"end":return e.stop()}}),e,this,[[2,9]])})));return function(){return e.apply(this,arguments)}}()},{key:"cleanUp",value:function(){this.app=null,this.transport&&this.transport.close(),this.transport=null}},{key:"unlock",value:function(){var t=Object(a.a)(s.a.mark((function t(n){var r,a,i,c,o;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!this.isUnlocked()||n){t.next=2;break}return t.abrupt("return","already unlocked");case 2:return r=n?this._toLedgerPath(n):this.hdPath,t.next=5,this.makeApp();case 5:return t.next=7,this.app.getAddress(r,!1,!0);case 7:return a=t.sent,console.log("hdPath",r),console.log("res",a),i=a.address,c=a.publicKey,o=a.chainCode,this.hdk.publicKey=e.from(c,"hex"),this.hdk.chainCode=e.from(o,"hex"),console.log("unlock publicKey",Object(p.bufferToHex)(this.hdk.publicKey)),t.abrupt("return",i);case 15:case"end":return t.stop()}}),t,this)})));return function(e){return t.apply(this,arguments)}}()},{key:"addAccounts",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return new Promise((function(n,r){e.unlock().then(function(){var r=Object(a.a)(s.a.mark((function r(a){var i,c,o,u,h;return s.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:i=e.unlockedAccount,c=i+t,o=i;case 3:if(!(o<c)){r.next=19;break}if(u=e._getPathForIndex(o),h=void 0,!e._isLedgerLiveHdPath()){r.next=12;break}return r.next=9,e.unlock(u);case 9:h=r.sent,r.next=13;break;case 12:h=e._addressFromIndex(k,o);case 13:e.accountDetails[p.toChecksumAddress(h)]={bip44:e._isLedgerLiveHdPath(),hdPath:u},e.accounts.includes(h)||e.accounts.push(h),e.page=0;case 16:o++,r.next=3;break;case 19:n(e.accounts);case 20:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}()).catch(r)}))}},{key:"getFirstPage",value:function(){return this.page=0,this.__getPage(1)}},{key:"getNextPage",value:function(){return this.__getPage(1)}},{key:"getPreviousPage",value:function(){return this.__getPage(-1)}},{key:"getAccounts",value:function(){return Promise.resolve(this.accounts.slice())}},{key:"removeAccount",value:function(e){if(!this.accounts.map((function(e){return e.toLowerCase()})).includes(e.toLowerCase()))throw new Error("Address ".concat(e," not found in this keyring"));this.accounts=this.accounts.filter((function(t){return t.toLowerCase()!==e.toLowerCase()})),delete this.accountDetails[p.toChecksumAddress(e)]}},{key:"updateTransportMethod",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return new Promise((function(n,r){e.iframeLoaded?e._sendMessage({action:"ledger-update-transport",params:{useLedgerLive:t}},(function(e){e.success?n(!0):r(new Error("Ledger transport could not be updated"))})):e.delayedPromise={resolve:n,reject:r,useLedgerLive:t}}))}},{key:"signMessage",value:function(e,t){return this.signPersonalMessage(e,t)}},{key:"signPersonalMessage",value:function(){var e=Object(a.a)(s.a.mark((function e(t,n){var r,a,i,c,o;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,this.makeApp(!0);case 3:return e.next=5,this.unlockAccountByAddress(t);case 5:return r=e.sent,e.next=8,this.app.signPersonalMessage(r,p.stripHexPrefix(n));case 8:if(a=e.sent,(i=(i=a.v-27).toString(16)).length<2&&(i="0".concat(i)),c="0x".concat(a.r).concat(a.s).concat(i),o=f.recoverPersonalSignature({data:n,sig:c}),p.toChecksumAddress(o)===p.toChecksumAddress(t)){e.next=16;break}throw new Error("Ledger: The signature doesnt match the right address");case 16:return e.abrupt("return",c);case 19:throw e.prev=19,e.t0=e.catch(0),new Error(e.t0.toString()||"Ledger: Unknown error while signing message");case 22:return e.prev=22,this.cleanUp(),e.finish(22);case 25:case"end":return e.stop()}}),e,this,[[0,19,22,25]])})));return function(t,n){return e.apply(this,arguments)}}()},{key:"unlockAccountByAddress",value:function(){var e=Object(a.a)(s.a.mark((function e(t){var n,r;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=p.toChecksumAddress(t),Object.keys(this.accountDetails).includes(n)){e.next=3;break}throw new Error("Ledger: Account for address '".concat(n,"' not found"));case 3:return r=this.accountDetails[n].hdPath,e.next=6,this.unlock(r);case 6:if(e.sent.toLowerCase()===t.toLowerCase()){e.next=9;break}throw new Error("Ledger: Account ".concat(t," does not belong to the connected device"));case 9:return e.abrupt("return",r);case 10:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"signTypedData",value:function(){var e=Object(a.a)(s.a.mark((function e(t,n){var r,a,i,c,o,u,h,d,l,g,v,k,m,b,x,y,w,P,A,L,_=this,j=arguments;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(r=j.length>2&&void 0!==j[2]?j[2]:{},a="V4"===r.version){e.next=4;break}throw new Error("Ledger: Only version 4 of typed data signing is supported");case 4:return i=f.TypedDataUtils.sanitizeData(n),c=i.domain,o=i.types,u=i.primaryType,h=i.message,d=f.TypedDataUtils.hashStruct("EIP712Domain",c,o,a).toString("hex"),l=f.TypedDataUtils.hashStruct(u,h,o,a).toString("hex"),e.next=9,this.unlockAccountByAddress(t);case 9:if(g=e.sent,!this.isWebUSB){e.next=35;break}return e.prev=11,e.next=14,this.makeApp(!0);case 14:return e.next=16,this.app.signEIP712HashedMessage(g,d,l);case 16:if(v=e.sent,(k=(k=v.v-27).toString(16)).length<2&&(k="0".concat(k)),m="0x".concat(v.r).concat(v.s).concat(k),b=f.recoverTypedSignature_v4({data:n,sig:m}),p.toChecksumAddress(b)===p.toChecksumAddress(t)){e.next=24;break}throw new Error("Ledger: The signature doesnt match the right address");case 24:return e.abrupt("return",m);case 27:throw e.prev=27,e.t0=e.catch(11),new Error(e.t0.toString()||"Ledger: Unknown error while signing message");case 30:return e.prev=30,this.cleanUp(),e.finish(30);case 33:e.next=50;break;case 35:return e.next=37,new Promise((function(e){_._sendMessage({action:"ledger-sign-typed-data",params:{hdPath:g,domainSeparatorHex:d,hashStructMessageHex:l}},(function(t){return e(t)}))}));case 37:if(x=e.sent,y=x.success,w=x.payload,!y){e.next=49;break}if((P=(P=w.v-27).toString(16)).length<2&&(P="0".concat(P)),A="0x".concat(w.r).concat(w.s).concat(P),L=f.recoverTypedSignature_v4({data:n,sig:A}),p.toChecksumAddress(L)===p.toChecksumAddress(t)){e.next=48;break}throw new Error("Ledger: The signature doesnt match the right address");case 48:return e.abrupt("return",A);case 49:throw new Error(w.error||"Ledger: Unknown error while signing message");case 50:case"end":return e.stop()}}),e,this,[[11,27,30,33]])})));return function(t,n){return e.apply(this,arguments)}}()},{key:"exportAccount",value:function(){throw new Error("Not supported on this device")}},{key:"forgetDevice",value:function(){this.accounts=[],this.page=0,this.unlockedAccount=0,this.paths={},this.accountDetails={},this.hdk=new l.a}},{key:"restart",value:function(){this.iframe&&(this.iframeLoaded=!1,this.iframe.remove()),this._setupIframe()}},{key:"useWebUSB",value:function(e){this.isWebUSB=e}},{key:"_setupIframe",value:function(){var e=this;this.iframe=document.createElement("iframe"),this.iframe.src=this.bridgeUrl,this.iframe.onload=Object(a.a)(s.a.mark((function t(){var n;return s.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(e.iframeLoaded=!0,!e.delayedPromise){t.next=15;break}return t.prev=2,t.next=5,e.updateTransportMethod(e.delayedPromise.useLedgerLive);case 5:n=t.sent,e.delayedPromise.resolve(n),t.next=12;break;case 9:t.prev=9,t.t0=t.catch(2),e.delayedPromise.reject(t.t0);case 12:return t.prev=12,delete e.delayedPromise,t.finish(12);case 15:e.msgQueue.length>0&&e.msgQueue.forEach((function(e){return e()}));case 16:case"end":return t.stop()}}),t,null,[[2,9,12,15]])}))),document.body.appendChild(this.iframe)}},{key:"_getOrigin",value:function(){var e=this.bridgeUrl.split("/");return e.splice(-1,1),e.join("/")}},{key:"_sendMessage",value:function(e,t){var n,r,s=this;(e.target="LEDGER-IFRAME",this.iframeLoaded)?null===(n=this.iframe)||void 0===n||null===(r=n.contentWindow)||void 0===r||r.postMessage(e,"*"):this.msgQueue.push((function(){var t,n;null===(t=s.iframe)||void 0===t||null===(n=t.contentWindow)||void 0===n||n.postMessage(e,"*")}));window.addEventListener("message",(function n(r){var a=r.origin,i=r.data;if(a!==s._getOrigin())return!1;i&&i.action&&i.action==="".concat(e.action,"-reply")&&t?t(i):window.removeEventListener("message",n)}))}},{key:"__getPage",value:function(){var e=Object(a.a)(s.a.mark((function e(t){var n,r,a;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return this.page+=t,this.page<=0&&(this.page=1),n=(this.page-1)*this.perPage,r=n+this.perPage,e.next=6,this.unlock();case 6:if(!this._isLedgerLiveHdPath()){e.next=12;break}return e.next=9,this._getAccountsBIP44(n,r);case 9:a=e.sent,e.next=13;break;case 12:a=this._getAccountsLegacy(n,r);case 13:return e.abrupt("return",a);case 14:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"_getAccountsBIP44",value:function(){var e=Object(a.a)(s.a.mark((function e(t,n){var r,a,i,c,o;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:r=[],a=t;case 2:if(!(a<n)){e.next=21;break}return i=this._getPathForIndex(a),e.next=6,this.unlock(i);case 6:if(c=e.sent,!this.implementFullBIP44){e.next=13;break}return e.next=10,this._hasPreviousTransactions(c);case 10:e.t0=e.sent,e.next=14;break;case 13:e.t0=!0;case 14:if(o=e.t0,r.push({address:c,balance:null,index:a}),o){e.next=18;break}return e.abrupt("break",21);case 18:a++,e.next=2;break;case 21:return e.abrupt("return",r);case 22:case"end":return e.stop()}}),e,this)})));return function(t,n){return e.apply(this,arguments)}}()},{key:"_getAccountsLegacy",value:function(e,t){for(var n=[],r=e;r<t;r++){var s=this._addressFromIndex(k,r);n.push({address:s,balance:null,index:r}),this.paths[p.toChecksumAddress(s)]=r}return n}},{key:"_padLeftEven",value:function(e){return e.length%2===0?e:"0".concat(e)}},{key:"_normalize",value:function(e){return this._padLeftEven(p.bufferToHex(e).toLowerCase())}},{key:"_addressFromIndex",value:function(e,t){console.log("generate via publicKey:",p.bufferToHex(this.hdk.publicKey));var n=this.hdk.derive("".concat(e,"/").concat(t)),r=p.publicToAddress(n.publicKey,!0).toString("hex");return p.toChecksumAddress("0x".concat(r))}},{key:"_pathFromAddress",value:function(e){var t=p.toChecksumAddress(e),n=this.paths[t];if("undefined"===typeof n)for(var r=0;r<1e3;r++)if(t===this._addressFromIndex(k,r)){n=r;break}if("undefined"===typeof n)throw new Error("Unknown address");return this._getPathForIndex(n)}},{key:"_toAscii",value:function(e){var t="",n=0,r=e.length;for("0x"===e.substring(0,2)&&(n=2);n<r;n+=2){var s=parseInt(e.substr(n,2),16);t+=String.fromCharCode(s)}return t}},{key:"_getPathForIndex",value:function(e){return this._isLedgerLiveHdPath()?"m/44'/60'/".concat(e,"'/0/0"):"".concat(this.hdPath,"/").concat(e)}},{key:"_isLedgerLiveHdPath",value:function(){return"m/44'/60'/0'/0/0"===this.hdPath}},{key:"_toLedgerPath",value:function(e){return e.toString().replace("m/","")}},{key:"_hasPreviousTransactions",value:function(){var e=Object(a.a)(s.a.mark((function e(t){var n,r,a;return s.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=this._getApiUrl(),e.next=3,window.fetch("".concat(n,"/api?module=account&action=txlist&address=").concat(t,"&tag=latest&page=1&offset=1"));case 3:return r=e.sent,e.next=6,r.json();case 6:if(!("0"!==(a=e.sent).status&&a.result.length>0)){e.next=9;break}return e.abrupt("return",!0);case 9:return e.abrupt("return",!1);case 10:case"end":return e.stop()}}),e,this)})));return function(t){return e.apply(this,arguments)}}()},{key:"_getApiUrl",value:function(){return y[this.network]||y.mainnet}}]),r}(h.EventEmitter);w.type=b,t.a=w}).call(this,n(8).Buffer)},230:function(e,t,n){},234:function(e,t){},239:function(e,t){},243:function(e,t){},244:function(e,t){},273:function(e,t){},275:function(e,t){},284:function(e,t){},286:function(e,t){},296:function(e,t){},298:function(e,t){},342:function(e,t){},344:function(e,t){},351:function(e,t){},352:function(e,t){},378:function(e,t){},384:function(e,t){},391:function(e,t){},442:function(e,t,n){"use strict";n.r(t);var r=n(58),s=n.n(r),a=n(209),i=n.n(a),c=(n(230),n(2)),o=n.n(c),u=n(21),h=n(223),d=n(13),l=n(210),p=n(211),f=n(31),g=new p.a;function v(e){if(!e)return"";if("number"===typeof e){var t=d.toBuffer(e);e=d.bufferToHex(t)}if("string"!==typeof e){var n="eth-sig-util.normalize() requires hex string or integer input.";throw n+=" received ".concat(typeof e,": ").concat(e),new Error(n)}return d.addHexPrefix(e)}var k=function(){var e=Object(r.useState)([]),t=Object(h.a)(e,2),n=t[0],s=t[1],a=function(){var e=Object(u.a)(o.a.mark((function e(){var t;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,g.setHdPath("m/44'/60'/0'/0");case 2:return e.next=4,g.unlock();case 4:return e.next=6,g.getFirstPage();case 6:return t=e.sent,s(t),e.next=10,g.setAccountToUnlock(0);case 10:g.addAccounts(1);case 11:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),i=function(){var e=Object(u.a)(o.a.mark((function e(){var t;return o.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=n[0],e.next=3,g.signPersonalMessage(v(t.address),Object(l.stringToHex)("test"));case 3:alert("sign success");case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(f.jsxs)("div",{className:"App",children:[Object(f.jsxs)("div",{children:[Object(f.jsx)("button",{onClick:a,children:"Get Addresses"}),Object(f.jsx)("button",{onClick:i,children:"Sign Message"})]}),Object(f.jsx)("ul",{children:n.map((function(e){return Object(f.jsx)("li",{children:e.address})}))})]})};i.a.render(Object(f.jsx)(s.a.StrictMode,{children:Object(f.jsx)(k,{})}),document.getElementById("root"))}},[[442,1,2]]]);
//# sourceMappingURL=main.c2a04b0b.chunk.js.map