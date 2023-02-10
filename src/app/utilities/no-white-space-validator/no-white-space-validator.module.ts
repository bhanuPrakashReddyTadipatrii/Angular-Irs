import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhiteSpaceValidatorDirective } from './white-space-validator.directive';

@NgModule({
  declarations: [WhiteSpaceValidatorDirective],
  imports: [
    CommonModule,
  ],
  exports: [
    WhiteSpaceValidatorDirective,
  ],
})
export class NoWhiteSpaceValidatorModule { }
