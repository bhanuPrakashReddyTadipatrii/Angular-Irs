import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalSliderDirective } from './global-slider.directive';

@NgModule({
  declarations: [GlobalSliderDirective],
  imports: [
    CommonModule,
  ],
  exports: [
    GlobalSliderDirective,
  ],
})
export class GlobalSliderModule { }
