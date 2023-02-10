import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { AgGridTableComponent } from './ag-grid-table/ag-grid-table.component';
import { AgGridModule } from '@ag-grid-community/angular';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { InfiniteRowModelModule } from '@ag-grid-community/infinite-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { WizardComponent } from './wizard/wizard.component';
import { ToasterService } from './toastr/toaster.service';
import { TreeModule } from '@circlon/angular-tree-component';
import { DfmComponent } from './dfm/dfm.component';
import { GenericTabsComponent } from './generic-tabs/generic-tabs.component';
import { CommonPopupComponent } from './common-popup/common-popup.component';
import { NgSelectModule } from '@ng-select/ng-select';
// import { TagInputModule } from 'ngx-chips';
import { OwlDateTimeModule, OwlNativeDateTimeModule, DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapsComponent } from './maps/maps.component';
import { ResizableModule } from 'angular-resizable-element';
import { BtnCellRendererComponent } from './btn-cell-renderer/btn-cell-renderer.component';
import { CommonPopupService } from './common-popup/common-popup.service';
import { ModalComponent } from './modal/modal.component';
import { SelectRendererComponent } from './select-renderer/select-renderer.component';
import { SwitchInputBtnCellRendererComponent } from './switch-input-btn-cell-renderer/switch-input-btn-cell-renderer.component';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HashDirective } from './hash.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MultiRangeSliderComponent } from './multi-range-slider/multi-range-slider.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { GlobalSliderModule } from '../utilities/global-slider/global-slider.module';
import { NoWhiteSpaceValidatorModule } from '../utilities/no-white-space-validator/no-white-space-validator.module';
import { WorkspaceComponent } from './workspace/workspace.component';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { VisualChartsComponent } from './visual-charts/visual-charts.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FiltersComponent } from './filters/filters.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
@NgModule({
  declarations: [
    HeaderComponent,
    AgGridTableComponent,
    WizardComponent,
    CommonPopupComponent,
    DfmComponent,
    GenericTabsComponent,
    MapsComponent,
    BtnCellRendererComponent,
    ModalComponent,
    SelectRendererComponent,
    SwitchInputBtnCellRendererComponent,
    HashDirective,
    MultiRangeSliderComponent,
    WorkspaceComponent,
    VisualChartsComponent,
    FiltersComponent,
    ConfirmModalComponent
  ],
  imports: [
    InfiniteScrollModule,
    NgxSliderModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule, 
    GlobalSliderModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
    TreeModule,
    NgSelectModule,
    // TagInputModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ResizableModule,
    AgGridModule,
    // NgbModule,
    NoWhiteSpaceValidatorModule,
    NgxEchartsModule.forRoot({
      echarts,
    })
  ],
  exports: [
    HeaderComponent,
    AgGridTableComponent,
    WizardComponent,
    CommonPopupComponent,
    DfmComponent,
    GenericTabsComponent,
    MapsComponent,
    ModalComponent,
    WorkspaceComponent,
    FiltersComponent, 
    VisualChartsComponent,
  ],
  providers: [ToastrService, ToasterService, CommonPopupService,
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: {
        fullPickerInput: 'D MMM, YYYY, HH:mm',
        parseInput: 'D MMM, YYYY, HH:mm',
        datePickerInput: 'D MMM, YYYY',
        timePickerInput: 'LT',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      }
    },
  ],
})
export class SharedModule {
  constructor() {
    const modules = [
      MasterDetailModule,
      MenuModule,
      RowGroupingModule,
      StatusBarModule,
      SetFilterModule,
      RangeSelectionModule,
      ColumnsToolPanelModule,
      ExcelExportModule,
      FiltersToolPanelModule,
      ClipboardModule,
      GridChartsModule,
      ClientSideRowModelModule,
      InfiniteRowModelModule,
      CsvExportModule,
    ];
    ModuleRegistry.registerModules(modules);
  }
}
