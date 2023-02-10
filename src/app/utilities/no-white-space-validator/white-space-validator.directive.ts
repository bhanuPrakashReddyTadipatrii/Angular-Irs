// tslint:disable:directive-selector quotemark prefer-template

import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ucpWhiteSpaceRestrictor]',
})
export class WhiteSpaceValidatorDirective {

  get ctrl() {
    return this.ngControl.control;
  }
  public notAllowedChars = ['`', '~', "'", '"', '!', '{', '}', ']', '>', '<', "/"];

  constructor(
    private ngControl: NgControl,
  ) { }
  @HostListener('focusout')
  onFocusOut(value: any) {
    if (typeof this.ctrl?.value === 'string') {
      this.ctrl.setValue((this.ctrl.value || '').trim());
    }
    // else if (typeof this.ctrl.value === 'object') {}
  }

  // @HostListener('keyup')
  // @HostListener('keydown') validateString() {
  //   if (typeof this.ctrl.value === 'string') {
  //     let value = this.ctrl.value || '';
  //     for (const eachChar of this.notAllowedChars) {
  //       if (value.includes(eachChar)) {
  //         const rejex = new RegExp(eachChar, 'gi');
  //         value = value.replace(rejex, '');
  //       }
  //     }
  //     this.ctrl.setValue(value);
  //   }
  // }
}
