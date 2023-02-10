import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityFunctions } from '../utilities/utility-func';
import { AppService } from '../services/app.service';
import { Subject } from 'rxjs';
import { Config } from '../config/config';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userpermissions: any = {};
  public refreshSideBarItems = new Subject<any>();
  public userDetails = [];

  constructor(private _router: Router, private _utility: UtilityFunctions, private appservice: AppService) { }
  storeUserDetails(userObj: any) {
    const encryptedUserObj = this._utility.encrypt(userObj);
    localStorage.setItem('user_details', encryptedUserObj);
    localStorage.setItem('full_name', userObj['full_name']);
  }
  storeProjectDetails(projObj: any) {
    const encryptedUserObj = this._utility.encrypt(projObj);
    localStorage.setItem('project_details', encryptedUserObj);
    localStorage.setItem('project_id', projObj['project_id']);
  }
  setLocalStorage(key, value) {
    if (!key || !value) {
      return null;
    }
    localStorage.setItem(key, value);
  }
  getLocalStorage(key) {
    if (!key) {
      return null;
    }
    const item = localStorage.getItem(key);
    return item;
  }
  getUserDetails(): any {
    try {
      if (this._utility.getSessionKey()) {
        if (localStorage.getItem('user_details')) {
          const encryptedUserDetails = localStorage.getItem('user_details');
          const decryptedUserDetails = this._utility.decrypt(encryptedUserDetails);
          return decryptedUserDetails && decryptedUserDetails !== '' ? JSON.parse(decryptedUserDetails) : null;
        }
      }
      return null;
    } catch (error) {
      console.error(error);
    }
  }
  getProjectDetails() {
    try {
      if (this._utility.getSessionKey()) {
        if (localStorage.getItem('project_details')) {
          const encryptedProjectDetails = localStorage.getItem('project_details');
          let decryptedProjectDetails = this._utility.decrypt(encryptedProjectDetails);
          decryptedProjectDetails = decryptedProjectDetails && decryptedProjectDetails !== '' ? JSON.parse(decryptedProjectDetails) : null;
          decryptedProjectDetails = (typeof decryptedProjectDetails === 'string') ? JSON.parse(decryptedProjectDetails) : decryptedProjectDetails;
          if (!decryptedProjectDetails || (typeof decryptedProjectDetails === 'object' && !decryptedProjectDetails['project_id'])) {
            this.clearStorages();
          } else if (decryptedProjectDetails && (typeof decryptedProjectDetails === 'object' && decryptedProjectDetails['project_id'])) {
            // this.headerService.project_name = decryptedProjectDetails['project_name'];
            // this.headerService.logo_url = decryptedProjectDetails['logo_url'];
          }
          return decryptedProjectDetails;
        }
      }
      this.clearStorages();
      return { project_id: '' };
    } catch (error) {
      console.error(error);
    }
  }
  deleteProjectDetails() {
    localStorage.removeItem('project_details');
    localStorage.removeItem('project_id');
  }
  getSessionStatus() {
    try {
      if (this._utility.getSessionKey()) {
        if (localStorage.getItem('user_details')) {
          const encryptedUserDetails = localStorage.getItem('user_details');
          let decryptedUserDetails: any = this._utility.decrypt(encryptedUserDetails);
          decryptedUserDetails = decryptedUserDetails && decryptedUserDetails !== '' ? JSON.parse(decryptedUserDetails) : null;
          return decryptedUserDetails ? decryptedUserDetails['session_status'] || 'in-valid' : 'in-valid'
        }
      }
      return 'in-valid';
    } catch (error) {
      console.error(error);
    }
  }
  getUserPermissions(key) {
    try {
      if (this._utility.getSessionKey()) {
        const encryptedUserDetails = localStorage.getItem('user_details');
        const decryptedUserDetails = this._utility.decrypt(encryptedUserDetails);
        let userdetails = JSON.parse(decryptedUserDetails);
        userdetails = userdetails['user_role_permissions'];
        if (key !== '') {
          return decryptedUserDetails && decryptedUserDetails !== '' ? userdetails[key] : null;
        } else if (key === '') {
          return decryptedUserDetails && decryptedUserDetails !== '' ? JSON.parse(decryptedUserDetails) : null;
        }
      }
      return null;
    } catch (error) {
      console.error(error);
    }
  }
  setSessionStatus(session_status: any) {
    try {
      const userDetails = this.getUserDetails();
      if (userDetails) {
        userDetails['session_status'] = session_status;
        this.storeUserDetails(userDetails);
      }
    } catch (error) {
      console.error(error);
    }
  }
  deleteUserDetails(key?) {
    localStorage.removeItem('user_details');
    localStorage.removeItem('project_details');
    // this.clearParent();
    if (!key) {
      this._router.navigate(['login']);
    }
  }

  clearParent = () => {
    try {
      if (window.parent && window.parent.location.href) {
        window.parent.location.href = this.appservice.getCurrentUrl('login');
      }
    } catch (error) {
      console.error(error);
    }
  }

  checkProjectDetailsExist() {
    try {
      if (this._utility.getSessionKey()) {
        if (localStorage.getItem('project_details')) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  isLoggednIn() {
    return this.getUserDetails() !== null;
  }
  logout() {
    this.deleteUserDetails();
    this._router.navigate(['login']);
  }
  clearStorages() {
    try {
      if (!this._router.url.includes('login')) {
        this.deleteUserDetails();
        this._router.navigate(['login']);
      }
    } catch (error) {
      console.error(error);
    }
  }

  public setUserPermissions(details: any) {
    this.userpermissions = details;
  }

  restrictRoute(page: any){
    try {
      if (!page) {
        return true;
      }
      const userDetails = this.getUserDetails();
      const uRPerm = userDetails?.user_role_permissions || {};
      if (uRPerm?.[page]?.view) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  
  getHeaderTabs() {
    try {
      const tabConstants = Config.CONSTANTS.headerTabs || [];
      if (!tabConstants?.length) {
        return [];
      }
      const headerTabs = [];
      const userDetails = this.getUserDetails();
      const uRPerm = userDetails?.user_role_permissions || {};
      for (let eachTab of tabConstants) {
        if (uRPerm?.[eachTab['value']]?.view) {
          headerTabs.push(eachTab);
        }
      }
      return headerTabs;
    } catch (headerErr) {
      console.error(headerErr);
      return [];
    }
  }

}
