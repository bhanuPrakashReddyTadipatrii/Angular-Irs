import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { UserTablesComponent } from './user-tables/user-tables.component';
import { ConfigUserComponent } from './config-user/config-user.component';
import { ConfigUserRoleComponent } from './config-user-role/config-user-role.component';
import { ConfigUserAccessGroupComponent } from './config-user-access-group/config-user-access-group.component';
import { SharedModule } from '../../../../app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GlobalSliderModule } from './../../../utilities/global-slider/global-slider.module'
import { NgSelectModule } from '@ng-select/ng-select';
import { NoWhiteSpaceValidatorModule } from '../../../utilities/no-white-space-validator/no-white-space-validator.module';


@NgModule({
  declarations: [
    UserManagementComponent,
    UserTablesComponent,
    ConfigUserComponent,
    ConfigUserRoleComponent,
    ConfigUserAccessGroupComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    SharedModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    GlobalSliderModule,
    NgSelectModule,
    NoWhiteSpaceValidatorModule,
  ], 
  exports: [UserTablesComponent]
})
export class UserManagementModule { }
