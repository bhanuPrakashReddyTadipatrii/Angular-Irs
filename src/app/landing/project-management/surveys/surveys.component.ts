import { Component, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { Router } from '@angular/router';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../guards/auth.service';
import { UtilityFunctions } from '../../../utilities/utility-func';


@Component({
  selector: 'ucp-surveys',
  templateUrl: './surveys.component.html',
  styleUrls: ['./surveys.component.scss']
})
export class SurveysComponent implements OnInit {

  public agGridOptions: any;
  public dfmData: any;
  public meta: any = {
    today: new Date(),
  };
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  public loader: any = {
    fetch: false,
    delete: false,
    survey: false,
    sheet: false,
    data: false,
    save: false,
    templateData: false
  }
  public surveysForm: FormGroup;
  public additionalForm: FormGroup;
  public fileUploaded: any = false;
  public paramSelectList: any;
  public previewTableData: any;
  public isPreview: any = false;
  public surveyId: any;
  public editModalOpen: any = false;
  public reloadTable: any;
  public surveyDetails: any = {
    csvUploadFile: undefined,
    fileSelectedToUpload: null,
    fileNameBlock: 'Choose file',
    isValid: false,
    selectedFile: undefined,
    survey_template_list: null,
    sheet_name: null,
    file_extension: null,
    survey_sheet_name: null,
    survey_template: null,
    survey_data: null,
    survey_id: null,
    tableData: null,
    survey_start_date: null,
    survey_end_date: null,
    chainage_milestone: null,
    work_order_number: null,
    formatOptions: {
      has_headers: false,
      row_number: null,
      skip_rows: null
    },
    templatePreviewTable: {},
    loadedTable: true,
    errorsTable: {},
    surveyTable: {},
    accordionView: [],
    isDataValid: false,
    validationMsg: null,
    templatePreview: false,
    dataLoaded: false,
    chainageUnit: null
  }
  additionalFile: any= {
    csvUploadFile: undefined,
    fileSelectedToUpload: null,
    fileNameBlock: 'Choose file',
    isValid: false,
    selectedFile: undefined,
    survey_template_list: null,
    sheet_name: null,
    file_extension: null,
    survey_sheet_name: null,
    survey_template: null,
    survey_data: null,
    survey_id: null,
    tableData: null,
    survey_start_date: null,
    survey_end_date: null,
    chainage_milestone: null,
    work_order_number: null,
    templatePreviewTable: {},
    loadedTable: true,
    errorsTable: {},
    surveyTable: {},
    accordionView: [],
    isDataValid: false,
    validationMsg: null,
    templatePreview: false,
    dataLoaded: false,
    chainageUnit: null
  };
  public chainage_milestone: any = {
    chainage_value: 1000,
    extension_value: 'm'
  }
  public chainage_milestone_list: any = [
    {
      label: 'M',
      value: 'm'
    }
  ];
  public chainageUnitList: any = [
    {
      label: 'M',
      value: 'm'
    },
    {
      label: 'KM',
      value: 'km'
    }

  ]
  public surveyName: any;
  public userRolePermissions: any = {};
  public disableField: any = false;
  public tableHeight: any;
  public allFields: any = ['survey_sheet_name', 'survey_template', 'survey_start_date', 'survey_end_date', 'chainage_milestone'];
  public validationChecked: any = false;
  public activeTab: any;
  public viewList = [];
  public additionalDataUploaded = false;
  public disabledRenderer: boolean = false;
  public survayAccordianView = [
    {
      label: "Upload Survey File",
      value: "uploadSurvayFile",
      showTab: true
    },
    {
      label: "Additional Files",
      value: "additionalFile",
      showTab: false
    }
  ];
  public existingSurveyId: any;
  public enableEditServiceCall: any= false;


  constructor(public toaster: ToasterService, private appservice: AppService, private router: Router, public commonPopup: CommonPopupService, private _auth: AuthService, private _util: UtilityFunctions) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_parameters_item') {
          this.confirmConfDelete(data?.data);
        }
      }
    });
    const surveyPerm = this._auth.getUserPermissions('surveys');
    if (surveyPerm) {
      this.userRolePermissions['create'] = surveyPerm['create'];
      this.userRolePermissions['edit'] = surveyPerm['edit'];
      this.userRolePermissions['delete'] = surveyPerm['delete'];
      this.userRolePermissions['view'] = surveyPerm['view'];
    }
  }

  ngOnInit(): void {
    this.loadTable();
  }


  /**
   * for loading the survey list table
   */
  loadTable() {
    try {
      this.loader.fetch = true;
      this.appservice.getDataImportDetails().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
          this.loader.fetch = false;
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
          this.loader.fetch = false;
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
        this.loader.fetch = false;
      });
    } catch (table_error) {
      console.error(table_error);
      this.loader.fetch = false;
    }
  }

  get f() {
    return this.surveysForm.controls;
  }

  /**
   * for validating the form
   * @param formGroup for survey form
   */
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

  changeactiveTab(activeAccTab: any) {
    // if (this.activeTab === activeAccTab.value) {
    //   this.activeTab = null;
    //   return;
    // }
    // this.activeTab = activeAccTab.value;
    activeAccTab.showTab = !activeAccTab.showTab;
  }

  activateValidation() {
    const validateObject = {};
    const nullValidatorObject = {};
    for (let ind = 0; ind < this.allFields?.length; ind++) {
      validateObject[this.allFields[ind]] = new FormControl({ value: this.surveyDetails[this.allFields[ind]], disabled: false }, [Validators.required]);
      nullValidatorObject[this.allFields[ind]] = new FormControl({ value: this.surveyDetails[this.allFields[ind]], disabled: false }, [Validators.nullValidator]);
    }
    this.surveysForm = new FormGroup(validateObject);
    this.additionalForm = new FormGroup(nullValidatorObject);
  }

  /**
   * for getting survey template data
   */
  fetchSurveyTemplateOptions() {
    try {
      this.loader.sheet = true;
      this.appservice.fetchSurveyTemplateList().pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.surveyDetails.survey_template_list = res['data']?.survey_template;
          this.additionalFile.survey_template_list = res['data']?.additional_template;
          this.loader.sheet = false;
        } else {
          this.loader.sheet = false;
          this.toaster.toast('error', 'Error', res.message, true);
          this.surveyDetails.survey_template_list = [];
          this.additionalFile.survey_template_list = [];
        }
      }, (fetchErr) => {
        this.loader.sheet = false;
        console.error(fetchErr);
        this.toaster.toast('error', 'Error', 'Error while fetching Template options', true);
      });
    } catch (templisterr) {
      this.loader.sheet = false;
      console.error(templisterr)
    }
  }

  /*---------------- file upload functions started -------------------*/

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


  uploadBlockCsv(event, param) {
    try {
      param['isValid'] = false;
      const size = event.target.files[0].size / 1024 / 1024;
      if (size > 15) {
        param['isValid'] = false;
        this.toaster.toast('error', 'Maximium file size', 'Cannot upload files more than 15 MB.', true);
        return;
      }
      if (event.target['value']) {
        const fileList: FileList = event.target.files;
        const validExts = new Array('.xlsx', '.xls');
        let fileExt = JSON.parse(JSON.stringify(event.target['value']));
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
        param['file_extension'] = fileExt;
        if (fileList.length > 0) {
          const file: File = fileList[0];
          if (validExts.indexOf(fileExt) > -1) {
            param['selectedFile'] = event.target.files[0];
            param['fileSelectedToUpload'] = event.target['value'].split('\\').pop();
            param['fileNameBlock'] = param['fileSelectedToUpload'];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            const current = this;
            param['isValid'] = true;
            reader.onload = function () {
              param['csvUploadFile'] = reader.result;
              if (['.xlsx', '.xls'].includes(param['file_extension'])) {
                current.getSheetNames(param);
              } else {
                param['sheet_name'] = null;
              }
            };
            reader.onerror = function (error) {
              console.error('Error: ', error);
            };
            // this.uploadBtn = true;
          } else {
            param['isValid'] = false;
            this.toaster.toast('error', 'File type', 'Cannot upload files other than specified.', true);
          }
        } else {
          param['isValid'] = false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * for file upload
   */
  getSheetNames(param) {
    try {
      this.loader.survey = true;
      const formData = new FormData();
      const fileData: any = [param['selectedFile']];
      for (let ind = 0; ind < fileData.length; ind++) {
        formData.append('upload_file', fileData[ind]);
      }
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      param['sheet_name'] = null;
      this.appservice.getSurveysList(formData).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          param.survey_sheet_name = null
          this.editModalOpen = false;
          param.survey_data = res['data']?.[param['fileSelectedToUpload']] || [];
          this.cleanAllFormFields(this.surveysForm);
          param.tableData = null;
          if (this.surveyId) {
            this.disableField = false;
          }
          param.dataLoaded = true;
          this.loader.survey = false;
        } else {
          this.toaster.toast('error', 'Error', res.message, true);
          param.survey_data = [];
          this.loader.survey = false;
        }
      }, (fetchSheetErr) => {
        this.loader.survey = false;
        console.error(fetchSheetErr);
        this.toaster.toast('error', 'Error', 'Error while fetching Survey data.', true);
      });
    } catch (err) {
      console.error(err);
      this.loader.survey = false;
    }
  }

  /*-------------------- file upload functions ended -----------------------*/

  aggridEmitter(event: any) {
    try {
      if (event && event?.action?.type) {
        switch (event.action.type) {
          case 'addnew':
            this.disabledRenderer = false;
            this.activateValidation();
            this.surveyDetails = {
              csvUploadFile: undefined,
              fileSelectedToUpload: null,
              fileNameBlock: 'Choose file',
              isValid: false,
              selectedFile: undefined,
              survey_template_list: null,
              sheet_name: null,
              file_extension: null,
              survey_sheet_name: null,
              survey_template: null,
              survey_data: null,
              survey_id: null,
              tableData: null,
              survey_start_date: null,
              survey_end_date: null,
              chainage_milestone: null,
              work_order_number: null,
              formatOptions: {
                has_headers: false,
                row_number: null,
                skip_rows: null
              },
              templatePreviewTable: {},
              loadedTable: true,
              errorsTable: {},
              surveyTable: {},
              accordionView: [],
              isDataValid: false,
              validationMsg: null,
              templatePreview: false,
              dataLoaded: false,
              chainageUnit: null
            }
            this.additionalFile = {
              csvUploadFile: undefined,
              fileSelectedToUpload: null,
              fileNameBlock: 'Choose file',
              isValid: false,
              selectedFile: undefined,
              survey_template_list: null,
              sheet_name: null,
              file_extension: null,
              survey_sheet_name: null,
              survey_template: null,
              survey_data: null,
              survey_id: null,
              tableData: null,
              survey_start_date: null,
              survey_end_date: null,
              chainage_milestone: null,
              work_order_number: null,
              templatePreviewTable: {},
              loadedTable: true,
              errorsTable: {},
              surveyTable: {},
              accordionView: [],
              isDataValid: false,
              validationMsg: null,
              templatePreview: false,
              dataLoaded: false,
              chainageUnit: null
            }
            this.surveyId = null;
            this.surveyName = "Add";
            this.disableField = false;
            this.fetchSurveyTemplateOptions();
            this.openModal('addModalButton');
            break;
          case 'edit':
            this.disabledRenderer = true;
            this.activateValidation();
            this.surveyDetails.tableData = null;
            this.surveyId = event.data.survey_id
            if (this.surveyId) {
              this.disableField = true;
            }
            this.fetchSurveyTemplateOptions();
            if(event?.data?.additional_survey_id) {
            this.enableEditServiceCall = true
            }
            this.fetcheditdata(event, this.surveyDetails, event.data.survey_id);
            break;
          case 'delete':
            this.disabledRenderer = false;
            const message1 = 'Are you sure do you want to delete this item?';
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_parameters_item', event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }

  /**
   * for edit a survey data
   * @param event gives all data of selected survey
   */
  fetcheditdata(event, param, survey_id) {
    try {
      this.loader.fetch = true;
      const payload = {
        survey_id: survey_id
      }
      this.editModalOpen = true;
      this.appservice.editsurveyData(payload).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          param['survey_sheet_name'] = res.data.survey_sheet_name;
          param['survey_template'] = res.data.survey_template;
          param.fileSelectedToUpload = null;
          param.selectedFile = null;
          param['survey_start_date'] = new Date(res.data.survey_start_date);
          param['survey_end_date'] = new Date(res.data.survey_end_date);
          param['work_order_number'] = res.data.work_order_number || null;
          param['chainage_milestone'] = res.data.chainage_milestone.chainage_value || null;
          this.validationChecked = false;
          param.dataLoaded = true;
          this.loader.fetch = false;
          this.surveyName = "Edit";
          param.templatePreview = false;
          this.validateSurvey(param);
          this.getTemplateData(param);
          this.openModal('addModalButton');
          this.surveyDetails.survey_data = res.data.edit_sheet_list;
          if(event?.data?.additional_survey_id && this.enableEditServiceCall) {
            this.enableEditServiceCall = false;
            this.fetcheditdata(event, this.additionalFile, event?.data?.additional_survey_id);
          }
        } else {
          this.toaster.toast('error', 'Error', res.message, true);
          this.surveyDetails.survey_data = [];
          this.loader.fetch = false;
        }
      }, (editConfigErr) => {
        this.loader['fetch'] = false;
        console.error(editConfigErr);
        this.toaster.toast('error', 'Error', 'Error while fetching Survey data.', true);
      });
    } catch (err) {
      console.error(err);
      this.loader.fetch = false;
    }
  }

  /**
   * for deleting of selected survey
   * @param event gives the details of selected survey
   */
  confirmConfDelete(event: any) {
    try {
      const dataToSend = {};
      dataToSend['survey_id'] = event.data.survey_id;
      dataToSend['survey_template'] = event.data.survey_template;
      this.loader['delete'] = true;
      this.appservice.deleteSurvey(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteData) => {
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

  loadSurveyFields() {
    try {
      this.loader.sheet = true;
      this.appservice.fetchSurveyField().pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.paramSelectList = res.data;
          this.loader.sheet = false;
        } else {
          this.loader.sheet = false;
          this.toaster.toast('error', 'Error', res.message, true);
        }
      }, (loadSurveyConfigErr) => {
        this.loader.sheet = false;
        console.error(loadSurveyConfigErr);
        this.toaster.toast('error', 'Error', 'Error while fetching Survey data.', true);
      });
    } catch (surveyFieldError) {
      this.loader.sheet = false;
      console.error(surveyFieldError);
    }
  }



  validateSurvey(param) {
    try {
      if (!param?.survey_sheet_name) {
        return;
      }
      if (this.disableField) {
        return;
      }
      const formData = new FormData();
      const fileData: any = [param['selectedFile']];
      for (let ind = 0; ind < fileData.length; ind++) {
        formData.append('upload_file', fileData[ind]);
      }
      const fileConstraints: any = {
        [param['fileSelectedToUpload']]: {
          survey_sheet_name: param['survey_sheet_name'],
        }
      }
      this.loader.data = true;
      const filename = param['fileSelectedToUpload'] || '';
      formData.append('file_constraints', JSON.stringify(fileConstraints));
      formData.append('survey_template_id', param['survey_template']);
      formData.append('survey_id', this.surveyId || '');
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.appservice.uploadSurvey(formData).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res?.status === 'success') {
          this.validationChecked = true;
          param.accordionView = [];
          param.isDataValid = res?.data?.[filename]?.valid || false;
          param.validationMsg = res?.data?.[filename]?.msg;
          param.errorsTable = res?.data?.[filename]?.['errors'] || {};
          param.surveyTable = res?.data?.[filename]?.['table_data'] || {};
          param.tableData = res?.data?.[filename]?.['template_table'] || {}
          param.templatePreview = false;
          // this.templatePreviewTable = {};
          if (param.tableData && param.tableData['columnDefs'] && param.tableData['columnDefs'].length) {
            for (const iterator1 of param.tableData['columnDefs']) {
              if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'data_type') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "options": this.paramSelectList?.data_types,
                    "minWidth": "400px",
                    "headerKey": "data_type",
                    "disabled": this.disabledRenderer,
                    disableFunc: (params) => params.skip_column || false

                  }
                }
              }
              else if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'parameter') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "options": this.paramSelectList?.parameters,
                    "minWidth": "400px",
                    "headerKey": "parameter",
                    "disabled": this.disabledRenderer,
                    disableFunc: (params) => params.skip_column || false
                  }
                }
              }
              else if (iterator1 && iterator1.cellRenderer === 'switchInputRenderer' && iterator1.field === 'skip_column') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "disabled": this.disabledRenderer,
                    "headerKey": "skip_column"
                  }
                }
              }
            }
          }
          if (param.accordionView.length < 3) {
            if (!param.errorsTable?.rowData?.length) {
              param.accordionView.unshift({ label: "Uploaded File Data", value: "surveyTable" }, { label: "Map Column To Parameter", "value": "mapColumnToParameter", "showTab": true })
            }
            else {
              param.accordionView.unshift({ label: "Errors in File", value: "errorTableData", "showTab": true }, { label: "Uploaded File Data", value: "surveyTable", "showTab": true }, { label: "Map Column To Parameter", "value": "mapColumnToParameter", "showTab": true })
            }
          }
          param.accordionView.forEach((ele) => ele.showTab = true);
          this.loader.data = false;
        } else {
          this.toaster.toast('error', 'Error', res.message || 'Error while validating data.', true);
          this.loader.data = false;
        }
      }, (uploadErr) => {
        console.error(uploadErr);
        this.toaster.toast('error', 'Error', 'Error while validating data.', true);
        this.loader.data = false;
      });
    } catch (surveyErr) {
      this.loader.data = false;
      console.error(surveyErr);
    }
  }

  /**
   * for getting the template data table
   */
  getTemplateData(param) {
    try {
      if (!param.survey_template) {
        return;
      }
      this.loadSurveyFields();
      this.loader.templateData = true
      this.appservice.getSurveyTemplate({ survey_template_id: param.survey_template }).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          param.templatePreviewTable = respData?.data;
          param.selectedFile = null;
          param.fileSelectedToUpload = null;
          param.survey_sheet_name = null;
          param.dataLoaded = false;
          param.templatePreview = true;
          this.disabledRenderer = true;
          this.loader.templateData = false;
          if (param.templatePreviewTable && param.templatePreviewTable['columnDefs'] && param.templatePreviewTable['columnDefs'].length) {
            for (const iterator1 of param.templatePreviewTable['columnDefs']) {
              if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'data_type') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "options": this.paramSelectList?.data_types,
                    "minWidth": "400px",
                    "headerKey": "data_type",
                    "disabled": this.disabledRenderer,
                    disableFunc: (params) => params.skip_column || false

                  }
                }
              }
              else if (iterator1 && iterator1.cellRenderer === 'selectRenderer' && iterator1.field === 'parameter') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "options": this.paramSelectList?.parameters,
                    "minWidth": "400px",
                    "headerKey": "parameter",
                    "disabled": this.disabledRenderer,
                    disableFunc: (params) => params.skip_column || false
                  }
                }
              }
              else if (iterator1 && iterator1.cellRenderer === 'switchInputRenderer' && iterator1.field === 'skip_column') {
                iterator1['cellRendererParams'] = {
                  "settings": {
                    "disabled": this.disabledRenderer,
                    "headerKey": "skip_column"
                  }
                }
              }
            }
          }
          param.loadedTable = false;
          setTimeout(() => {
            param.loadedTable = true;
          }, 100);
          param.templatePreviewTable = { ...param.templatePreviewTable }
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while loading the template Data.');
          this.loader.templateData = false;
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while previewing the Template Data.');
        this.loader.templateData = false;

      });
    } catch (templatedataError) {
      console.error(templatedataError);
      this.loader.templateData = false;
    }
  }


  /**
   * for opening the modal
   * @param id getting the element id
   */
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  closePreview() {
    this.isPreview = false;
    this.previewTableData = {}
    // this.validateSurvey();
  }

  /**
   * for saving the survey Data
   */
  saveModal(param) {
    try {
      if (this.surveysForm.invalid) {
        this.validateAllFormFields(this.surveysForm);
        this.toaster.toast('info', 'Info', 'Please fill all the required fields.');
        return;
      }
      if (!(this.surveyDetails.dataLoaded && this.surveyDetails.survey_template && !this.isPreview && !this.editModalOpen && (this.surveyDetails?.isDataValid && (!this.additionalDataUploaded || (this.additionalDataUploaded && this.additionalFile?.isDataValid))))) {
        return
      }
      let start_date: any = new Date(param.survey_start_date).getTime();
      let end_date: any = new Date(param.survey_end_date).getTime();
      if (start_date > end_date) {
        this.toaster.toast('info', 'Info', 'Start date cannot be greater than end date', true);
        return;
      }
      // const survey_details = {
      //   table_data: param['tableData']['rowData'],
      //   format_options: param['formatOptions'],
      // }
      this.loader.save = true;
      const formData = new FormData();
      const fileData: any = [param['selectedFile']];
      for (let ind = 0; ind < fileData.length; ind++) {
        formData.append('upload_file', fileData[ind]);
      }
      const fileConstraints: any = {
        [param['fileSelectedToUpload']]: {
          survey_sheet_name: param['survey_sheet_name'],
        }
      }
      formData.append('column_properties', JSON.stringify(param['tableData']['rowData']));
      formData.append('survey_sheet_name', param['survey_sheet_name']);
      formData.append('survey_template_id', param['survey_template']);
      formData.append('survey_start_date', start_date);
      formData.append('existing_survey_id', this.existingSurveyId);
      formData.append('survey_end_date', end_date);
      formData.append('work_order_number', param.work_order_number);
      formData.append('survey_id', this.surveyId);
      formData.append('file_constraints', JSON.stringify(fileConstraints));
      formData.append('chinage_unit', param?.chainageUnit);
      // formData.append('survey_data', JSON.stringify(survey_details || {}));
      formData.append('chainage_milestone', JSON.stringify(this.chainage_milestone || {}));
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      // formData.append('survey_data', JSON.stringify(param['survey_data']));
      this.appservice.saveSurvey(formData).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.toaster.toast('success', 'Success', respData['message'] || 'Survey Data Uploaded Successfully.');
          param.selectedFile = null;
          param['fileSelectedToUpload'] = null;
          this.loadTable();
          this.closeModal();
          if(this.additionalDataUploaded) {
            this.additionalDataUploaded = false;
            this.existingSurveyId = respData?.data
            this.saveModal(this.additionalFile);
          }
          this.loader.save = false;
        } else {
          this.loader.save = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving the data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.save = false;
        this.toaster.toast('error', 'Error', 'Error while saving the data.');

      });
    } catch (err) {
      console.error(err);
      this.loader.save = false;
    }
  }

  /**
   * for closing the model
   */
  closeModal() {
    try {
      const ele: any = document.getElementById('closeModel');
      if (ele) {
        ele.click();
        this.loadTable();
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * preview of uploaded file
   */
  previewData() {
    try {
      this.loader.data = true;
      const survey_details = {
        table_data: this.surveyDetails['tableData']['rowData'],
        format_options: this.surveyDetails['formatOptions'],
      }
      const formData = new FormData();
      formData.append('file_data', this.surveyDetails['selectedFile'] || '');
      formData.append('survey_sheet_name', this.surveyDetails['survey_sheet_name']);
      formData.append('survey_template', this.surveyDetails['survey_template']);
      formData.append('survey_data', JSON.stringify(survey_details || {}));
      formData.append('chainage_milestone', JSON.stringify(this.chainage_milestone || {}));
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.appservice.previewSurveyData(formData).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.previewTableData = respData.data?.table_data
          this.tableHeight = 'calc(100vh - 275px);';
          this.isPreview = true;
          this.loader.data = false;
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while previewing the data.');
          this.loader.data = false;
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while previewing the data.');
        this.loader.data = false;

      });
    } catch (previewerr) {
      console.error(previewerr);
      this.loader.data = false;
    }
  }

  /**
   * for making the form pristine
   * @param formGroup for survey form
   */
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
