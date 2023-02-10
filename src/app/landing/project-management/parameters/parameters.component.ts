import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { Router } from '@angular/router';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { stringToArray } from '@ag-grid-community/core';
import { AuthService } from '../../../guards/auth.service';
import { UtilityFunctions } from '../../../utilities/utility-func';


@Component({
  selector: 'ucp-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {
  public agGridOptions: any;
  public dfmData: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public unitList: any;
  public filterList: any;
  public subscription: Subscription;
  public paramKey: any;
  public paramForm: FormGroup = new FormGroup({
    unit: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    label: new FormControl({ value: null, disabled: false }, [Validators.required]),
    filter_type: new FormControl({ value: null, disabled: false }, [Validators.required]),
    range_select: new FormControl({ value: null, disabled: false }, [Validators.nullValidator]),
    round_decimal : new FormControl({value :null ,disabled : false}, [Validators.nullValidator]),
    // lower_threshold : new FormControl({value :null ,disabled : false}, [Validators.nullValidator]),
    // higher_threshold : new FormControl({value :null ,disabled : false}, [Validators.nullValidator])
  });
  public paramData: any = {
    label: null,
    unit: null,
    parameter_id: null,
    round_decimal :null,
    mark_important: false,
    // lower_threshold: null,
    // higher_threshold: null,
    limits: [],
    filter_type: null,
  }
  public loader: any = {
    parameter: false,
    delete: false,
    save: false,
    edit: false,
  }
  public userRolePermissions: any  = {};
  public fromList: any = [];
  public toList: any = [];
  public rangeList: any = [
    {
      label: 'Range Select',
      value: 'range_select'
    },
    {
      label: 'Single Select',
      value: 'single_select'
    }
  ]


  constructor(public toaster: ToasterService, private appservice: AppService, private router: Router, public commonPopup: CommonPopupService, private _auth: AuthService, private _util: UtilityFunctions) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_parameters_item') {
          this.confirmConfDelete(data?.data);
        }
      }
    });
    const paramPerm = this._auth.getUserPermissions('parameters');
    if (paramPerm) {
      this.userRolePermissions['create'] = paramPerm['create'];
      this.userRolePermissions['edit'] = paramPerm['edit'];
      this.userRolePermissions['delete'] = paramPerm['delete'];
      this.userRolePermissions['view'] = paramPerm['view'];
    }
  }
  ngOnInit(): void {
    this.loadTable();
  }

  loadTable() {
    try {
      this.loader.parameter = true;
      this.appservice.fetchParameterData().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
          this.loader.parameter = false;
        } else {
          this.loader.parameter = false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.parameter = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (table_error) {
      this.loader.parameter = false;
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
            this.paramData = {
              label: null,
              unit: null,
              parameter_id: null,
              limits: [],
              filter_type: null,
              round_decimal:null,
              mark_important: false,
              // higher_threshold: null,
              // lower_threshold: null,
            };
            this.getUnitList();
            this.paramKey = 'Add';
            this.openModal('configureModalButton');
            break
          case 'edit':
            const editPayload = { parameter_id: event?.data?.parameter_id } || {};
            this.getUnitList();
            this.paramKey = 'Edit';
            this.editParameter(editPayload);
            break;
          case 'delete':
            const message1 = `Are you sure do you want to delete this parameter (${event?.data?.label})?`;
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_parameters_item', event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }

  getUnitList() {
    try {
      this.appservice.getUnitList().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.unitList = respData?.data?.units?.length ? respData.data.units || [] : [];
          this.filterList = respData?.data?.filter_types?.length ? respData?.data?.filter_types || [] : [];
          this.fromList = respData?.data?.pre_qualifiers?.length ? respData?.data?.pre_qualifiers || [] : [];
          this.toList = respData?.data?.post_qualifiers?.length ? respData?.data?.post_qualifiers || [] : [];
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (unitErr) {
      console.error(unitErr);
    }
  }

  get f() {
    return this.paramForm.controls;
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
      if (this.paramForm.invalid) {
        this.validateAllFormFields(this.paramForm);
        this.toaster.toast('info', 'Info', 'Please fill all the required fields.');
        return;
      }
      if (!this.validateLimitRangeTable()) {
        return;
      }
      this.loader['save'] = true;
      const payload = this.paramData;
      this.appservice.saveParamData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.toaster.toast('success', ' Success', respData['message'] || 'Parameter saved successfully.');
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
      this.paramData.label = null;
      this.paramData.unit = null;
      this.paramData.filter_type = null;
      this.paramData.round_decimal = null;
      this.paramData.mark_important = false;
      // this.paramData.higher_threshold = null;
      // this.paramData.lower_threshold = null;
      this.paramData.limits = [];
      this.cleanAllFormFields(this.paramForm);
      if (!isClosed) {
        this.openModal('closeParamModel');
      }
    } catch (err) {
      console.error(err);
    }
  }

  editParameter(editPayload) {
    try {
      this.loader['edit'] = true;
      this.appservice.editParameterData(editPayload).pipe(takeUntil(this.destroy$)).subscribe((editDataRes) => {
        if (editDataRes?.status === 'success') {
          this.paramData = editDataRes?.data || {};
          this.loader['edit'] = false;
          this.openModal('configureModalButton');
        } else {
          this.loader['edit'] = false;
          this.toaster.toast('error', 'Error', editDataRes.message || 'Error while fetching Parameter data.', true);
        }
      }, (editConfigErr) => {
        this.loader['edit'] = false;
        console.error(editConfigErr);
        this.toaster.toast('error', 'Error', 'Error while fetching Parameter data.', true);
      });
    } catch (editErr) {
      this.loader['edit'] = false;
      this.toaster.toast('error', 'Error', 'Error while fetching Parameter data.', true);
      console.error(editErr);
    }
  }

  confirmConfDelete(event: any) {
    try {
      const dataToSend = {};
      this.loader['delete'] = true;
      dataToSend['parameter_id'] = event?.data?.parameter_id || '';
      dataToSend['label'] = event?.data?.label || '';
      this.appservice.deleteParameterData(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteData) => {
        if (deleteData?.status === 'success') {
          this.loader['delete'] = false;
          this.loadTable();
          this.toaster.toast('success', 'Success', deleteData.message || 'Parameter deleted successfully.', true);
        } else {
          this.loader['delete'] = false;
          this.toaster.toast('error', 'Error', deleteData.message || 'Error while deleting Parameter.', true);
        }
      }, (deleteConfigErr) => {
        this.loader['delete'] = false;
        console.error(deleteConfigErr);
        this.toaster.toast('error', 'Error', 'Error while deleting Parameter.', true);
      });
    } catch (error) {
      this.loader['delete'] = false;
      this.toaster.toast('error', 'Error', 'Error while deleting Parameter.', true);
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

  addNew() {
    try {
      if (!this.validateLimitRangeTable()) {
        return;
      }
      this.paramData['limits'].push({
        type: 'range_select',
        lower_limit: null,
        upper_limit: null,
        pre_qualifier: null,
        post_qualifier: null,
        text: null,
        value: null,
        color: null,
      });
    } catch (error) {
      console.error(error);
    }
  }

  validateLimitRangeTable() {
    try {
      if(!this.paramData.hasOwnProperty('limits')) {
        this.paramData['limits'] = [];
        return true;
      }
      if(!this.paramData?.limits?.length) {
        return true;
      }
      // if (this.paramData?.range_select) {
      //   const limits = this.paramData.limits.some((ele) => !ele?.pre_qualifier || !ele?.post_qualifier || !(ele?.lower_limit === 0 || ele?.lower_limit || ele?.upper_limit === 0 || ele?.upper_limit) || !ele?.text);
      //   if (limits) {
      //     this.toaster.toast('info', 'Info', 'Please fill empty fields in limit range table.', true);
      //     return false;
      //   }
      // } else {
      //   const limits = this.paramData.limits.some((ele) => !(ele?.value === 0 || ele?.value) || !ele?.text);
      //   if (limits) {
      //     this.toaster.toast('info', 'Info', 'Please fill empty fields in limit range table.', true);
      //     return false;
      //   }
      // }
      for (let eachItem of this.paramData['limits']) {
        if (eachItem?.type === 'range_select') {
          delete eachItem['value'];
        }
        if (eachItem?.type === 'single_select') {
          delete eachItem['pre_qualifier'];
          delete eachItem['post_qualifier'];
          delete eachItem['upper_limit'];
          delete eachItem['lower_limit'];
        }
      }
      for (let element of this.paramData.limits) {
        if (!element?.color) {
          element.color = '#000'
        }
      };
      return true;
    } catch (validateErr) {
      console.error(validateErr);
      return false;
    }
  }

  roundToDecimalInputEvent(event:any){
    if (event.which === 69 || event.which === 101) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
  }

  deleteLimit(ind) {
    try {
      this.paramData.limits.splice(ind, 1);
    } catch (error) {
      console.error(error);
    }
  }

}
