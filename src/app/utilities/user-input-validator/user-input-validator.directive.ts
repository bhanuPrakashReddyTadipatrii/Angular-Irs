// tslint:disable:directive-selector ter-indent deprecation max-line-length prefer-template no-increment-decrement no-consecutive-blank-lines

import { Directive, HostListener, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[klUserInputValidator]',
})
export class UserInputValidatorDirective implements OnInit {

  /**
   * validatorTypes : Types of validators accepted. Those are space, text and password.
   * SPACE : Removes white space before and after the text.
   * Text  : Validates the user input to allow only alphanumeric and . , _ .
   * PASSWORD : Validates the user entered password for the list of test cases provided in the input variable passwordValidator
   */
  @Input() validatorTypes = ['space'];
  @Input() regexType = /^[a-zA-Z0-9\s]+([a-zA-Z0-9)(_ ;:.,!\/$|-])*$/;

  get ctrl() { return this.ngControl.control; }

  @Input() passwordValidator = [
    {
      label: 'One lowecase letter',
      value: 'lowerCase',
      regex: /^(?=.*[a-z])/,
      isPresent: false,
    },
    {
      label: 'One uppercase letter',
      value: 'upperCase',
      regex: /^(?=.*[A-Z])/,
      isPresent: false,
    },
    {
      label: 'One number',
      value: 'number',
      regex: /^(?=.*\d)/,
      isPresent: false,
    },
    {
      label: 'One special character',
      value: 'lowerCase',
      regex: /^(?=.*[!@#$%^&*])/,
      isPresent: false,
    },
    {
      label: '8 characters minimum',
      value: 'eightChars',
      regex: /^.{8,}$/,
      isPresent: false,
    },
  ];

  public randomId = new Date().getTime() + (Math.random() * 1000).toFixed();
  constructor(private ngControl: NgControl, public el: ElementRef, public renderer: Renderer2) { }

  ngOnInit() {
    if (this.regexType && String(this.regexType) === String(/^([a-zA-Z0-9_ -])*$/)) {
      this.regexType = /^[a-zA-Z0-9\s]+([a-zA-Z0-9)(_ ;:.,!\/$|-])*$/;
    }
    this.checkPasswordValidation();
  }


  /**
   * @param event Key board event used to validate user input to accept only alphanumeric characters. Fired when the user presses on any key.
   */

  @HostListener('keypress', ['$event'])
  validateInput(event: any) {
    const e = <KeyboardEvent>event;
    const ch = String.fromCharCode(e.which);
    const value = this.ctrl?.value;

    const splRegex = /[$&+,:;=`~{}?@#|\<>.^*()%_!-/]/;
    if ((!value && splRegex.test(ch)) || (event.target.selectionEnd === 0 && splRegex.test(ch))) {
      this.addErrorMsg(event);
      e.preventDefault();
      return;
    }

    if (this.validatorTypes.indexOf('text') > -1) {
      const regex = this.regexType;
      const fullInput = value + ch;
      if (!regex.test(String(fullInput).toLowerCase())) {
        this.addErrorMsg(event);
        e.preventDefault();
      }
    }
  }

  /**
 * @param event Key board event used to validate user entered password. Fired when the user presses and releases a key.
 */

  addErrorMsg(event: any) {
    if (!event.target.classList.contains('invalid-input')) {
      event.target.classList.add('invalid-input');
    }
    setTimeout(() => { this.removeErrorMsg(event); }, 500);
    const ele = document.getElementById(this.randomId);
    if (!ele) {
      const errSpan = '<span style="color:red;" id="' + this.randomId + '">' + 'Invalid Input </span>';
      event.target.parentElement.insertAdjacentHTML('beforeend', errSpan);
    }
  }

  removeErrorMsg(event: any) {
    if (event.target.classList.contains('invalid-input')) {
      event.target.classList.remove('invalid-input');
      const ele = document.getElementById(this.randomId);
      if (ele) {
        ele.remove();
      }
    }
  }

  @HostListener('keyup', ['$event']) checkPassword() {
    this.checkPasswordValidation();
  }

  @HostListener('paste', ['$event']) onPaste(event: any) {
    if (this.validatorTypes.indexOf('text') === -1) {
      // return;
      const regex = /[$&+,:;=`~{}?@#|\<>.^*()%!-/]/;
      const e = <ClipboardEvent>event;
      const pasteData1 = e?.clipboardData?.getData('text/plain');
      if (pasteData1 && regex?.test(pasteData1) && event.target.selectionEnd === 0) {
        this.addErrorMsg(event);
        e.preventDefault();
      }
    } else {
      const regex = this.regexType || /^[a-zA-Z0-9\s]+([a-zA-Z0-9)(_ ;:.,!\/$|-])*$/;
      const e = <ClipboardEvent>event;
      const pasteData = e?.clipboardData?.getData('text/plain');
      if (pasteData && !regex.test(pasteData)) {
        this.addErrorMsg(event);
        e.preventDefault();
      }
    }
  }

  /**
* @param event Key board event used to trim white space before after the entered text. Fired when the user moves out of the respective field.
*/

  @HostListener('focusout')
  onFocusOut() {
    if (this.validatorTypes.indexOf('space') > -1 && typeof this.ctrl?.value === 'string') {
      this.ctrl.setValue((this.ctrl.value || '').trim());
    }
  }


  /**
   * Method to check password validation.
   */
  checkPasswordValidation() {
    if (this.validatorTypes.indexOf('password') > -1) {
      const passEle = this.el.nativeElement.parentElement.querySelector('.validation-container');
      if (passEle) {
        this.el.nativeElement.parentElement.removeChild(passEle);
      }
      const passwordContainer = document.createElement('div');
      passwordContainer.className = 'validation-container';
      const ul: any = [];
      const ulCount = Math.ceil(this.passwordValidator.length / 3);
      for (let index = 0; index < ulCount; index++) {
        ul['ul_' + index] = document.createElement('ul');
        ul['ul_' + index].className = 'validator-list';
      }
      for (let index = 0; index < this.passwordValidator.length; index++) {
        const eachValidator = this.passwordValidator[index];
        const li = document.createElement('li');
        if (eachValidator.regex.test(this.ctrl?.value)) {
          li.className = 'validator-item is-present';
        } else {
          li.className = 'validator-item';
        }
        li.innerHTML = eachValidator.label;
        const chunkIndex = Math.floor(index / 3);
        this.appendClildEle(ul['ul_' + chunkIndex], li);
      }
      for (let index = 0; index < ulCount; index++) {
        this.appendClildEle(passwordContainer, ul['ul_' + index]);
      }
      this.appendClildEle(this.el.nativeElement.parentElement, passwordContainer);
    }
  }

  /**
   * @param parent Parent DOM element to which the child element is to be appended.
   * @param child Child DOM element to be appended.
   */
  appendClildEle(parent: any, child: any) {
    this.renderer.appendChild(parent, child);
  }
}
