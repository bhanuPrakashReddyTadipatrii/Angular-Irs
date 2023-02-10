import { Component, OnInit, ViewChild, OnDestroy, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { PopupState } from './common-popup-state';
import { CommonPopupService } from './common-popup.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ucp-common-popup',
  templateUrl: './common-popup.component.html',
  styleUrls: ['./common-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CommonPopupComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public modalContent: any = {
    type: '',
    title: '',
    body: '',
    show: false,
    action: '',
    data: '',
  };
  @ViewChild('content') content: any;
  @Output() deleteItem: EventEmitter<any>;
  public destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public commonPopupService: CommonPopupService) { }

  ngOnInit() {
    this.subscription = this.commonPopupService.loaderState.pipe(takeUntil(this.destroy$)).subscribe((popupState: PopupState) => {
      this.modalContent.type = popupState.type;
      this.modalContent.title = popupState.title;
      this.modalContent.body = popupState.body;
      this.modalContent.action = popupState.action;
      this.modalContent.show = true;
      this.modalContent.data = popupState.data;
      this.modalContent = { ...this.modalContent };
      document.getElementById('openModal')?.click();
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  delete_item(modal: any, confirmation?: any) {
    try {
      if (modal) {
        // modal.close();
        document.getElementById('closeCommonPopup')?.click();
      }
      this.commonPopupService.confirmDelete(confirmation, this.modalContent.action, this.modalContent.data);
    } catch (error) {
      console.error(error);
    }
  }
}
