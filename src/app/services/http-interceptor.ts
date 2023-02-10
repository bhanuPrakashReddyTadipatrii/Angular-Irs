import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { EncDecData } from '../utilities/enc.dec';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ModalService } from '../shared/modal/modal.service';
import { ToasterService } from '../shared/toastr/toaster.service';
// the following class intercepts an http request, before sending the request and after getting the response
@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  public ssoLoginSubject = new Subject();
  public serviceParams: any = {
    serviceCounter: 0,
    route: null,
  };
  public refreshTokenInProgress = false;
  public tokenRefreshedSource = new Subject();
  public tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  constructor(
    private _utility: EncDecData,
    private sessionResetModal: ModalService,
    private _router: Router,
    private toaster: ToasterService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(map((event: HttpEvent<any>) => {
      if (environment.encryptionEnabled) {
        // encrypting the request body before sending it
        if (req.method !== 'GET') {
          // tslint:disable-next-line:no-parameter-reassignment
          req = req.clone({ body: this._utility.encrypt(req.body) });
        }
      }
      if (event instanceof HttpResponse) { // checking whether the http event is a response event
        this.serviceParams['serviceCounter'] = 0;
        if (typeof (event.body) === 'string') {
          if (environment.encryptionEnabled) {
            // decrypting the response
            // tslint:disable-next-line:no-parameter-reassignment
            event = event.clone({ body: JSON.parse(this._utility.decrypt(event.body)) });
          }
        }
      }
      return event;
    }))
      .pipe(catchError((error) => {
        if (error.status === 401) {
          this.serviceParams['route'] = window.location.href.split('/p/')[1];
          localStorage.setItem('prevURL', '/p/' + this.serviceParams['route']);
          if (this._router.url.includes('login')) {
            return throwError(error);
          }
          this.sessionResetModal.openModal();
          return this.refreshToken(error)
            .pipe(switchMap(() => {
              return next.handle(req);
            }))
            .pipe(catchError((err) => {
              return throwError(err);
            }));
        }
        return throwError(error);
      }));
  }

  refreshToken(err) {
    if (this.refreshTokenInProgress && err.hasOwnProperty('url') && err.url.indexOf('login') === -1) {
      return new Observable((observer: any) => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    }
    this.refreshTokenInProgress = true;
    return this.showLoginModal(err)
      .pipe(tap(() => {
        this.refreshTokenInProgress = false;
        this.tokenRefreshedSource.next('');
      }));
  }

  showLoginModal(err) {
    return new Observable<any>((observer) => {
      this.sessionResetModal.modalSubj.subscribe((result: any) => {
        observer.next(result);
      });
    });
  }

  clearSession = () => {
    try {
      localStorage.removeItem('user_details');
      localStorage.removeItem('project_details');
      localStorage.removeItem('droppedItems');
      localStorage.removeItem('appConfig');
      localStorage.removeItem('user_type');
    } catch (sessionError) {
      console.error(sessionError);
    }
  }

}
