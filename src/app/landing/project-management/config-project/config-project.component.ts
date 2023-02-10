import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { DfmComponent } from '../../../shared/dfm/dfm.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../guards/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ucp-config-project',
  templateUrl: './config-project.component.html',
  styleUrls: ['./config-project.component.scss']
})
export class ConfigProjectComponent implements OnInit {

  @Input() ID: any;
  public dfmData: any;
  public agGridOptions: any;
  public uploadBtn: any = true;
  public uploadClick: any = false;
  public chainageData: any = {
    table_data: {
      columnDefs: null,
      defaultColDef: null,
      enableActions: null,
      tableActions: null,
      height: null,
      rowData: null
    },
    map_data: null
  };
  public sheetList: any;
  public mapData: any;
  public mapOptions: any = {
    "center": {
      "lat": null,
      "lng": null,
    },
    "zoom": 10,
    "heading": 10,
    "tilt": 47.5,
    "mapTypeId": 'satellite',
    "mapId": null,
    "mapTypeControl": false,
    "streetViewControl": false,
  }
  public loader: any = {
    fetch: false,
    save: false,
    sheetName: false,
  };
  public clickableColumn: any = ['filename'];
  public destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(DfmComponent) DFMReference;
  public projectId: any = '';
  public emitData: any = false;
  public fileUploadMetaData = {
    csvUploadFile: undefined,
    fileSelectedToUpload: null,
    fileNameBlock: 'Choose file',
    isValid: false,
    selectedFile: undefined,
    sheet_name: null,
    file_extension: null
  };
  public pageType: any = '';
  constructor(public router: Router, public toaster: ToasterService, private appservice: AppService, private route: ActivatedRoute, private _auth: AuthService) {
    this.route.params.subscribe((params: any) => {
      if (params && params.mode) {
        if (params.mode === 'new') {
          this.projectId = '';
          this.pageType = 'Add';
        } else if (params.mode === 'edit') {
          this.projectId = params.id ? params.id : '';
          this.pageType = 'Edit';
        }
      }
    });
  }

