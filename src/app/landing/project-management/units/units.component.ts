import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AppService } from '../../../services/app.service';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../guards/auth.service';
import { UtilityFunctions } from '../../../utilities/utility-func';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';

@Component({
  selector: 'ucp-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {
  public agGridOptions: any;
  public userRolePermissions: any = {};
  public unitKey: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  public unitData: any = {
    unit_name: null,
    notation: null,
    unit_id: null,
  }
  public loader: any = {
    units: false,
    delete: false,
    save: false,
  }
  public unitForm: FormGroup = new FormGroup({
    unit_name: new FormControl({ value: null, disabled: false }, [Validators.required]),
    notation: new FormControl({ value: null, disabled: false }, [Validators.required]),
  });
  constructor(public toaster: ToasterService, private appservice: AppService, private router: Router, public commonPopup: CommonPopupService, private _auth: AuthService, private _util: UtilityFunctions) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_unit') {
          this.confirmConfDelete(data?.data);
        }
      }
    });
    const unitPerm = this._auth.getUserPermissions('units');
    if (unitPerm) {
      this.userRolePermissions['create'] = unitPerm['create'];
      this.userRolePermissions['edit'] = unitPerm['edit'];
      this.userRolePermissions['delete'] = unitPerm['delete'];
      this.userRolePermissions['view'] = unitPerm['view'];
    }
  }

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable() {
    try {
      this.loader.units = true;
      this.appservice.fetchUnitData().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
          this.loader.units = false;
        } else {
          this.loader.units = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.units = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (table_error) {
      this.loader.units = false;
      console.error(table_error);
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

  aggridEmitter(event: any) {
    try {
      if (!event || !event?.action?.type) {
        return;
      }
      if (event && event?.action?.type) {
        switch (event.action.type) {
          case 'addnew':
            this.unitData = {
              unit_name: null,
              notation: null,
              unit_id: null,
            };
            this.unitKey = 'Add';
            this.openModal('configureUnitModal');
            break
          case 'edit':
            this.unitData = event.data;
            this.unitKey = 'Edit';
            this.openModal('configureUnitModal');
            break;
          case 'delete':
            const message1 = `Are you sure do you want to delete this unit (${event?.data?.unit_name})?`;
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_unit', event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }

  get f() {
    return this.unitForm.controls;
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

  saveModal() {
    try {
      if (this.unitForm.invalid) {
        this.validateAllFormFields(this.unitForm);
        this.toaster.toast('info', 'Info', 'Please fill all the required fields.');
        return;
      }
      this.loader['save'] = true;
      const payload = this.unitData;
      this.appservice.saveUnitData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.toaster.toast('success', ' Success', respData['message'] || 'Unit saved Successfully.');
          this.loader['save'] = false;
          this.loadTable();
          this.closeModal();
        } else {
          this.loader['save'] = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving the data.');
        }
      }, (error) => {
        console.error(error);
        this.loader['save'] = false;
        this.toaster.toast('error', 'Error', 'Error while saving the data.');
      });
    } catch (err) {
      this.loader['save'] = false;
      console.error(err);
    }
  }

  closeModal(isClosed?) {
    try {
      this.unitData.unit_name = null;
      this.unitData.notation = null;
      this.cleanAllFormFields(this.unitForm);
      if (!isClosed) {
        this.openModal('closeUnitModel');
      }
    } catch (err) {
      console.error(err);
    }
  }

  confirmConfDelete(event: any) {
    try {
      const dataToSend = {};
      this.loader['delete'] = true;
      dataToSend['unit_id'] = event?.data?.unit_id || '';
      this.appservice.deleteUnitData(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteData) => {
        if (deleteData?.status === 'success') {
          this.loader['delete'] = false;
          this.loadTable();
          this.toaster.toast('success', 'Success', deleteData.message || 'Unit deleted successfully.', true);
        } else {
          this.loader['delete'] = false;
          this.toaster.toast('error', 'Error', deleteData.message || 'Error while deleting the Unit.', true);
        }
      }, (deleteConfigErr) => {
        this.loader['delete'] = false;
        console.error(deleteConfigErr);
        this.toaster.toast('error', 'Error', 'Error while deleting the Unit.', true);
      });
    } catch (error) {
      this.loader['delete'] = false;
      this.toaster.toast('error', 'Error', 'Error while deleting the Unit.', true);
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

}
