import { Component, OnInit } from '@angular/core';
import { Subject, Subscription} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { Router } from '@angular/router';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../guards/auth.service';
import { UtilityFunctions } from '../../../utilities/utility-func';
import { HttpLayerService } from '../../../services/http-layer.service';
import { Config } from '../../../config/config';

@Component({
  selector: 'ucp-survey-template',
  templateUrl: './survey-template.component.html',
  styleUrls: ['./survey-template.component.scss']
})
export class SurveyTemplateComponent implements OnInit {

  public agGridOptions: any;
  public dfmData: any;
  public meta: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  public surveyKey: any;
  public loader: any= {
    survey_template: false,
    delete: false
  }
  public surveyTemplateForm: FormGroup = new FormGroup({
    survey_name: new FormControl({ value: null, disabled: false }, [Validators.required]),
    sheet_name: new FormControl({ value: null, disabled: false }, [Validators.required]),
    survey_template: new FormControl({ value: null, disabled: false }, [Validators.required]),
  });

  public templateData: any = {
    sheet_name: null,
    survey_template: null,
    has_headers: false,
    row_number: 0,
    skip_rows: 0,
  }
  public surveyExpDate :any = {
    survey_expiry_date :  null,
    survey_expiry_date_extension :null
  }
  public fileUploadMetaData = {
    csvUploadFile: undefined,
    fileSelectedToUpload: null,
    fileNameBlock: 'Choose file',
    isValid: false,
    selectedFile: undefined,
    sheet_name: null,
    file_extension: null
  };
  public DataLoaded: any = false;
  public sheetList: any;
  public tableData: any;
  public SurveySheetName: any;
  public paramSelectList: any;
  public reloadTable: any;
  public userRolePermissions: any  = {};
  public surveySampleTempData: any;
  public surveyExpList : any = [
    {
      label : "Year",
      value : "years"
    },
    {
      label : "Month",
      value : "months"
    },
    {
      label : "Days",
      value : "days"
    }
  ];

