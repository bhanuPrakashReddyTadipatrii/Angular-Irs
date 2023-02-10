import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectManagementRoutingModule } from './project-management-routing.module';
import { ProjectManagementComponent } from './project-management.component';
import { ProjectsComponent } from './projects/projects.component';
import { ConfigProjectComponent } from './config-project/config-project.component';
import { SharedModule } from '../../../app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ConfigurationPageComponent } from './configuration-page/configuration-page.component';
import { UserManagementModule } from '../settings/user-management/user-management.module';
import { GlobalSliderModule } from '../../utilities/global-slider/global-slider.module';
import { ParametersComponent } from './parameters/parameters.component';
import { SurveyTemplateComponent } from './survey-template/survey-template.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SurveysComponent } from './surveys/surveys.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { MomentDateTimeAdapter } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time-adapter.class';
import { UnitsComponent } from './units/units.component';
import { NoWhiteSpaceValidatorModule } from '../../utilities/no-white-space-validator/no-white-space-validator.module';

@NgModule({
  declarations: [
    ProjectManagementComponent,
    ProjectsComponent,
    ConfigProjectComponent,
    ConfigurationPageComponent,
    ParametersComponent,
    SurveyTemplateComponent,
    SurveysComponent,
    UnitsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ProjectManagementRoutingModule,
    NgSelectModule, 
    UserManagementModule,
    GlobalSliderModule,
    FormsModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NoWhiteSpaceValidatorModule,
  ],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: {
        fullPickerInput: 'D MMM, YYYY, HH:mm',
        parseInput: 'D MMM, YYYY, HH:mm',
        datePickerInput: 'D MMM YYYY',
        timePickerInput: 'LT',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
      }
    },
  ],
})
export class ProjectManagementModule { }
