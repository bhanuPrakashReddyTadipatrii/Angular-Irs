import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EmptyStatePagesComponent } from './empty-state-pages/empty-state-pages.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '', component: AppComponent, children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login', component: LoginComponent, canActivate: [AuthGuard]
      },
      {
        path: 'app',
        loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule)
      },
      { 
        path: 'empty-state/:type', component: EmptyStatePagesComponent 
      },
      { 
        path: '**', redirectTo: 'empty-state/404', pathMatch: 'full' 
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
