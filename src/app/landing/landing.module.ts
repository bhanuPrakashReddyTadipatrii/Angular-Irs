import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardsViewPageComponent } from './cards-view-page/cards-view-page.component';

@NgModule({
  declarations: [
    LandingComponent,
    DashboardComponent,
    CardsViewPageComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule,
    SharedModule,
  ],
  exports: [
    LandingComponent,
  ]
})
export class LandingModule { }
