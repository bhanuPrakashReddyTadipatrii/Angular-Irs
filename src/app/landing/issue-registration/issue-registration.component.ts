import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'ucp-issue-registration',
  templateUrl: './issue-registration.component.html',
  styleUrls: ['./issue-registration.component.scss']
})
export class IssueRegistrationComponent implements OnInit {

  public dfmData: any = {
    headerContent: [
      {
        "content": "New Section",
        "data": [
          {
            "disabled": false,
            "gridWidth": "12",
            "key": "issue_title",
            "label": "Issue Title",
            "placeholder": "Enter Issue Title",
            "required": true,
            "type": "text",
            "value": "",
            "patternValidator": true
          },
          {
            "disabled": false,
            "gridWidth": "12",
            "key": "issue_description",
            "label": "Description",
            "placeholder": "Description",
            "required": true,
            "type": "textarea",
            "rows": 5,
            "value": ""
          },
          {
            "disabled": true,
            "gridWidth": "12",
            "key": "issue_url",
            "label": "Image / Video",
            "required": false,
            "type": "file",
            "value": ""
          }
        ],
        "layoutType": "section",
        "sectionTitle": "",
        "sectionWidth": "12"
      }
    ],
    bodyContent: {},
    userActions: {
      "cancel": {
        "label": "Cancel"
      },
      "save": {
        "label": "Submit"
      },
      "addOptionalFields": {
        "enableAdd": false,
        "modalInfo": {
          "config": "Issue Registration",
          "modalTitle": "Registration"
        }
      }
    },
  };
  issueRegUpload = {};
  uploadedFileList: any;




  constructor(public appService: AppService) { }

  ngOnInit(): void {
  }

  onProtocolConfigChanges(event: any) {
    try {
      if (event && event.field) {
        this.onFileUpload(event.event, event.field && event.fileTypes && event.fileTypes.length ? event.fileTypes : ['.eas', '.EAS']);
      }
    } catch (error) {
      console.error(error);
    }
  }


  onFileUpload(event: any, validExts: any) {
    try {
      this.issueRegUpload = {};
      this.issueRegUpload['isValid'] = false;
      const size = event.target.files[0].size / 1024 / 1024;
      if (size > 5) {
        this.issueRegUpload['isValid'] = false;
        // this._toastLoad.toast('error', 'Maximium file size', 'Cannot upload files more than 5 MB.', true);
        return;
      }
      if (event.target['value']) {
        const fileList: FileList = event.target.files;
        let fileExt = JSON.parse(JSON.stringify(event.target['value']));
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
        const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (fileList.length > 0) {
          const file: File = fileList[0];
          if (validExts.indexOf(fileExt) > -1) {
            this.issueRegUpload['selectedFile'] = event.target.files[0];
            this.issueRegUpload['fileSelectedToUpload'] = event.target['value'].split('\\').pop();
            this.issueRegUpload['fileNameBlock'] = this.issueRegUpload['fileSelectedToUpload'];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            const current = this;
            current.issueRegUpload['isValid'] = true;
            reader.onload = function () {
              current.issueRegUpload['csvUploadFile'] = reader.result;
              const formData = new FormData();
              formData.append('file', current.issueRegUpload['selectedFile']);
              console.log('formData :', formData);
              current.parseUploadedFile(formData);
            };
            reader.onerror = function (error) {
              console.error('Error: ', error);
            };
          } else {
            this.issueRegUpload['isValid'] = false;
            // this._toastLoad.toast('error', 'File type', 'Cannot upload files other than specified.', true);
          }
        } else {
          this.issueRegUpload['isValid'] = false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }


  parseUploadedFile(payload: any) {
    try {
      this.appService.parseUploadedFile(payload).subscribe((resp: any) => {
        if (resp && resp['status'] === 'success') {
          this.uploadedFileList = { list: resp['data'], type: 'plcTags' };
        } else {
          // this._toastLoad.toast('error', 'Error', resp['message'] || 'Error while uploading file.', true);
        }
      }, (error) => {
        console.error(error);
        // this._toastLoad.toast('error', 'Error', 'Error while uploading file.', true);
      });
    } catch (error) {
      console.error(error);
    }
  }


}
