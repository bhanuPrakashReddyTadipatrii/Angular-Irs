import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../../services/app.service';
import { ToasterService } from '../../../../shared/toastr/toaster.service';

@Component({
  selector: 'ucp-config-user-access-group',
  templateUrl: './config-user-access-group.component.html',
  styleUrls: ['./config-user-access-group.component.scss']
})
export class ConfigUserAccessGroupComponent implements OnInit, OnChanges {

  @Input() pageconf: any = {
    id: null,
    type: null,
    data: null,
  };
  @Output() userGroupEmitter = new EventEmitter();
  public userAccessForm: FormGroup = new FormGroup({
    access_group: new FormControl({ value: null, disabled: false}, [Validators.required]),
    description: new FormControl({ value: null, disabled: false}, [Validators.required]),
  });
  public userAccessData: any = {
    access_group: null,
    description: null,
  };
  public loader: any = {
    saveAccess: false,
  };
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  constructor(private appservice: AppService, private toaster: ToasterService) {  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pageconf']) {
      if (this.pageconf?.data) {
        this.userAccessData['access_group'] = this.pageconf?.data?.access_group;
        this.userAccessData['description'] = this.pageconf?.data?.description;
      }
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    try {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsDirty({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.validateAllFormFields(control);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  get f() {
    return this.userAccessForm.controls;
  }

  saveUserGroup() {
    try {
      if (this.userAccessForm.invalid) {
        this.validateAllFormFields(this.userAccessForm);
        this.toaster.toast('warning', 'Warning', 'Please fill all the required fields', true);
        return;
      }
      const savePayload: any = this.userAccessData;
      if (this.pageconf?.id) {
        savePayload['access_group_id'] = this.pageconf['id'];
      }
      this.loader.saveAccess = true;
      this.appservice.saveUserGroup(savePayload).pipe(takeUntil(this.destroy$)).subscribe((respData: any) => {
        if (respData && respData['status'] === 'success') {
          this.loader.saveAccess = false;
          this.toaster.toast('success', 'Success', respData['message'] || 'User access group saved successfully.');
          this.emitData('save');
        } else {
          this.loader.saveAccess = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving user access group.');
        }
      }, (error) => {
        this.loader.saveAccess = false;
        this.toaster.toast('error', 'Error', 'Error while saving user access group.');
        console.error(error);
      });
    } catch (groupErr) {
      this.loader.saveAccess = false;
      console.error(groupErr);
    }
  }

  cancelUserGroup() {
    try {
      this.emitData('cancel');
    } catch (cancelUserErr) {
      console.error(cancelUserErr);
    }
  }

  emitData(key, data?) {
    const emitJson: any = {
      page: 'user-access-groups',
      type: key,
    }
    if (data) {
      emitJson['data'] = data;
    }
    this.userGroupEmitter.emit(emitJson);
  }

}
