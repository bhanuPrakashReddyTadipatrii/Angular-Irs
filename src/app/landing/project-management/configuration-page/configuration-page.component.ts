import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../guards/auth.service';
import { UtilityFunctions } from '../../../utilities/utility-func';
import { Config } from '../../../config/config';

@Component({
  selector: 'ucp-configuration-page',
  templateUrl: './configuration-page.component.html',
  styleUrls: ['./configuration-page.component.scss']
})
export class ConfigurationPageComponent implements OnInit {
  public tabs: any = [
    {
      label: 'About The Project',
      value: 'about_the_project',
    },
    {
      label: 'Setup User',
      value: 'setup_user',
    },
    {
      label: 'Import Data',
      value: 'import_data',
    }
  ];
  public selectedTab: any = null;
  public accordionView: any = [];
  public activeTab: any = 'users';
  public mappingPerm: any = {
    setup_user: ['users','user_roles','user_groups'],
    import_data: ['units','parameters','survey_templates', 'surveys']
  }


  constructor(private router: Router, private _auth: AuthService, private _util: UtilityFunctions) {
    for (let eachKey in this.mappingPerm) {
      let tabPerm: any = false;
      for (let eachSec of this.mappingPerm[eachKey]) {
        const permission = this._auth.getUserPermissions(eachSec);
        tabPerm = tabPerm || permission?.view;
      }
      if (!tabPerm) {
        const tabInd = this.tabs.findIndex((ele: any) => ele.value === eachKey);
        if (tabInd > -1) {
          this.tabs.splice(tabInd, 1);
        }
      }
    }
   }

  ngOnInit(): void {
    this.switchTabs(this.tabs[0]);
  }

  switchTabs(tab: any) {
    this.selectedTab  = tab?.value;
    if(this.selectedTab === 'setup_user' || this.selectedTab === 'import_data') {
      this.accordionView = JSON.parse(JSON.stringify(Config.PROJECTCONSTANTS?.[this.selectedTab])) || [];
      for (let eachItem of this.mappingPerm?.[this.selectedTab ]) {
        const permission = this._auth.getUserPermissions(eachItem);
        if (!permission['view']) {
          const ind = this.accordionView.findIndex((ele) => ele.key === eachItem);
          if (ind > -1) {
            this.accordionView.splice(ind, 1);
          }
        }
      }
    }
  }

  changeactiveTab(activeAccTab: any) {
    if (this.activeTab === activeAccTab.value) {
      this.activeTab = null;
      return;
    }
    this.activeTab = activeAccTab.value;
  }
}