  constructor(public toaster: ToasterService, private appservice: AppService, private router:Router,public commonPopup: CommonPopupService,  private _auth: AuthService, private _util: UtilityFunctions , private httpLayerService : HttpLayerService) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_parameters_item') {
          this.confirmConfDelete(data?.data);
        }
      }
    });
    const surveyTempPerm = this._auth.getUserPermissions('survey_templates');
    if (surveyTempPerm) {
      this.userRolePermissions['create'] = surveyTempPerm['create'];
      this.userRolePermissions['edit'] = surveyTempPerm['edit'];
      this.userRolePermissions['delete'] = surveyTempPerm['delete'];
      this.userRolePermissions['view'] = surveyTempPerm['view'];
    }

   }

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable() {
    try {
      this.loader.survey_template = true;
      this.appservice.fetchSurveyTemplateDetails().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
          this.loader.survey_template = false;
        } else {
          this.loader.survey_template = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.survey_template = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (table_error) {
      this.loader.survey_template = false;
      console.error(table_error);
    }
  }

  get f() {
    return this.surveyTemplateForm.controls;
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


  aggridEmitter(event: any) {
    try {
      if (event && event?.action?.type) {
        switch(event.action.type) {
          case 'addnew':
            this.templateData= {
              sheet_name: null,
              survey_template: null,
              survey_expiry_date : null,
              survey_expiry_date_extension :null,
              has_headers: false,
              row_number: 0,
              skip_rows: 0,
            }
            this.fileUploadMetaData['selectedFile'] = undefined;
            this.fileUploadMetaData['fileSelectedToUpload'] = null;
            this.DataLoaded = false;
            this.surveyKey = 'Add';
            this.loadSurveySheet();
            this.cleanAllFormFields(this.surveyTemplateForm);
            this.openModal('addModalButton');
            break;
          case 'edit':
            this.surveyKey = 'Edit';
            this.openModal('addModalButton');
            break;
          case 'delete':
            const message1 = `Are you sure do you want to delete this survey template (${event?.data?.survey_template})?`;
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_parameters_item', event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }
  
  confirmConfDelete(event: any) {
    try {
      const dataToSend = {};
      dataToSend['survey_template_id'] = event.data.survey_template_id;
      this.loader['delete'] = true;
      this.appservice.deleteSurveyTemplateData(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteData) => {
        if (deleteData.status === 'success') {
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
      console.error(error);
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

  loadSurveySheet() {
    this.loader.surveyLoad = false;
    this.appservice.getSurveyName().pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if (res && res['status'] === 'success') {
        this.SurveySheetName = res['data']['surveys'];
        this.loader.surveyLoad = false;
      } else {
        this.loader.surveyLoad = false;
        this.toaster.toast('error', 'Error', res.message, true);
        this.sheetList = [];
      }
    });
  }

  toggleDOMELM(referenceId) {
    try {
      const domEle = document.getElementById(referenceId);
      if (domEle) {
        domEle.click();
      }
    } catch (error) {
      console.error(error);
    }
  }

  uploadBlockCsv(event) {
    try {
      this.fileUploadMetaData['isValid'] = false;
      const size = event.target.files[0].size / 1024 / 1024;
      if (size > 5) {
        this.fileUploadMetaData['isValid'] = false;
        this.toaster.toast('error', 'Maximium file size', 'Cannot upload files more than 5 MB.', true);
        return;
      }
      if (event.target['value']) {
        const fileList: FileList = event.target.files;
        const validExts = new Array('.xlsx', '.xls');
        let fileExt = JSON.parse(JSON.stringify(event.target['value']));
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
        this.fileUploadMetaData['file_extension'] = fileExt;
        if (fileList.length > 0) {
          const file: File = fileList[0];
          if (validExts.indexOf(fileExt) > -1) {
            this.fileUploadMetaData['selectedFile'] = event.target.files[0];
            this.fileUploadMetaData['fileSelectedToUpload'] = event.target['value'].split('\\').pop();
            this.fileUploadMetaData['fileNameBlock'] = this.fileUploadMetaData['fileSelectedToUpload'];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            const current = this;
            current.fileUploadMetaData['isValid'] = true;
            reader.onload = function () {
              current.fileUploadMetaData['csvUploadFile'] = reader.result;
              if (['.xlsx', '.xls'].includes(current.fileUploadMetaData['file_extension'])) {
                current.getSheetNames();
              } else {
                current.fileUploadMetaData['sheet_name'] = null;
              }
            };
            reader.onerror = function (error) {
              console.error('Error: ', error);
            };
            // this.uploadBtn = true;
          } else {
            this.fileUploadMetaData['isValid'] = false;
            this.toaster.toast('error', 'File type', 'Cannot upload files other than specified.', true);
          }
        } else {
          this.fileUploadMetaData['isValid'] = false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  changeSheetData(tableData) {
    try {
      if (tableData) {
        this.tableData = tableData;
        if (this.tableData && this.tableData['columnDefs'] && this.tableData['columnDefs'].length) {
          for (const iterator1 of this.tableData['columnDefs']) {
            if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'data_type') {
              iterator1['cellRendererParams'] = {
                "settings": {
                  "options": this.paramSelectList?.data_types,
                  "minWidth": "400px",
                  "headerKey": "data_type",
                  disableFunc : (params) => params.skip_column || false
                }
              }
            }
            else if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'parameter') {
              iterator1['cellRendererParams'] = {
                "settings": {
                  "options": this.paramSelectList?.parameters,
                  "minWidth": "400px",
                  "headerKey": "parameter",
                  disableFunc : (params) => params.skip_column || false
                }
              }
            }
            else if(iterator1 && iterator1.cellRenderer === 'switchInputRenderer'  && iterator1.field === 'skip_column')
              {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "headerKey" : "skip_column"
                  }
                }
              }
          }
        }
        
        this.reloadTable = false;
        this.tableData = { ...this.tableData };
        setTimeout(() => {
          this.reloadTable = true;
        }, 100);
      }
    } catch (error) {
      console.error(error)
    }
  }

  getSheetNames() {
    try {
      const formData = new FormData();
      formData.append('file_data', this.fileUploadMetaData['selectedFile']);
      formData.append('file_name', this.fileUploadMetaData['fileSelectedToUpload']);
      formData.append('survey_name', this.templateData['survey_name']);
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.fileUploadMetaData['sheet_name'] = null;
      this.DataLoaded = true;
      this.templateData.sheet_name = "";
      this.sheetList = [];
      this.cleanAllFormFields(this.surveyTemplateForm);
      this.loader.fetch = true;
      this.appservice.fetchSurveySheetList(formData).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.loadSurveyFields();
          this.sheetList = res['data']['sheet_name'];
          this.loader.fetch = false;
          this.DataLoaded = true;
        } else {
          this.loader.fetch = false;
          this.toaster.toast('error', 'Error', res.message, true);
          this.sheetList = [];
        }
      });
    } catch (err) {
      this.loader.fetch = false;
      console.error(err);
    }
  }

  loadSurveyFields() {
    try {
      this.loader.fetch = true;
      this.appservice.fetchSurveyField().pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.paramSelectList = res.data;
          this.loader.fetch = false;
        } else {
          this.loader.fetch = false;
          this.toaster.toast('error', 'Error', res.message, true);
          this.sheetList = [];
        }
      });
    } catch (surveyFieldError) {
      this.loader.fetch = false;
      console.error(surveyFieldError);
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

  saveModal() {
    try{
      if (this.surveyTemplateForm.invalid) {
        this.validateAllFormFields(this.surveyTemplateForm);
        this.toaster.toast('info', 'Info', 'Please fill all the required fields.');
        return;
      }
      const payload = {
        "survey_name": this.templateData.survey_name || '',
        "column_data": this.templateData.sheet_name.table_data.rowData || [],
        "has_headers": this.templateData.has_headers || '',
        "survey_expiry_date_extension" : this.surveyExpDate.survey_expiry_date_extension || null ,
        "survey_expiry_date" :this.surveyExpDate.survey_expiry_date || null,
        "row_number": this.templateData.row_number || '',
        "skip_rows": this.templateData.skip_rows || '',
        "survey_template": this.templateData.survey_template || '',
      };
      this.appservice.saveSurveyTemplate(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.toaster.toast('success', 'Success', respData['message'] || 'Survey Template Data Uploaded Successfully.');
          this.loadTable();
          this.closeModal();
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving the data.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while saving the data.');
      });
      this.closeModal();
    } catch(err) {
      console.error(err);
    }
  }

  closeModal() {
    try{
      this.templateData.survey_name = null;
      this.templateData.description = null;
      this.surveyExpDate.survey_expiry_date = null;
      this.surveyExpDate.survey_expiry_date_extension = null;
      const ele: any = document.getElementById('closeParamModel');
      if (ele) {
      ele.click();
    }
    } catch(err) {
      console.error(err);
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
  downloadFile()
  {
    const payload = {
      survey_template : this.templateData['survey_name'] || '' ,
    }
    const encodedURL = this._util.jsontoURLSearchParam(payload);
    const downLoadLink = Config.API.GET_SAMPLE_TEMP_DATA+ `?params=${encodedURL}`;
    window.open(downLoadLink);   
  }
}
