import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AppService } from '../../../services/app.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ToasterService } from '../../../shared/toastr/toaster.service';


@Component({
  selector: 'ucp-simulate',
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.scss']
})
export class SimulateComponent implements OnInit {

  public destroy$: Subject<boolean> = new Subject<boolean>();
  public loaders: any= {
    showMap: false
  }
  public mapData: any;
  public aggridData: any;
  public mapOptions: any= {
    "center": {
      "lat": null,
      "lng": null,
    },
    "zoom": 10,
    "heading": 10,
    "tilt": 47.5,
    "mapTypeId": 'satellite',
    "mapId": null,
    "mapTypeControl": false,
    "streetViewControl": false,
  };
  public tableHeight: any = '8%';
  public refreshingTable: any;
  public theme: any = 'ag-theme-balham';
  public tooltipOptions: any = [];
  public legends: any;
  public selectedLegends: any = [];

  constructor(private appservice: AppService, private toaster: ToasterService,) { }

  ngOnInit(): void {
    this.getLegends();
    this.getTableData();
  }

  getMapData() {
    try {
      const payload: any = {
        "startRow": 0,
        "endRow": 100,
        "page": 1,
        "records": 100,
        "sortModel": {
          "sort": "asc",
          "colId": "chainage"
        },
        "applied_filters": {
          "survey": "soil_resistivity",
          "survey_period": "bBHbuknciuUVBz7S8Cbu8c"
        },
        "selected_column": "protection_potential_most_negative",
        "legends": [
          "protection_potential_most_negative"
        ],
        "tz": "Asia/Calcutta"
      };
      this.loaders['showMap'] = true;
      this.appservice.getSimulateMapData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.mapData = respData?.data?.map_data;
          this.mapOptions.mapId = environment.mapId;
          this.mapOptions.center = respData?.data?.map_data?.markers?.[0] || respData?.data?.map_data?.polylines?.[0]?.path[0] || {}; 
          const mapcenterInd = Math.round((respData?.data?.map_data?.polylines?.[0]?.path / 2) || respData?.data?.map_data?.markers?.length / 2); 
          this.mapOptions.center = respData?.data?.map_data?.polylines?.[0]?.path[(mapcenterInd - 3)] || respData?.data?.map_data?.markers?.[(mapcenterInd - 3)] || {lat: 24.127831666666665, lng: 52.8955}; 
          this.tooltipOptions = respData?.data?.map_data?.tooltipOptions || [];
          this.mapData = { ...this.mapData };
          this.mapOptions = { ...this.mapOptions};
          this.loaders['showMap'] = false;
        } else {
          this.loaders['showMap'] = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders['showMap'] = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (dataErr) {
      this.loaders['showMap'] = false;
      console.error(dataErr);
    }
  }

  getTableData() {
    try {
      const payload: any = {
        "startRow": 0,
        "endRow": 100,
        "page": 1,
        "records": 100,
        "sortModel": {
          "sort": "asc",
          "colId": "chainage"
        },
        "applied_filters": {
          "survey": "soil_resistivity",
          "survey_period": "bBHbuknciuUVBz7S8Cbu8c"
        },
        "selected_column": "protection_potential_most_negative",
        "legends": [
          "protection_potential_most_negative"
        ],
        "tz": "Asia/Calcutta"
      };
      this.appservice.getSimulateHeaderData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.aggridData = {
            dataMethod: 'getSimulateTableData',
            columnDefs: respData?.data?.columnDefs?.length ? respData.data.columnDefs || [] : [],
            rowData: [],
            defaultColDef: respData?.data?.defaultColDef ? respData.data.defaultColDef || { flex: 1, resizable: true, sortable: true, filter: true } : {},
            payload: payload,
            infiniteScroll: true,
          };
          this.refreshingTable = true;
          setTimeout(() => {
            this.aggridData = { ...this.aggridData };
            this.refreshingTable = false;
          }, 0);
        } else {
          this.aggridData['columnDefs'] = [];
          this.aggridData['rowData'] = [];
          this.aggridData = { ...this.aggridData };
        }
      }, (error) => {
        console.error(error);
      });
    } catch (filterErr) {
      console.error(filterErr);
    }
  }

  getLegends() {
    try {
      const legendJSON: any = {
        survey: "soil_resistivity",
        survey_period: "FXzUAPcBxoYUCpgrBMa5Vm",
        simulate: true
      }
      this.appservice.getLegends(legendJSON).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.legends = respData?.data || {}; 
          this.selectedLegends = Object.keys(this.legends);
          this.getMapData();
        } else {
          this.legends = {};
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.legends = {};
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (legendErr) {
      this.legends = {};
      console.error(legendErr);
    }
  }

}
