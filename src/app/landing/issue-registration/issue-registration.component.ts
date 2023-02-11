import { ToasterService } from './../../shared/toastr/toaster.service';
import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

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
            "key": "name",
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
            "key": "description",
            "label": "Description",
            "placeholder": "Description",
            "required": true,
            "type": "textarea",
            "rows": 5,
            "value": ""
          },
          {
            "disabled": false,
            "gridWidth": "12",
            "key": "category",
            "label": "Category",
            "placeholder": "Category",
            "required": true,
            "type": "select",
            "options": [
              {
                "value": "air pollution",
                "label": "Air Pollution"
              },
              {
                "value": "electricity",
                "label": "Electricity"
              },
              {
                "value": "fire accident",
                "label": "Fire Transport"
              },
              {
                "value": "garbage",
                "label": "Garbage"
              },
              {
                "value": "potholes",
                "label": "Potholes"
              },
              {
                "value": "public_transport",
                "label": "Public Transport"
              },
              {
                "value": "road accident",
                "label": "Road Transport"
              },
              {
                "value": "sewage",
                "label": "Sewage"
              },
              {
                "value": "water",
                "label": "Water"
              },
              {
                "value": "others",
                "label": "Others"
              }
            ],
            "value": ""
          },
          {
            "disabled": true,
            "gridWidth": "12",
            "key": "issue_url",
            "label": "Image / Video",
            "required": true,
            "type": "file",
            "value": "",
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
  imgContent: any = [];
  imageChangedEvent: any;
  uploadedFileList: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  locationCoords: { lat: string; long: string; };




  constructor(public appService: AppService, public toastLoad: ToasterService, private router: Router,) { }

  ngOnInit(): void {
    navigator.permissions.query({
      name: 'geolocation',
    }).then((result) => {
      if (result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition((loc) => {
          const coOrdinates = {
            lat: loc.coords.latitude.toString(),
            long: loc.coords.longitude.toString(),
          };
          this.locationCoords = coOrdinates;
        });
      }
    });
  }

  onProtocolConfigChanges(event: any) {
    try {
      if (event && event.field) {
        this.onFileUpload(event.event, event.field && event.fileTypes && event.fileTypes.length ? event.fileTypes : ['.img', '.jpeg', '.jpg', '.png', '.mp4']);
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
      if (size > 50) {
        this.issueRegUpload['isValid'] = false;
        this.toastLoad.toast('error', 'Maximium file size', 'Cannot upload files more than 50 MB.', true);
        return;
      }
      if (event.target['value']) {
        const fileList: FileList = event.target.files;
        let fileExt = JSON.parse(JSON.stringify(event.target['value']));
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
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
            };
            reader.onerror = function (error) {
              console.error('Error: ', error);
            };
          } else {
            this.issueRegUpload['isValid'] = false;
            this.toastLoad.toast('error', 'File type', 'Cannot upload files other than specified.', true);
          }
        } else {
          this.issueRegUpload['isValid'] = false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }


  saveData(event) {
    try {
      this.dfmData['bodyContent'] = JSON.parse(JSON.stringify(event));
      const inputJSON = {
        incident_id: '',
        name: event.name,
        description: event.description,
        category: event.category,
        status: 'In Progress',
        posted_on: new Date().getTime(),
        created_on: new Date().getTime(),
        comments: [],
        coOrds: this.locationCoords
      }
      this.appService.registerIssue(inputJSON).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.dfmData['bodyContent']['incident_id'] = res['data'];
          this.saveFile(res);
        } else {
          this.toastLoad.toast('error', 'Error', res['message'], true);
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  saveFile(res) {
    try {
      const formData = new FormData();
      formData.append('file_data', this.issueRegUpload['selectedFile']);
      formData.append('phone_number', localStorage.getItem('phone_number') || '9491262936');
      formData.append('category', this.dfmData['bodyContent']['category']);
      formData.append('incident_id', this.dfmData['bodyContent']['incident_id']);
      formData.append('coOrds', JSON.stringify(this.locationCoords));
      this.appService.uploadFile(formData).pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res && res['status'] === 'success') {
          this.cancel();
        }
      })
    } catch (error) {
      console.error(error);
    }
  }

  cancel() {
    try {
      this.router.navigate(['app/cards-view']);
    } catch (error) {
      console.error(error);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
