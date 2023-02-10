import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { ToastrState } from './toastr-state';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})

export class ToasterService {
  public toasterSub = new Subject<ToastrState>();

  constructor(private toasterService: ToastrService) { }

  toast(Type: string, Message: string, Title: string, ToastConfig?: any) {
    const trigger: ToastrState = {
      type: Type,
      message: Message, // Message includes Error, Success, Info, Warning
      title: Title,
      toastConfig: ToastConfig ? ToastConfig : true,
    };
    if (trigger?.type && this.isToastTypeExists(trigger.type)) {
      switch (trigger.type) {
        case 'info':
          this.toasterService.info(`<div class="class="toast-bottom-right d-flex"><img  src="assets/images/information-filled-1.svg" class="close-icon ml-1" alt=""><span class="ml-1">${trigger?.title}</span></div>`, '', trigger?.toastConfig && typeof trigger.toastConfig === 'object' ? trigger.toastConfig : {
            enableHtml: true,
        });
          break;
        case 'success':
          this.toasterService.success(`<div class="toast-top-center d-flex" style="padding :0 !important"><img src="assets/images/checkmark--filled (6).svg" alt=""><span class="ml-3">${trigger?.title}</span></div>`, '', trigger?.toastConfig && typeof trigger.toastConfig === 'object' ? trigger.toastConfig : {
            enableHtml: true,
            closeButton: true,
            positionClass: 'toast-top-center'
        });
          break;
        case 'error':
          this.toasterService.error(`<div class="toast-bottom-right d-flex"><img src="assets/images/close-filled.svg" class="close-icon ml-1 mt-1" alt=""><span class="ml-1">${trigger?.title}</span></div>`, '', trigger?.toastConfig && typeof trigger.toastConfig === 'object' ? trigger.toastConfig : {
            enableHtml: true,
        });
          break;
        case 'warning':
          this.toasterService.error(`<div class="toast-bottom-righ p-0 d-flex"><img src="assets/images/warning-alt-filled-3.svg" class="close-icon ml-1 mt-1" alt=""><span class="ml-1">${trigger?.title}</span></div>`, '', trigger?.toastConfig && typeof trigger.toastConfig === 'object' ? trigger.toastConfig : {
            enableHtml: true,
        });
          break;
      }
    }
  }

  isToastTypeExists(type: any) {
    return ['success', 'warning', 'info', 'error'].includes(type);
  }
}
