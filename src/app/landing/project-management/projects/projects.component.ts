import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { Router } from '@angular/router';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AuthService } from '../../../guards/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { DOCUMENT } from '@angular/common';
import { UtilityFunctions } from '../../../utilities/utility-func';

@Component({
  selector: 'ucp-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  public agGridOptions: any;
  public dfmData: any;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public unitList: any;
  public subscription: Subscription;
  public paramForm: FormGroup = new FormGroup({
    paramName: new FormControl({ value: null, disabled: false }, [Validators.required]),
    unit: new FormControl({ value: null, disabled: false }, [Validators.required]),
  });

  public paramData: any = {
    paramName: null,
    unit: null,
    paramId: null
  }
  public loader: any = {
    project: false,
    delete: false
  }
  public userData: any;
  public userRolePermissions: any  = {};



  constructor(@Inject(DOCUMENT) private document: any, public toaster: ToasterService, private router: Router, private _auth: AuthService, private appservice: AppService, public commonPopup: CommonPopupService, private _util: UtilityFunctions) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_project_item') {
          this.confirmProjectDelete(data?.data);
        }
      }
    });
    const projectPerm = this._auth.getUserPermissions('project_info');
    if (projectPerm) {
      this.userRolePermissions['create'] = projectPerm['create'];
      this.userRolePermissions['edit'] = projectPerm['edit'];
      this.userRolePermissions['delete'] = projectPerm['delete'];
      this.userRolePermissions['view'] = projectPerm['view'];
      this.userRolePermissions['switch_project'] = projectPerm['switch_project'];
    }
    if (!this.userRolePermissions['view']) {
      this.router.navigate(['empty-state/401']);
    }
  }

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable() {
    try {
      this.loader.project = true;
      this.appservice.fetchProjects().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.agGridOptions = respData.data;
          this.agGridOptions['tableActions'] = this._util.updateActions(this.agGridOptions['tableActions'], this.userRolePermissions);
          this.agGridOptions['clickableColumns'] = this._util.clickableCol(this.agGridOptions, this.agGridOptions?.clickableColumns || [], this.userRolePermissions);
          if (this.agGridOptions?.columnDefs?.length) {
            const userInd = this.agGridOptions.columnDefs.findIndex((ele: any) => ele.field === 'users');
            if (userInd > -1) {
              this.agGridOptions.columnDefs[userInd]['cellRenderer'] = this.userCellRenderer;
            }
          }
          this.loader.project = false;
        } else {
          this.loader.project = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loader.project = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (table_error) {
      this.loader.project = false;
      console.error(table_error);
    }
  }


  aggridEmitter(event: any) {
    try {
      if (!event || !event?.action?.type) {
        return;
      }
      if (event && event?.action?.type) {
        switch (event.action.type) {
          case 'addnew':
            this.router.navigate(["app/projects/config-project/new"]);
            break;
          case 'edit':
            this.router.navigate([`app/projects/config-project/edit/${event?.data?.project_id}`]);
            break;
          case 'switch_project':
            const projectId = this._auth.getProjectDetails()?.project_id || '';
            if (event?.data?.project_id === projectId) {
              this.toaster.toast('info', 'Info', 'Already in the same project.', true);
              return;
            }
            this.changeProject(event?.data);
            break;
          case 'delete':
            const message1 = `Are you sure do you want to delete this project (${event.data.project_name})?`
            this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_project_item', event);
            break;
        }
      }
    } catch (aggridErr) {
      console.error(aggridErr);
    }
  }

  changeProject(event: any, isHeaderComp?) {
    try {
      const dataToSend: any = {
        project_id: event?.project_id || '',
      };
      this.loader['change_project'] = true;
      this.appservice.switchProjects(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((respData) => {
        if (respData?.status === 'success') {
          localStorage.removeItem('project_id');
          localStorage.removeItem('project_details');
          const baseProjectDet = respData['data'] || {};
          const projectDet: any = {
            project_id: '',
            project_name: baseProjectDet.project_name || '',
            project_type: baseProjectDet.project_type || '',
            logo_url: baseProjectDet.logo_url || '',
            map_center: baseProjectDet?.map_center || { 
              lat: 24.45, 
              lng: 54.37 
            },
            zoom_level: baseProjectDet?.zoom_level || 5,
          };
          projectDet['project_id'] = baseProjectDet['project_id'] || '';
          this._auth.storeProjectDetails(projectDet);
          if (!isHeaderComp) {
            this.router.navigate(['app/dashboard/visualize']);
          } else {
            this.router.navigate(['app/dashboard/visualize'], { queryParams: {project_id: projectDet['project_id'] || ''}});
          }
          this.loader['change_project'] = false;
        } else {
          this.loader['change_project'] = false;
          this.toaster.toast('error', 'Error', respData.message || 'Error while switching projects.', true);
        }
      }, (error) => {
        console.log(error);
        this.loader['change_project'] = false;
        this.toaster.toast('error', 'Error', 'Error while switching projects.', true);
      },
      );
    } catch (error) {
      this.loader['change_project'] = false;
      console.error(error);
    }
  }

  userCellRenderer(params: ICellRendererParams) {
    if (params.value === undefined || params.value === null) {
      return '';
    }
    let data = '<span class="d-flex">';
    for (let i = 0; i < 4; i++) {
      if (params?.value?.length === i) {
        break;
      } else {
        data = data + `<span class="dot"><span class="dot-label">&nbsp;${params?.value[i]}</span></span>`
      }
    }
    if (params?.value?.length > 4) {
      data = data + `<span class="dot"><span class="dot-label">+${params.value.length - 4}</span></span>`;
    }
    return data + '</span>';
  }

  confirmProjectDelete(event: any) {
    try {
      const dataToSend = {};
      this.loader['delete'] = true;
      dataToSend['project_id'] = event?.data?.project_id || '';
      this.appservice.deleteProjectData(dataToSend).pipe(takeUntil(this.destroy$)).subscribe((deleteData) => {
        if (deleteData.status === 'success') {
          this.loader['delete'] = false;
          const localProjectId = this._auth?.getProjectDetails()?.project_id || '';
          if (dataToSend['project_id'] === localProjectId) {
            const headerComponent = new HeaderComponent(this.document, this.toaster, this.router, this._auth,  this.appservice, this.commonPopup, this._util);
            headerComponent.logOut();
          } else {
            this.loadTable();
          }
          this.toaster.toast('success', 'Success', deleteData.message || 'Project deleted successfully.', true);
        } else {
          this.loader['delete'] = false;
          this.toaster.toast('error', 'Error', deleteData.message || 'Error while deleting Project.', true);
        }
      }, (deleteConfigErr) => {
        this.loader['delete'] = false;
        console.error(deleteConfigErr);
        this.toaster.toast('error', 'Error', 'Error while deleting Project.', true);
      });
    } catch (error) {
      this.loader['delete'] = false;
      console.error(error);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
