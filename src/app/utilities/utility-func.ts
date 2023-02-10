import * as CryptoJS from 'crypto-js';
import { AppService } from './../services/app.service';
import { ToasterService } from './../shared/toastr/toaster.service';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as bcrypt from 'bcryptjs';
import { color } from 'echarts';
@Injectable()
export class UtilityFunctions {
  // tslint:disable:component-selector no-parameter-reassignment align no-increment-decrement no-input-rename no-output-rename prefer-template max-line-length ter-indent

  constructor(private appservice: AppService, private _toastLoad: ToasterService, private datePipe: DatePipe) { }
  public swr: ServiceWorkerRegistration;
  sessionValue: any = '';
  public tableActionsMapping = {
    edit: 'fa-pencil',
    flow: 'elm-flow-chart',
    delete: 'fa-trash',
    clone: 'fa-clone',
    download: 'fa-arrow-circle-down',
    print: 'fa-print',
    envelop: 'fa-envelope',
    view: 'fa-tv',
    file: 'fa-file-text-o',
    associate: 'fa-handshake-o',
    fetchEvents: 'icon-icons8-internet-connection-100',
  };
  public waste = {
    k: '',
    li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };

  public waste1 = {
    K: '',
    Li: '',
    Lens: '',
    KLiL: '',
    e: '',
    nsK: '',
    L: '',
  };

