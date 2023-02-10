import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './guards/auth.service';
import { TreeComponentUtilityFunctions } from './utilities/tree-component-util';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpRequestInterceptor } from './services/http-interceptor';
import { ToasterService } from './shared/toastr/toaster.service';
import { AppService } from './services/app.service';
import { ToastrModule } from 'ngx-toastr';
import { EncDecData } from './utilities/enc.dec';
import { UtilityFunctions } from './utilities/utility-func';
import { LandingModule } from './landing/landing.module';
import { ModalService } from './shared/modal/modal.service';
import { EmptyStatePagesComponent } from './empty-state-pages/empty-state-pages.component';

@NgModule({
  declarations: [
    AppComponent,
    EmptyStatePagesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    LandingModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: true,
      positionClass: 'toast-bottom-right',
      // preventDuplicates: true,
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
    HttpRequestInterceptor, EncDecData,
    AuthGuard, AuthService, TreeComponentUtilityFunctions, AppService, ToasterService, ModalService, UtilityFunctions, DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
