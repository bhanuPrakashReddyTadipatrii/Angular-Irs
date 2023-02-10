import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../guards/auth.service';
import { AppService } from '../../../../services/app.service';
import { ToasterService } from '../../../../shared/toastr/toaster.service';

@Component({
  selector: 'ucp-config-user-role',
  templateUrl: './config-user-role.component.html',
  styleUrls: ['./config-user-role.component.scss']
})
export class ConfigUserRoleComponent implements OnInit {

  @Input() pageconf: any = {
    id: null,
    type: null,
    data: null,
  };
  @Output() userRoleEmitter = new EventEmitter();
  public userRoleForm: FormGroup = new FormGroup({
    user_role_name: new FormControl({ value: null, disabled: false }, [Validators.required]),
    user_role_description: new FormControl({ value: null, disabled: false }, [Validators.required]),
  });
  public userRoleData: any = {
    user_role_name: null,
    user_role_description: null,
  };
  public loader: any = {
    saveRole: false,
    fetch: false,
  };
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public activeTab: any;
  public openTab: any = true;
  public accordionView: any = [];
  public allPermList: any = [];
  public accessPermission: any = {};
  public subscription: Subscription;
  public defaultParams: any = ['create', 'edit', 'delete', 'view'];
  constructor(private appservice: AppService, private toaster: ToasterService, private _auth: AuthService) {
    this.fetchUserAccessPermissions();
  }

  ngOnInit(): void {
  }

  fetchUserAccessPermissions() {
    try {
      this.loader.fetchPerm = true;
      this.appservice.fetchUserAccessPermissions().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.accordionView = respData?.data?.items;
          this.allPermList = respData?.data?.allPermissionList;
          this.accessPermission = this.setPermissions() || {};
          this.loader.fetchPerm = false;
          if (this.pageconf?.id) {
            this.fetchUserRole();
          }
        } else {
          this.loader.fetchPerm = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.fetchPerm = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
        console.error(error);
      });
    } catch (fetchPermErr) {
      this.loader.fetchPerm = false;
      console.error(fetchPermErr);
    }
  }

  fetchUserRole() {
    try {
      this.loader.fetch = true;
      this.appservice.fetchUserRole({user_role_id: this.pageconf?.id}).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.userRoleData.user_role_name = respData?.data?.user_role_name;
          this.userRoleData.user_role_description = respData?.data?.user_role_description;
          this.accessPermission = respData?.data?.user_role_permissions || {};
          this.accessPermission = this.setPermissions();
          this.loader.fetch = false;
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

  setPermissions() {
    try {
      const permissions: any = {}
      for (let eachItem of this.accordionView) {
        permissions[eachItem?.value] = {}
        for (let eachPerm of this.allPermList) {
          if (this.defaultParams?.includes(eachPerm?.value)) {
            if (!(eachItem?.hideDefaultPerms?.includes(eachPerm?.value))) {
              permissions[eachItem?.value][eachPerm?.value] = this.accessPermission?.[eachItem?.value]?.[eachPerm?.value] || false;
            } else {
              permissions[eachItem?.value][eachPerm?.value] = false;
            }
          } else {
            if (eachItem?.extraPerms?.includes(eachPerm?.value)) {
              permissions[eachItem?.value][eachPerm?.value] = this.accessPermission?.[eachItem?.value]?.[eachPerm?.value] || false;
            }
          }
        }
        for (let eachPer of this.allPermList) {
          if (eachItem?.parent && (this.defaultParams.includes(eachPer?.value) || eachItem?.extraPerms?.includes(eachPer?.value))) {
            permissions[eachItem?.value][eachPer?.value] = this.accessPermission?.[eachItem.parent]?.[eachPer?.value] ? this.accessPermission?.[eachItem?.value]?.[eachPer?.value] || false : false
          }
        }
      }
      return permissions || {}
    } catch (setPermErr) {
      console.error(setPermErr);
      return {};
    }
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['pageconf']) {
  //     this.fetchUserAccessPermissions();
  //   }
  // }

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
    return this.userRoleForm.controls;
  }

  checkPermissions() {
    try {
      let checkedPerm: any = false;
      for (let eachSec in this.accessPermission) {
        for (let eachPerm in this.accessPermission[eachSec]) {
          checkedPerm = checkedPerm || this.accessPermission[eachSec][eachPerm]
        }
      }
      return checkedPerm;
    } catch (permErr) {
      console.error(permErr)
    }
  }

  saveUserRole() {
    try {
      if (this.userRoleForm.invalid) {
        this.validateAllFormFields(this.userRoleForm);
        this.toaster.toast('warning', 'Warning', 'Please fill all the required fields.', true);
        return;
      }
      if (!this.checkPermissions()) {
        this.toaster.toast('warning', 'Warning', 'Please set atleast one permission to this user role.', true);
        return;
      }
      this.accessPermission = this.setPermissions();
      const savePayload: any = { ...this.userRoleData, user_role_permissions: this.accessPermission};
      if (this.pageconf?.id) {
        savePayload['user_role_id'] = this.pageconf['id'];
      }
      this.loader.saveRole = true;
      this.appservice.saveUserRole(savePayload).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
        if (respData && respData['status'] === 'success') {
          if (this.pageconf?.id) {
            this._auth.logout()
          }
          this.loader.saveRole = false;
          this.toaster.toast('success', 'Success', respData['message'] || 'User role saved successfully.');
          this.emitData('save');
        } else {
          this.loader.saveRole = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving user role.');
        }
      }, (error) => {
        this.loader.saveRole = false;
        this.toaster.toast('error', 'Error', 'Error while saving user role.');
        console.error(error);
      });
    } catch (groupErr) {
      this.loader.saveRole = false;
      console.error(groupErr);
    }
  }

  cancelUserRole() {
    try {
      this.emitData('cancel');
    } catch (cancelUserErr) {
      console.error(cancelUserErr);
    }
  }

  emitData(key, data?) {
    const emitJson: any = {
      page: 'user-roles',
      type: key,
    }
    if (data) {
      emitJson['data'] = data;
    }
    this.userRoleEmitter.emit(emitJson);
  }
  
  changeactiveTab(activeAccTab: any) {
    if (this.activeTab === activeAccTab.value) {
      this.activeTab = null;
      return;
    }
    this.activeTab = activeAccTab.value;
  }

  openAccessTab() {
    this.openTab = !this.openTab;
  }

  onPermChange(tab, perm) {
    try {
      if (perm ==='view' && !this.accessPermission[tab]['view']) {
        for (let eachPerm of this.allPermList) {
          if (eachPerm?.value !== 'view' && this.accessPermission[tab]?.hasOwnProperty(eachPerm?.value)) {
            this.accessPermission[tab][eachPerm?.value] = false;
          }
        }
        return;
      }
      const remaningPerm: any = Object.keys(this.accessPermission[tab]).some((ele: any) => ele !== 'view' && this.accessPermission[tab][ele]);
      if (perm !== 'view' && remaningPerm) {
        this.accessPermission[tab]['view'] = true;
      }
    } catch (tabErr) {
      console.error(tabErr);
    }
  }
  
}
