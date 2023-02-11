import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';
import { ToasterService } from 'src/app/shared/toastr/toaster.service';

@Component({
  selector: 'ucp-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public chartOptions1: any = {};
  public chartOptions2: any = {};
  public chartOptions3: any = {};
  public data: any = [];
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public loaders: any = {
    dashboard: false,
  }

  constructor(private _toaster: ToasterService, private router: Router, private appservice: AppService) { }

  ngOnInit(): void {
    this.getDashboardData();
  }

  goto() {
    this.router.navigate(['app/cards-view']);
  }

  getDashboardData() {
    try {
      this.loaders['dashboard'] = true;
      this.appservice.dashboardList({user_id: 'user_100'}).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response?.status === 'success') {
          this.chartOptions1 = response.line;
          this.chartOptions2 = response.bar;
          this.chartOptions3 = response.pie;
          this.data = response.cards;
          this.loaders['dashboard'] = false;
        } else {
          this.loaders['dashboard'] = false;
          this._toaster.toast('error', 'Error', 'Error while fetching the otp.', true);
        }
      }, (error) => {
        this.loaders['dashboard'] = false;
        this._toaster.toast('error', 'Error', 'Error while fetching the otp.', true);
      });
    } catch (dashErr) {
      this.loaders['dashboard'] = false;
      console.error(dashErr);
    }
  }

}
