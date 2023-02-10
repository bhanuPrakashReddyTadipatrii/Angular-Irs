import { CardsViewPageComponent } from './cards-view-page/cards-view-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LandingComponent } from './landing.component';
import { IssueRegistrationComponent } from './issue-registration/issue-registration.component';

const routes: Routes = [
  {
    path: '', component: LandingComponent, children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'cards-view',
        component: CardsViewPageComponent
      },
      {
        path: 'registration',
        component: IssueRegistrationComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
