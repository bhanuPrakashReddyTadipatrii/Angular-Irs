import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { Config } from '../../config/config';

@Component({
  selector: 'ucp-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  public message: any;
  subject: Subject<boolean>;
  constructor(public bsModalRef: BsModalRef) { 
    this.message = Config?.ALERT_MESSAGES?.['CONFIRM_ALART_MESSAGE']
  }

  ngOnInit() {
  }
  action(value: boolean) {
    this.bsModalRef.hide();
    this.subject.next(value);
    this.subject.complete();
  }
}
