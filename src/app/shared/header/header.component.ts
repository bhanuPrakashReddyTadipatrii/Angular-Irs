import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '../toastr/toaster.service';
import { AuthService } from '../../guards/auth.service';
import { AppService } from '../../services/app.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonPopupService } from '../common-popup/common-popup.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilityFunctions } from '../../utilities/utility-func';

@Component({
  selector: 'ucp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public loading: any = {
    userLogout: false,
    fetchUser: false,
  };
  public userName: any = 'Admin';
  public fullScreenActive: any = false;
  public elem: any;
  public userDetails: any = {};
  public projectDetails: any;
  public tabs: any = [];
  public choosenTab: any = null;
  public profile_url: any;
  public profileImageDetails: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public loader: any = {
    project: false,
    delete: false,
    saveUser: false,
    fetch: false,
    savePassword: false,
    saveProfileImage: false
  }
  public profileForm: FormGroup = new FormGroup({
    name: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    username: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    email: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    phonenumber: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    userrole: new FormControl({ value: null, disabled: true }, [Validators.nullValidator]),
    user_id: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    access_group_ids: new FormControl({ value: null, disabled: true }, [Validators.nullValidator]),

  });
  public passwordForm: FormGroup = new FormGroup({
    password: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    confirmPassword: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    newPassword: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
  });

  public profileData: any = {
    name: '',
    username: '',
    phonenumber: [],
    userrole: null,
    user_id: '',
    access_group_ids: [],
  };
  public passwordData: any = {
    password: '',
    confirmPassword: '',
    newPassword: '',
    username: ''
  };
  public allFields: any = ['name', 'username', 'password', 'confirmPassword', 'newPassword', 'email', 'phonenumber', 'userrole', 'access_group_ids'];
  public passwordValidator = [
    {
      label: 'One lowercase letter',
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
  public dropdownData: any = {
    'user-roles': [],
    'user-access-groups': [],
  }
  public meta: any = {
    id: null,
    type: null,
  };
  public metaData = {
    passwordInvalid: false,
  };
  public storedUserDetails: any = {
    full_name: null,
    user_role_name: null,
    profile_url: null,
  };
  public themes: any = {
    'default-skin' : {
      theme: 'default-skin',
      tableClass: 'ag-theme-alphine',
      label: 'Light Theme'
    },
    'dark-theme' : {
      theme: 'dark-theme',
      tableClass: 'ag-theme-dark',
      label: 'Dark Theme'
    }
  };
  public selectedTheme: any = {
    theme: 'default-skin',
    tableClass: 'ag-theme-alphine',
    label: 'Light Theme'
  };

  @HostListener('window:fullscreenchange', ['$event'])
  fullscreenChange($event) {
    this.fullScreenActive = this.document.fullscreen;
  }

  constructor(@Inject(DOCUMENT) private document: any, private toasterService: ToasterService, private router: Router, private _auth: AuthService, private appservice: AppService, public commonPopup: CommonPopupService, private _util: UtilityFunctions) {
    this.tabs = this._auth.getHeaderTabs() || [];
  }

  ngOnInit(): void {
    if (this.router.url) {
      // for (let eachTab of this.tabs) {
      //   if (this.router.url.includes(eachTab?.route)) {
      //     this.choosenTab = eachTab?.value;
      //   }
      // }
      // this.viewAllProjects();
    }
    this.updateUserDetails();
    this.elem = document.documentElement;

    let themes = JSON.parse(this._auth.getLocalStorage('theme'));
    if (themes) {
      this.selectedTheme = themes;
    }
  }

  updateUserDetails() {
    try {
      this.userDetails = this._auth.getUserDetails();
      this.storedUserDetails = {
        full_name: this.userDetails?.full_name || '',
        user_role_name: this.userDetails?.user_role_name || '',
        profile_url: '',
      };
      this.appservice.getProfileImage().pipe(takeUntil(this.destroy$)).subscribe(
        (serviceData) => {
          if (serviceData.status === "success") {
            this.storedUserDetails['profile_url'] = serviceData.data || undefined;
            this.profile_url = serviceData.data || undefined;
          } else {
            this.storedUserDetails['profile_url'] = 'assets/images/profile.png';
          }
        }, (error) => {
          console.error(error);
          this.storedUserDetails['profile_url'] = 'assets/images/profile.png';
        });
    } catch (err) {
      this.storedUserDetails['profile_url'] = 'assets/images/profile.png';
      console.error(err);
    }
  }

  viewAllProjects() {
    try {
      this.loader['project'] = true;
      this.appservice.fetchProjects().pipe(takeUntil(this.destroy$)).subscribe((respData) => {
        if (respData?.status === 'success') {
          this.projectDetails = respData?.data?.rowData || [];
          this.loader['project'] = false;
        } else {
          this.loader['project'] = false;
          // this.toasterService.toast('error', 'Error', respData.message || 'Error while listing projects.', true);
        }
      }, (error) => {
        console.error(error);
        this.loading['project'] = false;
        // this.toasterService.toast('error', 'Error', 'Error while listing projects.', true);
      },
      );
    } catch (error) {
      this.loading['project'] = false;
      console.error(error);
    }
  }

  changeProject(projectId) {
    try {
      if (!projectId || (projectId === this.getProjectDetails('project_id'))) {
        this.toasterService.toast('info', 'Info', 'Already in the same project.', true);
        return;
      }
      const projectPerm = this._auth.getUserPermissions('project_info');
      if (!projectPerm?.switch_project) {
        this.toasterService.toast('info', 'Info', `Please contact Administrator to switch project.`, true);
        return;
      }
      // const projectComponent = new ProjectsComponent(this.document, this.toasterService, this.router, this._auth, this.appservice, this.commonPopup, this._util);
      // projectComponent.changeProject({ project_id: projectId }, true);
    } catch (projErr) {
      console.error(projErr);
    }
  }

  switchTabs(tab) {
    this.choosenTab = tab?.value;
    this.routeTo(tab.route);
  }

  routeTo(route) {
    try {
      this.router.navigate([route]);
    } catch (routeErr) {
      console.error(routeErr);
    }
  }

  logOut() {
    try {
      this.loading['userLogout'] = true;
      const userDet: any = this._auth.getUserDetails();
      if (!userDet?.username || !userDet?.user_id) {
        this.router.navigate(['login']);
      }
      this.appservice.logoutUser({ user_name: this.userDetails.username, user_id: this.userDetails.user_id }).pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          if (data?.status === 'success') {
            // this.toasterService.toast('success', 'Success', data['message'], true);
            this._auth.deleteUserDetails(true);
            this._auth.deleteProjectDetails();
            // this._auth.deletePrevRouteDetails();
            // this.headerService['project_name'] = '';
            // this.headerService['logo_url'] = '';
            this.loading['userLogout'] = false;
            // if (clearPrevURL) {
            //   this._auth.deletePrevRouteDetails();
            // }
            this.router.navigate(['login']);
          } else {
            this.loading['userLogout'] = false;
            this.toasterService.toast('error', 'Error', data['message'] || 'Error While Logging Out', true);
          }
        },
        (error) => {
          console.error(error);
          this.loading['userLogout'] = false;
          this.toasterService.toast('error', 'Error', 'Error While Logging Out', true);
        },
      );
    } catch (error) {
      this.loading['userLogout'] = false;
      console.error(error);
    }
  }

  getProjectDetails(key) {
    try {
      if (key === 'project_name' || key === 'project_id') {
        return this._auth?.getProjectDetails()?.[key];
      }
      return '';
    } catch (keyErr) {
      console.error(keyErr);
    }
  }

  toggleFullscreen(event: any) {
    try {
      if (!this.fullScreenActive) {
        if (this.elem.requestFullscreen) {
          this.elem.requestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
          /* Firefox */
          this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
          /* Chrome, Safari and Opera */
          this.elem.webkitRequestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
          /* IE/Edge */
          this.elem.msRequestFullscreen();
        }
      } else {
        if (this.document.exitFullscreen) {
          this.document.exitFullscreen();
        } else if (this.document.mozCancelFullScreen) {
          this.document.mozCancelFullScreen();
        } else if (this.document.webkitExitFullscreen) {
          this.document.webkitExitFullscreen();
        } else if (this.document.msExitFullscreen) {
          this.document.msExitFullscreen();
        }
      }

    } catch (error) {
      console.error(error);
    }
  }

  confirmPasswordValidator(control: FormControl): { [key: string]: boolean } | null {
    const controls_root = control.root['controls'];
    if (controls_root) {
      if (controls_root['newPassword'] && controls_root['newPassword']['value']) {
        const confirmPassword = control.value;
        const password = controls_root['newPassword']['value'];
        if (password === confirmPassword) {
          if (controls_root['newPassword']['invalid'] || controls_root['confirmPassword']['invalid']) {
            controls_root['newPassword'].setErrors();
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
    const passwordValidateObj = {};
    for (let ind = 0; ind < this.allFields?.length; ind++) {
      if (this.allFields[ind] === 'email') {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: this.profileData[this.allFields[ind]] || null, disabled: false }, [Validators.required, Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')],
        );
      } else if (this.allFields[ind] === 'username') {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: this.profileData[this.allFields[ind]] || null, disabled: this.userDetails?.user_id }, [Validators.required, Validators.minLength(5)],
        );
      } else if (this.allFields[ind] === 'confirmPassword' || this.allFields[ind] === 'password' || this.allFields[ind] === 'newPassword') {
        if (this.allFields[ind] === 'confirmPassword') {
          passwordValidateObj[this.allFields[ind]] = new FormControl(
            { value: this.passwordData[this.allFields[ind]] || null, disabled: false }, [Validators.required, Validators.minLength(8)],
          );
        } else {
          passwordValidateObj[this.allFields[ind]] = new FormControl(
            { value: null, disabled: false }, [Validators.required, Validators.minLength(8)],
          );
        }
      } else {
        validateObject[this.allFields[ind]] = new FormControl(
          { value: this.profileData[this.allFields[ind]] || null, disabled: false }, [this.userDetails?.user_id && (this.allFields[ind] === 'confirmPassword' || this.allFields[ind] === 'password') || this.allFields[ind] === 'newPassword' ? Validators.nullValidator : Validators.required],
        );
      }
    }
    this.profileForm = new FormGroup(validateObject);
    this.passwordForm = new FormGroup(passwordValidateObj);
  }

  openModal(id: any) {
    try {
      const domEle: any = document.getElementById(id);
      if (domEle) {
        domEle.click();
      }
    } catch (idErr) {
      console.error(idErr);
    }
  }

  fetchUser() {
    try {
      this.loader.fetch = true;
      this.appservice.fetchUser({ user_id: this.userDetails?.user_id }).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.updateUserDetails();
          this.profileData = respData?.data;
          this.profileData = { ...this.profileData };
          this.loader.fetch = false;
          this.activateValidation();
          this.loadData('user-roles');
          this.loadData('user-access-groups');
          this.openModal('profileBtn');
        } else {
          this.loader.fetch = false;
          this.toasterService.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.fetch = false;
        this.toasterService.toast('error', 'Error', 'Error while fetching data.');
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
          this.toasterService.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.table = false;
        this.toasterService.toast('error', 'Error', 'Error while fetching data.');
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
    return this.profileForm.controls;
  }

  get p() {
    return this.passwordForm.controls;
  }

  updateProfile() {
    try {
      if (this.profileForm.invalid) {
        this.validateAllFormFields(this.profileForm);
        this.toasterService.toast('warning', 'Warning', 'Please fill all the required fields correctly.', true);
        return;
      }
      const savePayload: any = JSON.parse(JSON.stringify(this.profileData));
      if (!savePayload?.user_id) {
        return;
      }
      this.loader.saveUser = true;
      this.appservice.saveUser(savePayload).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
        if (respData && respData['status'] === 'success') {
          if (this.profileImageDetails) {
            this.updateImage();
          } else {
            this.openModal('closeProfile');
            const userDet: any = this._auth.getUserDetails();
            if (userDet) {
              this._auth.storeUserDetails(userDet);
          }
          this.updateUserDetails();
            this.toasterService.toast('success', 'Success', respData['message'] || 'User Profile updated successfully.');
          }
          
          this.loader.saveUser = false;
        } else {
          this.loader.saveUser = false;
          this.toasterService.toast('error', 'Error', respData['message'] || 'Error while saving user.');
        }
      }, (error) => {
        this.loader.saveUser = false;
        this.toasterService.toast('error', 'Error', 'Error while saving user.');
        console.error(error);
      });
    } catch (groupErr) {
      this.loader.saveUser = false;
      console.error(groupErr);
    }
  }
  updateImage() {
    this.loader.saveProfileImage = true;
    const formData = new FormData();
    formData.append('image_data', this.profileImageDetails);
    formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
    this.appservice.saveProfileImage(formData).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
      if (respData && respData['status'] === 'success') {
        this.toasterService.toast('success', 'Success', respData['message'] || 'User Profile updated successfully.');
        this.loader.saveProfileImage = false;
        this.openModal('closeProfile');
        const userDet: any = this._auth.getUserDetails();
          if (userDet) {
            this._auth.storeUserDetails(userDet);
          }
          this.updateUserDetails();
      } else {
        this.loader.saveProfileImage = false;
        this.toasterService.toast('error', 'Error', respData['message'] || 'Error while updating User Profile.');
      }
    }, (error) => {
      this.loader.saveProfileImage = false;
      this.toasterService.toast('error', 'Error', 'Error while updating User Profile.');
      console.error(error);
    });
  }

  updatePassword() {
    try {
      if (this.passwordForm.invalid) {
        this.validateAllFormFields(this.passwordForm);
        this.toasterService.toast('warning', 'Warning', 'Please fill all the required fields correctly.', true);
        return;
      }
      if (!this.userDetails?.user_id) {
        return;
      }
      if (this.passwordData['newPassword'] !== this.passwordData['confirmPassword']) {
        this.toasterService.toast('warning', 'Warning', 'Confirm Password is not same as Password.', true);
        return;
      }
      let regexCheck: any = true;
      for (let eachRegex of this.passwordValidator) {
        regexCheck = regexCheck && this.isregexSatisfies(eachRegex?.regex);
      }
      if (!regexCheck) {
        this.toasterService.toast('warning', 'Warning', 'Please fill the password correctly.', true);
        return;
      }
      const savePassword: any = {
        userName: this.userDetails.username,
        password: this.passwordData?.password,
        newPassword: this.passwordData.newPassword,
      };
      savePassword['userName'] = this.userDetails.username;
      savePassword['password'] = this._util.encryptPasswordWithUsername(savePassword['password'], savePassword['userName']);
      savePassword['newPassword'] = this._util.encryptPasswordWithUsername(savePassword['newPassword'], savePassword['userName']);
      this.loader.savePassword = true;
      this.appservice.updatePassword(savePassword).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
        if (respData && respData['status'] === 'success') {
          this.toasterService.toast('success', 'Success', respData['message'] || 'Password changed successfully..');
          this.loader.savePassword = false;
          this.openModal('closePassword');
          this.logOut();
        } else {
          this.loader.savePassword = false;
          this.toasterService.toast('error', 'Error', respData['message'] || 'Error while changing the password.');
        }
      }, (error) => {
        this.loader.savePassword = false;
        this.toasterService.toast('error', 'Error', 'Error while changing the password.');
        console.error(error);
      });
    } catch (groupErr) {
      this.loader.savePassword = false;
      console.error(groupErr);
    }
  }

  changePassword() {
    try {
      this.loader.fetch = true;
      this.passwordData = {};
      this.activateValidation();
      this.openModal('passwordBtn');
    } catch (fetchErr) {
      this.loader.fetch = false;
      console.error(fetchErr);
    }
  }

  isregexSatisfies(regex: any = false) {
    try {
      if (!regex || !this.passwordData?.newPassword) {
        return false;
      }
      if (regex?.test(this.passwordData?.newPassword)) {
        return true;
      }
      return false;
    } catch (regexErr) {
      console.error(regexErr);
      return false;
    }
  }

  // onSelectFile(event) {
  //   if (event.target.files && event.target.files[0]) {
  //     var reader = new FileReader();

  //     reader.readAsDataURL(event.target.files[0]); 

  //     reader.onload = (event) => { 
  //       this.url = event.target.result;
  //     }
  //   }
  // }

  fileChangeEvent(event) {

    try {
      if (event.target.files[0]) {
        var size = event.target.files[0].size / 1024;
      }
      if (size > 500) {
        this.toasterService.toast('warning', 'Maximium file size', 'Cannot upload files more than 500 KB.', true);
        return;
      }
      const fileList: FileList = event.target.files;
      const ValidImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/JPEG', 'image/PNG', 'image/JPG', 'image/gif', 'image/GIF'];
      if (fileList.length > 0) {
        const file: File = fileList[0];
        const imageContent = {
          file_name: '',
          img_str: '',
        };
        const reader: FileReader = new FileReader();
        reader.onload = ((frEvent) => {
          const imgContent: any = frEvent.target['result'];
          this.profile_url = frEvent.target['result'];
          if (imgContent.length > 0 && ValidImageTypes.indexOf(file.type) > -1) {
            imageContent.file_name = file.name.replace(/\s/g, '');
            imageContent.img_str = imgContent.split(',')[1];
            // tslint:disable-next-line:prefer-template
            this.profileImageDetails = event.target.files[0];
          } else {
            this.toasterService.toast('warning', 'Warning', 'Invalid File Format', true);
            return;
          }
        });
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.log(error);
    }
  }

  checkValidation() {
    try {
      this.passwordValidator.forEach(element => {
        element['isPresent'] = this._util.checkRegex(element.regex, this.passwordData.newPassword);
      });
      this.metaData['passwordInvalid'] = this.passwordValidator.some(eachItem => !eachItem['isPresent']);
    } catch (error) {
      console.error(error);
    }
  }

  switchTheme(eachTheme) {
    document.body.classList.add(eachTheme);
    document.body.classList.remove(this.selectedTheme?.theme);
    this.selectedTheme.theme = eachTheme;

    let themeStyle: any = this.themes['default-skin'];

    if (eachTheme === 'dark-theme') {
      themeStyle = this.themes['dark-theme'];
    }
    this._auth.setLocalStorage('theme', JSON.stringify(themeStyle));
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}

