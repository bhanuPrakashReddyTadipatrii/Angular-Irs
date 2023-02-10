import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigProjectComponent } from './config-project/config-project.component';
import { ConfigurationPageComponent } from './configuration-page/configuration-page.component';
import { ProjectManagementComponent } from './project-management.component';
import { ProjectsComponent } from './projects/projects.component';

const routes: Routes = [
  {
    path: '', component: ProjectManagementComponent, children: [
      { path: '', redirectTo: 'configuration', pathMatch: 'full' },
      { path: 'configuration', component: ConfigurationPageComponent },
      { path: 'list', component: ProjectsComponent },
      { path: 'config-project/:mode', component: ConfigProjectComponent },
      { path: 'config-project/:mode/:id', component: ConfigProjectComponent }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectManagementRoutingModule { }
