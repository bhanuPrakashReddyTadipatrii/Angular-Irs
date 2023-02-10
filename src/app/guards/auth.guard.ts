import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  public snapShot: any;
  public userDetails: any = {};
  constructor(private _auth: AuthService, private _router: Router) {
    this.userDetails = this._auth.getUserDetails();
  }
  
  canActivate( route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      return true;
      if (localStorage.getItem('user_details')) {
        // if (state.url.includes('/login')){
        //   return false;
        // }
        if (this._auth.restrictRoute(route?.data['page'])) {
          return true;
        } else {
          this._router.navigate(['empty-state/401']);
          return false;
        }
      } 
      if (!localStorage.getItem('user_details') && (state.url.includes('/login'))) {
        if (this._auth.restrictRoute(route?.data['page'])) {
          return true;
        } else {
          this._router.navigate(['empty-state/401']);
          return false;
        }
      }
      this._router.navigate(['login']);
      return false;
  }

}