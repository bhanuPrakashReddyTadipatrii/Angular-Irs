import { Component, HostListener, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { AppService } from '../../../services/app.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { GridsterConfig, GridsterItem, GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { AgGridTableComponent } from '../../../shared/ag-grid-table/ag-grid-table.component';
import { AuthService } from '../../../guards/auth.service';
import { MapsComponent } from '../../../shared/maps/maps.component';
import { VisualChartsComponent } from '../../../shared/visual-charts/visual-charts.component';

@Component({
  selector: 'ucp-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {

  @ViewChildren(AgGridTableComponent) gridDetails: QueryList<AgGridTableComponent>;
  @ViewChildren(MapsComponent) mapDetails: QueryList<MapsComponent>;
  @ViewChildren(VisualChartsComponent) visualCharts: QueryList<VisualChartsComponent>;
  public colors;
  public barOption;
  public multiLineOption;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription;
  public loaders: any = {
    leftFilters: false,
    fields: false,
    dfm: false,
  };
  public theme: any = 'ag-theme-balham';
  public widgetType: any = false;
  public activeWidget: any;

  public showFilterOptions;
  public workSpaceData: any = [];
  public footArrowDropDown: any = [
    {
      name: "Rename",
      value: 'edit'
    },
    {
      name: "Duplicate",
      value: 'duplicate'
    },
    {
      name: "Delete",
      value: 'delete'
    },
    {
      name: "Move right",
      value: 'move_right',
    },
    {
      name: "Move left",
      value: 'move_left'
    }
  ];
  public workSpaceType: any = "compare";
  public activeTab: any = null;
  public gridSterOptions: GridsterConfig;
  public toggleAddCompare: any = false;
  public allWidgets: any;
  public exitPage: any = false;
  public comapreSettings = {
    gridDetails: {
      gridHeight: 1,
      gridWidth: null,
      gridMargin: 5,
      gridCols: 12,
    },
  };
  public createCompare = [
    {
      icon: "table_chart",
      label: "Table",
      value: "table"
    },
    {
      icon: "bar_chart",
      label: "Chart",
      value: "chart"
    },
    {
      icon: "map",
      label: "Map",
      value: "map"
    }
  ];
  public typeChangeBtn: any;
  public widgetData: any = {
    // widget_123: {
    //   tableData: {colDefs: [], rowData: []},
    //   chartData: {},
    //   mapData: {},
    // }
  };
  public filters: any = {};
  public widgetLoaders: any = {};
  public storedAllWidget: any;


  constructor(private appservice: AppService, private toaster: ToasterService, public commonPopup: CommonPopupService, private _auth: AuthService) {
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_workspace') {
          this.confirmConfDelete(data?.data);
        }
        if (data['action'] === 'delete_Widget') {
          this.confirmWidgetDelete(data?.data);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
    this.gridSterConfigurations();
  }

  gridSterConfigurations() {
    const currentView = this;
    const totalCols = this.comapreSettings.gridDetails['gridCols'];
    const rowHeight = this.comapreSettings.gridDetails['gridHeight'];
    const gridMargin = this.comapreSettings.gridDetails['gridMargin'];
    const gridWidth = document.getElementById('dashboardArea')?.offsetWidth + 5;
    this.comapreSettings.gridDetails['gridWidth'] = Math.round(gridWidth / totalCols) - 6;
    this.gridSterOptions = {
      gridWidth,
      pushItems: true,
      gridType: GridType.ScrollVertical,
      compactType: CompactType.CompactUpAndLeft,
      displayGrid: DisplayGrid.OnDragAndResize,
      minCols: totalCols,
      maxCols: totalCols,
      minRows: 10,
      minItemRows: 1,
      maxItemRows: 500,
      // setGridSize: true,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      fixedRowHeight: rowHeight,
      defaultItemCols: 1,
      defaultItemRows: 1,
      margin: gridMargin,
      draggable: {
        enabled: true,
        ignoreContent: true,
      },
      resizable: {
        enabled: true,
        stop(item, gridsterItem, event) {
          currentView.resizeGrid(item, gridsterItem, event);
        },
      },
    };

  }

  resizeGrid(item, gridsterItem, event) {
    try {
      if (item && gridsterItem && gridsterItem?.item && gridsterItem?.item?.rows) {
        item['hide'] = true;
        item = Object.assign(item, gridsterItem.item.rows);
        setTimeout(() => {
          item['hide'] = false;
        }, 100);
      }
    } catch (error) {
      console.error(error);
    }
  }

  createWidget(widgetType?) {
    try {
      const payload = {
        widget_type: widgetType || "",
        type: "create",
        workspace_type: "compare",
        workspace_id: this.activeTab?.workspace_id || "",
        workspace_count: this.allWidgets?.length
      }
      this.appservice.configureWidget(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          if (!this.allWidgets?.length) {
            this.filterPinned = false;
          }
          this.allWidgets?.push(respData?.data?.[0] || { col: 12, row: 3, x: 0, y: 0 });
          this.widgetLoaders[respData?.data?.[0]?.wId] = {
            map: false,
            table: false,
            chart: false,
          };
          this.widgetData[respData?.data?.[0]?.wId] = {
              tableData: {},
              chartData: {},
              mapData: {},
              mapOptions: {
                "center": respData?.data?.[0]?.mapProps?.center,
                "zoom": respData?.data?.[0]?.mapProps?.zoom,
                "heading": 320,
                "tilt": respData?.data?.[0]?.mapProps?.tilt,
                "mapTypeId": respData?.data?.[0]?.mapProps?.activeMapType,
                "mapId": null,
                "mapTypeControl": false,
                "streetViewControl": false,
              }
            }
          this.changeActiveWidget(this.allWidgets?.[this.allWidgets?.length - 1])
          this.allWidgets = [...this.allWidgets];
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while Creating the Workspace.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while Creating the Workspace.');
      });
    } catch (widgetCreationError) {
      console.error(widgetCreationError);
    }
  }


  changeActiveWidget(selectedData, isSelected?) {
    if (this.activeWidget?.wId === selectedData.wId) {
      return;
    }
    this.activeWidget = selectedData;
    this.filters = this.dfmFilterData.bodyContent = selectedData?.filterProps?.filters || {};
    this.dependentLength = 0;
    this.loaders.leftFilters = true;
    setTimeout(() => {
      this.loaders.leftFilters = false;
    }, 1000);
    this.showFilterOptions = selectedData?.filterProps?.hasOwnProperty('showFilterOptions') ? selectedData?.filterProps?.showFilterOptions : true;
    this.filterPinned = selectedData?.filterProps?.hasOwnProperty('pinFilters') ? selectedData?.filterProps?.pinFilters : true;
    this.selectedTab = this.tabs?.[0]?.value || this.selectedTab || '';
    if (this.filters?.survey) {
      this.getDisplayOptions({ survey: this.filters.survey });
    }
    this.getFilters(isSelected ? true : null);
  }

  openWidgetType(widgetDet) {
    if(this.typeChangeBtn === widgetDet?.wId) {
      this.typeChangeBtn = null;
      return;
    }
    this.typeChangeBtn = widgetDet?.wId
  }

  changeEachWidgetType(item, type, index) {
    this.allWidgets[index].visualType = type?.value;
    this.changeVisualType(item?.wId, type?.value, index);
  }

  saveWidget(ind, widgetDetails) {
    try {
      this.allWidgets[ind].wName = widgetDetails?.wName;
      this.allWidgets[ind].isInput = false;
      this.allWidgets = [...this.allWidgets];
    } catch(renameWidgetError) {
      console.error(renameWidgetError)
    }
  }

  deleteWidget(widgetDetails) {
    try {
      if (!widgetDetails?.wId) {
        return;
      }
      const message1 = `Are you sure do you want to delete this Widget (${widgetDetails?.wName})?`;
      this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_Widget', widgetDetails?.wId);
    } catch(widgetDeleteError) {
      console.error(widgetDeleteError);
    }
  }
  confirmWidgetDelete(wId) {
    try {
      if (!wId) {
        return;
      }
      const payload = {
        widget_id: wId,
        type: "delete",
        workspace_type: "compare",
        workspace_id: this.activeTab?.workspace_id || "",
        workspace_count: this.allWidgets?.length
      }
      this.appservice.configureWidget(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          let widgetInd = this.allWidgets?.findIndex((ele) => ele.wId === wId);
          this.allWidgets?.splice(widgetInd, 1);
          this.allWidgets = [...this.allWidgets];
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while Creating the Workspace.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while Creating the Workspace.');
      });
    } catch (widgetDeleteError) {
      console.error(widgetDeleteError);
    }
  }


  //--------------------WorkSpace Functionality Started Here----------------------------//

  /**
   * for Workspace Functionalities(add, edit, delete, etc..)
   * @param event gives click type
   */
  workSpaceEmitterData(event) {
    if (event?.type) {
      switch (event?.type) {
        case 'add':
          this.addWorkSpace();
          break;
        case 'changetab':
          this.activeWidget = null;
          this.filters = {};
          this.changeActiveTab(this.workSpaceData?.[event.ind]);
          break;
        case 'duplicate':
          this.changeActiveTab(this.workSpaceData?.[event.ind]);
          this.duplicateWorkSpace(event?.ind, event?.$event);
          break;
        case 'edit':
          this.changeActiveTab(this.workSpaceData?.[event.ind]);
          this.editWorkspace(event?.ind, event?.$event);
          break;
        case 'save':
          this.changeActiveTab(this.workSpaceData?.[event.ind]);
          this.saveWorkspace(event?.ind, event?.$event);
          break;
        case 'delete':
          this.deleteWorkspace(event?.ind, event?.$event);
          break;
        case 'move':
          this.moveWorkSpace(event?.workSpaceData);
          break;
        case 'move_left':
          this.moveLeftRightWorkspaceUpdate(event);
          break;
        case 'move_right':
          this.moveLeftRightWorkspaceUpdate(event);
      }
    }
  }

  /**
   * For adding a workspace
   */
  addWorkSpace() {
    try {
      this.loadWorkSpace({ type: 'new', workspace_type: this.workSpaceType });
    } catch (modalErr) {
      console.error(modalErr);
    }
  }

  /**
   * listing workspace
   * @param payload for sending to BE
   */
  loadWorkSpace(payload) {
    try {
      this.loaders.workSpace = true;
      this.appservice.listingWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.workSpaceData = respData.data?.length ? respData.data || [] : [];
          if (!this.activeTab?.workspace_id && this.workSpaceData?.length) {
            this.changeActiveTab(this.workSpaceData[0]);
          }
          this.loaders.workSpace = false;
        } else {
          this.loaders.workSpace = false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while listing the data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders.workSpace = false;
        // this.toaster.toast('error', 'Error', 'Error while listing the data.');
      });
    } catch (err) {
      this.loaders.workSpace = false;
      console.error(err);
    }
  }

  /**
   * for changing the workspace
   * @param eachSheet gives workspace details
   */
  changeActiveTab(eachSheet) {
    try {
      if (this.activeTab?.workspace_id === eachSheet.workspace_id) {
        return;
      }
      this.workSpaceData.forEach((ele) => {
        if (this.activeTab?.workspace_id === ele.workspace_id) {
          ele.isInput = false;
        }
      })
      this.activeTab = eachSheet;
      const payload = {
        workspace_id: this.activeTab?.workspace_id,
        workspace_type: this.workSpaceType
      }
      this.appservice.getWorkspaceDetails(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.allWidgets = respData?.data?.length ? respData?.data || [] : [];
          this.storedAllWidget = JSON.parse(JSON.stringify(this.allWidgets));
          if (this.allWidgets?.length) {
            this.changeActiveWidget(this.allWidgets?.[0])
            this.loadwidgets();
          }
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching workspace details.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching workspace details.');
      });
    } catch (changeErr) {
      this.loaders.leftFilters = false;
      console.error(changeErr);
    }
  }

  loadwidgets() {
    if (this.allWidgets?.length) {
      this.widgetData = {};
      for (let eachInd = 0; eachInd < this.allWidgets?.length; eachInd++) {
        this.widgetLoaders[this.allWidgets[eachInd]?.wId] = {
          map: false,
          table: false,
          chart: false,
        };
        this.changeVisualType(this.allWidgets[eachInd]?.wId, this.allWidgets[eachInd]?.visualType, eachInd);
      }
    }
  }

  changeVisualType(wId, type, ind) {
    try {
      if(!this.widgetData?.[this.allWidgets[ind]?.wId]) {
        this.widgetData[this.allWidgets[ind]?.wId] = {};
      }
      if (type === "chart") {
        this.widgetData[wId]['chartData'] = {};
        this.getChartData(wId, ind);
      }
      if (type === "table") {
        this.widgetData[wId]['tableData'] = {};
        this.getLegends(wId, ind, true);
      }
      if (type === "map") {
        this.widgetData[wId]['mapOptions'] = {
          "center": {
            "lat": null,
            "lng": null,
          },
          "zoom": 10,
          "heading": 320,
          "tilt": 47.5,
          "mapTypeId": 'satellite',
          "mapId": null,
          "mapTypeControl": false,
          "streetViewControl": false,
        };
        this.widgetData[wId]['legends'] = {};
        this.widgetData[wId]['mapData'] = {};
        this.getLegends(wId, ind);
      }
    } catch (changeErr) {
      console.error(changeErr);
    }
  }

  saveCurrentWorkspace() {
    let index = this.workSpaceData?.findIndex(ele => ele?.workspace_id === this.activeTab?.workspace_id)
    this.changeActiveTab({workspace_id: this.activeTab?.workspace_id});
    this.saveWorkspace(index);
  }

  public chartType;
  chartTypeChange(event) {
    this.activeWidget['chartProps']['type'] = event?.chartType ? event?.chartType : 'line';
  }

  /**
   * for saving the workspace
   * @param ind gives index of workspace
   * @param event gives event
   */
  saveWorkspace(ind, event?) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.workSpaceData[ind]['isInput'] = false;
    const payload = {
      "type": "save",
      "workspace_type": this.workSpaceType,
      "workspace_name": this.workSpaceData[ind].workspace_name,
      "workspace_id": this.workSpaceData[ind].workspace_id,
    };
    this.gridDetails.forEach((ele: any) => {
      let tableIndex = this.allWidgets.findIndex(data => data?.wId === ele?.agGridOptions?.tableId)
      let tempData = ele.getTableState();
      this.allWidgets[tableIndex].tableProps.tableState = tempData;
    });
    this.mapDetails.forEach((ele: any) => {
      let mapIndex = this.allWidgets.findIndex(data => data?.wId === ele?.mapOptions?.wId)
      let tempData = ele.getMapPosition();
      this.allWidgets[mapIndex].mapProps.center = tempData?.center;
      this.allWidgets[mapIndex].mapProps.zoom = tempData?.zoom;
    });
    payload[this.workSpaceType] = this.allWidgets;
    this.appservice.configureWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
      if (respData && respData['status'] === 'success') {
        this.workSpaceData.data = respData;
        this.storedAllWidget = this.allWidgets;
        this.toaster.toast('success', 'Success', respData['message'] || 'Workspace saved successfully.');
        this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
      } else {
        this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving workspace.');
        this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
      }
    }, (error) => {
      console.error(error);
      this.toaster.toast('error', 'Error', 'Error while saving workspace.');
      this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
    });
  }

  /**
   * for editing the workspace
   * @param ind gives index of workspace
   * @param event gives event
   */
  editWorkspace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    this.workSpaceData[ind]['isInput'] = true;
  }

  /**
   * for duplicating workspace
   * @param ind gives index of workspace
   * @param event gives event
   */
  duplicateWorkSpace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.workSpaceData[ind]['workspace_id']) {
      return;
    }
    this.loadWorkSpace({ type: 'duplicate', workspace_id: this.workSpaceData[ind]['workspace_id'], workspace_type: this.workSpaceType });
  }

  /**
   * for dragging the workspace to left and right
   * @param data gives workspace details
   */
  moveWorkSpace(data) {
    try {
      let payload = {
        "type": "move",
        "workspace_type": this.workSpaceType,
        "workspace_ids": data.map((e) => e.workspace_id),
      }
      this.appservice.configureWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData?.status === 'success') {
          this.workSpaceData = data;
          this.workSpaceData = [...this.workSpaceData];
        }
        else {
          this.workSpaceData = [...this.workSpaceData];
        }
      }, (err) => {
        this.workSpaceData = [...this.workSpaceData];
        console.error(err);
      });
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * for moving left and right to workspace by using button click
   * @param event gives workspace event
   */
  moveLeftRightWorkspaceUpdate(event) {
    try {
      let holdElement = this.workSpaceData[event.ind];
      this.workSpaceData[event.ind] = this.workSpaceData[event.type === 'move_left' ? --event.ind : ++event.ind];
      this.workSpaceData[event.ind] = holdElement;
      this.moveWorkSpace(this.workSpaceData);
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * for opening delete popup model
   * @param ind index of workspace
   * @param event 
   */
  deleteWorkspace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    const message1 = `Are you sure do you want to delete this WorkSpace (${this.workSpaceData[ind].workspace_name})?`;
    this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_workspace', ind);
  }
  /**
   * for deleting workspace
   * @param ind gives index
   */

  confirmConfDelete(ind: any) {
    try {
      const payload = {
        "type": "delete",
        "workspace_name": this.workSpaceData[ind].workspace_name,
        "workspace_id": this.workSpaceData[ind].workspace_id,
        "workspace_type": this.workSpaceType
      };
      this.appservice.configureWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          if (this.activeTab?.workspace_id === payload?.workspace_id) {
            this.activeTab = null;
          }
          this.toaster.toast('success', 'Success', respData['message'] || 'Workspace deleted successfully.');
          this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
        } else {
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while listing the data.');
        }
      }, (error) => {
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while listing the data.');
      });

    } catch (workspaceerror) {
      console.error(workspaceerror);
    }
  }

  //-----------------------------Workspace Functionality Ended Here----------------------------//

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    this.toggleAddCompare = !this.toggleAddCompare;
    if (event?.target?.className?.length && event?.target?.className?.includes('newCompareBtn')) {
      this.typeChangeBtn = null;
      return;
    }
    this.toggleAddCompare = false;
    if (event?.target?.className?.length && (event?.target?.className?.includes('widget-type') || event?.target?.className?.includes('change-wid'))) {
      this.toggleAddCompare = false;
      return;
    }
    this.typeChangeBtn = null;
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if(this.allWidgets?.length === this.storedAllWidget?.length) {
      if(this.equalsCheck(this.allWidgets, this.storedAllWidget)) {
       return true;
      }
    } else {
      this.exitPage = true;
    }
    return this.exitPage;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  equalsCheck(data1, data2) {
    return JSON.stringify(data1) === JSON.stringify(data2);
};

  setLoaderVar(wId) {
    if (!this.widgetLoaders.hasOwnProperty(wId)) {
      this.widgetLoaders[wId] = {};
    }
  }

  getMapData(mapPayload, mapConf, wId) {
    try {
      this.setLoaderVar(wId);
      this.widgetLoaders[wId]['map'] = true;
      this.appservice.getMapData(mapPayload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.widgetData[wId]['mapData'] = respData?.data?.map_data || {};
          this.widgetData[wId]['mapOptions'].mapId = environment.mapId;
          this.widgetData[wId]['mapOptions'].wId = wId;
          const projectDet: any = this._auth.getProjectDetails();
          const mapcenterInd = Math.round((respData?.data?.map_data?.markers ? respData?.data?.map_data?.markers.length : respData?.data?.map_data?.polylines?.[0]?.path.length) / 2)
          this.widgetData[wId]['mapOptions']['center'] = (mapConf?.center?.lat && mapConf?.center?.lng ? mapConf.center : false) || (projectDet?.map_center?.lat && projectDet?.map_center?.lng ?  projectDet.map_center : false) || respData?.data?.map_data?.markers?.[(mapcenterInd - 3)] || respData?.data?.map_data?.polylines?.[0]?.path[(mapcenterInd)] || { lat: 24.127831666666665, lng: 52.8955 };
          this.widgetData[wId]['mapOptions']['zoom'] = mapConf?.zoom || projectDet?.zoom_level || 9;
          this.widgetData[wId]['mapOptions']['tilt'] = mapConf?.tilt || 0;
          this.widgetData[wId]['mapData'] = { ...this.widgetData[wId]['mapData'] };
          this.widgetData[wId]['mapOptions'] = { ...this.widgetData[wId]['mapOptions'] };
          this.widgetLoaders[wId]['map'] = false;
        } else {
          this.widgetLoaders[wId]['map'] = false;
          this.widgetData[wId]['mapData'] = {
            legends: {},
            markers: [],
            polylines: []
          };
          this.widgetData[wId]['mapData'] = { ...this.widgetData[wId]['mapData'] };
          this.widgetData[wId]['mapOptions']['center'] = (mapConf?.center?.lat && mapConf?.center?.lng ? mapConf.center : false) || { lat: 24.127831666666665, lng: 52.8955 };
          this.widgetData[wId]['mapOptions']['zoom'] = mapConf?.zoom || 9;
          this.widgetData[wId]['mapOptions']['tilt'] = mapConf?.tilt || 0;
          this.widgetData[wId]['mapOptions'] = { ...this.widgetData[wId]['mapOptions'] };
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching map data.');
        }
      }, (error) => {
        console.error(error);
        this.widgetLoaders[wId]['map'] = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (mapDataError) {
      this.widgetLoaders[wId]['map'] = false;
      console.error(mapDataError)
    }
  }

  getColdefs(tablePayload, wId) {
    try {
      this.setLoaderVar(wId);
      this.widgetLoaders[wId]['table'] = true;
      this.appservice.getSelectedFiltersAndColDefs(tablePayload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.widgetData[wId]['tableData'] = {
            dataMethod: 'getTableData',
            columnDefs: respData?.data?.columnDefs?.length ? respData.data.columnDefs || [] : [],
            rowData: [],
            defaultColDef: respData?.data?.defaultColDef ? respData.data.defaultColDef || { flex: 1, resizable: true, sortable: true, filter: true } : {},
            payload: tablePayload,
            infiniteScroll: true,
            tableId: wId || ""
          };
          this.widgetData[wId]['refreshingTable'] = true;
          setTimeout(() => {
            this.widgetData[wId]['tableData'] = { ...this.widgetData[wId]['tableData'] };
          this.widgetData[wId]['refreshingTable'] = false;
          this.widgetLoaders[wId]['table'] = false;
          }, 1000);
        } else {
          this.widgetData[wId]['tableData']['columnDefs'] = [];
          this.widgetData[wId]['tableData']['rowData'] = [];
          this.widgetData[wId]['tableData'] = { ...this.widgetData[wId]['tableData'] };
          this.widgetLoaders[wId]['table'] = false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        this.widgetLoaders[wId]['table'] = false;
        console.error(error);
      });
    } catch (filterErr) {
      console.error(filterErr);
      this.widgetLoaders[wId]['table'] = false;
      this.widgetData[wId]['refreshingTable'] = false;
    }
  }

  getChartData(wId, ind) {
    try {
      let eachData: any = this.allWidgets[ind] || {};
      let chartPayload: any = {
        applied_filters: { ...(eachData?.filterProps?.filters || {}) },
        selected_column: eachData?.chartProps?.selected_column || [],
        markLines: (typeof eachData?.chartProps?.markLines === "string") ?  eachData?.chartProps?.markLines || null : null, 
        chartType: eachData?.chartProps?.type || null,
      };
      this.setLoaderVar(wId);
      this.widgetLoaders[wId]['chart'] = true;
      this.appservice.getChartData(chartPayload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          if (respData?.data?.tooltip) {
            respData.data.tooltip['formatter'] = (val) => {
              let c = "";
              if (val?.length) {
                c += respData?.data?.xAxis?.name + ": " + val?.[0].value?.[0] + '<br>'
                for (const item of val) {
                  c += (item?.color ? (`<span style="display:inline-block;margin-right:4px;width:15px;height:15px;background-color:` + item?.color + `;"></span>`) : item?.marker) + " " + item?.seriesName + " " + item?.value[1] + '<br>'
                }
              }
              return c
            }
          }
          this.widgetData[wId]['chartData'] = respData?.data;
          this.widgetData[wId]['chartData'] = { ...this.widgetData[wId]['chartData'] }
          this.widgetLoaders[wId]['chart'] = false;
        } else {
            this.widgetLoaders[wId]['chart'] = false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.widgetLoaders[wId]['chart'] = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (echartError) {
      this.widgetLoaders[wId]['chart'] = false;
      console.error(echartError);
    }
  }



  //----------------- Filters service call starts from here------------------------//
  public dfmFilterData: any = {};
  public displayFilterData: any = {};
  public selectedTab: any = null;
  public filterPinned: any = true;
  public tabs: any = [
    {
      label: 'Filters',
      value: 'filters',
      class: 'li-filter'
    },
    {
      label: 'Display options',
      value: 'display_options',
      class: 'li-display-options'
    }
  ];
  public dependentLength: any = 0;

  openFilter(key) {
    try {
      if (!key || !this.dfmFilterData?.headerContent?.[0]?.data?.length) {
        return;
      }
      for (let eachItem of this.dfmFilterData.headerContent[0]['data']) {
        if (eachItem['key'] === key) {
          eachItem['showTab'] = true;
        } else {
          eachItem['showTab'] = false;
        }
      }
      if (this.selectedTab !== 'filters') {
        this.selectedTab = 'filters';
      }
      this.dfmFilterData = { ...this.dfmFilterData };
      this.showFilters(true, key);
    } catch (keyErr) {
      console.error(keyErr);
    }
  }

  showFilters(isTopFilters?, key?) {
    if (isTopFilters) {
      if (!this.showFilterOptions) {
        this.showFilterOptions = true;
      }
      if (key) {
        const domEle = document.getElementById(`dfm_component_${key}`);
        if (domEle) {
          domEle.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
      }
      return;
    }
    setTimeout(() => {
      this.gridSterConfigurations();
    }, 0);
    this.showFilterOptions = !this.showFilterOptions;
  }

  pinFilter() {
    try {
      this.filterPinned = !this.filterPinned;
      setTimeout(() => {
        this.gridSterConfigurations();
      }, 0);
    } catch (filterErr) {
      console.error(filterErr);
    }
  }

  switchTabs(tab: any) {
    let data: any;
    this.selectedTab = tab?.value;
  }

  getDisplayOptions(data: any) {
    try {
      const payload = {
        survey: this.filters?.survey,
      };
      this.appservice.defaultDisplayOptions(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.displayFilterData = respData.data || {};
          this.setMapParameter();
          this.setMapOptions();
          this.setChartParameters();
          this.setTooltipParameters();
          this.setChartMarklines();
          this.setLegends();
        } else {
          this.displayFilterData = {};
        }
      }, (error) => {
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (error) {
      console.log(error)
    }
  }

  setMapOptions() {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      let selectedKeys: any = [];
      for (let eachItem in this.allWidgets[id]?.mapProps?.showInMap) {
        if (this.allWidgets[id]?.mapProps?.showInMap?.[eachItem]) {
          selectedKeys.push(eachItem);
        }
      }
      this.displayFilterData['bodyContent']['map_options'] = selectedKeys || [];
      this.displayFilterData = { ...this.displayFilterData };
    } catch (optErr) {
      console.error(optErr);
    }
  }

  assignMapParam(id) {
    try {
      this.loaders['leftFilters'] = true;
      setTimeout(() => {
        this.displayFilterData['bodyContent']['map_parameters'] = this.allWidgets[id]['mapProps']['selectedParam'];
        this.displayFilterData = { ...this.displayFilterData };
        this.loaders['leftFilters'] = false;
      }, 0);
    } catch (paramErr) {
      this.loaders['leftFilters'] = false;
      console.error(paramErr);
    }
  }

  setMapParameter() {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      setTimeout(() => {
        if (!this.displayFilterData?.bodyContent?.map_parameters) {
          for (let eachHead of this.displayFilterData?.headerContent) {
            if (eachHead?.data?.length) {
              const mapInd: any = eachHead?.data.findIndex((ele: any) => ele.key === 'map_parameters');
              if (mapInd > -1) {
                const findInd = eachHead?.data[mapInd]?.['options']?.findIndex((ele: any) => ele.value === this.allWidgets[id]['mapProps']['selectedParam']);
                if (!(findInd > -1) || !this.allWidgets[id]['mapProps']['selectedParam']) {
                  this.allWidgets[id]['mapProps']['selectedParam'] = eachHead?.data[mapInd]?.['options']?.[0]?.['value'] || null;
                }
                break;
              }
            }
          }
          this.assignMapParam(id);
        } else {
          if (this.allWidgets[id]?.mapProps) {
            this.allWidgets[id]['mapProps']['selectedParam'] = this.displayFilterData?.bodyContent?.map_parameters || null;
          }
        }
      }, 0);
      if (this.allWidgets[id]?.mapProps?.selectedParam) {
        this.assignMapParam(id);
      }
    } catch (setParamErr) {
      this.loaders['leftFilters'] = false;
      console.error(setParamErr);
    }
  }

  setLegends() {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (this.allWidgets[id]?.mapProps?.['selectedLegends'] && this.allWidgets[id]?.mapProps?.['selectedLegends']?.length) {
        this.displayFilterData['bodyContent']['legends_parameters'] = this.displayFilterData['selectedLegends'];
        this.displayFilterData = { ...this.displayFilterData }; 
      } else {
        if (this.allWidgets[id]?.mapProps) {
          this.allWidgets[id].mapProps['selectedLegends'] = this.displayFilterData['bodyContent']['legends_parameters'];
        }
      }
    } catch(setLParamErr) {
      console.error(setLParamErr);
    }
  }

  setChartParameters(key?) {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (this.allWidgets[id]['chartProps']['selected_column']) {
        this.displayFilterData['bodyContent']['chart_parameters'] = this.allWidgets[id]['chartProps']['selected_column'];
        this.displayFilterData = { ...this.displayFilterData };
      } else {
        if (this.allWidgets[id]?.chartProps) {
          this.allWidgets[id]['chartProps']['selected_column'] = this.displayFilterData?.bodyContent?.chart_parameters || null;
        }
      }
    } catch (setCParamErr) {
      console.error(setCParamErr);
    }
  }

  setChartMarklines() {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (this.allWidgets[id]['chartProps']['markLines']) {
        this.displayFilterData['bodyContent']['show_marklines'] = this.allWidgets[id]['chartProps']['markLines'];
        this.displayFilterData = { ...this.displayFilterData };
      } else {
        if (this.allWidgets[id]?.chartProps) {
          this.allWidgets[id]['chartProps']['markLines'] = this.displayFilterData?.bodyContent?.show_marklines || null;
        }
      }
    } catch (markLineError) {
      console.error(markLineError);
    }
  }

  setTooltipParameters() {
    try {
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (this.allWidgets[id]?.mapProps?.['tooltipParams'] && this.allWidgets[id]?.mapProps?.['tooltipParams']?.length) {
        this.displayFilterData['bodyContent']['tooltip_parameters'] = this.allWidgets[id]?.mapProps?.['tooltipParams'];
        this.displayFilterData = { ...this.displayFilterData };
      } else {
        if (this.allWidgets[id]?.mapProps) {
          this.allWidgets[id].mapProps['tooltipParams'] = this.displayFilterData['bodyContent']['tooltip_parameters'];
        }
      }
    } catch (setTTParamErr) {
      console.error(setTTParamErr);
    }
  }

  emitDFMField(event, position?) {
    try {
      if (!event || !event?.key) {
        return
      }
      if (event?.key === 'survey' && event.type === 'simpleRadioSelect' && event.emitType === 'simpleRadioClick') {
        this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['showTab'] = true;
        return;
      }
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (position === 'top' || position === 'left') {
        this.allWidgets[id]['filterProps']['filters'] = this.filters = this.dfmFilterData.bodyContent = { ...this.filters, ...event['bodyContent'] } || {};
        this.dfmFilterData = { ...this.dfmFilterData };
      }
      if (event.key === 'survey' && event?.value) {
        this.allWidgets[id]['filterProps']['filters'] = this.filters = this.dfmFilterData.bodyContent = { [event.key]: event?.value || '' };
        this.allWidgets[id]['chartProps']['selected_column'] = null;
        this.allWidgets[id]['chartProps']['markLines'] = null;
        this.allWidgets[id].mapProps['selectedLegends'] = null;
        this.allWidgets[id].mapProps['selectedParam'] = null;
        this.allWidgets[id]['mapProps']['tooltipParams'] = null;
        this.getDisplayOptions({ [event.key]: event?.value || '' });
        this.getDeptFilters({ [event.key]: event?.value || '' });
      } else if (event.hasOwnProperty('value')) {
        if (event?.disableDependentKey) {
          if (event?.value) {
            delete this.filters[event?.disableDependentKey];
            delete this.dfmFilterData.bodyContent[event?.disableDependentKey];
            delete this.allWidgets[id]['filterProps']['filters'][event?.disableDependentKey];
          }
        }
        this.changeVisualType(this.activeWidget?.wId, this.activeWidget?.visualType, id);
      }
      if (event?.type === 'range') {
        if (event.emitType === 'rangePickerClick') {
          this.getFieldData(event);
        }
        if (event.emitType === 'rangeSliderEmitter') {
          this.changeVisualType(this.activeWidget?.wId, this.activeWidget?.visualType, id);

        }
      }
      if ((event.emitType === 'advMultiSelectClick' && event.type === 'advMultiSelect') ||
        (event.emitType === 'simpleRadioClick' && event.type === 'simpleRadioSelect') || (event.emitType === 'advRadioClick' && event.type === 'advRadioSelect')) {
        this.getFieldData(event, true);
      }
    } catch (eventErr) {
      this.loaders['leftFilters'] = false;
      this.loaders['topFilters'] = false;
      console.error(eventErr);
    }
  }

  getDeptFilters(data: any, IsSelected?) {
    try {
      this.loaders['leftFilters'] = true;
      this.appservice.getDependentFilters(data).pipe(takeUntil(this.destroy$)).subscribe(dependentRes => {
        if (dependentRes && dependentRes.status === 'success') {
          const id: any = this.getWidgetId();
          if (!(id > -1)) {
            return;
          }
          if (!this.dfmFilterData.headerContent?.[0]?.data?.length) {
            this.dependentLength = dependentRes.data?.headerContent[0]['data'].length;
            this.dfmFilterData.headerContent = dependentRes.data?.headerContent || [];
            this.dfmFilterData.userActions = dependentRes.data?.userActions || {};
          } else {
            if (this.dependentLength) {
              this.dfmFilterData.headerContent[0]['data'] = this.dfmFilterData.headerContent[0]['data'].slice(0, this.dfmFilterData.headerContent[0]['data']['length'] - this.dependentLength);
            }
            if (dependentRes.data?.headerContent?.[0]?.data?.length) {
              this.dependentLength = dependentRes.data?.headerContent[0]['data'].length;
              this.dfmFilterData.headerContent[0]['data'] = [...this.dfmFilterData.headerContent[0]['data'], ...dependentRes.data?.headerContent[0]['data']];
            }
            this.allWidgets[id]['filterProps']['filters'] = this.dfmFilterData.bodyContent = this.filters = { ...(dependentRes?.data?.bodyContent || {}), ...this.filters } || {};
            this.dfmFilterData = { ...this.dfmFilterData };
            this.expandAllFilters();
          }
          this.loaders['leftFilters'] = false;
          if (!IsSelected) {
            this.changeVisualType(this.activeWidget?.wId, this.activeWidget?.visualType, id);
          }
        } else {
          if (this.dependentLength) {
            this.dfmFilterData.headerContent[0]['data'] = this.dfmFilterData.headerContent[0]['data'].slice(this.dependentLength, this.dfmFilterData.headerContent[0]['data']['length']);
            this.dependentLength = 0;
          }
          this.loaders['leftFilters'] = false;
          // this.toaster.toast('error', 'Error', dependentRes['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        if (this.dependentLength) {
          this.dfmFilterData.headerContent[0]['data'] = this.dfmFilterData.headerContent[0]['data'].slice(this.dependentLength, this.dfmFilterData.headerContent[0]['data']['length']);
          this.dependentLength = 0;
        }
        this.loaders['leftFilters'] = false;
        console.error(error);
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (filterErr) {
      if (this.dependentLength) {
        this.dfmFilterData.headerContent[0]['data'] = this.dfmFilterData.headerContent[0]['data'].slice(this.dependentLength, this.dfmFilterData.headerContent[0]['data']['length']);
        this.dependentLength = 0;
      }
      this.loaders['leftFilters'] = false;
      this.loaders['topFilters'] = false;
      console.error(filterErr);
    }
  }

  expandAllFilters() {
    try {
      for (let secInd = 0; secInd < this.dfmFilterData.headerContent?.length; secInd++) {
        this.dfmFilterData.headerContent[0].data.forEach((element, fieldInd) => {
          if (element.key !== 'survey') {
            const event: any = {
              key: element.key,
              type: element.type,
              sectionIndex: secInd,
              fieldIndex: fieldInd,
              page: 1,
              records: 50,
            }
            this.getFieldData(event, true);
          }
        });
      }
    } catch (expandErr) {
      console.error(expandErr);
    }
  }

  getLegends(wId, ind, isTable?) {
    try {
      let eachData: any = this.allWidgets[ind] || {};
      let mapPayload: any = {
        applied_filters: { ...(eachData?.filterProps?.filters || {}) },
        selected_column: eachData?.mapProps?.selectedParam || null,
        mapOptions: eachData?.mapProps?.showInMap
      };
      let mapSettings: any = {
        zoom: eachData?.mapProps?.zoom,
        center: eachData?.mapProps?.center,
        tilt: eachData?.mapProps?.tilt,
      };
      if (!mapPayload.applied_filters?.survey || !mapPayload.applied_filters?.survey_period) {
        return;
      }
      const legendJSON: any = {
        survey: mapPayload.applied_filters?.survey,
        survey_period: mapPayload.applied_filters?.survey_period
      }
      this.setLoaderVar(wId);
      if(isTable) {
        this.widgetLoaders[wId]['table'] = true;
      } else {
        this.widgetLoaders[wId]['map'] = true;
      }
      this.appservice.getLegends(legendJSON).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.widgetData[wId].legends = respData?.data || {};
          mapPayload['legends'] = Object.keys(this.widgetData[wId].legends || {}) || [];
          if(isTable) {
            this.widgetLoaders[wId]['table'] = false;
            this.getColdefs(mapPayload, wId)
          }
          else {
            this.widgetLoaders[wId]['map'] = false;
            this.getMapData(mapPayload, mapSettings, wId);
          }
        } else {
          if(isTable) {
            this.widgetLoaders[wId]['table'] = false;
          } else {
            this.widgetLoaders[wId]['map'] = false;
          }
          this.widgetData[wId].legends = {};
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        if(isTable) {
          this.widgetLoaders[wId]['table'] = false;
        } else {
          this.widgetLoaders[wId]['map'] = false;
        }
        this.widgetData[wId].legends = {};
        console.error(error);
        this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (legendErr) {
      if(isTable) {
        this.widgetLoaders[wId]['table'] = false;
      } else {
        this.widgetLoaders[wId]['map'] = false;
      }
      this.widgetData[wId].legends = {};
      console.error(legendErr);
    }
  }

  getFieldData(event: any, isFirstTime?: any, parentKey?) {
    try {
      let payload: any = {
        applied_filters: {
          survey: this.filters?.survey,
          survey_period: this.filters?.survey_period,
        } || {},
        type: event.type,
        key: event.key,
      }
      if (parentKey) {
        payload['applied_filters'][parentKey] = this.filters[parentKey];
      }
      if (event?.type !== 'range') {
        payload['page'] = isFirstTime ? 1 : this.dfmFilterData?.headerContent?.[event?.sectionIndex]?.['data']?.[event?.fieldIndex]?.['page'] || 1;
        payload['records'] = 50;
        if (event?.end_of_records) {
          return;
        }
      };
      this.loaders.fields = true;
      this.appservice.getFieldData(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          if (event?.type === 'range') {
            if (respData?.data && !isNaN(respData?.data?.minValue) && !isNaN(respData?.data?.maxValue)) {
              this.injectRangeData(respData, event, 'left');
            } else {
              this.loaders.fields = false;
              this.toaster.toast('info', 'Info', respData.message || 'No Range Found.', true);
            }
          } else if (['advMultiSelect', 'simpleRadioSelect', 'advRadioSelect'].includes(event?.type)) {
            if (!respData?.data || !respData?.data?.length) {
              respData.data = [];
              if (event.key !== 'survey_period') {
                const id: any = this.getWidgetId();
                if (!(id > -1)) {
                  return;
                }
                this.allWidgets[id]['filterProps']['filters'][event.key] = null;
                this.filters[event.key] = null;
                this.dfmFilterData.bodyContent[event.key] = null;
                this.filters = { ...this.filters };
                this.dfmFilterData = { ...this.dfmFilterData };
                this.allWidgets[id]['filterProps']['filters'] = { ...this.allWidgets[id]['filterProps']['filters'] };
              }
            }
            if (!this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]?.options || !this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]?.options?.length) {
              this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex].options = [];
            }
            if (isFirstTime) {
              this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['options'] = respData?.data?.length ? respData?.data || [] : [];
            } else {
              this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['options'] = [...this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['options'], ...respData?.data];
            }
            this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['page'] = (payload?.page || 1) + 1;
            this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['end_of_records'] = respData?.end_of_records || false;
            this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['showTab'] = true;
            this.dfmFilterData = { ...this.dfmFilterData };
            if (event?.key === "survey_period") {
              this.loaders.leftFilters = true;
              setTimeout(() => {
                this.loaders.leftFilters = false;
              }, 1000);
            }
            this.loaders.fields = false;
          } else {
            this.loaders.fields = false;
          }
        } else {
          this.loaders.fields = false;
          this.toaster.toast('error', 'Error', respData.message || 'Error while fetching data', true);
        }
      }, (error) => {
        console.error(error);
        this.loaders.fields = false;
        this.toaster.toast('error', 'Error', 'Error while fetching data.', true);
      },
      );
    } catch (error) {
      this.loaders.leftFilters = false;
      this.loaders.fields = false;
      console.error(error);
    }
  }

  injectRangeData(respData: any, event: any, pos: any) {
    try {
      if (pos === 'left') {
        if (this.dfmFilterData?.headerContent?.[event?.sectionIndex]?.['data']?.length) {
          this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex] = { ...this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex], ...(respData?.data ? respData.data || {} : {}), ...{ showTab: true } };
          const id: any = this.getWidgetId();
          if (!(id > -1)) {
            return;
          }
          this.allWidgets[id]['filterProps']['filters'][event?.key] = this.filters[event?.key] = this.dfmFilterData.bodyContent[event.key] = this.filters[event?.key] || {
            min: respData?.data?.minValue,
            max: respData?.data?.maxValue,
          };
          this.dfmFilterData = { ...this.dfmFilterData };
        }
        this.loaders.fields = false;
      }
    } catch (injectErr) {
      this.loaders.fields = false;
      this.loaders['leftFilters'] = false;
      console.error(injectErr);
    }
  }

  emitDFMDisplayField(event) {
    try {
      if (!event || !event?.key) {
        return
      }
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      if (event?.key === 'map_options') {
        for (let eachKey of Object.keys(this.allWidgets[id]?.mapProps?.showInMap)) {
          this.allWidgets[id].mapProps.showInMap[eachKey] = event?.value?.includes(eachKey) ? true : false;
        }
        this.allWidgets[id].mapProps.showInMap = { ...this.allWidgets[id]?.mapProps?.showInMap };
      } else if (event?.key === 'map_parameters') {
        this.allWidgets[id].mapProps['selectedParam'] = event?.value;
        this.getLegends(this.activeWidget?.wId, id);
      } else if (event?.key === 'chart_parameters') {
        this.allWidgets[id]['chartProps']['selected_column'] = event?.value;
        this.getChartData(this.activeWidget?.wId, id);
      } else if (event?.key === 'tooltip_parameters') {
        this.allWidgets[id]['mapProps']['tooltipParams'] = event?.value;
        this.allWidgets[id]['mapProps']['tooltipParams'] = [...this.allWidgets[id]['mapProps']['tooltipParams']];
      }
      else if (event?.key === "show_marklines") {
        this.allWidgets[id]['chartProps']['markLines'] = event?.value;
        this.getChartData(this.activeWidget?.wId, id);
      }else if(event?.key === 'legends_parameters') {
        this.allWidgets[id].mapProps['selectedLegends'] = event?.value;
        this.allWidgets[id].mapProps['selectedLegends'] = [ ...this.allWidgets[id].mapProps['selectedLegends'] ];
      }
    } catch (error) {
      console.log(error)
    }
  }
  emitOnScroll(event) {
    try {
      if (event?.key !== 'survey' && ['advMultiSelect', 'simpleRadioSelect', 'advRadioSelect'].includes(event?.type) && event?.emitType === 'infiniteScroll') {
        this.getFieldData(event);
      }
    } catch (eventErr) {
      console.error(eventErr);
    }
  }

  clearAllFilters() {
    try {
      this.filters = {
        survey: this.filters?.survey,
      };
      this.loaders['dfm'] = true;
      for (let eachSec of this.dfmFilterData?.headerContent) {
        for (let eachField of eachSec?.data) {
          if (eachField?.type === 'advMultiSelect') {
            for (let eachOpt of eachField?.options) {
              eachOpt['IsSelected'] = false;
            }
            eachField['showTab'] = false;
          } else if (eachField?.type === 'simpleRadioSelect' || eachField?.type === 'advRadioSelect') {
            // eachField['showTab'] = false;
          } else if (eachField?.type === 'range') {
            // eachField['showTab'] = false;
          }
        }
      }
      this.dfmFilterData.bodyContent = { ...this.filters };
      this.dfmFilterData = { ...this.dfmFilterData };
      const id: any = this.getWidgetId();
      if (!(id > -1)) {
        return;
      }
      this.widgetData[id]['filterProps']['filters'] = {...this.filters};
      setTimeout(() => {
        this.loaders['dfm'] = false;
      }, 10);
      this.getDeptFilters({ survey: this.filters.survey });
      // this.getDisplayOptions({ survey: this.filters.survey });
    } catch (filterErr) {
      this.loaders['dfm'] = false;
      console.error(filterErr);
    }
  }

  showMoreOpt(event) {
    try {
      let dataVar: any = null;
      if (this.selectedTab === 'filters') {
        dataVar = 'dfmFilterData';
      } else if (this.selectedTab === 'display_options') {
        dataVar = 'displayFilterData';
      }
      for (let eachItem of this?.[dataVar]?.headerContent) {
        for(let eachData of eachItem['data']) {
         if (event === 'expand') {
          eachData['showTab'] = true;
          } else if (event === 'collapse') {
            eachData['showTab'] = false;
          }
        }
      }
    } catch (moreFilterErr) {
      console.error(moreFilterErr);
    }
  }

  getFilters(selected?) {
    try {
      this.loaders['topFilters'] = true;
      this.appservice.defaultVisualizeFilters().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          const surveyInd = respData.data?.headerContent?.[0]?.data.findIndex((ele: any) => ele.key === 'survey');
          if (surveyInd > -1) {
            respData.data.headerContent[0]['data'][surveyInd]['showTab'] = true;
          }
          this.dfmFilterData = JSON.parse(JSON.stringify(respData?.data)) || {
            headerContent: [],
            bodyContent: [],
            userActions: []
          };
          const id: any = this.getWidgetId();
          if (!(id > -1)) {
            return;
          }
          this.allWidgets[id]['filterProps']['filters'] = this.dfmFilterData.bodyContent = this.filters = { ...(this.dfmFilterData?.bodyContent || {}), ...this.filters };
          if (respData.data?.headerContent?.[0]?.data?.length) {
            if (this.filters?.survey) {
              this.getDeptFilters({ survey: this.filters.survey }, selected ? selected : null);
            }
          }
          this.loaders['topFilters'] = false;
        } else {
          this.loaders['topFilters'] = false;
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching filters data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders['topFilters'] = false;
        this.toaster.toast('error', 'Error', 'Error while fetching filters data.');
      });
    } catch (filterErr) {
      this.loaders['topFilters'] = false;
      console.error(filterErr);
    }
  }

  openAllFilters() {
    try {
      if (!this.activeWidget?.wId) {
        this.toaster.toast('info', 'Info', 'Please select any widget to apply filters.');
        return;
      }
      setTimeout(() => {
        this.gridSterConfigurations();
      }, 0);
      if (!this.selectedTab) {
        this.selectedTab = this.tabs[0]['value'];
      }
      if (this.showFilterOptions) {
        this.showFilters();
        return;
      }
      if (!this.dfmFilterData?.headerContent?.[0]?.data?.length) {
        return;
      }
      for (let eachItem of this.dfmFilterData.headerContent[0]['data']) {
        if (eachItem['key']) {
          eachItem['showTab'] = true;
        }
      }
      this.dfmFilterData = { ...this.dfmFilterData };
      this.showFilters();
    } catch (openAllErr) {
      console.error(openAllErr);
    }
  }

  getWidgetId() {
    try {
      const widId: any = this.allWidgets.findIndex((ele: any) => ele.wId === this.activeWidget.wId);
      if (widId > -1) {
        return widId;
      }
      return -1;
    } catch (idErr) {
      console.error(idErr);
    }
  }

  hoverEmitter(event) {
    try {
      if (event) {
        this.visualCharts.forEach((ele: any) => {
            let echartInstance: any = ele.chartInstance;
            echartInstance.dispatchAction({
              type: 'showTip',
              dataIndex: this.getDataIndex(ele?.chartOptions?.series?.[0]?.data || [], event.data[0]),
              seriesIndex: 0,
            });
        })
      }
    } catch (hoverErr) {
      console.error(hoverErr);
    }
  }

  mouseOutEmitter(event) {
    try {
      if (event) {
        this.visualCharts.forEach((ele: any) => {
            let echartInstance: any = ele.chartInstance;
            echartInstance.dispatchAction({
              type: 'hideTip',
              dataIndex: this.getDataIndex(ele?.chartOptions?.series?.[0]?.data || [], event.data[0]),
              seriesIndex: 0
            });
        })
      }
    } catch (outErr) {
      console.error(outErr);
    }
  }

  getDataIndex(data, xCoord) {
    try {
      const dataInd: any = data.findIndex((ele: any) => ele[0] === xCoord);
      return dataInd > -1 ? dataInd : -1;
    } catch (coordErr) {
      console.error(coordErr);
    }
  }
}
