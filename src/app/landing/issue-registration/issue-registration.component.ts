import { Component, OnInit } from '@angular/core';

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
      "addOptionalFields": {
        "enableAdd": false,
        "modalInfo": {
          "config": "Issue Registration",
          "modalTitle": "Registration Info"
        }
      }
    },
  };



  constructor() { }

  ngOnInit(): void {
  }

}
