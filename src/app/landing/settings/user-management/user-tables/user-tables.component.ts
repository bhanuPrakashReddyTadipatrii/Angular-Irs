import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { GridApi } from '@ag-grid-community/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../../services/app.service';
import { ToasterService } from '../../../../shared/toastr/toaster.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonPopupService } from '../../../../shared/common-popup/common-popup.service';
import { Config } from '../../../../config/config';
import { AuthService } from '../../../../guards/auth.service';
import { UtilityFunctions } from '../../../../utilities/utility-func';

@Component({
  selector: 'ucp-user-tables',
  templateUrl: './user-tables.component.html',
  styleUrls: ['./user-tables.component.scss']
})
export class UserTablesComponent implements OnInit {

  @Input() pageType: any;
  public agGridOptions : any ;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public gridApi: GridApi;
  public gridColumnApi: any;
  public usersConf: any = ['users', 'user-roles', 'user-access-groups'];
  public userLabels: any = {};
  public selectedView: any;
  public loader: any = {
    table: false,
    delete: false,
  };
  public meta: any = {
    id: null,
    type: null,
  };
  public subscription: Subscription;
  public userRolePermissions: any  = {};

  constructor(
    private appservice: AppService, private toaster: ToasterService, private router: Router, private route: ActivatedRoute, public commonPopup: CommonPopupService, private _auth: AuthService, private _util: UtilityFunctions
  ) { 
    this.userLabels = Config.CONSTANTS.userLabels;
    this.route.params.subscribe((params: any) => {
      if (params && params.type) {
        this.pageBasedConf(params.type);
      }
    });
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === `delete_${this.selectedView}_item`) {
          this.confirmConfDelete(data?.data);
        }
      }
    });
    if (this.pageType) {
      this.pageBasedConf(this.pageType);
      this.setPermissions();
    }
  }

  setPermissions() {
    try {
      const permissionKey = Config.CONSTANTS.userLabels?.[this.pageType]?.permissionKey;
      if (permissionKey) {
        const userTablePerm = this._auth.getUserPermissions(permissionKey);
        if (userTablePerm) {
          this.userRolePermissions['create'] = userTablePerm['create'];
          this.userRolePermissions['edit'] = userTablePerm['edit'];
          this.userRolePermissions['delete'] = userTablePerm['delete'];
          this.userRolePermissions['view'] = userTablePerm['view'];
        }
      }
    } catch (permErr) {
      console.error(permErr);
    }
  }

  pageBasedConf(type: any) {
    try {
      switch (type) {
        case 'users':
          this.selectedView = 'users';
          break;
        case 'user-roles':
          this.selectedView = 'user-roles';
          break;
        case 'user-access-groups':
          this.selectedView = 'user-access-groups';
          break;
      }
      this.loadData();
    } catch (err) {
      console.error(err);
    }
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageType']) {
      this.pageBasedConf(this.pageType);
      this.setPermissions();
    }
  }

  /**
   * loads the user table data
   */
  loadData() {
    try {
      let serviceCall: any = 'getUserDetails';
      switch (this.selectedView) {
        case 'user-roles':
          serviceCall = 'getUserRoleDetails'
          break;
        case 'user-access-groups':
          serviceCall = 'getUserAccessGroupDetails'
          break;
        case 'users':
          serviceCall = 'getUserDetails'
          break;
      }
      this.loader.table = true;
      this.appservice[serviceCall]().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
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

  aggridEmitter(event: any) {
    try {
      if (!event || !event?.action?.type || !this.selectedView) {
        return;
      }
      if (event && event?.action?.type) {
        switch(event.action.type) {
          case 'addnew':
            this.meta['id'] = null;
            this.meta['data'] = null;
            this.meta['type'] = this.selectedView;
            this.openModal(`${this.selectedView}_id`);
            break
          case 'edit':
            this.meta['id'] = event.data[this.getId()];
            this.meta['data'] = event.data;
            this.meta['type'] = this.selectedView;
            this.openModal(`${this.selectedView}_id`);
            break;
          case 'delete':
            const message1 = `Are you sure do you want to delete this ${this.userLabels[this.selectedView]?.errorLabel} (${event?.data?.[this.userLabels[this.selectedView]?.titleKey]})?`;
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, `delete_${this.selectedView}_item`, event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }

  userConfEmitter(event) {
    try {
      if (!event || !event?.page || !event?.type) {
        return
      }
      if (event.type === 'cancel' || event.type === 'save') {
        this.meta = {
          id: null,
          type: null, 
          data: null,
        }
        this.openModal(`close_${event.page}_id`)
        if (event.type === 'save') {
          this.loadData();
        }
      }
    } catch (emitErr) {
      console.error(emitErr);
    }
  }

  openModal(id: any) {
    try {
      const domEle: any = document.getElementById(id);
      if (domEle) {
        domEle.click();
      }
    } catch (modalErr) {
      console.error(modalErr);
    }
  }

  closeUserConf() {
    this.meta = {
      id: null,
      page: null,
    }
  }

  getId() {
    switch (this.selectedView) {
      case 'user-roles':
        return 'user_role_id';
      case 'user-access-groups':
        return 'access_group_id';
      case 'users':
        return 'user_id';
    }
    return '';
  }

  confirmConfDelete(event: any) {
    try {
      const dataToSend = {};
      dataToSend[this.getId()] = event.data[this.getId()];
      let deleteServiceCall = '';
      switch (this.selectedView) {
        case 'user-roles':
          deleteServiceCall = 'deleteUserRole'
          break;
        case 'user-access-groups':
          deleteServiceCall = 'deleteUserGroup'
          break;
        case 'users':
          deleteServiceCall = 'deleteUser'
          break;
      }
      if (!deleteServiceCall) {
        return;
      }
      this.loader['delete'] = true;
      this.appservice[deleteServiceCall](dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteConfigRes) => {
        if (deleteConfigRes.status === 'success') {
          this.loader['delete'] = false;
          this.loadData();
          this.toaster.toast('success', 'Success', deleteConfigRes.message || `${this.userLabels[this.selectedView]['messageLabel']} deleted successfully.`, true);
        } else {
          this.loader['delete'] = false;
          this.toaster.toast('error', 'Error', deleteConfigRes.message || `Error while deleting ${this.userLabels[this.selectedView]['errorLabel']}.`, true);
        }
      }, (deleteConfigErr) => {
        this.loader['delete'] = false;
        console.error(deleteConfigErr);
        this.toaster.toast('error', 'Error', `Error while deleting ${this.userLabels[this.selectedView]['errorLabel']}.`, true);
      });
    } catch (error) {
      this.loader['delete'] = false;
      console.error(error);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
