import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthService } from '../guards/auth.service';
import { ConfirmModalComponent} from '../shared/confirm-modal/confirm-modal.component'

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}


@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  constructor ( private modalService: BsModalService, private _auth: AuthService) {
  }
  canDeactivate(component: CanComponentDeactivate) {
    const user = this._auth.getUserDetails();
    if (component.canDeactivate() || !user) {
      return true;
    // tslint:disable-next-line:no-else-after-return
    } else {
      const subject = new Subject<boolean>();
      const modal = this.modalService.show(ConfirmModalComponent, {
        class: 'modal-dialog-centered',
      });
      modal.content.subject = subject;
      return subject.asObservable();
    }
  }
}
