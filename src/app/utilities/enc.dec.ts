import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

export class EncDecData {
  public sessionValue: any = '';
  public waste = {
    k: '',
    li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };
  constructor() {

  }
  returnK() {
    let k = '';
    // tslint:disable-next-line: forin
    for (const prop in this.waste) {
      k += prop;
    }
    return k;
  }

  getSessionKey() {
    // const cookie = document.cookie;
    // let splitedCookie = [];
    // let session_id = '';
    // splitedCookie = cookie.split(';');
    // if (splitedCookie.length > 0) {
    //   splitedCookie.forEach((element) => {
    //     const tempList = element.split('=');
    //     if (tempList[0].trim() === 'session_id') {
    //       session_id = tempList[1];
    //     }
    //   });
    //   session_id = session_id.substring(0, 16);
    //   const parsed_session_id = CryptoJS.enc.Utf8.parse(session_id);
    //   return parsed_session_id;
    // }
    const session_id = this.returnK();
    const parsed_session_id = CryptoJS.enc.Utf8.parse(session_id);
    return parsed_session_id;
  }

    // Enc Function
  encrypt(encData) {
    const key = this.getSessionKey();
    encData = JSON.stringify(encData);
        // msgString is expected to be Utf8 encoded
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(encData, key, {
      iv,
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }

    // Dec Function
  decrypt(ciphertextStr) {
    const key = this.getSessionKey();
    // ciphertextStr = ciphertextStr.toString();
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
        // split IV and ciphertext
    const iv = ciphertext.clone();
    iv.sigBytes = 16;
    iv.clamp();
    ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
    ciphertext.sigBytes -= 16;
        // decryption
    const decrypted = CryptoJS.AES.decrypt({ ciphertext }, key, {
      iv,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