  public uuid = {
    'QVY': 1,
    '1b': null,
    'W': 'a',
    'dMQ0': '',
    'Zxc': undefined,
  };
  returnK() {
    let k = '';
    // tslint:disable-next-line: forin
    for (const prop in this.waste) {
      k += prop;
    }
    return k;
  }
  generateUUID() {
    let k = '';
    // tslint:disable-next-line: forin
    for (const prop in this.uuid) {
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
  getFirstThreeCharacters(username): any {
    try {
      let three = '';
      const len = username.length;
      if (len <= 3) {
        three = username + ('a'.repeat(3 - len));
      } else {
        three = username.slice(0, 3);
      }
      return three;
    } catch (e) {
      console.log(e);
    }
  }
  encryptPasswordWithUsername(encData, username, token?) {
    try {
      let tokenFromUI = '';
      if (token) {
        tokenFromUI = this.getFirstThreeCharacters(username) + token;
      } else {
        tokenFromUI = this.getFirstThreeCharacters(username) + this.generateUUID();
      }
      // tokenFromUI = this.getFirstThreeCharacters(username) + this.generateUUID();
      const key = CryptoJS.enc.Utf8.parse(tokenFromUI);
      // encData = JSON.stringify(encData);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(encData, key, {
        iv,
      });
      return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error(error);
    }
  }
  encryptPassword(encData) {
    try {
      const tokenFromUI = Object.keys(this.waste1).join();
      const _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
      const _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(encData), _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return encrypted.toString();
    } catch (error) {
      console.error(error);
    }
  }
  decryptPassword(ciphertextStr) {
    try {
      const tokenFromUI = Object.keys(this.waste1).join();
      const _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
      const _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);
      const decrypted = CryptoJS.AES.decrypt(
        ciphertextStr, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }).toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(error);
      return ciphertextStr;
    }
  }
  /**
   * Method to remove the counters which are used for Validation of the Nested Forms
   * @param counter_key Refers to the key to be removed
   * @param counter_array Refers to the Array To Iterate
   */
  removeValidationCounters(counter_key, counter_array) {
    try {
      if (!counter_key || !counter_array) {
        return;
      }
      const arrayToIterate = JSON.parse(JSON.stringify(counter_array));
      arrayToIterate.forEach((eachItem) => {
        delete eachItem[counter_key];
      });
      return arrayToIterate;
    } catch (error) {
      console.error(error);
    }
  }

  exportTable(reportName, tableData, reportDetails = '') {
    const uri = 'data:text/csv;charset=utf-8,' + escape(reportDetails + this.tableContentInString(',', tableData));
    const link = document.createElement('a');
    link.href = uri;
    link.setAttribute('style', 'visibility:hidden');
    link.download = reportName + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  tableContentInString(delimiter, tableData) {
    let CSV = '';
    tableData.headerContent.forEach((element, index) => {
      let header = (element['label']);
      header = (typeof header !== 'string') ? JSON.stringify(header) : header;
      CSV += (header || 'NA').replace(/,|\n/g, ' ') +
        (index === tableData.headerContent.length - 1 ? '' : delimiter);
    });
    CSV += '\n';
    tableData.bodyContent.forEach(row => {
      tableData.headerContent.forEach((col, index) => {
        const headerKey = col.hasOwnProperty('is_value_dependent') ? (col['is_value_dependent'] ? 'value' : 'key') : '';
        let value = headerKey ? row[col[headerKey]] : row[col['key'] || col['value']];
        value = [undefined, null, '', NaN].indexOf(value) > -1 ? 'NA' : value;
        if (value && col['tag_type'] === 'date') {
          value = this.datePipe.transform(new Date(value), 'dd MMM, yyyy, HH:mm:ss');
        }
        value = value.toString();
        CSV += value.replace(/,|\n/g, ' ') + (index === tableData.headerContent.length - 1 ? '' : delimiter);
      });
      CSV += '\n';
    });
    return CSV;
  }

  getProjectDetails() {
    try {
      if (localStorage.getItem('project_details')) {
        const encryptedProjectDetails = localStorage.getItem('project_details');
        let decryptedProjectDetails = this.decrypt(encryptedProjectDetails);
        decryptedProjectDetails = decryptedProjectDetails && decryptedProjectDetails !== '' ? JSON.parse(decryptedProjectDetails) : null;
        decryptedProjectDetails = (typeof decryptedProjectDetails === 'string') ? JSON.parse(decryptedProjectDetails) : decryptedProjectDetails;
        return decryptedProjectDetails;
      }
    } catch (error) {
      console.error(error);
    }
  }

  exportTableAsPdf(tableData: any, reportDetails?: any, bindLabel?: any, bindValue?: any) {
    const htmlTags: any = this.getTableDom(tableData, reportDetails, bindLabel, bindValue);
    const domEle: any = Object.values(htmlTags).join(' ');
    const popupWin = window.open();
    popupWin.document.open();
    popupWin.document.write(domEle);
    popupWin.document.close();
  }

  getTableDom(tableData: any, reportDetails?: any, bindLabel?: any, bindValue?: any) {
    const c = document.createElement('canvas');
    const img = document.getElementById('ilens-project-img');
    c.height = img['naturalHeight'];
    c.width = img['naturalWidth'];
    const ctx: any = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const base64String = c.toDataURL();
    const styleTag = '<style>.table{width:100vw;margin-bottom:1rem;background-color:transparent;border-spacing:0;border-collapse:collapse}.table th,.table td{// padding:0.75rem;vertical-align:top;border-top:1px solid #dee2e6}.table thead th{vertical-align:bottom;border-bottom:2px solid #dee2e6}.table tbody + tbody{border-top:2px solid #dee2e6}.table .table{background-color:#fff}.table-sm th,.table-sm td{padding:0.3rem}.table-bordered{border:1px solid #dee2e6}.table-bordered th,.table-bordered td{border:1px solid #dee2e6}.table-bordered thead th,.table-bordered thead td{border-bottom-width:2px}.table-borderless th,.table-borderless td,.table-borderless thead th,.table-borderless tbody + tbody{border:0}.table-striped tbody tr:nth-of-type(odd){background-color:rgba(0,0,0,0.05)}.table-hover tbody tr:hover{background-color:rgba(0,0,0,0.075)}.table-primary,.table-primary > th,.table-primary > td{background-color:#b8daff}.table-primary th,.table-primary td,.table-primary thead th,.table-primary tbody + tbody{border-color:#7abaff}.table-hover .table-primary:hover{background-color:#9fcdff}.table-hover .table-primary:hover > td,.table-hover .table-primary:hover > th{background-color:#9fcdff}.table-secondary,.table-secondary > th,.table-secondary > td{background-color:#d6d8db}.table-secondary th,.table-secondary td,.table-secondary thead th,.table-secondary tbody + tbody{border-color:#b3b7bb}.table-hover .table-secondary:hover{background-color:#c8cbcf}.table-hover .table-secondary:hover > td,.table-hover .table-secondary:hover > th{background-color:#c8cbcf}.table-success,.table-success > th,.table-success > td{background-color:#c3e6cb}.table-success th,.table-success td,.table-success thead th,.table-success tbody + tbody{border-color:#8fd19e}.table-hover .table-success:hover{background-color:#b1dfbb}.table-hover .table-success:hover > td,.table-hover .table-success:hover > th{background-color:#b1dfbb}.table-info,.table-info > th,.table-info > td{background-color:#bee5eb}.table-info th,.table-info td,.table-info thead th,.table-info tbody + tbody{border-color:#86cfda}.table-hover .table-info:hover{background-color:#abdde5}.table-hover .table-info:hover > td,.table-hover .table-info:hover > th{background-color:#abdde5}.table-warning,.table-warning > th,.table-warning > td{background-color:#ffeeba}.table-warning th,.table-warning td,.table-warning thead th,.table-warning tbody + tbody{border-color:#ffdf7e}.table-hover .table-warning:hover{background-color:#ffe8a1}.table-hover .table-warning:hover > td,.table-hover .table-warning:hover > th{background-color:#ffe8a1}.table-danger,.table-danger > th,.table-danger > td{background-color:#f5c6cb}.table-danger th,.table-danger td,.table-danger thead th,.table-danger tbody + tbody{border-color:#ed969e}.table-hover .table-danger:hover{background-color:#f1b0b7}.table-hover .table-danger:hover > td,.table-hover .table-danger:hover > th{background-color:#f1b0b7}.table-light,.table-light > th,.table-light > td{background-color:#fdfdfe}.table-light th,.table-light td,.table-light thead th,.table-light tbody + tbody{border-color:#fbfcfc}.table-hover .table-light:hover{background-color:#ececf6}.table-hover .table-light:hover > td,.table-hover .table-light:hover > th{background-color:#ececf6}.table-dark,.table-dark > th,.table-dark > td{background-color:#c6c8ca}.table-dark th,.table-dark td,.table-dark thead th,.table-dark tbody + tbody{border-color:#95999c}.table-hover .table-dark:hover{background-color:#b9bbbe}.table-hover .table-dark:hover > td,.table-hover .table-dark:hover > th{background-color:#b9bbbe}.table-active,.table-active > th,.table-active > td{background-color:rgba(0,0,0,0.075)}.table-hover .table-active:hover{background-color:rgba(0,0,0,0.075)}.table-hover .table-active:hover > td,.table-hover .table-active:hover > th{background-color:rgba(0,0,0,0.075)}.table .thead-dark th{color:#fff;background-color:#212529;border-color:#32383e}.table .thead-light th{color:#495057;background-color:#e9ecef;border-color:#dee2e6}.table-dark{color:#fff;background-color:#212529}.table-dark th,.table-dark td,.table-dark thead th{border-color:#32383e}.table-dark.table-bordered{border:0}.table-dark.table-striped tbody tr:nth-of-type(odd){background-color:rgba(255,255,255,0.05)}.table-dark.table-hover tbody tr:hover{background-color:rgba(255,255,255,0.075)}.table tr th,.table tr td{min-width:110px !important;padding:4px 6px;font-size:12px;text-align:center;border-left:1px solid #dee2e6;border-top:1px solid #dee2e6;white-space:normal;border-spacing:0;border-collapse:collapse}</style>';
    const htmlOpeningTag = '<html><head><link rel="stylesheet" type="text/css" href="style.css"/>' + styleTag + '</head><body onload="window.print()" onafterprint="window.close()" style="font-family: reboto-regular;">'; // 
    const htmlClosingTag = '</html>';
    let details: any = '';
    if (reportDetails) {
      details = ' <table style="width:100%" > <tbody> <tr> <td>Report Name : ' + reportDetails['reportName'] + '</td> <td rowspan="3" style="text-align: right;"><img src="' + base64String + '" style="width:90px"></td> </tr> <tr> <td>Generated on : ' + reportDetails['timeOfCreation'] + '</td> </tr> <tr> <td>Generated by :' + reportDetails['createdby'] + '</td> </tr> </tbody></table>';
    }
    let tableContent = '<table class="table table-striped table-bordered">';
    let headerContent = '<thead><tr>';
    for (const eachHeader of tableData.headerContent) {
      headerContent += '<th>' + (bindLabel ? eachHeader[bindLabel] : eachHeader.label) + '</th>';
    }
    headerContent += '</tr></thead>';
    let bodyContent = '<tbody>';
    for (const eachRow of tableData.bodyContent) {
      let tr = '<tr>';
      for (const eachHeader of tableData.headerContent) {
        const headerKey = eachHeader.hasOwnProperty('is_value_dependent') ? (eachHeader['is_value_dependent'] ? 'value' : 'key') : (bindValue ? bindValue : '');
        let value = headerKey ? eachRow[eachHeader[headerKey]] : eachRow[eachHeader.key || eachHeader.value];
        value = [undefined, null, '', NaN].indexOf(value) > -1 ? '' : value;
        if (value && eachHeader['tag_type'] === 'date') {
          value = this.datePipe.transform(new Date(value), 'dd MMM, yyyy, HH:mm:ss');
        }
        tr += '<td>' + this.getvalue(value) + '</td>';
      }
      tr += '</tr>';
      bodyContent += tr;
    }
    bodyContent += '</tbody>';
    tableContent = tableContent + headerContent + bodyContent + '</table>';
    return { htmlOpeningTag, details, tableContent, htmlClosingTag };
  }

  exportTableAsExcel(tableData: any, reportDetails?: any, bindLabel?: any, bindValue?: any, reportName = 'Report') {
    const htmlTags: any = this.getTableDom(tableData, reportDetails, bindLabel, bindValue);
    htmlTags['details'] = '<table> <thead> <tr> <th colspan="4"><h3>iLens Report</h3></th> </tr> </thead> <tbody> <tr> <td colspan="2" style="font-weight: 800;">Report Name</td> <td colspan="2">' + reportDetails['reportName'] + '</td> </tr> <tr> <td colspan="2" style="font-weight: 800;">Generated on </td> <td colspan="2">' + reportDetails['timeOfCreation'] + '</td> </tr> <tr><td colspan="2" style="font-weight: 800;">Generated by </td> <td colspan="2"> ' + reportDetails['createdby'] + '</td> </tr> </tbody></table><br>';
    const domEle: any = Object.values(htmlTags).join(' ');
    const uri = 'data:text/xlsx;charset=utf-8,' + escape(domEle);
    const link = document.createElement('a');
    link.href = uri;
    link.setAttribute('style', 'visibility:hidden');
    link.download = reportName + '.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getvalue(value: any) {
    if (value == undefined) {
      this._toastLoad.toast('error', 'Error', 'Error While Downloading The PDF', true);
    }
    if (typeof value === 'number') {
      return value;
    }
    return value.replace(/,/g, ', ');
  }

  getFormioDateFormat = (date): any => {
    try {
      const dt = this.formatDate(date) + 'T' + this.formatTime(date);
      const dtObj = new Date(date).toString().split('GMT');
      const splitdtObj = dtObj[1].split(' (India Standard Time)');
      const offsethours = splitdtObj[0];
      return dt + offsethours;
    } catch (error) {
      console.log(error);
    }
  }

  formatDate(date, dateFirst?) {
    const temp = new Date(date);
    let month = '' + (temp.getMonth() + 1);
    let day = '' + temp.getDate();
    const year = temp.getFullYear();
    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;
    return [dateFirst ? day : year, month, dateFirst ? year : day].join('-');
  }

  formatTime(time, onlyHM?) {
    const temp = new Date(time);
    let hours = '' + temp.getHours();
    let minutes = '' + temp.getMinutes();
    let seconds = onlyHM ? '00' : '' + temp.getSeconds();
    hours = hours.length < 2 ? '0' + hours : hours;
    minutes = minutes.length < 2 ? '0' + minutes : minutes;
    seconds = seconds.length < 2 ? '0' + seconds : seconds;
    return [hours, minutes, seconds].join(':');
  }
  formatHourTime(time, onlyHM?) {
    const temp = new Date(time);
    let hours = '' + temp.getHours();
    let minutes = '' + temp.getMinutes();
    hours = hours.length < 2 ? '0' + hours : hours;
    minutes = minutes.length < 2 ? '0' + minutes : minutes;
    return [hours, minutes].join(':');
  }
  setHours = (dt, h) => {
    try {
      const s = /(\d+):(\d+)(.+)/.exec(h);
      const hrsValue = parseInt(s[1], 10);
      dt.setHours(s[3] === 'PM' && hrsValue !== 12 ? 12 + parseInt(s[1], 10) : parseInt(s[1], 10));
      dt.setMinutes(parseInt(s[2], 10));
      return dt;
    } catch (error) {
      console.error(error);
    }
  }
  getFullDateTimeFormat(date): any {
    try {
      const result = this.formatDate(date) + ' ' + this.formatTime(date);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  updateUserRolePermissions(tableActions, userRolepermissions) {
    try {
      const permissionKeyMapping = {
        clone: 'create',
        edit: 'edit',
        delete: 'delete',
        flow: 'view',
        switch: 'view',
        view: 'view',
      };
      if (!tableActions) {
        return {
          actions: [],
          enableActions: false,
          externalActions: [],
        };
      }
      if (!tableActions.actions) {
        tableActions.actions = [];
      }
      if (!tableActions.externalActions) {
        tableActions.externalActions = [];
      }
      if (tableActions && userRolepermissions) {
        if (!tableActions['actions']) {
          tableActions['actions'] = []
        }
        if (!tableActions['externalActions']) {
          tableActions['externalActions'] = [];
        }
        if (tableActions['actions'] && tableActions['externalActions']) {
          const actions = ['edit', 'clone', 'delete'];
          const indexes = {
            addNewIndex: -1,
            edit: -1,
            clone: -1,
            delete: -1,
          };
          indexes['addNewIndex'] = tableActions['externalActions'].findIndex(item => item['type'] === 'addnew');
          if (!userRolepermissions['create'] && indexes['addNewIndex'] !== -1) {
            tableActions['externalActions'].splice(indexes['addNewIndex'], 1);
          }
          for (const eachAction of actions) {
            indexes[eachAction] = tableActions['actions'].findIndex(item => item['type'] === eachAction);
            if (!userRolepermissions[permissionKeyMapping[eachAction]] && indexes[eachAction] !== -1) {
              tableActions['actions'].splice(indexes[eachAction], 1);
            }
          }
          return JSON.parse(JSON.stringify(tableActions));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  mqttTopicRegister(inputJson: any) {
    const promise = new Promise((resolve) => {
      this.appservice.registerMqttTopics(inputJson).subscribe((response) => {
        try {
          if (response && response['status'] === 'success') {
            resolve(response);
          } else {
            resolve(undefined);
            this._toastLoad.toast('error', 'Error', response && response['message'] ? response['message'] : 'Error while saving data.', true);
          }
        } catch (error) {
          console.error(error);
          resolve(undefined);
          throw (error);
        }
      }, (error) => {
        console.error(error);
        resolve(undefined);
        this._toastLoad.toast('error', 'Error', 'Error while saving data.', true);
      });
    });
    promise.catch((error) => {
      console.error(error);
      this._toastLoad.toast('error', 'Error', 'Error while saving data.', true);
    });
    return promise;
  }

  getUserDetails() {
    if (this.getSessionKey()) {
      if (localStorage.getItem('user_details')) {
        const encryptedUserDetails = localStorage.getItem('user_details');
        const decryptedUserDetails = this.decrypt(encryptedUserDetails);
        return decryptedUserDetails && decryptedUserDetails !== '' ? JSON.parse(decryptedUserDetails) : null;
      }
    }
    return null;
  }

  getMqttConfigDetails(inputJson: any) {
    const self = this;
    const promise = new Promise((resolve) => {
      this.appservice.getMqttConfigDetails(inputJson).subscribe((response) => {
        try {
          if (response && response['status'] === 'success') {
            if (response['data'] && response['data']['isAuthorized']) {
              const userDetails = self.getUserDetails();
              const deSaugars = '$2b$12$yGLTsi6dMwHAkNYvKaDM9e';
              const passKey = userDetails['username'] + '_' + userDetails['user_id'];
              response['data']['username'] = userDetails['username'];
              response['data']['password'] = bcrypt.hashSync(passKey, deSaugars);
            }
            resolve(response);
          } else {
            resolve(undefined);
          }
        } catch (error) {
          console.error(error);
          resolve(undefined);
          throw (error);
        }
      }, (getMqttConfigDetails) => {
        console.error(getMqttConfigDetails);
        resolve(undefined);
      });
    });
    promise.catch((getMqttConfigDetailsPromError) => {
      console.error(getMqttConfigDetailsPromError);
      this._toastLoad.toast('error', 'Error', 'Error while saving data.', true);
    });
    return promise;
  }
  /**
   * Password validation
   * @param password password
   */
  checkPassword(password) {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  }

  /**
   * Check for regex validation
   * @param expression regular expression
   * @param value value to be checked
   */
  checkRegex(expression, value) {
    return expression.test(value);
  }
  updateTableHeaderContent(headerContent, keytoUpdate, tableActions, actiontoAdd?: any) {
    try {
      if (headerContent && headerContent.length) {
        for (const eachHeader of headerContent) {
          if (eachHeader['value'] === keytoUpdate || eachHeader['key'] === keytoUpdate) {
            eachHeader['style'] = 'indicate-item cursor-pointer';
            if (tableActions && tableActions['actions']) {
              for (const eachAction of tableActions['actions']) {
                eachAction['icon-class'] = eachAction['icon-class'] ? eachAction['icon-class'] : this.tableActionsMapping[eachAction['type']];
              }
              if (actiontoAdd) {
                const checkIfEditAvailable = tableActions['actions'].some(item => item['action'] === actiontoAdd['action']);
                eachHeader['enableClick'] = checkIfEditAvailable;
                eachHeader['action'] = actiontoAdd ? actiontoAdd : {
                  action: 'edit',
                  label: 'Edit',
                  type: 'edit',
                };
              } else {
                const checkIfEditAvailable = tableActions['actions'].some(item => item['action'] === 'edit');
                eachHeader['enableClick'] = checkIfEditAvailable;
                eachHeader['action'] = {
                  action: 'edit',
                  label: 'Edit',
                  type: 'edit',
                };
              }
            }
          }
        }
      }
      return headerContent;
    } catch (error) {
      console.error(error);
    }
  }
  removeAppClass() {
    try {
      document.body.classList.remove('app-window');
      document.body.classList.remove('pin-sidebar');
    } catch (error) {
      console.error(error);
    }
  }
  downloadFile(URL?: any) {
    try {
      if (!URL) {
        return;
      }
      const anchorTag = document.createElement('a');
      // anchorTag.setAttribute('type', 'hidden');
      // anchorTag.setAttribute('contenteditable', 'true');
      anchorTag.href = URL;
      document.body.appendChild(anchorTag);
      anchorTag.click();
      anchorTag.remove();
    } catch (error) {
      console.error(error);
    }
  }

  // Function to check validity of color by entered by user.

  checkValidColor(inputColor: any) {
    let e = document.getElementById('divValidColor');
    if (!e) {
      e = document.createElement('div');
      e.id = 'divValidColor';
    }
    e.style.display = 'none';
    e.style.borderColor = '';
    e.style.borderColor = inputColor;
    const tmpcolor = e.style.borderColor;
    if (tmpcolor.length === 0) {
      return false;
    }
    return true;
  }
  copyToClipboard(val) {
    try {
      const div = document.createElement('div');
      div.setAttribute('id', 'clipBoardCopy');
      document.body.appendChild(div);
      const a = document.createElement('a');
      a.innerText = val;
      document.getElementById('clipBoardCopy').appendChild(a);
      const range = document.createRange();
      range.selectNode(document.getElementById('clipBoardCopy'));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
      a.remove();
      div.remove();
    } catch (error) {
      console.error(error);
    }
  }
  communicateWithIndexDB() {
    try {
      console.log(indexedDB);
      let openRequest = indexedDB.open('Sample', 1);
      console.log(openRequest)
      openRequest.onupgradeneeded = (event) => {
        // triggers if the client had no database
        // ...perform initialization...
        let db = openRequest.result;
        switch (event.oldVersion) { // existing db version
          case 0:
          // version 0 means that the client had no database
          // perform initialization
          case 1:
          // client had version 1
          // update
        }
      };

      openRequest.onerror = () => {
        console.error("Error", openRequest.error);
      };

      openRequest.onsuccess = () => {
        let db = openRequest.result;
        console.log(db);
        // continue working with database using db object
      };
    } catch (error) {
      console.error(error);
    }
  }

  replaceWithDefaultVal(val, dVal = 'NA', naArray = [null, undefined, '']) {
    return naArray.indexOf(val) > -1 ? dVal : val;
  }

  checkNested(obj, ..._arguments) {
    const args = Array.prototype.slice.call(arguments, 1);
    for (let i = 0; i < args.length; i++) {
      if (!obj || !obj.hasOwnProperty(args[i])) {
        return false;
      }
      obj = obj[args[i]];
    }
    return true;
  }

  invertColor(hex) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
    const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
    const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b);
  }

  colorAdjuster = (inputColor, amount) => {
    return '#' + inputColor.replace(/^#/, '').replace(/../g, _color => ('0' + Math.min(255, Math.max(0, parseInt(_color, 16) + amount)).toString(16)).substr(-2));
  }

  contrastingColor = (inputColor) => {
    return (this.luma(inputColor) >= 165) ? '#000' : '#fff';
  }

  luma = (inputColor) => {
    if (inputColor) {
      const rgb = (typeof inputColor === 'string') ? color.parse(inputColor) : inputColor;
      return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
    }

    return 0;
  }

  padZero(str, len = 2) {
    const zeros = Array(len).join('0');
    return (zeros + str).slice(-len);
  }
  triggerDesktopNotifiction(title, body) {
    if (!('Notification' in window)) {
      console.log('Web Notification not supported');
      return;
    }
    Notification.requestPermission((permission) => {
      navigator.serviceWorker.getRegistration().then((registration: any) => {
        setTimeout(() => {
          registration?.showNotification(title, {
            body,
            badge: window.location.origin + window.location.pathname + 'assets/images/unifytwin-favicon.png',
            icon: window.location.origin + window.location.pathname + 'assets/images/unifytwin-favicon.png',
            renotify: false,
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200],
            dir: 'ltr',
            lang: 'en-US',
            tag: new Date().getTime(),
          });
        }, 500);
      });
    });
  }

  downloadURI(uri, name) {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  convertTZ = (date: any): any => {
    if (!date) {
      return;
    }
    const projectDetails = this.getProjectDetails() || {};
    const tzString: any = projectDetails['tz'] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const _d = new Date((typeof date === 'string' ? new Date(date) : date));
    return _d.toLocaleString('en-US', { timeZone: tzString });
  }

  getScreenWidth = () => {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  charsUnescapePipe(value: any, args?: any): any {
    if (!value) {
      return '';
    }
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.documentElement.textContent;
  }

  /**
   * Deep copies the passed object
   * @param obj object that received from the parent component.
   * @returns Deep copied object or undefined
   */
  getCopy(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Checks provided value is proper value or not
   * @param value
   * @returns boolean
   */
  isProperValue(value: any) {
    try {
      if ([null, NaN, undefined, ''].indexOf(value) === -1) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true;
    }
  }
/**
 * changes the format of current date
 * @returns string
 */
  getFormattedDate(inputDate): any {
    try {
      let date = new Date(inputDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset(), null, null);
      const c_date = date.toISOString().slice(0, -1);
      return c_date;
    } catch (date_error) {
      console.error(date_error);
    }
  }

  isAppView = () => {
    if (!window.location.href.includes('/apps/') && !window.location.href.includes('/apps-view/')
      && !(window.location.href.includes('type=iframe') || window.location.href.includes('type%3Diframe'))) {
      return true;
    }
    return false;
  }

  updateActions(tableJson, permissions) {
    try {
      if (!tableJson) {
        return {
          actions: [],
          enableActions: false,
          externalActions: [],
        };
      }
      if (!tableJson.actions) {
        tableJson.actions = [];
      }
      if (!tableJson.externalActions) {
        tableJson.externalActions = [];
      }
      if (tableJson && permissions) {
        if (!tableJson['actions']) {
          tableJson['actions'] = []
        }
        if (!tableJson['externalActions']) {
          tableJson['externalActions'] = [];
        }
      }
      const defaultPermMapping: any = {
        create: 'addnew',
      };
      const permissionKeys: any = Object.keys(permissions);
      if (!permissionKeys?.length) {
        return tableJson;
      }
      for (let eachPerm of permissionKeys) {
        if (!permissions[eachPerm]) {
          if (tableJson?.externalActions?.length) {
            const permKey = (defaultPermMapping?.[eachPerm] ? defaultPermMapping[eachPerm] : eachPerm);
            let extInd = tableJson['externalActions'].findIndex((eachAct: any) => eachAct.action === permKey);
            if (extInd > -1) {
              tableJson['externalActions'].splice(extInd, 1);
            }
          }
          if (tableJson?.actions?.length) {
            const intInd = tableJson['actions'].findIndex((eachIntAct: any) => eachIntAct.action === eachPerm);
            if (intInd > -1) {
              tableJson['actions'].splice(intInd, 1);
            }
          }
        }
      }
      return tableJson;
    } catch (err) {
      console.error(err);
      return tableJson;
    }
  } 

  clickableCol (tableJson,clickableColumn, userRolePermissions)
  {
    try {
      if(!clickableColumn){
        return [];
      }
      for (let eachCol of tableJson.columnDefs) {
        if (clickableColumn.includes(eachCol?.field)) {
          if (!userRolePermissions[eachCol?.action?.action || 'edit']) {
            const clickInd = clickableColumn.findIndex((ele: any) => ele === eachCol?.field)
            if (clickInd > -1) {
              clickableColumn.splice(clickInd, 1);
            }
          }
        }
      }
      return clickableColumn;
    } catch (cliErr) {
      console.error(cliErr)
      return [];
    }
  }
  
  jsontoURLSearchParam(jsonObject) {
    const stringifiedJson = JSON.stringify(jsonObject);
    return  encodeURIComponent(stringifiedJson).toString();
  }
}
