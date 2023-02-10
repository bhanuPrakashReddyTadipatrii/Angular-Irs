import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { MainDashboardComponent } from './main-dashboard.component';
import { VisualizeComponent } from './visualize/visualize.component';
import { SimulateComponent } from './simulate/simulate.component';
import { CompareComponent } from './compare/compare.component';
import { SharedModule } from './../../shared/shared.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResizableModule } from 'angular-resizable-element';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { GridsterModule } from 'angular-gridster2';
import { PipesModule } from '../../utilities/pipes/pipes.module';
import { CanDeactivateGuard } from '../../services/can-deactivate-guard.service';
import { BsModalService } from 'ngx-bootstrap/modal';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    MainDashboardComponent,
    VisualizeComponent,
    SimulateComponent,
    CompareComponent
  ],
  imports: [
    CommonModule,
    MainDashboardRoutingModule,
    SharedModule,
    ScrollingModule,
    DragDropModule,
    ResizableModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({
      echarts,
    }),
    GridsterModule,
    PipesModule,
    // NgbModule
  ],
  providers: [CanDeactivateGuard, BsModalService]
})
export class MainDashboardModule { }