  ngOnInit(): void {
    if (!this.projectId && !this.pageType) {
      const projectDet: any = this._auth.getProjectDetails();
      this.projectId = projectDet['project_id'];
    }
    this.projectData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ID']) {
      this.projectId = this.ID;
      this.projectData();
    }
  }

  projectData() {
    try {
      this.loader.fetch = true;
      this.appservice.getProjectData().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.dfmData = respData.data;
          this.loader.fetch = false;
          if (this.projectId) {
            this.fetchProjectData();
          }
        } else {
          this.loader.fetch = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.loader.fetch = false;
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (filterErr) {
      this.loader.fetch = false;
      console.error(filterErr);
    }
  }

  fetchProjectData() {
    try {
      this.loader.fetch = true;
      this.appservice.fetchProjectData({ project_id: this.projectId }).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.dfmData.bodyContent = respData?.data ? respData.data || {} : {};
          this.dfmData = { ...this.dfmData };
          this.loader.fetch = false;
        } else {
          this.loader.fetch = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.fetch = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (saveErr) {
      this.loader.fetch = false;
      console.error(saveErr);
    }
  }

  savePage() {
    try {
      this.DFMReference.submitData();
      if (this.DFMReference.formDFM.invalid) {
        return;
      }
      let payload: any = this.DFMReference.Form_filled_data || {};
      this.loader.save = true;
      payload['project_id'] = this.projectId || '';
      this.appservice.saveProjectData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          if (!this.pageType || (respData?.data?.project_id && payload['project_id'] === respData?.data?.project_id)) {
            this.projectId = respData.data.project_id;
            const projectDet: any = {
              project_id: respData.data['project_id'] || '',
              project_name: respData.data.project_name || '',
              logo_url: respData.data.logo_url || '',
              project_type: respData.data['project_type'] || '',
              map_center: respData.data?.map_center || { 
                lat: 24.45, 
                lng: 54.37 
              },
              zoom_level: respData.data?.zoom_level || 5,
            };
            this._auth.storeProjectDetails(projectDet);
          }
          this.loader.save = false;
          if(this.fileUploadMetaData['selectedFile']) {
            this.SaveChainageData(respData.data.project_id);
          }
          this.toaster.toast('success', 'Success', respData['message'] || 'Project saved successfully.');
          if (this.pageType) {
            this.routeTo('app/projects/list');
          } else {
            this.fetchProjectData();
          }
        } else {
          this.loader.save = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.save = false;
        this.toaster.toast('error', 'Error', 'Error while saving data.');
      });
    } catch (saveErr) {
      this.loader.save = false;
      console.error(saveErr);
    }
  }

  SaveChainageData(projectId) {
    try {
      this.loader.save = true;
      const formData = new FormData();
      formData.append('file_data', this.fileUploadMetaData['selectedFile']);
      formData.append('project_id', projectId || '');
      formData.append('filename', this.fileUploadMetaData['fileSelectedToUpload'] || '');
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.appservice.saveChainages(formData).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.loader.save = false;
        } else {
          this.loader.save = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.save = false;
        this.toaster.toast('error', 'Error', 'Error while saving data.');
      });
    } catch (chainagesaveerr) {
      this.loader.save = false;
      console.error(chainagesaveerr);
    }
  }

  routeTo(route) {
    try {
      this.router.navigate([route]);
    } catch (routeErr) {
      console.error(routeErr);
    }
  }

  discardPage() {
    if (this.pageType) {
      this.routeTo('app/projects/list');
    }
  }

  onChangesEmitted(event) {
    try {
      if (event.key === "chainages") {
        if (this.projectId) {
          this.fileUploadMetaData['selectedFile'] = null;
          this.fileUploadMetaData['fileSelectedToUpload'] = null;
          this.getSheetNames();
        }
        document.getElementById('addModalButton').click();
      }
    } catch (error) {
      console.error(error);
    }
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
        const validExts = new Array('.xlsx', '.xls', '.csv');
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
            this.mapData = null;
            const current = this;
            current.fileUploadMetaData['isValid'] = true;
            reader.onload = function () {
              current.fileUploadMetaData['csvUploadFile'] = reader.result;
              current.uploadClick = false;
              if (['.xlsx', '.xls', '.csv'].includes(current.fileUploadMetaData['file_extension'])) {
                current.getSheetNames();
              } else {
                current.fileUploadMetaData['sheet_name'] = null;
              }
            };
            reader.onerror = function (error) {
              console.error('Error: ', error);
            };
            this.uploadBtn = true;
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

  getSheetNames() {
    try {
      const formData = new FormData();
      formData.append('file_data', this.fileUploadMetaData['selectedFile'] || '');
      formData.append('project_id', this.projectId || '');
      formData.append('filename', this.fileUploadMetaData['fileSelectedToUpload'] || '');
      formData.append('tz', Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.fileUploadMetaData['sheet_name'] = null;
      this.mapData = {};
      this.sheetList = {};
      this.loader.sheetNames = true;
      this.appservice.fetchChainageDetails(formData).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.sheetList = res?.data?.table_data || {};
          this.mapData = res?.data?.map_data || {};
          this.mapOptions.mapId = environment?.mapId;
          this.mapOptions.center = res?.data?.map_data?.polylines[0]?.path[0] || {lat: 24.127831666666665, lng: 52.8955};
          this.mapData = { ...this.mapData };
          this.mapOptions = { ...this.mapOptions };
          this.uploadBtn = false
          // this.fileUploadMetaData['sheet_name'] = this.fileUploadMetaData['sheet_name'] ? this.fileUploadMetaData['sheet_name'] : (this.sheetList && this.sheetList.length ? this.sheetList[0].value : '');
          this.loader.sheetNames = false;
        } else {
          this.toaster.toast('error', 'Error', res.message, true);
          this.sheetList = [];
          this.loader.sheetNames = false;
          this.uploadBtn = true;
          this.projectData();
        }
      },(editConfigErr) => {
        this.loader.sheetNames = false;
        console.error(editConfigErr);
        this.uploadBtn = true;
        this.toaster.toast('error', 'Error', 'Error while fetching Chainage data.', true);
       });
    } catch (err) {
      this.loader.sheetNames = false;
      this.uploadBtn = true;
      console.error(err);
    }
  }

  savePopupData() {
    try {
      this.chainageData.table_data['defaultColDef'] = this.sheetList.defaultColDef || {};
      this.chainageData.table_data['columnDefs'] = this.sheetList.columnDefs || {};
      this.chainageData.table_data['enableActions'] = this.sheetList.enableActions || '';
      this.chainageData.table_data['tableActions'] = this.sheetList.tableActions || {};
      this.chainageData.table_data['height'] = this.sheetList.height || '';
      this.chainageData.table_data['rowData'] = this.sheetList.rowData || {};
      this.chainageData.map_data = this.mapData;
      const domEle = document.getElementById('close-modal');
      if (domEle) {
        domEle.click();
      }
    } catch (error) {
      console.error(error);
    }
  }

  discardPopupData() {
    try {
      this.sheetList = {};
      this.mapData = null;
      this.uploadBtn= true;
      const domEle = document.getElementById('close-modal');
      if (domEle) {
        domEle.click();
      }
      this.loader.sheetNames = false;
      this.uploadBtn = true;
    } catch (error) {
      console.error(error);
    }
  }


  aggridEmitter(event: any) {
    try {
      if (event && event?.action?.type) {
        switch (event.action.type) {
          case 'addnew':
            this.toggleDOMELM('fileBlock');
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }
}
