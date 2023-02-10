import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInputValidatorDirective } from './user-input-validator.directive';

@NgModule({
  declarations: [UserInputValidatorDirective],
  imports: [
    CommonModule,
  ],
  exports: [UserInputValidatorDirective],
})
export class UserInputValidatorModule { }
