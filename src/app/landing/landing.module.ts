import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardsViewPageComponent } from './cards-view-page/cards-view-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { IssueRegistrationComponent } from './issue-registration/issue-registration.component';

@NgModule({
  declarations: [
    LandingComponent,
    DashboardComponent,
    CardsViewPageComponent,
    IssueRegistrationComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    FontAwesomeModule,
    SharedModule,
    FormsModule,
  ],
  exports: [
    LandingComponent,
  ]
})
export class LandingModule { }
