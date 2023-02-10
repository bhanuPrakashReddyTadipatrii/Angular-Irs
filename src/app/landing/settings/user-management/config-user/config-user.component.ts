import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UtilityFunctions } from '../../../../utilities/utility-func';
import { AppService } from '../../../../services/app.service';
import { ToasterService } from '../../../../shared/toastr/toaster.service';

@Component({
  selector: 'ucp-config-user',
  templateUrl: './config-user.component.html',
  styleUrls: ['./config-user.component.scss']
})
export class ConfigUserComponent implements OnInit, OnChanges {

  @Input() pageconf: any = {
    id: null,
    type: null,
    data: null,
  };
  @Output() userEmitter = new EventEmitter();
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
  public userForm: FormGroup;
  public userData: any = {
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phonenumber: [],
    userrole: null,
    user_id: '',
    access_group_ids: [], 
  };
  public allFields: any = ['name', 'username', 'password', 'confirmPassword', 'email', 'phonenumber', 'userrole', 'access_group_ids'];
  public loader: any = {
    saveUser: false,
    fetch: false,
  };
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  public dropdownData: any = {
    'user-roles': [],
    'user-access-groups': [],
  }
  constructor(private appservice: AppService, private toaster: ToasterService, private _util: UtilityFunctions) { 
    if (this.pageconf?.id) {
      this.fetchUser();
    } else {
      this.activateValidation();
    }
   }

  ngOnInit(): void {
    this.loadData('user-roles');
    this.loadData('user-access-groups');
  }

  confirmPasswordValidator(control: FormControl): { [key: string]: boolean } | null {
    const controls_root = control.root['controls'];
    if (controls_root) {
      if (controls_root['password'] && controls_root['password']['value']) {
        const confirmPassword = control.value;
        const password = controls_root['password']['value'];
        if (password === confirmPassword) {
          if (controls_root['password']['invalid'] || controls_root['confirmPassword']['invalid']) {
            controls_root['password'].setErrors();
            controls_root['confirmPassword'].setErrors();
          }
          return null;
        }
        return { validating_passwords: true };
      }
    }
    return null;
  }

  activateValidation() {
    const validateObject = {};
    for (let ind = 0; ind < this.allFields?.length; ind++) {
      if (this.allFields[ind] === 'email') {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: null, disabled: false }, [Validators.required, Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')],
        );
      } else if (!this.pageconf?.id && (this.allFields[ind] === 'confirmPassword' || this.allFields[ind] === 'password')) {
        if (this.allFields[ind] === 'confirmPassword' ) {
          validateObject[this.allFields[ind]] = new FormControl(
            { value: null, disabled: false }, [Validators.required, Validators.minLength(8), this.confirmPasswordValidator],
          );
        } else {
          validateObject[this.allFields[ind]] = new FormControl(
            { value: null, disabled: false }, [Validators.required, Validators.minLength(8)],
          );
        }
      } else if (this.allFields[ind] === 'username') {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: null, disabled: this.pageconf?.id }, [Validators.required, Validators.minLength(5)],
        );
      } else {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: null, disabled: false }, [(this.pageconf?.id && (this.allFields[ind] === 'confirmPassword' || this.allFields[ind] === 'password')) || (this.allFields[ind] === 'access_group_ids') ?  Validators.nullValidator : Validators.required],
        );
      }
    }
    this.userForm = new FormGroup(validateObject);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageconf']) {
      if (this.pageconf?.id) {
        this.fetchUser();
      }
    }
  }

  fetchUser() {
    try {
      this.loader.fetch = true;
      this.appservice.fetchUser({user_id: this.pageconf?.id}).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.userData = respData?.data;
          this.loader.fetch = false;
          this.activateValidation();
        } else {
          this.loader.fetch = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.fetch = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
        console.error(error);
      });
    } catch (fetchErr) {
      this.loader.fetch = false;
      console.error(fetchErr);
    }
  }

  loadData(type) {
    try {
      let serviceCall: any;
      switch (type) {
        case 'user-roles':
          serviceCall = 'getUserRoleDetails'
          break;
        case 'user-access-groups':
          serviceCall = 'getUserAccessGroupDetails'
          break;
      }
      if (!serviceCall) {
        return;
      }
      this.loader.table = true;
      this.appservice[serviceCall]().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.dropdownData[type] = respData?.data?.rowData || [];
          this.loader.table = false;
        } else {
          this.loader.table = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.table = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
        console.error(error);
      });
    } catch (table_error) {
      this.loader.table = false;
      console.error(table_error)
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

  get f() {
    return this.userForm.controls;
  }

  saveUser() {
    try {
      if (this.userForm.invalid) {
        this.validateAllFormFields(this.userForm);
        this.toaster.toast('warning', 'Warning', 'Please fill all the required fields correctly.', true);
        return;
      }
      const savePayload: any = JSON.parse(JSON.stringify(this.userData));
      if (this.pageconf?.id) {
        savePayload['user_id'] = this.pageconf['id'];
        delete savePayload['password'];
      } else {
        if (this.userData['password'] !== this.userData['confirmPassword']) {
          this.toaster.toast('warning', 'Warning', 'Confirm Password is not same as Password.', true);
          return;
        }
        let regexCheck: any = true;
        for (let eachRegex of this.passwordValidator) {
          regexCheck = regexCheck && this.isregexSatisfies(eachRegex?.regex);
          if (!regexCheck) {
            this.toaster.toast('warning', 'Warning', 'Please fill the password correctly.', true);
            return;
          }
        }
        savePayload['password'] = this._util.encryptPasswordWithUsername(savePayload['password'], savePayload['username']);
      }
      delete savePayload['confirmPassword'];
      this.loader.saveUser = true;
      this.appservice.saveUser(savePayload).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
        if (respData && respData['status'] === 'success') {
          this.toaster.toast('success', 'Success', respData['message'] || 'User saved successfully.');
          this.loader.saveUser = false;
          this.emitData('save');
        } else {
          this.loader.saveUser = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving user.');
        }
      }, (error) => {
        this.loader.saveUser = false;
        this.toaster.toast('error', 'Error', 'Error while saving user.');
        console.error(error);
      });
    } catch (groupErr) {
      this.loader.saveUser = false;
      console.error(groupErr);
    }
  }

  cancelUser() {
    try {
      this.emitData('cancel');
    } catch (cancelUserErr) {
      console.error(cancelUserErr);
    }
  }

  emitData(key, data?) {
    const emitJson: any = {
      page: 'users',
      type: key,
    }
    if (data) {
      emitJson['data'] = data;
    }
    this.userEmitter.emit(emitJson);
  }

  isregexSatisfies(regex: any) {
    try {
      if (!regex){
        return false;
      }
      if (regex?.test(this.userData?.password)) {
        return true;
      }
      return false;
    } catch (regexErr) {
      console.error(regexErr);
      return false;
    }
  }
}
