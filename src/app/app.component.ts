import { Component } from '@angular/core';
import { AppService } from './services/app.service';
import { UtilityFunctions } from './utilities/utility-func';
import * as CryptoJS from 'crypto-js';
import { AuthService } from './guards/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private appService: AppService, private util: UtilityFunctions,public _auth : AuthService) {
    if (window.location.href.includes('/login')) {
      this.getEncToken();
    }
    let themeStyle: any = null;
    if (_auth.getLocalStorage('theme')) {
      themeStyle = JSON.parse(_auth.getLocalStorage('theme')) || null;
    }
    if (themeStyle) {
      if (themeStyle?.theme ) {
        document.body.classList.remove('default-skin');
      }
      document.body.classList.add(themeStyle?.theme || 'default-skin');
    }
  }

  getEncToken() {
    const self = this;
    const promise = new Promise((resolve, reject) => {
      self.appService.getTokenInfo('?t=constants').subscribe((tokenInfo: any) => {
        if (tokenInfo && tokenInfo['status'] === 'success' && tokenInfo.unique_key && tokenInfo.c_key) {
          const encKey = tokenInfo.unique_key.slice(-8) + tokenInfo.c_key.slice(-8);
          const keyToEnc = Object.keys(this.util.waste).join('');
          const iv = CryptoJS.lib.WordArray.random(16);
          const encrypted = CryptoJS.AES.encrypt(keyToEnc, CryptoJS.enc.Utf8.parse(encKey), { iv });
          const finalKey = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
          // localStorage.setItem('vSign', self.util.encrypt(tokenInfo.verify_signature || false));
          resolve(finalKey + '_' + tokenInfo.c_key.slice(-8));
        } else {
          resolve(null);
        }
      }, (error) => {
        console.error(error);
        resolve(undefined);
      });
    });
    promise.catch((error) => {
      console.error(error);
    });
    return promise;
  }
}
