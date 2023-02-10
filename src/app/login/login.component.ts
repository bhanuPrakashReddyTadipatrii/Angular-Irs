import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Config } from '../config/config';
import { AuthService } from '../guards/auth.service';
import { AppService } from '../services/app.service';
import { SharedModule } from '../shared/shared.module';
import { ToasterService } from '../shared/toastr/toaster.service';
import { UtilityFunctions } from '../utilities/utility-func';
@Component({
  selector: 'ucp-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [SharedModule, CommonModule,
    FormsModule,
    ReactiveFormsModule],
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public captchaLoading: any;
  public captchaimage: string;
  public userdetails: any;
  public userDet: any = {
    phonenumber: null,
    otp: null,
  };
  public pageType: any = 'normalLogin'; // ["normalLogin", "forgotPassword", "updatePassword"]
  public variableValidations: any = {
    password: [Validators.required, Validators.minLength(8)],
    username: [Validators.required],
    confirmPassword: [Validators.required, Validators.minLength(8)],
    activationKey: [Validators.required],
    captcha: [Validators.required],
  }
  public loader: any = {
    captcha: false,
    login: false,
    formPage: true,
  };
  public allFields: any = ['username', 'password', 'activationKey', 'confirmPassword', 'captcha'];
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public authToken: any = '';
  public userData: any;
  public passwordValidator = [
    {
      label: 'One lowecase letter',
      value: 'lowerCase',
      regex: /^(?=.*[a-z])/,
      isPresent: false,
    },
    {
      label: 'One uppercase letter',
      value: 'upperCase',
      regex: /^(?=.*[A-Z])/,
      isPresent: false,
    },
    {
      label: 'One number',
      value: 'number',
      regex: /^(?=.*\d)/,
      isPresent: false,
    },
    {
      label: 'One special character',
      value: 'lowerCase',
      regex: /^(?=.*[!@#$%^&*])/,
      isPresent: false,
    },
    {
      label: '8 characters minimum',
      value: 'eightChars',
      regex: /^.{8,}$/,
      isPresent: false,
    },
  ];
  public page: any = 'phonenumber';


  constructor(private _toaster: ToasterService, private appservice: AppService, private _utility: UtilityFunctions, private _auth: AuthService, public _route: Router) { }

  ngOnInit(): void {
    // const userDetails: any = this._auth.getUserDetails();
    // if (!userDetails || !userDetails?.user_id || !userDetails?.user_role_permissions || !(Object.keys(userDetails?.user_role_permissions || {})?.length)) {
      // this.setValidation();
    // } else {
    //   this._route.navigate([this.getDefaultRoute(this.userData?.landing_page) || 'app/dashboard/visualize']);
    // }
  }

  setValidation() {
    try {
      const validateObject = {};
      const availableFields = this.getAvailableFields();
      for (let ind = 0; ind < this.allFields?.length; ind++) {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: this.userDet[this.allFields[ind]], disabled: false }, availableFields.includes(this.allFields[ind]) ? this.variableValidations[this.allFields[ind]] : [Validators.nullValidator],
        );
      }
      this.loginForm = new FormGroup(validateObject);
      this.loader.formPage = false;
    } catch (valErr) {
      this.loader.formPage = false;
      console.error(valErr);
    }
  }

  getAvailableFields() {
    let rF = [];
    try {
      if (this.pageType === 'normalLogin') {
        rF = ['username', 'password'];
      } else if (this.pageType === 'forgotPassword') {
        rF = ['username', 'captcha'];
      } else if (this.pageType === 'updatePassword') {
        rF = ['username', 'password', 'activationKey', 'confirmPassword', 'captcha'];
      }
      return rF;
    } catch (availErr) {
      return '';
      console.error(availErr);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    try {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsDirty({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.validateAllFormFields(control);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  cleanAllFormFields(formGroup: FormGroup) {
    try {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsPristine({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.cleanAllFormFields(control);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  changePageType(key) {
    try {
      this.pageType = key;
      this.clearAllFormFields();
      this.configureValidation(this.loginForm);
    } catch (err) {
      console.error(err);
    }
  }

  configureValidation(form: FormGroup) {
    // Removing Non-Active Validations
    for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
    }
    // Adding Active Field Validation
    this.setValidation();
  }

  getCaptcha(reload?: any) {
    try {
      this.captchaLoading = false;
      const getCaptchaInput = {
        height: 80,
        width: 200,
        maxLength: 5,
        fontSizeMin: 40,
        fontSizeMax: 50,
      };
      this.appservice.getCaptcha(getCaptchaInput).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp.status === 'success') {
          this.captchaimage = 'data:image/png;base64,' + resp['data'];
          this.captchaLoading = true;
          this.userDet.captcha = null;
          if (this.pageType === 'normalLogin') {
            this.changePageType('forgotPassword');
          }
          if (!reload) {
            this.cleanAllFormFields(this.loginForm);
          }
        } else {
          this._toaster.toast('error', 'Error', resp['message'] || 'Error while fetching Captcha');
        }
      }, (error) => {
        console.error(error);
        this._toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (err) {
      console.error(err);
    }


  }

  checkValidation() {
    try {
      this.passwordValidator.forEach(element => {
        element['isPresent'] = this._utility.checkRegex(element.regex, this.userDet.password);
      });
    } catch (error) {
      console.error(error);
    }
  }

  getToken() {
    try {
      this.appservice.getTokenInfo().pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.status === 'success') {
          this.authToken = response.unique_key;
          this.login();
        } else {
          this._toaster.toast('error', 'Error', response.message || 'Unable to login. Please try again.');
        }
      }, (error) => {
        this._toaster.toast('error', 'Error','Unable to get Data');
       });
    } catch (e) {
      console.log(e);
    }
  }

  login() {
    if (this.loginForm.invalid) {
      this.validateAllFormFields(this.loginForm);
      this._toaster.toast('warning', 'Warning', 'Please fill all the required fields');
      return;
    }
    try {
      const input = {};
      input['user_name'] = this.userDet.username;
      input['password'] = this._utility.encryptPasswordWithUsername(this.userDet.password, this.userDet.username, this.authToken);
      this.loader.login = true;
      this.appservice.loginUser(input).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response?.status && response.status.toLowerCase() === 'success') {
          this.userData = response?.data;
          this.fetchUserRole(response);
        } else {
          this.loader.login = false;
          this._toaster.toast('error', 'Error', response.message, true);
        }
      }, (error) => {
        this.loader.login = false;
        this._toaster.toast('error', 'Error', 'Error while Loging in.', true);
      });
    } catch (error) {
      this.loader.login = false;
      console.error(error);
    }
  }

  fetchUserRole(data) {
    try {
      this.appservice.fetchUserRole({user_role_id: this.userData?.user_role_id}).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response?.status && response.status.toLowerCase() === 'success') {
          this._auth.setUserPermissions(response?.data?.user_role_permissions || {});
          this.loginSuccess(data, {user_role_permissions: response?.data?.user_role_permissions || {}});
        } else {
          this.loader.login = false;
        }
      }, (error) => {
        this.loader.login = false;
      });
    } catch (fetchErr) {
      this.loader.login = false;
      console.error(fetchErr);
    }
  }

  loginSuccess(response, user_role_permissions) {
    try {
      this._auth.storeUserDetails({...response.data, ...user_role_permissions});
      this.getBaseProject();
    } catch (resErr) {
      this.loader.login = false;
      console.error(resErr);
    }
  }

  getBaseProject() {
    try {
      this.appservice.getBaseProject({}).subscribe((baseProjectRes) => {
        if (baseProjectRes?.status === 'success') {
          const baseProjectDet = baseProjectRes['data'] || {};
          const projectDet: any = {
            project_id: '',
            project_name: baseProjectDet.project_name || '',
            logo_url: baseProjectDet.logo_url || '',
            project_type: baseProjectDet['project_type'] || '',
            map_center: baseProjectDet?.map_center || { 
              lat: 24.45, 
              lng: 54.37 
            },
            zoom_level: baseProjectDet?.zoom_level || 5,
          };
          projectDet['project_id'] = baseProjectDet['id'] || '';
          // this._auth.storeProjectDetails(projectDet);
          this._route.navigate(['app/dashboard']);
          // this.loader.login = false; 
        } else {
          this.loader.login =  false;
          this._toaster.toast('error', 'Error', baseProjectRes['message'] || 'Error While Fetching base project.', true);
        }
      }, (baseProjectFetchErr) => {
        this.loader.login = false;
        console.error(baseProjectFetchErr);
        this._toaster.toast('error', 'Error', 'Error While Fetching base project.', true);
      });
    } catch (baseErr) {
      this.loader.login = false;
      console.error(baseErr);
    }
  }

  getDefaultRoute(landing_url?) {
    try {
      const userDetails = this._auth.getUserDetails();
      const uRPerm = userDetails?.user_role_permissions || {};
      if (landing_url) {
        for (let eachRoute of Config.CONSTANTS.headerTabs) {
          if (landing_url.includes(eachRoute['route']) && uRPerm?.[eachRoute['value']]?.view) {
            return landing_url;
          }
        }
      }
      if (uRPerm?.visualize?.view) {
        return 'app/dashboard/visualize';
      } else {
        return Config.CONSTANTS.headerTabs[0]['route'];
      }
    } catch (defErr) {
      console.error(defErr);
      return 'app/dashboard/visualize';
    }
  }

  forgotPassword() {
    if (this.loginForm.invalid) {
      this.validateAllFormFields(this.loginForm);
      this._toaster.toast('warning', 'Warning', 'Please fill all the required fields', true);
      return;
    }
    const input = {
      userName: this.userDet.username,
      user_id: this.userDet.username,
      captcha: this.userDet.captcha,
    };
    this.appservice.forgotPassword(input).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if (response?.status === 'success') {
        // this.markAsPristine(this.loginForm, 'password');
        // this.markAsPristine(this.loginForm, 'forgotKey');
        // this.loading['forgotPassword'] = false;
        // this.disable_switch = false;
        this._toaster.toast('success', 'Success', response['message'], true);
        this.userDet.captcha = null;
        this.cleanAllFormFields(this.loginForm);
        this.userDet.password = null;
        this.changePageType('updatePassword');
        this.getCaptcha();
      } else {
        // this.loading['forgotPassword'] = false;
        // this.disable_switch = false;
        this.getCaptcha();
        this._toaster.toast('error', 'Error', response['message'], true);
      }
    }, (error) => {
      console.error(error);
      // this.loading['forgotPassword'] = false;
      // this.disable_switch = false;
      this._toaster.toast('error', 'Error', 'Failed to reset password', true);
    });
  
  }

  resetPassword() {
    if (this.loginForm.invalid) {
      this.validateAllFormFields(this.loginForm);
      this._toaster.toast('warning', 'Warning', 'Please fill all the required fields', true);
      return;
    }
    // if (!this._utility.checkPassword(this.userDet.password)) {
    //   this._toaster.toast('info', 'Information', 'Please enter valid password', true);
    //   return;
    // }
    if (this.userDet.password !== this.userDet.confirmPassword) {
      this._toaster.toast('warning', 'Warning', 'Confirm Password and New Password both are not same.', true);
      return;
    }
      const input = {};
    input['userName'] = this.userDet.username;
    input['key'] = this.userDet.activationKey;
    input['captcha'] = this.userDet.captcha;
    input['new_password'] = this._utility.encryptPasswordWithUsername(this.userDet.password, this.userDet.username);
    // this.loading['updatePassword'] = true;
    // this.disable_switch = true;
    this.appservice.resetPassword(input).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data?.status === 'success') {
        // this.loading['updatePassword'] = false;
        // this.disable_switch = false;
        this.cleanAllFormFields(this.loginForm);
        this.changePageType('normalLogin')
        this._toaster.toast('success', 'Success', data['message'], true);

      } else {
        // this.loading['updatePassword'] = false;
        // this.disable_switch = false;
        this.getCaptcha();
        this._toaster.toast('error', 'Error', data['message'], true);
      }
    }, (error) => {
      // this.loading['updatePassword'] = false;
      this.getCaptcha();
      this._toaster.toast('error', 'Error', 'Error while updating the password.', true);
    });
  }
  get f() { return this.loginForm.controls; }

  clearAllFormFields() {
    this.userDet.username = null;
    this.userDet.password = null;
    this.userDet.captcha = null;
    this.userDet.activationKey = null;
    this.userDet.confirmPassword = null;
  }

  isregexSatisfies(regex: any) {
    try {
      if (!regex){
        return false;
      }
      if (regex?.test(this.userDet?.password)) {
        return true;
      }
      return false;
    } catch (regexErr) {
      console.error(regexErr);
      return false;
    }
  }

  getOTP() {
    try {
      this.appservice.getOTP({phone_number: this.userDet.phonenumber}).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response?.status === 'success') {
          this.page = 'otp';
        } else {
          this._toaster.toast('error', 'Error', 'Error while fetching the otp.', true);
        }
        }, (error) => {
          this._toaster.toast('error', 'Error', 'Error while fetching the otp.', true);
        });
    } catch (otpErr) {
      console.error(otpErr);
    }
  }

  verifyOTP() {
    try {
      this.appservice.verifyOTP({phone_number: this.userDet.phonenumber, otp: this.userDet.otp}).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response?.status === 'success') {
          this.page = 'otp';
        } else {
          this._toaster.toast('error', 'Error', 'Error while logging in. Please try again later.', true);
        }
        }, (error) => {
          this._toaster.toast('error', 'Error', 'Error while logging in. Please try again later.', true);
        });
    } catch (otpErr) {
      console.error(otpErr);
    }
  }

  
}
