import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PopupState } from './common-popup-state';

@Injectable({
  providedIn: 'root',
})
export class CommonPopupService {

  private loaderSubject = new Subject<PopupState>();
  public loaderState = this.loaderSubject.asObservable();

  constructor() { }

  triggerPopup(Type: string, Title: string, Body: string, Show: boolean, Action?: string, Data?: any) {
    try {
      // if (this.loaderSubject['observers'].length) {
        // console.log('non empty observers');
      // } else {
        // console.log('empty observers');
      // }
      this.loaderSubject.next(<PopupState>{
        type: Type,
        title: Title,
        body: Body,
        show: Show,
        action: Action,
        data: Data,
      });
    } catch (error) {
      console.error(error);
    }
  }

  confirmDelete(Confirmation: string, Action?: string, Data?: any) {
    try {
      if (Confirmation) {
        this.loaderSubject.next(<any>{
          confirmation: Confirmation,
          action: Action,
          data: Data,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
