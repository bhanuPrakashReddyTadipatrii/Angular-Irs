import {
  Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, OnDestroy, OnChanges,
  ChangeDetectorRef, QueryList, ViewChildren, DoCheck, ChangeDetectionStrategy, SimpleChanges,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WizardComponent } from '../wizard/wizard.component';
import { ToasterService } from '../toastr/toaster.service';
import { CommonPopupService } from '../common-popup/common-popup.service';
import { Config } from '../../config/config';
import { Subscription, Subject, zip } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { TreeComponentUtilityFunctions } from '../../utilities/tree-component-util';
import { SearchPipe } from './search.pipe';
import { StorageListenerService } from '../../services/storage-listener.service';
import { IActionMapping, TreeComponent } from '@circlon/angular-tree-component';
import { OwlDateTimeComponent } from 'ng-pick-datetime';
import { HashDirective } from '../hash.directive';


@Component({
  selector: 'ucp-dfm',
  templateUrl: './dfm.component.html',
  styleUrls: ['./dfm.component.scss'],
})

// tslint:disable:no-this-assignment max-line-length prefer-template ter-prefer-arrow-callback no-increment-decrement align

export class DfmComponent implements OnInit, OnDestroy, OnChanges, DoCheck, AfterViewInit {
  submitted = false;
  public subscription = new Subscription();
  @Input() DFMDATA: any; // Inputs form data from parent component
  @Input()
  wizardref: WizardComponent = new WizardComponent;
  @Input() stepnumber: any;
  @Input() detectChanges: any;     // varibale to detect changes without submit button
  @Input() formSpecificValidation: any;
  @Input() loader: any; // Inputs form data from parent component
  @Input() disableSave: any; // Inputs form data from parent component
  @Input() hideSave: any; // Inputs form data from parent component
  @Output() previousstep = new EventEmitter();
  @Output() nextstep = new EventEmitter();
  @Output() SelectedValues: EventEmitter<any>; // Emit to Parent Component
  @Output() showFields: EventEmitter<any>; // Emit to Parent Component
  @Output() addNewEmitter: EventEmitter<any> = new EventEmitter(); // Emit to Parent Component
  @Output() emitInstantChanges: EventEmitter<any> = new EventEmitter(); // Emit to Parent Component
  @Output() scrollEmitter: EventEmitter<any> = new EventEmitter(); // Emit to Parent Component
  @Output() updateDFMValidation: EventEmitter<any> = new EventEmitter(); // Emit to Parent Component
  @Output() cancel: EventEmitter<any>; // Emit to Parent Component
  @Input() heightSpecified: any;
  @Input() calculatedFormHeight: any;
  @Input() fieldValueDependent: any;
  @Input() restrictFields: any = false;
  @ViewChild(TreeComponent) treesingleselect: any;
  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, e: Event) => this.checkTreeMultiSelect(node, !node.data.checked, e),
    },
  };

  @ViewChild(TreeComponent) treeMultiselect: any;
  @ViewChild(TreeComponent) treeHierarchy: any;
  @ViewChildren(TreeComponent) treesingleselects: any;
  @ViewChildren(TreeComponent) treeMultiselects: any;
  @ViewChildren(HashDirective) public hashes: QueryList<HashDirective>

  public currTime: any = new Date().getTime() + Config.getRandomColor();

  public selectedNodes: any = {};
  Form_filled_data: any = {}; // Component ngModel variable
  DFMObject: any = {};
  formDFM: any; // form validation variable
  public formValidateKeysArray: any = [];
  public formNonValidateKeysArray: any = [];
  DropDownsettings: object = {};
  mainKeys = [];
  date: Date = new Date();
  settings = {
    bigBanner: false,
    enableTime: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false,
  };
  settings2 = {
    bigBanner: true,
    enableTime: true,
    format: 'dd-MM-yyyy',
    defaultOpen: false,
  };
  showSelect = false;
  showError = false;
  emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  faxRegex = /^\+?[0-9]+$/;
  mobRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;

  submitTrue = false;
  public button_loader: any = false;
  public bodyContentCopy: any = {};
  public disabledFields: any = {};
  public loaders = {
    createFormControls: true,
  };
  public selctedOptionalFields: any = {};
  public validatorsMetaData: any = [
    'minLength', 'maxLength', 'min', 'max',
  ];
  public inputChanges = new Subject<any>();
  public validatorsOfFields: any = {};
  public validateObject: any = {};
  public pageType: any;
  public fieldDetails: any = {};
  public counter: any = 0;
  public imageOptions: any = {
    message: undefined,
  };
  public keyRegex: any = /^([a-zA-Z0-9_ -])*$/;
  public mediaBreakPoint: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public mediaResolutionSubscription = new Subscription();
  public activeTab: any;

  constructor(public _toaster: ToasterService, public commonPopup: CommonPopupService, private cdr: ChangeDetectorRef, private _treeUtil: TreeComponentUtilityFunctions, public _session: StorageListenerService) {
    this.SelectedValues = new EventEmitter<any>();
    this.showFields = new EventEmitter<any>();
    this.nextstep = new EventEmitter<any>();
    this.previousstep = new EventEmitter<any>();
    this.cancel = new EventEmitter<any>();
  }
  ngOnInit() {
    try {
      this.mediaBreakPoint = localStorage.getItem('mediaBreakPoint');
      this.mediaResolutionSubscription = this._session.watchStorage().pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.mediaBreakPoint = data;
      });
      this.inputChanges.pipe(
        debounceTime(1400),
        distinctUntilChanged(),
      ).subscribe((result) => {
        const dataToEmit = {
          type: 'emitChanges',
          key: result['data']['key'],
          value: this.Form_filled_data[result['data']['key']],
          bodyContent: this.Form_filled_data,
        };
        this.emitInstantChanges.emit(dataToEmit);
      });
      const temp_var = {};
      this.Form_filled_data = {};
      // if (this.DFMDATA['selectedRecord'] !== undefined) {
      //   this.updateFields();
      // } else
      this.loaders['createFormControls'] = false;
      this.pageType = this.DFMDATA['pageType'];
      if (this.DFMDATA['bodyContent']) {
        if (Object.keys(this.DFMDATA['bodyContent']).length > 0) {
          this.Form_filled_data = this.DFMDATA['bodyContent'];
          this.updateFields();
          for (const item of this.DFMDATA['headerContent']) {
            if (item['data']) {
              for (const eachItem of item['data']) {
                if (eachItem['type'] === 'dynamicFieldsArray') {
                  if (this.Form_filled_data.hasOwnProperty(eachItem['key'])) {
                    if (typeof this.Form_filled_data[eachItem['key']] !== 'object') {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                    if (this.Form_filled_data[eachItem['key']] === null) {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                  } else {
                    this.Form_filled_data[eachItem['key']] = [
                      {
                        type: null,
                        key: null,
                      },
                    ];
                  }
                }
                if (eachItem.type === 'edit_grid') {
                  this.Form_filled_data[eachItem.key] = this.Form_filled_data[eachItem.key] && this.Form_filled_data[eachItem.key].length ? this.Form_filled_data[eachItem.key] : [{}];
                }
                this.disabledFields[eachItem.key] = eachItem.hasOwnProperty('disabled') ? eachItem['disabled'] : false;
                this.validatorsOfFields[eachItem['key']] = eachItem['validators'] ? eachItem['validators'] : null;
                if (eachItem.required) {
                  this.formValidateKeysArray.push(eachItem.key);
                } else if (!eachItem.required) {
                  this.formNonValidateKeysArray.push(eachItem.key);
                } else {
                  this.formNonValidateKeysArray.push(eachItem.key);
                }
              }
            }
          }
        } else {
          for (const item of this.DFMDATA['headerContent']) {
            if (item['data']) {
              for (const eachItem of item['data']) {
                this.disabledFields[eachItem.key] = eachItem.hasOwnProperty('disabled') ? eachItem['disabled'] : false;
                this.Form_filled_data[eachItem.key] = null;
                if (eachItem['type'] === 'dynamicFieldsArray') {
                  if (this.Form_filled_data.hasOwnProperty(eachItem['key'])) {
                    if (typeof this.Form_filled_data[eachItem['key']] !== 'object') {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                    if (this.Form_filled_data[eachItem['key']] === null) {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                  } else {
                    this.Form_filled_data[eachItem['key']] = [
                      {
                        type: null,
                        key: null,
                      },
                    ];
                  }
                }
                if (eachItem.type === 'date') {
                  this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
                } else if (eachItem.type === 'time') {
                  this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
                } else if (eachItem.type === 'checkbox') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'treeMultiselect') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'multiselect' || eachItem.type === 'tagInput') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'edit_grid') {
                  this.Form_filled_data[eachItem.key] = [{}];
                } else if (eachItem.type === 'range') {
                  this.Form_filled_data[eachItem.key] = {
                    min: eachItem.minValue,
                    max: eachItem.maxValue,
                  };
                }
                try {
                  if (eachItem.type === 'customMultiselect' && eachItem.settings && eachItem.settings.singleSelection) {
                    this.Form_filled_data[eachItem.key] = null;
                  } else if (eachItem.type === 'customMultiselect' && eachItem.settings && !eachItem.settings.singleSelection) {
                    this.Form_filled_data[eachItem.key] = [];
                  }
                } catch (error) {
                  console.error(error);
                }

                this.validatorsOfFields[eachItem['key']] = eachItem['validators'] ? eachItem['validators'] : null;
                if (eachItem.required) {
                  this.formValidateKeysArray.push(eachItem.key);
                } else if (!eachItem.required) {
                  this.formNonValidateKeysArray.push(eachItem.key);
                } else {
                  this.formNonValidateKeysArray.push(eachItem.key);
                }
              }
            }
          }
        }
      } else {
        if (this.DFMDATA['headerContent']) {
          for (const item of this.DFMDATA['headerContent']) {
            if (item['data']) {
              for (const eachItem of item['data']) {
                this.disabledFields[eachItem.key] = eachItem.hasOwnProperty('disabled') ? eachItem['disabled'] : false;
                this.Form_filled_data[eachItem.key] = null;
                if (eachItem['type'] === 'dynamicFieldsArray') {
                  if (this.Form_filled_data.hasOwnProperty(eachItem['key'])) {
                    if (typeof this.Form_filled_data[eachItem['key']] !== 'object') {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                    if (this.Form_filled_data[eachItem['key']] === null) {
                      this.Form_filled_data[eachItem['key']] = [
                        {
                          type: null,
                          key: null,
                        },
                      ];
                    }
                  } else {
                    this.Form_filled_data[eachItem['key']] = [
                      {
                        type: null,
                        key: null,
                      },
                    ];
                  }
                } else if (eachItem.type === 'date') {
                  this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
                } else if (eachItem.type === 'time') {
                  this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
                } else if (eachItem.type === 'checkbox') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'treeMultiselect') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'treesingleselect') {
                  this.Form_filled_data[eachItem.key] = [];
                } else if (eachItem.type === 'number') {
                  this.Form_filled_data[eachItem.key] = null;
                } else if (eachItem.type === 'edit_grid') {
                  this.Form_filled_data[eachItem.key] = [{}];
                } else if (eachItem.type === 'range') {
                  this.Form_filled_data[eachItem.key] = {
                    min: eachItem.minValue,
                    max: eachItem.maxValue,
                  };
                }
                this.validatorsOfFields[eachItem['key']] = eachItem['validators'] ? eachItem['validators'] : null;
                if (eachItem.required) {
                  this.formValidateKeysArray.push(eachItem.key);
                } else if (!eachItem.required) {
                  this.formNonValidateKeysArray.push(eachItem.key);
                } else {
                  this.formNonValidateKeysArray.push(eachItem.key);
                }
              }
            }
          }
        }
      }
      this.activateValidation();
      this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
        if (data['confirmation'] === 'Yes' && data['action'] === 'resetDfm') {
          this.cancel.emit(data['data']);
        }
      });
      this.loaders['createFormControls'] = true;
    } catch (error) {
      console.error(error);
    }
  }
  activateValidation() {
    try {
      for (let ind = 0; ind < this.formValidateKeysArray.length; ind++) {
        this.validateObject[this.formValidateKeysArray[ind]] = new FormControl(
          {
            value: this.Form_filled_data[this.formValidateKeysArray[ind]],
            disabled: this.disabledFields[this.formValidateKeysArray[ind]],
          },
          this.validatorsOfFields[this.formValidateKeysArray[ind]] || [Validators.required],
        );
      }
      for (let ind = 0; ind < this.formNonValidateKeysArray.length; ind++) {
        this.validateObject[this.formNonValidateKeysArray[ind]] = new FormControl(
          {
            value: this.Form_filled_data[this.formNonValidateKeysArray[ind]],
            disabled: this.disabledFields[this.formNonValidateKeysArray[ind]],
          },
          [Validators.nullValidator],
        );
      }
      this.formDFM = new FormGroup(this.validateObject);
      if (this.DFMDATA['headerContent'] && this.DFMDATA['headerContent'].length) {
        for (const item of this.DFMDATA['headerContent']) {
          if (item['data']) {
            for (const eachItem of item['data']) {
              if (['treesingleselect', 'treeMultiselect', 'date'].includes(eachItem['type'])) {
                this.updateFormControlValues(eachItem['key'], this.Form_filled_data[eachItem['key']]);
              }
            }
          }
        }
      }
      this.setValidatorsForDynamicFieldsArray();
      this.hideOptionalFields();
      this.formDFM.updateValueAndValidity();
      if (this.DFMDATA.disableForm) {
        this.formDFM.disable();
      }
    } catch (error) {
      console.error(error);
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
  public noWhitespaceValidator(control: FormControl): any {
    try {
      const isWhitespace = (control.value || '').trim().length === 0;
      const isValid = !isWhitespace;
      return isValid ? null : { whitespace: true };
    } catch (error) {
      console.error(error);
    }
  }

  ngAfterViewInit() {
    try {
      this.updateTreeNodes();
    } catch (error) {
      console.error(error);
    }

  }
  updateTreeNodes() {
    try {
      const treeNodes: any = [];
      this.treesingleselects.forEach((eachTree: any) => {
        treeNodes.push(eachTree.treeModel.getVisibleRoots());
      });
      if (this.treeMultiselects) {
        this.treeMultiselects.forEach((eachTree: any) => {
          treeNodes.push(eachTree.treeModel.getVisibleRoots());
        });
      }
      const trees_singleselect = Object.keys(this.selectedNodes);
      for (let index = 0; index < trees_singleselect.length; index++) {
        const element = trees_singleselect[index];
        this.updateParentState(treeNodes[index], this.selectedNodes[element]);
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }
  fieldValidationMethod(field: any, key: any, value: any) {
    try {
      if (['email', 'refPerEmail', 'emailId'].includes(key)) {
        if (!(this.emailRegex.test(String(value).toLowerCase()))) {
          field['error'] = true;
        } else {
          field['error'] = false;
        }
      } else if (['fax'].includes(key)) {
        if (!(this.faxRegex.test(String(value).toLowerCase()))) {
          field['error'] = true;
        } else {
          field['error'] = false;
        }
      } else if (['refPerMobileNo', 'mobileNumber', 'phone'].includes(key)) {
        if (!(this.mobRegex.test(String(value).toLowerCase()))) {
          field['error'] = true;
        } else {
          field['error'] = false;
        }
      }

    } catch (error) {
      console.error(error);
    }
  }
  updateFields() {
    try {
      if (Object.keys(this.DFMDATA['bodyContent']).length > 0) {
        for (const item of this.DFMDATA['headerContent']) {
          const sectionIndex = this.DFMDATA['headerContent'].indexOf(item);
          if (item['data']) {
            for (const eachItem of item['data']) {
              if (eachItem.type === 'treesingleselect' && this.DFMDATA['bodyContent'][eachItem.key]) {
                this.selectedNodes[eachItem.key] = JSON.parse(JSON.stringify(this.DFMDATA['bodyContent'][eachItem.key]));
                this.checkNodesofATree(eachItem.nodeData, this.DFMDATA['bodyContent'][eachItem.key]);
              } else if (eachItem.type === 'treeMultiselect' && this.DFMDATA['bodyContent'][eachItem.key]) {
                this.selectedNodes[eachItem.key] = JSON.parse(JSON.stringify(this.DFMDATA['bodyContent'][eachItem.key]));
                this.checkNodesofATree(eachItem.nodeData, this.DFMDATA['bodyContent'][eachItem.key]);
              } else if (eachItem.type === 'advMultiSelect') {
                // IsSelected
                for (let ind = 0; ind < eachItem?.options?.length; ind++) {
                  for (let jind = 0; jind < this.DFMDATA?.['bodyContent']?.[eachItem?.key]?.length; jind++) {
                    if (JSON.stringify(eachItem?.options?.[ind]?.value) === JSON.stringify(this.DFMDATA?.['bodyContent']?.[eachItem.key]?.[jind])) {
                      eachItem.options[ind]['IsSelected'] = true;
                    }
                  }
                }
              } else if (eachItem.type === 'checkbox') {
                // IsSelected
                for (let ind = 0; ind < eachItem.options.length; ind++) {
                  for (let jind = 0; jind < this.DFMDATA['bodyContent'][eachItem.key].length; jind++) {
                    if (eachItem.options[ind].value === this.DFMDATA['bodyContent'][eachItem.key][jind]) {
                      eachItem.options[ind]['IsSelected'] = true;
                    }
                  }
                }
              } else if (eachItem.type === 'select' && eachItem.dependent === true && this.DFMDATA['bodyContent'].hasOwnProperty(eachItem.key)) {
                this.dynamicDropDownInfo(eachItem.key, item['data'], sectionIndex);
              } else if (eachItem.type === 'select' && eachItem.fieldDependency === true && this.DFMDATA['bodyContent'].hasOwnProperty(eachItem.key)) {
                this.updateFieldsWithValueDependency(eachItem.key, item['data'], sectionIndex);
              }
            }
          }
        }
        this.bodyContentCopy = JSON.parse(JSON.stringify(this.Form_filled_data));
      } else {
        this.Form_filled_data = this.DFMDATA['bodyContent'];
        this.bodyContentCopy = JSON.parse(JSON.stringify(this.Form_filled_data));
      }
    } catch (error) {
      console.error(error);
    }
  }
  dynamicDropDownInfo(dependentKey: any, fieldsArray: any, sectionIndex: any, updateValue?: any, field?: any) {
    try {
      for (let eachFieldIndex = 0; eachFieldIndex < fieldsArray.length; eachFieldIndex++) {
        const eachField = fieldsArray[eachFieldIndex];
        if (eachField.hasOwnProperty('dependency')) {
          const dependencyProperties = eachField['dependency'];
          if (dependencyProperties['status'] && (dependencyProperties['dependent_key'] === dependentKey)) {
            if (typeof (this.Form_filled_data[dependentKey]) === 'boolean') {
              eachField['options'] = dependencyProperties['dependent_options'][this.Form_filled_data[dependentKey].toString()];
            } else {
              eachField['options'] = dependencyProperties['dependent_options'][this.Form_filled_data[dependentKey]] || [];
            }
            if (updateValue) {
              this.Form_filled_data[eachField.key] = eachField['options'] && eachField['options'][0] ?
                (typeof eachField['options'][0]['value'] === 'boolean' ? eachField['options'][0]['value'] : eachField['options'][0]['value'] || null) : null;
              if (eachField.settings && eachField.settings.fullObject) {
                this.Form_filled_data[eachField.key] = eachField['options'] && eachField['options'][0] ? eachField.options[0] : null;
              }
              if (eachField.type === 'multiselect') {
                this.Form_filled_data[eachField.key] = this.Form_filled_data[eachField.key] ? [this.Form_filled_data[eachField.key]] : [];
              }
            }
          }
        }
      }
      this.DFMDATA['headerContent'][sectionIndex]['data'] = fieldsArray;
      // if (typeof (this.Form_filled_data[dependentKey]) !== undefined) {
      //   return inputObject['dependent_options'][this.Form_filled_data[dependentKey]];
      // } else {
      //   return [];
      // }
      if (field) {
        this.emitFieldChanges(field);
      }
      this.updateValidationForFields();
    } catch (error) {
      console.error(error);
    }
  }


  updateFieldsWithValueDependency(dependentKey: any, fieldsArray: any, sectionIndex: any, updateValue?: any, field?: any) {
    try {
      for (let eachFieldIndex = 0; eachFieldIndex < fieldsArray.length; eachFieldIndex++) {
        const eachField = fieldsArray[eachFieldIndex];
        if (eachField.hasOwnProperty('dependency')) {
          const dependencyProperties = eachField['dependency'];
          if (dependencyProperties['status'] && (dependencyProperties['field_dependent_key'] === dependentKey) && dependencyProperties['dependent_value'] === this.Form_filled_data[dependentKey]) {
            eachField['hidden'] = false;
          } else {
            eachField['hidden'] = true;
          }
        }
      }
      this.DFMDATA['headerContent'][sectionIndex]['data'] = fieldsArray;
      if (field) {
        this.emitFieldChanges(field, null, sectionIndex);
      }
    } catch (error) {
      console.error(error);
    }
  }
  onDateSelect(event: any, key: any, field, sectionIndex) {
    try {
      if (!event) {
        return;
      }
      const dateString = new Date(event).toISOString().split('.')[0] + 'Z';
      this.Form_filled_data[key] = dateString;
      if (field['emitChanges']) {
        this.emitInstantChanges.emit({
          sectionIndex,
          type: 'emitChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
          extra_fields: event['extra_fields'] || [],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  multiselectFunc(data: any, key: any) {
    this.Form_filled_data[key] = data;
  }
  onSelectAll(selectedField: any) {
    try {
      if (selectedField && selectedField['settings']) {
        if (selectedField['settings']['fullObject']) {
          this.Form_filled_data[selectedField.key] = selectedField['options'];
          this.Form_filled_data[selectedField.key] = [...this.Form_filled_data[selectedField.key]];
        } else if (selectedField['settings']['primaryKey']) {
          this.Form_filled_data[selectedField.key] = selectedField['options'].map((item: any) => item[selectedField['settings']['primaryKey']]);
        } else {
          this.Form_filled_data[selectedField.key] = selectedField['options'].map((item: any) => item.value);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  onDeSelectAll(selectedField: any) {
    try {
      if (selectedField) {
        this.Form_filled_data[selectedField.key] = [];
      }
    } catch (error) {
      console.error(error);
    }
  }

  selectAllList(selectedField: any) {
    try {
      if (selectedField.searchVal) {
        const searchPipe = new SearchPipe();
        const filteredOptions = searchPipe.transform(selectedField['options'], [selectedField.settings.labelKey || 'label'], selectedField.searchVal || '');
        for (const eachItem of filteredOptions) {
          eachItem['checked'] = true;
        }
        this.onCustomMultiselectModelChange(selectedField, null);
        return;
      }
      if (selectedField && selectedField['settings']) {
        if (selectedField['settings']['fullObject']) {
          this.Form_filled_data[selectedField.key] = selectedField['options'];
          this.Form_filled_data[selectedField.key] = [...this.Form_filled_data[selectedField.key]];
        } else if (selectedField['settings']['primaryKey']) {
          this.Form_filled_data[selectedField.key] = selectedField['options'].map((item: any) => item[selectedField['settings']['primaryKey']]);
        } else {
          this.Form_filled_data[selectedField.key] = selectedField['options'].map((item: any) => item.value);
        }
      }
      selectedField['selectedItems'] = [];
      for (const eachItem of selectedField.options) {
        eachItem['checked'] = true;
      }
      selectedField['selectedItems'] = selectedField.options;
      const fieldControls = this.formDFM.get(selectedField.key);
      if (fieldControls) {
        fieldControls.updateValueAndValidity();
      }
      this.onMultiselectValueChange(selectedField);
    } catch (error) {
      console.error(error);
    }
  }

  deselectAllList(selectedField: any) {
    try {
      if (selectedField.searchVal) {
        const searchPipe = new SearchPipe();
        const filteredOptions = searchPipe.transform(selectedField['options'], [selectedField.settings.labelKey || 'label'], selectedField.searchVal || '');
        for (const eachItem of filteredOptions) {
          eachItem['checked'] = false;
        }
        this.onCustomMultiselectModelChange(selectedField, null);
        return;
      }
      this.Form_filled_data[selectedField.key] = [];
      selectedField['selectedItems'] = [];
      const fieldControls = this.formDFM.get(selectedField.key);
      if (fieldControls) {
        fieldControls.updateValueAndValidity();
      }
      for (const eachItem of selectedField.options) {
        eachItem['checked'] = false;
      }
      this.onMultiselectValueChange(selectedField);
    } catch (error) {
      console.error(error);
    }
  }

  cancelOperation() {
    try {
      this.Form_filled_data = {};
      const currentVw = this;
      // tslint:disable-next-line:ter-prefer-arrow-callback
      setTimeout(function () {
        currentVw.showFields.emit('new');
      }, 500);
    } catch (error) {
      console.error(error);
    }
  }
  // =================================================== CheckBox code ================================
  // checkboxUpdate(key, value, CheckBox) {
  //   if (typeof (this.Form_filled_data[key]) === 'undefined') {
  //     this.Form_filled_data[key] = [];
  //   }
  //   if (CheckBox.IsSelected) {
  //     this.Form_filled_data[key].push(value);
  //   } else if (!CheckBox.IsSelected) {
  //     let index = 0;
  //     for (let i = 0; i < this.Form_filled_data[key].length; i++) {
  //       if (this.Form_filled_data[key][i] === value) {
  //         index = i;
  //         break;
  //       }
  //     }
  //     this.Form_filled_data[key].splice(index, 1);
  //   }
  // }

  checkboxUpdate(key: any, value: any, CheckBox: any) {
    try {
      if (typeof (this.Form_filled_data[key]) === 'undefined') {
        this.Form_filled_data[key] = [];
      }
      if (CheckBox.IsSelected) {
        this.Form_filled_data[key].push(value);
      } else if (!CheckBox.IsSelected) {
        let index = 0;
        for (let i = 0; i < this.Form_filled_data[key].length; i++) {
          if (this.Form_filled_data[key][i] === value) {
            index = i;
            break;
          }
        }
        this.Form_filled_data[key].splice(index, 1);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // ========================================= readio Group Code =============================================
  // radioFieldUpdate(key, value, group) {

  // }
  // isRadioChecked(key, value, group) {

  // }

  // =========================================== Tree Functions ===============================================
  /**
   *  if Tree type === treesingleselect
   * @param node Selected Node Data
   * @param checked Status of Checked
   * @param key Data to store key
   */
  public checkSingleSelectTree(node: any, checked: any, key: any) {
    try {
      let siteLabel: any = [];
      this._treeUtil.formHeaderLabel(node, siteLabel);
      siteLabel = siteLabel.reverse();
      const site_name = siteLabel.join('>>');
      this.Form_filled_data[key] = [{
        site_name,
        parent_id: this.returnParentId(node),
        node_id: node.data.node_id,
      }];
      this.unCheckAllNodes(node.treeModel.nodes);
      node.data['isChecked'] = checked;
      this.updateParentNodeCheckbox(node.parent);
      this.treesingleselect.treeModel.update();
      if (!checked) {
        for (let ind = 0; ind < this.Form_filled_data[key].length; ind++) {
          if (this.Form_filled_data[key][ind].node_id === node.data.node_id) {
            this.Form_filled_data[key].splice(ind, 1);
          }
        }
      }
      this.formDFM.controls[key].setValue(this.Form_filled_data[key]);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   *  if Tree type === treesingleselect
   * @param node Selected Node Data
   * @param checked Status of Checked
   * @param key Data to store key
   */
  public checkTreeMultiSelect(node: any, checked: any, key: any) {
    try {
      if (checked) {
        let siteLabel: any = [];
        this._treeUtil.formHeaderLabel(node, siteLabel);
        siteLabel = siteLabel.reverse();
        const site_name = siteLabel.join('>>');
        this.Form_filled_data[key].push({
          site_name,
          parent_id: this.returnParentId(node),
          node_id: node.data.node_id,
        });
      } else {
        for (let ind = 0; ind < this.Form_filled_data[key].length; ind++) {
          if (this.Form_filled_data[key][ind].node_id === node.data.node_id) {
            this.Form_filled_data[key].splice(ind, 1);
          }
        }
      }
      node.data['isChecked'] = checked;
      this.formDFM.controls[key].setValue(this.Form_filled_data[key]);
      this.updateChildNodeCheckbox(node, checked);
      this.updateParentNodeCheckbox(node.realParent);
    } catch (error) {
      console.error(error);
    }
  }
  public updateChildNodeCheckbox(node: any, checked: any) {
    try {
      node.data.checked = checked;
      if (node.children) {
        node.children.forEach((child: any) => this.updateChildNodeCheckbox(child, checked));
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Recersive function to CLear tree from Selection
   * @param node Parent Nodes of tree
   */
  unCheckAllNodes(node: any) {
    try {
      for (let ind = 0; ind < node.length; ind++) {
        if (node[ind].isChecked) {
          node[ind].isChecked = false;
          node[ind]['indeterminate'] = false;
        }
        if (node[ind].children) {
          this.unCheckAllNodes(node[ind].children);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Recursive function to auto populate the Selected nodes
   * @param node Node list
   * @param selectedNodes Selected node_id
   */
  checkNodesofATree(node: any, selectedNodes: any) {
    try {
      for (let ind = 0; ind < node.length; ind++) {
        // if (selectedNodes) {
        for (let jind = 0; jind < selectedNodes.length; jind++) {
          if (selectedNodes[jind] && node[ind].node_id === selectedNodes[jind].node_id) {
            node[ind].isChecked = true;
            // this.updateParentNodeCheckbox(node[ind])
          }
        }
        // }
        if (node[ind].children) {
          this.checkNodesofATree(node[ind].children, selectedNodes);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  updateParentState(nodes: any, selectedNodes: any) {
    try {
      if (selectedNodes !== '' && selectedNodes.length !== 0 && selectedNodes[0].node_id === selectedNodes[0].parent_id) {
        return;
      }
      this.updateParentNode(nodes);
    } catch (error) {
      console.error(error);
    }
  }

  updateParentNode(node: any) {
    try {
      if (!node) {
        return;
      }
      if (node.children) {
        this.updateParentNode(node.children);
        this.updateParentNodeCheckbox(node);
      } else {
        for (const element of node) {
          if (element && element.children) {
            this.updateParentNode(element.children);
            this.updateParentNodeCheckbox(element);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * ParentId to return the data
   * @param node Node data that needs to return its parent data
   */
  returnParentId(node: any) {
    try {
      let new_node = node;
      while (!new_node.data.parent_id) {
        new_node = new_node.parent;
      }
      return new_node.data.parent_id;
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Passnode parent data
   * @param node Pass node.parent of an instance
   */
  public updateParentNodeCheckbox(node: any) {
    try {
      if (!node) {
        return;
      }
      let allChildrenChecked = true;
      let noChildChecked = true;
      for (const child of node.children) {
        if (!child.data.isChecked || child.data.indeterminate) {
          allChildrenChecked = false;
        }
        if (child.data.isChecked) {
          noChildChecked = false;
        }
      }
      if (allChildrenChecked) {
        node.data['isChecked'] = true;
        node.data['indeterminate'] = false;
      } else if (noChildChecked) {
        node.data['isChecked'] = false;
        node.data['indeterminate'] = false;
      } else {
        node.data['isChecked'] = true;
        node.data['indeterminate'] = true;
      }
      // if (noChildChecked) {
      //   node.data.isChecked = false;
      //   node.data['indeterminate'] = false;
      // } else {
      //   node.data.isChecked = true;
      //   node.data['indeterminate'] = true;
      // }
      this.updateParentNodeCheckbox(node.parent);
    } catch (error) {
      console.error(error);
    }
  }
  // =========================================== Button Emitting Functions ==================================
  submitData() {
    try {
      if (this.formDFM.invalid) {
        this.validateAllFormFields(this.formDFM);
        this._toaster.toast('warning', 'Warning', 'Please fill all the required fields', true);
        return;
      }
      this.submitted = true;
      this.updateBodyContent();
    } catch (error) {
      console.error(error);
    }
  }
  //cancel Form
  cancelForm(flag?: any) {
    if (!flag) {
      flag = false;
    }
    this.cancel.emit(flag);
    // const message = Config.ALERT_MESSAGES['LICENSE_ALERT_MESSAGE_2'];
    // this.commonPopup.triggerPopup('confirmation', 'Confirmation', message, true, 'resetDfm', flag);
  }

  refreshForm() { }

  // formDFM
  get f() { return this.formDFM.controls; }

  // ===================================== Stepper Functions =========================
  stepprevious() {
    try {
      this.stepnumber = this.stepnumber - 1;
      this.previousstep.emit(this.stepnumber);
    } catch (error) {
      console.error(error);
    }
  }
  stepnext() {
    try {
      this.stepnumber = this.stepnumber + 1;
      this.nextstep.emit(this.stepnumber);
    } catch (error) {
      console.error(error);
    }
  }
  ngOnChanges(simplechanges: SimpleChanges) {
    try {
      if (this.loader) {
        this.button_loader = true;
      } else {
        this.button_loader = false;
      }
      if (simplechanges && simplechanges['DFMDATA'] && simplechanges['DFMDATA'].currentValue) {
        this.DFMDATA = { ...simplechanges['DFMDATA'].currentValue };
        this.updateFields();
        this.updateValidationForFields();
      }
    } catch (error) {
      console.error(error);
    }
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.mediaResolutionSubscription) {
      this.mediaResolutionSubscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  ngDoCheck() {
    try {
      if (this.detectChanges && (this.bodyContentCopy != this.Form_filled_data)) {
        Object.keys(this.Form_filled_data).forEach((eachKey) => {
          if (this.Form_filled_data[eachKey] != this.bodyContentCopy[eachKey]) {
            this.SelectedValues.emit(this.Form_filled_data);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  onSingleSelectChange(event: any, field: any, sectionIndex: any) {
    try {
      if (event) {
        if (event['value'] === 'addnew') {
          this.Form_filled_data[field['key']] = null;
          this.addNewEmitter.emit({
            type: 'addNew',
            key: field['key'],
          });
        } else if ((event['value'] === true || event['value'] === false) && (field['key'] === 'default')) {
          this.updateDFMValidation.emit({ type: 'updateValidation', value: event['value'], bodyContent: this.Form_filled_data });
        }
      }
      if (field['emitChanges']) {
        this.emitInstantChanges.emit({
          sectionIndex,
          type: 'emitChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
          extra_fields: event['extra_fields'] || [],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  fieldTrackFilter(index: number, filter: any) {
    return filter.key;
  }
  sectionTrackFilter(index: number, filter: any) {
    return filter.section_key;
  }
  onValueChangeInSingleSelect(field: any, sectionIndex: any) {
    try {
      if (field['emitInstantChanges']) {
        let extra_fields = [];
        if (this.Form_filled_data[field['key']]) {
          field['options'] = field['options'] || [];
          for (const eachOption of field['options']) {
            if (eachOption['value'] === this.Form_filled_data[field['key']]) {
              extra_fields = eachOption['extra_fields'] || [];
            }
          }
        }
        this.emitInstantChanges.emit({
          sectionIndex,
          type: 'emitInstantChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
          extra_fields: [...extra_fields],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  addNew(fieldKey: any) {
    try {
      this.addNewEmitter.emit({
        type: 'addNew',
        key: fieldKey,
      });
    } catch (error) {
      console.error(error);
    }
  }
  emitFieldChanges(field: any, type?: any, sectionIndex?: any) {
    try {
      if (field && field['emitChanges']) {
        let payload: any = {
          type: 'emitChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
          fieldType: field['type'],
        };
        if (!isNaN(sectionIndex)) {
          payload['sectionIndex'] = sectionIndex;
        }
        this.emitInstantChanges.emit(payload);
      }
    } catch (error) {
      console.error(error);
    }
  }
  onEditNode(node: any, fieldKey: any) {
    try {
      this.addNewEmitter.emit({
        type: 'editExisting',
        key: fieldKey,
        industry_id: node['data']['node_id'],
      });
    } catch (error) {
      console.error(error);
    }
  }
  updateFormControlValues(key: any, value: any) {
    try {
      if (this.formDFM.controls) {
        this.formDFM.controls[key].setValue(value);
        this.formDFM.updateValueAndValidity();
      }
    } catch (error) {
      console.error(error);
    }
  }
  /**
   * Update the Tree Nodes after updating the Header Content
   */
  updateTreeAfterUpdate() {
    try {
      if (Object.keys(this.Form_filled_data).length > 0) {
        for (const item of this.DFMDATA['headerContent']) {
          const sectionIndex = this.DFMDATA['headerContent'].indexOf(item);
          if (item['data']) {
            for (const eachItem of item['data']) {
              if (eachItem.type === 'treesingleselect' && this.Form_filled_data[eachItem.key]) {
                this.selectedNodes[eachItem.key] = JSON.parse(JSON.stringify(this.Form_filled_data[eachItem.key]));
                this.checkNodesofATree(eachItem.nodeData, this.Form_filled_data[eachItem.key]);
              } else if (eachItem.type === 'treeMultiselect' && this.Form_filled_data[eachItem.key]) {
                this.checkNodesofATree(eachItem.nodeData, this.Form_filled_data[eachItem.key]);
              } else if (eachItem.type === 'checkbox') {
                // IsSelected
                // for (let ind = 0; ind < eachItem.options.length; ind++) {
                //   for (let jind = 0; jind < this.Form_filled_data[eachItem.key].length; jind++) {
                //     if (eachItem.options[ind].value === this.Form_filled_data[eachItem.key][jind]) {
                //       eachItem.options[ind]['IsSelected'] = true;
                //     }
                //   }
                // }
              } else if (eachItem.type === 'select' && eachItem.dependent === true && this.Form_filled_data.hasOwnProperty(eachItem.key)) {
                // this.dynamicDropDownInfo(eachItem.key, item['data'], sectionIndex);
              }
            }
          }
        }
        this.updateTreeNodes();
      }
    } catch (error) {
      console.error(error);
    }
  }
  openOptinalFieldsModal() {
    try {
      this.selctedOptionalFields = JSON.parse(JSON.stringify(this.DFMDATA));
      for (const item of this.selctedOptionalFields['headerContent']) {
        if (item['data']) {
          for (const eachItem of item['data']) {
            if (!eachItem.hasOwnProperty('isSelected')) {
              eachItem['isSelected'] = false;
            }
          }
        }
      }
      if (this.fieldValueDependent) {
        document.getElementById('addAnotherFieldModal_' + this.currTime)?.click();
      } else {
        document.getElementById('addAnotherFieldModalWithNoBackDrop_' + this.currTime)?.click();
      }
    } catch (error) {
      console.error(error);
    }
  }
  closeAddOptionalFieldsModal() {
    try {
      if (this.fieldValueDependent) {
        document.getElementById('addAnotherFieldModal_' + this.currTime)?.click();
      } else {
        document.getElementById('addAnotherFieldModalWithNoBackDrop_' + this.currTime)?.click();
      }
    } catch (error) {
      console.error(error);
    }
  }
  saveSelectedOptinalFields() {
    try {
      this.DFMDATA['headerContent'] = JSON.parse(JSON.stringify(this.selctedOptionalFields['headerContent']));
      for (const item of this.DFMDATA['headerContent']) {
        if (item['data']) {
          for (const eachItem of item['data']) {
            if (eachItem['isSelected'] && eachItem['isOptional']) {
              eachItem['hidden'] = false;
            } else if (!eachItem['isSelected'] && eachItem['isOptional']) {
              eachItem['hidden'] = true;
              if (eachItem.type === 'date') {
                this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
              } else if (eachItem.type === 'time') {
                this.Form_filled_data[eachItem.key] = this.date.toISOString().split('.')[0] + 'Z';
              } else if (eachItem.type === 'checkbox') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treeMultiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'multiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else {
                this.Form_filled_data[eachItem.key] = null;
              }
            }
          }
        }
      }
      this.closeAddOptionalFieldsModal();
    } catch (error) {
      console.error(error);
    }
  }
  selectField(selectedField: any) {
    try {
      if (selectedField.hasOwnProperty('isSelected')) {
        selectedField['isSelected'] = !selectedField['isSelected'];
        this.DFMDATA['bodyContent'][selectedField.key] = selectedField['isSelected'] ? (selectedField.type === 'text' ? '-' : null) : undefined;
        this.emitInstantChanges.emit({
          type: 'emitChanges',
          key: selectedField['key'],
          value: this.Form_filled_data[selectedField['key']],
          bodyContent: this.Form_filled_data,
        });
      } else {
        selectedField['isSelected'] = true;
      }
    } catch (error) {
      console.error(error);
    }
  }
  hideOptionalFields() {
    try {
      this.selctedOptionalFields = JSON.parse(JSON.stringify(this.DFMDATA));
      if (this.DFMDATA['headerContent']) {
        for (const item of this.DFMDATA['headerContent']) {
          if (item['data']) {
            for (const eachItem of item['data']) {
              const fieldValue = this.Form_filled_data[eachItem['key']];
              if (this.fieldValueDependent) {
                if (eachItem['isOptional'] && (fieldValue === '' || fieldValue === null || fieldValue === undefined)) {
                  eachItem['required'] = false;
                  eachItem['hidden'] = true;
                } else if (eachItem['isOptional'] && (fieldValue !== '' && fieldValue !== null && fieldValue !== undefined)) {
                  eachItem['isSelected'] = true;
                  eachItem['hidden'] = eachItem['hidden'] ? false : eachItem['hidden'];
                }
              } else {
                if (eachItem['isOptional']) {
                  eachItem['required'] = false;
                  eachItem['hidden'] = true;
                  eachItem['isSelected'] = false;
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  onKeydown(field: any, event: any) {
    try {
      if (field['emitChanges']) {
        const obj = {
          data: field,
          triggeredEvent: event,
        };
        this.inputChanges.next(obj);
      }
      if (field.type === 'number' && field.min !== undefined) {
        if (field.min > -1 && event['keyCode'] === 189) {
          event.preventDefault();
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  setValidatorsForDynamicFieldsArray() {
    try {
      if (this.DFMDATA['headerContent']) {
        for (const item of this.DFMDATA['headerContent']) {
          if (item['data']) {
            for (const eachItem of item['data']) {
              if (eachItem['type'] === 'dynamicFieldsArray') {
                if (this.Form_filled_data[eachItem['key']]) {
                  eachItem['fieldsArray'] = [];
                  let counter = 1;
                  this.Form_filled_data[eachItem['key']].forEach((eachConfiguredField: any, configIndex: any) => {
                    const template = JSON.parse(JSON.stringify(eachItem['template']));
                    template['label'] = eachItem['incrimentalKey'] + (configIndex + 1);
                    template['key'] = eachItem['incrimentalKey'] + (configIndex + 1);
                    eachConfiguredField['key'] = template['key'];
                    template['counter'] = counter;
                    eachConfiguredField['counter'] = counter;
                    eachItem['fieldsArray'].push(template);
                    counter = counter + 1;
                  });
                }
                if (eachItem['fieldsArray'] && eachItem['fieldsArray'].length) {
                  eachItem['fieldsArray'].forEach((eachField: any, fieldIndex: any) => {
                    if (eachField.required) {
                      this.validateObject[eachItem['incrimentalKey'] + eachField['counter']] = new FormControl(
                        {
                          value: null,
                          disabled: false,
                        },
                        [Validators.required],
                      );
                    } else {
                      this.validateObject[eachItem['incrimentalKey'] + eachField['counter']] = new FormControl(
                        {
                          value: null,
                          disabled: false,
                        },
                        [Validators.nullValidator],
                      );
                    }
                  });
                }
              }
            }
          }
        }
        this.formDFM = new FormGroup(this.validateObject);
        this.formDFM.updateValueAndValidity();
      }
    } catch (error) {
      console.error(error);
    }
  }
  addFieldsToDynamicFieldsArray(field: any) {
    try {
      if (field['fieldsArray']) {
        const template = JSON.parse(JSON.stringify(field['template']));
        template['label'] = field['incrimentalKey'] + (field['fieldsArray'].length + 1);
        template['key'] = field['incrimentalKey'] + (field['fieldsArray'].length + 1);
        const counterArray: any = [];
        field['fieldsArray'].forEach((eachBlockData: any) => {
          if (eachBlockData.hasOwnProperty('counter')) {
            counterArray.push(eachBlockData['counter']);
          }
        });
        counterArray.sort((a: any, b: any) => {
          return a - b;
        });
        const currentCounter = counterArray[counterArray.length - 1] + 1;
        this.Form_filled_data[field['key']][field['fieldsArray'].length] = {
          type: null,
          key: template['key'],
        };
        if (template.required) {
          this.validateObject[field['incrimentalKey'] + currentCounter] = new FormControl(
            {
              value: null,
              disabled: false,
            },
            [Validators.required],
          );
        } else {
          this.validateObject[field['incrimentalKey'] + currentCounter] = new FormControl(
            {
              value: null,
              disabled: false,
            },
            [Validators.nullValidator],
          );
        }
        this.formDFM = new FormGroup(this.validateObject);
        this.formDFM.updateValueAndValidity();
        template['counter'] = currentCounter;
        field['fieldsArray'].push(template);
      }
    } catch (error) {
      console.error(error);
    }
  }
  deleteFieldsFromDynamicFieldsArray(array: any, index: any, field: any) {
    if (array) {
      if (array.length > 1) {
        const deletedItem = JSON.parse(JSON.stringify(array[index]));
        this.Form_filled_data[field['key']].splice(index, 1);
        array.splice(index, 1);
        delete this.validateObject[field['incrimentalKey'] + deletedItem['counter']];
        this.formDFM = new FormGroup(this.validateObject);
        this.formDFM.updateValueAndValidity();
        array.forEach((eachItem: any, itemIndex: any) => {
          const incrimentedIndex = itemIndex + 1;
          eachItem['label'] = field['incrimentalKey'] + incrimentedIndex;
          eachItem['key'] = field['incrimentalKey'] + incrimentedIndex;
          this.Form_filled_data[field['key']][itemIndex]['key'] = eachItem['key'];
        });
        field['fieldsArray'] = JSON.parse(JSON.stringify(array));
      }
    }
  }


  handleTableEmitter(event: any, field: any, sectionIndex: any) {
    event['field'] = field;
    event['bodyContent'] = this.Form_filled_data;
    event['sectionIndex'] = sectionIndex;
    this.emitInstantChanges.emit(event);
  }

  handleTabsEmitter(event: any, field: any) {
    try {
      this.emitInstantChanges.emit({ event, field });
    } catch (error) {
      console.error(error);
    }
  }
  updateValidationForFields() {
    try {
      if (this.DFMDATA['headerContent']) {
        this.formValidateKeysArray = [];
        this.formNonValidateKeysArray = [];
        this.validateObject = {};
        const filedsWithDependent: any = {};
        for (const item of this.DFMDATA['headerContent']) {
          item['section_key'] = item['section_key'] || 'section_' + this.counter;
          this.counter++;
          if (item['data']) {
            for (const eachItem of item['data']) {
              if (eachItem.dependent) {
                filedsWithDependent[eachItem.key] = true;
              }
              if (eachItem['type'] === 'table') {
                eachItem['options'] = { ...eachItem['options'] };
              } else if (eachItem['type'] === 'customMultiselect') {
                this.updateCustomMultiselectList(eachItem);
              }
              this.disabledFields[eachItem.key] = eachItem.hasOwnProperty('disabled') ? eachItem['disabled'] : false;
              this.validatorsOfFields[eachItem['key']] = eachItem['validators'] ? eachItem['validators'] : null;
              if (eachItem.required) {
                if (eachItem.dependentKey && eachItem.dependentValue && filedsWithDependent[eachItem.dependentKey] && this.Form_filled_data[eachItem.dependentKey] === eachItem.dependentValue) {
                  this.formValidateKeysArray.push(eachItem.key);
                } else {
                  this.formNonValidateKeysArray.push(eachItem.key);
                }
              } else if (!eachItem.required) {
                this.formNonValidateKeysArray.push(eachItem.key);
              } else {
                this.formNonValidateKeysArray.push(eachItem.key);
              }
            }
          }
        }
        this.activateValidation();
      }
    } catch (error) {
      console.error(error);
    }
  }
  updateBodyContent() {
    try {
      if (this.Form_filled_data) {
        Object.keys(this.Form_filled_data).forEach((eachFieldKey) => {
          this.Form_filled_data[eachFieldKey] = this.replaceNullValues(this.Form_filled_data[eachFieldKey]);
        });
        this.SelectedValues.emit(this.Form_filled_data);
      }
    } catch (error) {
      console.error(error);
    }
  }
  replaceNullValues(value: any) {
    return (value == null || value === undefined) ? '' : value;
  }
  triggerFileUpload(id: any) {
    try {
      const domElm = document.getElementById(id);
      if (domElm) {
        domElm.click();
      }
    } catch (error) {
      console.error(error);
    }
  }
  fileChangeEvent(event: any, field: any) {
    try {
      const fieldKey = field.key;
      this.imageOptions['message'] = undefined;
      if (!event || !event.target || !event.target.files || !event.target.files.length) {
        return;
      }
      const size = event.target.files[0].size / 1024;
      if (size > 500) {
        this._toaster.toast('warning', 'Maximium file size', 'Cannot upload files more than 500 KB.', true);
        return;
      }
      const imageDetails: any = {};
      const fileList: FileList = event.target.files;
      const ValidImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (fileList.length > 0) {
        const file: File = fileList[0];
        const imageContent: any = {
          file_name: '',
          img_str: '',

        };
        let base64String: any = '';
        const reader: FileReader = new FileReader();
        reader.onload = ((frEvent: any) => {
          const imgContent: any = frEvent?.target['result'];
          if (imgContent.length > 0 && ValidImageTypes.indexOf(file.type) > -1) {
            imageContent.file_name = file.name.replace(/\s/g, '');
            imageContent.img_str = imgContent.split(',')[1];
            base64String = 'data:' + file.type + ';base64,' + imageContent['img_str'];
            imageDetails['image_content'] = imageContent.img_str;
            imageDetails['image_url'] = base64String;
            // imageDetails['image_url'] = frEvent.target['result'];
            this.Form_filled_data[fieldKey] = imageDetails;
            if (field['changeDetectionKey']) {
              this.Form_filled_data[field['changeDetectionKey']] = true;
            }
            this.formDFM.controls[fieldKey].setValue(this.Form_filled_data[fieldKey]);
            this.formDFM.updateValueAndValidity();
          } else {
            this.imageOptions['message'] = 'Only image (.jpeg, .jpg, .png) is allowed';
            this._toaster.toast('warning', 'Warning', 'Please upload valid file format.', true);
          }
        });
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error(error);
    }
  }

  onFileUpload(event: any, field: any) {
    try {
      this.emitInstantChanges.emit({ event, field, type: 'emitChanges', bodyContent: this.Form_filled_data });
    } catch (error) {
      console.error(error);
    }
  }

  onMultiselectValueChange(data: any) {
    try {
      if (data && data.emitChanges) {
        this.inputChanges.next({ data });
      }
    } catch (error) {
      console.error(error);
    }
  }

  onCustomMultiselectModelChange(field: any, item: any) {
    try {
      if (field.settings && field.settings.singleSelection) {
        this.Form_filled_data[field.key] = null;
        field.selectedItems = [];
        if (item && item.checked) {
          this.Form_filled_data[field.key] = field.settings.fullObject ? item : item[field.settings.primaryKey || 'value'];
        }
        for (const eachItem of field.options) {
          eachItem['checked'] = field.settings.fullObject ? JSON.stringify(this.Form_filled_data[field.key] || '') === JSON.stringify(eachItem) : eachItem[field.settings.primaryKey || 'value'] === this.Form_filled_data[field.key];
          if (eachItem.checked) {
            field.selectedItems = [eachItem];
          }
        }
      } else if (field.settings) {
        if (field.settings.fullObject) {
          this.Form_filled_data[field.key] = field.options.filter((el: any) => el.checked);
        } else {
          this.Form_filled_data[field.key] = (field.options.filter((el: any) => el.checked) || []).map((eachTag: any) => eachTag[field.settings.primaryKey || 'value']);
        }
        field.selectedItems = field.options.filter((el: any) => el.checked);
      }
      const fieldControls = this.formDFM.get(field.key);
      if (fieldControls) {
        fieldControls.updateValueAndValidity();
      }
      this.onMultiselectValueChange(field);
    } catch (error) {
      console.error(error);
    }
  }

  updateCustomMultiselectList(field: any) {
    try {
      if (!this.DFMDATA || !this.DFMDATA['bodyContent']) {
        return;
      }
      let fieldValue = this.DFMDATA['bodyContent'][field.key];
      field['options'] = field['options'] || [];
      const primaryKey = field.settings.primaryKey || 'value';
      if (field.settings.singleSelection) {
        if (field.settings.fullObject) {
          fieldValue = fieldValue || {};
          const ind = field.options.findIndex((el: any) => JSON.stringify(el) === JSON.stringify(fieldValue));
          if (ind > -1) {
            field.options[ind]['checked'] = true;
            field['selectedItems'] = [field.options[ind]];
          }
        } else {
          fieldValue = fieldValue || null;
          const ind = field.options.findIndex((el: any) => el[primaryKey] === fieldValue);
          if (ind > -1) {
            field.options[ind]['checked'] = true;
            field['selectedItems'] = [field.options[ind]];
          }
        }
      } else {
        fieldValue = fieldValue || [];
        field['selectedItems'] = [];
        for (let indexIn = 0; indexIn < field.options.length; indexIn++) {
          const eachItem = field.options[indexIn];
          if (field.settings.fullObject) {
            eachItem['checked'] = fieldValue.some((el: any) => el[primaryKey] === eachItem[primaryKey]);
          } else {
            eachItem['checked'] = fieldValue.indexOf(eachItem[primaryKey]) > -1;
          }
          if (eachItem['checked']) {
            const elementSpliced = field.options.splice(indexIn, 1);
            field.options.splice(0, 0, elementSpliced[0]);
            field.selectedItems.push(eachItem);
          }
        }
      }
      this.DFMDATA = { ...this.DFMDATA };
    } catch (error) {
      console.error(error);
    }
  }

  deselectAllTreeNodes(field: any) {
    this.Form_filled_data[field.key] = [];
    this.unselectChildNodes(field.nodeData);
  }

  unselectChildNodes(nodeData: any) {
    if (nodeData && nodeData.length) {
      for (const eachNode of nodeData) {
        eachNode.isChecked = false;
        eachNode.indeterminate = false;
        if (eachNode.children && eachNode.children.length) {
          this.unselectChildNodes(eachNode.children);
        }
      }
    }
  }
  changeactiveTab(activeTab: any) {
    this.activeTab = this.activeTab === activeTab ? undefined : activeTab;
  }
  ////////////////slider/////////////////////////

  showRangeSlider(field, sectionInd?, fieldInd?) {
    if(isNaN(field?.minValue) || isNaN(field?.maxValue) || !field.showSlider) {
      this.emitInstantChanges.emit({
        type: field.type,
        key: field['key'],
        emitType: 'rangePickerClick',
        sectionIndex: sectionInd,
        fieldIndex: fieldInd,
      });
      return;
    }
    field.showSlider = !field.showSlider;
    // if (!sliderTrack) {
    //   sliderTrack = this.getContainerFor(field.key);
    // }
    // if (!this.Form_filled_data[field.key]) {
    //   this.Form_filled_data[field.key] = {
    //     min: field.minValue,
    //     max: field.maxValue,
    //   };
    // }
    // setTimeout(() => {
    //   this.slideOne(field, sliderTrack)
    //   this.slideTwo(field, sliderTrack)
    // }, 10);
  }

  getContainerFor = (name) => this.hashes.find(x => x.hash === name).vcRef.element.nativeElement;

  slideOne(field, sliderTrack?) {
    if (!sliderTrack) {
      sliderTrack = this.getContainerFor(field.key);
    }
    let sliderOne = this.Form_filled_data[field.key]['min'];
    const sliderTwo = this.Form_filled_data[field.key]['max'];
    const minGap = field.minGap;
    const maxValue = field.maxValue;
    if (parseInt(sliderTwo) - parseInt(sliderOne) <= minGap) {
      sliderOne = parseInt(sliderTwo) - minGap;
      this.Form_filled_data[field.key]['min'] = sliderOne;
    }
    this.fillColor(sliderOne, sliderTwo, sliderTrack, maxValue);
  }
  slideTwo(field, sliderTrack?) {
    if (!sliderTrack) {
      sliderTrack = this.getContainerFor(field.key);
    }
    const sliderOne = this.Form_filled_data[field.key]['min'];
    let sliderTwo = this.Form_filled_data[field.key]['max'];
    const minGap = field.minGap;
    const maxValue = field.maxValue;
    if (parseInt(sliderTwo) - parseInt(sliderOne) <= minGap) {
      sliderTwo = parseInt(sliderOne) + minGap;
      this.Form_filled_data[field.key]['max'] = sliderTwo;
    }
    this.fillColor(sliderOne, sliderTwo, sliderTrack, maxValue);
  }
  fillColor(sliderOne, sliderTwo, sliderTrack, sliderMaxValue) {
    const percent1 = (sliderOne / sliderMaxValue) * 100;
    const percent2 = (sliderTwo / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
  }
  clearRangeValue(field: any, sliderTrack?: any) {
    try {
      if (!sliderTrack) {
        sliderTrack = this.getContainerFor(field.key);
      }
      this.Form_filled_data[field.key]['min'] = field.minValue;
      this.Form_filled_data[field.key]['max'] = field.maxValue;
      this.slideOne(field, sliderTrack);
      this.slideTwo(field, sliderTrack);
    } catch (error) {
      console.error(error);
    }
  }

  openDataPage(field: any) {
    try {
      if (field && field['emitChanges']) {
        this.emitInstantChanges.emit({
          type: 'emitChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
        });
      }
    } catch (err) {
      console.error(err)
    }
  }

  choosenYearMonHandler(event, datepicker: OwlDateTimeComponent<any>, field) {
    this.Form_filled_data[field.key] = new Date(event);
    datepicker.close();
  }

  onLabelClick(field, sectionInd?, fieldInd?) {
    try {
      if (!this.restrictFields) {
        return;
      }
      if (field?.groupedKeys?.length) {
        for (let eachKey of field?.groupedKeys) {
          for (let headerInd = 0; headerInd < this.DFMDATA?.headerContent?.length; headerInd++) {
            const groupInd = this.DFMDATA?.headerContent[headerInd]?.data?.findIndex((ele: any) => ele.key === eachKey);
            if (groupInd > -1) {
              this.DFMDATA.headerContent[headerInd].data[groupInd]['showTab'] = !this.DFMDATA.headerContent[headerInd].data[groupInd]['showTab'];
            }
          }
        }
      } else {
        field.showTab = !field.showTab;
      }
      return
      if (field?.type === 'range') {
        if (!field.showTab) {
         setTimeout(() => this.showRangeSlider(field, sectionInd, fieldInd), 0);
        } else {
          field.showTab = !field?.showTab;
        }
        return;
      }
      if (['advMultiSelect', 'simpleRadioSelect', 'advRadioSelect'].includes(field?.type)) {
        if (!field.showTab) {
          field['page'] = 1;
          field['end_of_records'] = false;
          let emitTypeName = '';
          if (field.type === 'advMultiSelect') {
            emitTypeName = 'advMultiSelectClick';
          } else if (field.type === 'simpleRadioSelect') {
            emitTypeName = 'simpleRadioClick';
          } else if (field.type === 'advRadioSelect') {
            emitTypeName = 'advRadioClick';
          }
          this.emitInstantChanges.emit({
            type: field.type,
            key: field['key'],
            emitType: emitTypeName,
            sectionIndex: sectionInd,
            fieldIndex: fieldInd,
          });
        } else {
          field.showTab = false;
        }
      } else {
        field.showTab = !field?.showTab;
      }
    } catch (labelClickErr) {
      console.error(labelClickErr);
    }
  }

  onScrollDown(field, sectionInd, fieldInd) {
    try {
      if (field?.end_of_records) {
        return;
      }
      this.scrollEmitter.emit({
        type: field.type,
        key: field['key'],
        emitType: 'infiniteScroll',
        sectionIndex: sectionInd,
        fieldIndex: fieldInd,
      });
    } catch (err) {
      console.error(err);
    }
  }

  sliderEmitter(event, field, sectionInd, ind) {
    try {
      if (!this.Form_filled_data[field?.key]) {
        this.Form_filled_data[field?.key] = {
          min: event.min,
          max: event.max
        }
      }
      if (field && field['emitChanges']) {
        this.emitInstantChanges.emit({
          type: field.type,
          key: field['key'],
          emitType: 'rangeSliderEmitter',
          sectionIndex: sectionInd,
          fieldIndex: ind,
          bodyContent: this.Form_filled_data,
        });
      }
    } catch (slideEmitErr) {
      console.error(slideEmitErr);
    }
  }

  advSelectValChange(key, eachField, sectionIndex, val, field, eachOpt) {
    try {
      if (!this.Form_filled_data?.[key] || !this.Form_filled_data?.[key]?.length) {
        this.Form_filled_data[key] = [];
      }
      const findInd = this.Form_filled_data[key].findIndex((ele: any) => JSON.stringify(ele) === JSON.stringify(eachOpt.value));
      if (findInd > -1) {
        if (!eachOpt?.IsSelected) {
          this.Form_filled_data[key].splice(findInd, 1);
        }
      } else {
        if (eachOpt?.IsSelected) {
          this.Form_filled_data[key].push(eachOpt?.value);
        }
      }
      this.updateFieldsWithValueDependency(key, eachField, sectionIndex, val, field);
    } catch (fieldErr) {
      console.error(fieldErr);
    }
  }

  clearFieldValue(field: any, eachField, sectionIndex, val, isMultiSelect?) {
    try {
      if (!field?.key) {
        return;
      }
      if (isMultiSelect) {
        for (let eachOpt of field?.options) {
          eachOpt['IsSelected'] = false;
        }
        this.Form_filled_data[field.key] = [];
        this.updateFieldsWithValueDependency(field.key, eachField, sectionIndex, val, field);
      } else {
        this.Form_filled_data[field.key] = null;
        this.updateFieldsWithValueDependency(field.key, eachField, sectionIndex, val, field);
      }
    } catch (fieldErr) {
      console.error(fieldErr);
    }
  }

  onAdvMultiSelectAll(field: any, eachField, sectionIndex, val) {
    try {
      if (!field?.key) {
        return;
      }
      this.Form_filled_data[field.key] = [];
      for (let eachOpt of field?.options) {
        eachOpt['IsSelected'] = true;
        this.Form_filled_data[field.key].push(eachOpt?.value);
      }
      this.updateFieldsWithValueDependency(field.key, eachField, sectionIndex, val, field);
    } catch (fieldErr) {
      console.error(fieldErr);
    }
  }

  onSwitchChange(field) {
    try {
      if (field && field['emitChanges']) {
        let payload: any = {
          type: 'emitChanges',
          key: field['key'],
          value: this.Form_filled_data[field['key']],
          bodyContent: this.Form_filled_data,
          fieldType: field['type'],
        };
        if (field['disableDependentKey']) {
          payload['disableDependentKey'] = field['disableDependentKey']
        }
        this.emitInstantChanges.emit(payload);
      }
    } catch (fieldErr) {
      console.error(fieldErr);
    }
  }
}
