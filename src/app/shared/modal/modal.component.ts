import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../guards/auth.service';
import { AppService } from '../../services/app.service';
import { HttpLayerService } from '../../services/http-layer.service';
import { HttpRequestInterceptor } from '../../services/http-interceptor';
import { UtilityFunctions } from '../../utilities/utility-func';
import { ModalService } from './modal.service';
import { ToasterService } from '../toastr/toaster.service';
import { Config } from '../../config/config';


@Component({
  selector: 'ucp-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  private modalSubscription: Subscription;
  public passwordVal: any = null;
  public authToken: any = '';
  public metaData: any = {
    flag: true,
    timeoutSec: 20,
    username: null,
    timeOut: null,
  };
  public userDetails = {};
  public loginComponentRef: any;
  public showOTP: any = false;
  public showlogin: any = true;

  constructor(
    public modalService: ModalService,
    private router: Router,
    private appservice: AppService,
    public _toast: ToasterService,
    private _auth: AuthService,
    public _utility: UtilityFunctions,
    private httpLayerService: HttpRequestInterceptor,
  ) { }

  ngOnInit() {
    this.httpLayerService['serviceParams']['serviceCounter'] = 0;
    this.httpLayerService['serviceParams'] = { ...this.httpLayerService['serviceParams'] };
    this.modalSubscription = this.modalService.modalSubj.subscribe((res) => {
      if (res === 'open') {
        const modalId = document.getElementById('modalDemoButton');
        const userDet = this._auth.getUserDetails();
        if (userDet?.username) {
          this.metaData['username'] = userDet['username'];
          modalId.click();
          this.metaData['flag'] = true;
          this.metaData['timeoutSec'] = Config.CONSTANTS.timeoutSec;
          this.setInstantTime();
        } else {
          this.navigateToLoginPage();
        }
      }
    });
  }
  setInstantTime() {
    try {
      if (this.metaData['flag']) {
        this.metaData['timeoutSec']--;
        if (this.metaData['timeoutSec']) {
          setTimeout(() => {
            this.setInstantTime();
          }, 1000);
        } else {
          this.navigateToLoginPage();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  navigateToLoginPage() {
    try {
      this.metaData['flag'] = false;
      clearTimeout(this.metaData['timeOut']);
      localStorage.removeItem('user_details');
      this.httpLayerService['serviceParams']['serviceCounter'] = 0;
      this.httpLayerService['serviceParams'] = { ...this.httpLayerService['serviceParams'] };
      document.getElementById('closeLoginPopupModal').click();
      this._auth.clearParent();
      this.router.navigate(['login']);
    } catch (loginErr) {
      console.error(loginErr);
    }
  }

  loginToPrevPage() {
    try {
      const input = {};
      const userDetails = this._auth.getUserDetails();
      input['user_name'] = userDetails['username'];
      input['password'] = this._utility.encryptPasswordWithUsername(this.passwordVal, input['user_name'], this.authToken);
      this.appservice.loginUser(input).subscribe((response) => {
        if (response.status === 'success') {
          this.httpLayerService.serviceParams['serviceCounter'] = 0;
          // clearTimeout(this.metaData['timeOut']);
          // this._auth.storeUserDetails(response.data);
          document.getElementById('closeLoginPopupModal').click();
          this.httpLayerService['serviceParams']['serviceCounter'] = 0;
          this.httpLayerService['serviceParams'] = { ...this.httpLayerService['serviceParams'] };
          this.passwordVal = null;
          // this.loginComponentRef.getBaseProject();
          this.modalService.modalSubj.next('close');
        } else {
          this._toast.toast('error', 'Error', response['message'] || 'Error while Logging in.', true);
        }
      }, (error) => {
        // this._toast.toast('error', 'Error', 'Error while Loging in.', true);
      });
    } catch (prevErr) {
      console.error(prevErr);
    }
  }

  getToken() {
    try {
      this.metaData['flag'] = false;
      clearTimeout(this.metaData['timeOut']);
      this.appservice.getTokenInfo().subscribe((response) => {
        if (response.status === 'success') {
          this.authToken = response.unique_key;
          this.loginToPrevPage();
        } else {
          this._toast.toast('error', 'Error', 'Unable to login. Please try again.', true);
        }
      }, (error) => { });
    } catch (e) {
      console.log(e);
    }
  }

  ngOnDestroy() {
    this.modalSubscription.unsubscribe();
  }

}
