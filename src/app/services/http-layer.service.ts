import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import 'rxjs/Rx';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { gzip } from 'pako';
import { ToasterService } from '../shared/toastr/toaster.service';
import { Config } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class HttpLayerService {
  private monitoring = {
    pendingRequestsNumber: 0,
  };
  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  public browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  public waste = {
    k: '',
    li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };

  constructor(
    private _http: HttpClient,
    private _router: Router,
    public _toastLoad: ToasterService
  ) { }
  getSessionKey() {
    const session_id = this.returnK();
    const parsed_session_id = CryptoJS.enc.Utf8.parse(session_id);
    return parsed_session_id;
  }
  returnK() {
    let k = '';
    // tslint:disable-next-line: forin
    for (const prop in this.waste) {
      k += prop;
    }
    return k;
  }

  postGzipData(url: any, payload: any, file_name: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain',
      'Content-Encoding': 'gzip',
    });
    const data: any = { payload, file_name };
    data['language'] = localStorage.getItem('lang') || 'en';
    const str = JSON.stringify(data);
    window.unescape = window.unescape || window.decodeURI;
    const utf8Data = unescape(btoa(str));
    // const utf8Data = unescape(Buffer.from(str).toString('base64'));
    const geoJsonGz: any = gzip(utf8Data);
    const gzippedBlob: any = new Blob([geoJsonGz]);
    
    return this._http.post(url, gzippedBlob, { headers })
      .pipe(catchError((error) => {
        return throwError(error);
      }))
      .pipe(timeout(300000))
      .pipe(finalize(() => { }));
  }

  decrypt(ciphertextStr) {
    const key = this.getSessionKey();
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
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedString;
  }

  delete(url: string, data: any, values?: any): Observable<any> {
    try {
      const projectDetails = this.getProjectDetails();
      data['tz'] = data.tz || ((projectDetails && projectDetails.tz) ? projectDetails.tz : this.browserTz);
      data['project_id'] = this.getProjectId(data);
      data['language'] = localStorage.getItem('lang') || 'en';
      return this._http.request('delete', url, {
        body: this.getSignedToken(data, 'application/json'),
        headers: this.httpOptions.headers,
        responseType: 'json',
      }).pipe(catchError((error) => {
        return throwError(error);
      }))
        .pipe(timeout(480000))
        .pipe(finalize(() => {
        }));
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }
  post(url: string, data: any, values?: any): Observable<any> {
    try {
      // const projectDetails = this.getProjectDetails();
      // data['tz'] = data.tz || ((projectDetails && projectDetails.tz) ? projectDetails.tz : this.browserTz);
      // data['language'] = localStorage.getItem('lang') || 'en';
      // data['project_id'] = this.getProjectId(data);
      data['tz'] = this.browserTz;
      const contentType = this.detectContentType('POST', url, data);
      return this._http.post(url, this.getSignedToken(data, contentType), contentType === 'application/json' ? this.httpOptions : values)
        .pipe(catchError((error) => {
          return throwError(error);
        }))
        .pipe(timeout(480000))
        .pipe(finalize(() => {
        }));
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }

  jsontoURLSearchParam(jsonObject) {
    const stringifiedJson = JSON.stringify(jsonObject);
    return  encodeURIComponent(stringifiedJson).toString();
  }

  get(url: string, data?: any): Observable<any> {
    try {
      this.monitoring.pendingRequestsNumber++;
      let payload: any = {tz: this.browserTz};
      if (data) {
        payload = { ...data, ...payload};
      }
      url = `${url}?params=${this.jsontoURLSearchParam(payload)}`;
      return this._http.get(url)
        .pipe(catchError((error) => {
          return throwError(error);
        }))
        .pipe(timeout(300000))
        .pipe(finalize(() => {
          this.monitoring.pendingRequestsNumber--;
        }));
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }

  getProjectId = (data: any) => {
    try {
      const projectDetails = this.getProjectDetails();
      let project_id = '';
      if (data.project_id) {
        project_id = data.project_id;
      } else {
        project_id = ((projectDetails && projectDetails.project_id) ? projectDetails.project_id : '');
      }
      return project_id || null;
    } catch (projectError) {
      console.log(projectError);
      return null;
    }
  }
  detectContentType(method, url, data) {
    const req = new HttpRequest(method, url, data);
    const contentType = req.detectContentTypeHeader();
    return contentType;
  }
  getProjectDetails = () => {
    try {
      if (localStorage.getItem('project_details')) {
        const encryptedProjectDetails = localStorage.getItem('project_details');
        let decryptedProjectDetails = this.decrypt(encryptedProjectDetails);
        decryptedProjectDetails = decryptedProjectDetails && decryptedProjectDetails !== '' ? JSON.parse(decryptedProjectDetails) : null;
        decryptedProjectDetails = (typeof decryptedProjectDetails === 'string') ? JSON.parse(decryptedProjectDetails) : decryptedProjectDetails;
        return decryptedProjectDetails;
      }
      return {};
    } catch (projectsError) {
      console.log(projectsError);
      return {};
    }
  }

  put(url: string, data: any, values?: any): Observable<any> {
    try {
      const contentType = this.detectContentType('PUT', url, data);
      return this._http.put(url, this.getSignedToken(data, contentType, url), contentType === 'application/json' ? this.httpOptions : values)
        .pipe(catchError((error) => {
          return throwError(error);
        }))
        .pipe(timeout(480000))
        .pipe(finalize(() => { }));
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }

  postFormData(url: string, data: any): Observable<any> {
    try {
      const headerOptions = {
        headers: new HttpHeaders({
          Accept: 'application/json',
        }),
      };

      const httpHeaders = new HttpHeaders();
      httpHeaders.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this._http.post(url, data, headerOptions)
        .pipe(catchError((error) => {
          return throwError(error);
        }))
        .pipe(timeout(480000))
        .pipe(finalize(() => { }));
    } catch (error) {
      console.error(error);
      return throwError(error);
    }
  }

  handleResponse(observable: Observable<any>, isBackgroundServiceCall: boolean = false): Observable<any> {
    return observable.pipe((err) => {
      return throwError(err);
    });
  }

  downloadExcel(url, data): void {
    const projectDetails = this.getProjectDetails();
    data['tz'] = data.tz || ((projectDetails && projectDetails.tz) ? projectDetails.tz : this.browserTz);
    data['project_id'] = this.getProjectId(data);
    data['language'] = localStorage.getItem('lang') || 'en';
    this._http.post(url, data, {
      responseType: 'blob',
    }).subscribe((response: Blob) => {
      const _url = window.URL.createObjectURL(response);
      window.open(_url, '_blank');
    });
  }
  
  getSignedToken = (payload: any, contentType, URL?) => {
    try {
      let vSign = false;
      if (localStorage.getItem('vSign')) {
        vSign = JSON.parse(this.decrypt(localStorage.getItem('vSign')));
      }
      if (!vSign || contentType !== 'application/json' || this.bypassSignature(URL)) {
        return payload;
      }
      const secretKey = Object.keys(this.waste).join('');
      const header = {
        alg: 'HS256',
        typ: 'JWT',
      };
      const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
      const encodedHeader = this.base64url(stringifiedHeader);
      const stringifiedData = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
      const encodedData = this.base64url(stringifiedData);
      const token = encodedHeader + '.' + encodedData;
      let signature: any = CryptoJS.HmacSHA256(token, secretKey);
      signature = this.base64url(signature);
      const signedToken = token + '.' + signature;
      return signedToken;
    } catch (e) {
      console.error(e);
    }
  }
  bypassSignature = (url: any) => {
    try {
      return Config.CONSTANTS.BYPASS_SIGNATURE_LIST.some(v => url.includes(v));
    } catch (bypassErr) {
      console.error(bypassErr);
      return false;
    }
  }

  base64url(source: any): string {
    let encodedSource = CryptoJS.enc.Base64.stringify(source);
    encodedSource = encodedSource.replace(/=+$/, '');
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');
    return encodedSource;
  }
}
