import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { CompareComponent } from './compare/compare.component';
import { MainDashboardComponent } from './main-dashboard.component';
import { SimulateComponent } from './simulate/simulate.component';
import { VisualizeComponent } from './visualize/visualize.component';
import { CanDeactivateGuard } from '../../services/can-deactivate-guard.service';

const routes: Routes = [
  {
    path: '', component: MainDashboardComponent, children: [
      { path: '', redirectTo: 'visualize', pathMatch: 'full' },
      { path: 'simulate', component: SimulateComponent, data: {page: 'simulate'}, canActivate: [AuthGuard] },
      { path: 'visualize', component: VisualizeComponent, data: {page: 'visualize'}, canActivate: [AuthGuard] },
      { path: 'compare', component: CompareComponent, data: {page: 'compare'}, canActivate: [AuthGuard], canDeactivate: [CanDeactivateGuard] },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainDashboardRoutingModule { }
