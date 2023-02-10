import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from '../../../services/app.service';
import { ToasterService } from '../../../shared/toastr/toaster.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonPopupService } from '../../../shared/common-popup/common-popup.service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../guards/auth.service';
import { AgGridTableComponent } from '../../../shared/ag-grid-table/ag-grid-table.component';
import { MapsComponent } from '../../../shared/maps/maps.component';
import { Config } from '../../../config/config';
import { UtilityFunctions } from '../../../utilities/utility-func';

@Component({
  selector: 'ucp-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.scss']
})
export class VisualizeComponent implements OnInit, OnDestroy {

  @ViewChild(MapsComponent) mapDetails
  @ViewChild(AgGridTableComponent) gridDetails

  public destroy$: Subject<boolean> = new Subject<boolean>();
  public dfmData: any = {};
  public mapData: any;
  public workSpaceDet: FormGroup = new FormGroup({
    workspace_name: new FormControl({ value: null, disabled: false }, [Validators.required]),
  });
  public workSpaceData: any = [];
  public dfmFilterData: any = {};
  public workSpaceType: any = "visualize";
  public dependentLength: any = 0;
  public loaders: any = {
    showMap: false,
    leftFilters: false,
    topFilters: false,
    workSpace: false,
    fields: false,
    mapOptions: false,
    tableData: false,
    dfm: false,
  };
  public Form_filled_data: any = {
    slider: {},
  };
  public showChainages: any = false;
  public legends: any;
  // public showOptions: any = [];
  public showTogglePopover;
  public showFilterOptions;
  public activeTab: any = null;
  public tableState: any;
  public subscription: Subscription;
  public aggridData: any;
  public mapOptions: any = {
    // "center": {
    //   "lat": null,
    //   "lng": null,
    // },
    // "zoom": 10.4,
    "heading": 10,
    "tilt": 47.5,
    "mapTypeId": 'satellite',
    "mapId": null,
    "mapTypeControl": false,
    "streetViewControl": false,
  }
  public filters: any = {};
  public visibleFilters: any = [];
  public userRolePermissions: any = {};
  public filterPinned: any = true;
  public chartOptions: any;
  public mappayload: any;
  public selectedIndex: number;

  public selectedTab: any = null;
  public choosenTab: any = null;
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
  public displayFilterData: any = {};
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
      name: "Save",
      value: 'save'
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
  public theme: any = 'ag-theme-balham';
  public chartType: any = 'line';
  public tableEle: any;
  public wrapper: any;
  public handler: any;
  public tableHeight: any;
  public mapOptionsChartSatelite: any;
  public enableAutoResize: any= false;

  constructor(private appservice: AppService, private toaster: ToasterService, public commonPopup: CommonPopupService, private route: ActivatedRoute, private _auth: AuthService, private _util: UtilityFunctions) {
    const visPerm = this._auth.getUserPermissions('visualize');
    if (visPerm) {
      this.userRolePermissions['create'] = visPerm['create'];
      this.userRolePermissions['edit'] = visPerm['edit'];
      this.userRolePermissions['delete'] = visPerm['delete'];
      this.userRolePermissions['view'] = visPerm['view'];
      this.userRolePermissions['share'] = visPerm['share'];
    }
    this.route.queryParams.subscribe((params) => {
      if (params && params['project_id']) {
        this.reInitializeVariables();
        this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
      }
    });
    this.subscription = this.commonPopup.loaderState.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['confirmation'] === 'Yes') {
        if (data['action'] === 'delete_workspace') {
          this.confirmConfDelete(data?.data);
        }
      }
    });
  }

  ngOnInit() {
    this.loadWorkSpace({type: 'list', workspace_type: this.workSpaceType});
    this.switchTabs(this.tabs[0]);
  }

  reInitializeVariables() {
    try {
      this.activeTab = null;
      this.filters = {};
      this.aggridData = {};
      this.mapData = null;
      this.dfmFilterData = {};
      this.dfmData = {};
      this.dependentLength = 0;
      this.workSpaceData = [];
    } catch (varErr) {
      console.error(varErr);
    }
  }

  getFilters() {
    try {
      this.loaders['topFilters'] = true;
      this.appservice.defaultVisualizeFilters().pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          const surveyInd = respData.data?.headerContent?.[0]?.data.findIndex((ele: any) => ele.key === 'survey');
          if (surveyInd > -1) {
            respData.data.headerContent[0]['data'][surveyInd]['showTab'] = true;
            // if (!this.filters?.survey) {
            //   this.filters['survey'] = this.dfmFilterData.bodyContent['survey'] = respData.data.headerContent[0]['data'][surveyInd]?.['options']?.[0]?.value || null;
            // }
          }
          this.dfmFilterData = JSON.parse(JSON.stringify(respData?.data)) || {
            headerContent: [],
            bodyContent: [],
            userActions: []
          };
          this.dfmFilterData.bodyContent = this.filters = { ...(this.dfmFilterData?.bodyContent || {}), ...this.filters };
          if (respData.data?.headerContent?.[0]?.data?.length) {
            if (this.filters?.survey) {
              this.getDeptFilters();
            }
          }
          this.loaders['topFilters'] = false;
        } else {
          this.loaders['topFilters'] = false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders['topFilters'] = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (filterErr) {
      this.loaders['topFilters'] = false;
      console.error(filterErr);
    }
  }

  loadWorkSpace(payload) {
    try {
      this.loaders.workSpace = true;
      this.appservice.listingWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.workSpaceData = respData.data?.length ? respData.data || [] : [];
          if (!this.activeTab && this.workSpaceData?.length) {
            this.changeActiveTab(this.workSpaceData[0])
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

  emitDFMField(event, position?) {
    try {
      if (!event || !event?.key) {
        return
      }
      if (event?.key === 'survey' && event.type === 'simpleRadioSelect' && event.emitType === 'simpleRadioClick') {
        this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex]['showTab'] = true;
        return;
      }
      if (position === 'top' || position === 'left') {
        this.filters = this.dfmData.bodyContent = this.dfmFilterData.bodyContent = { ...this.filters, ...event['bodyContent'] } || {};
        this.dfmData = { ...this.dfmData };
        this.dfmFilterData = { ...this.dfmFilterData };
      }
      if (event.key === 'survey' && event?.value) {
        this.filters = this.dfmData.bodyContent = this.dfmFilterData.bodyContent = { [event.key]: event?.value || '' };
        this.visibleFilters = [];
        this.mapOptions['selectedChartParams'] = null;
        this.displayOptions['markLines'] = null;
        this.displayOptions['selectedLegends'] = null;
        this.displayOptions['tooltipParams'] = null;
        this.mapOptions['selectedParam'] = null;
        this.displayOptions.mapParams = this.displayOptions.mapParams || {};
        this.getDisplayOptions({ [event.key]: event?.value || '' });
        this.getDeptFilters();
      } else if (event.key === 'survey_period' && event?.value) {
        this.filters = this.dfmData.bodyContent = this.dfmFilterData.bodyContent = { [event.key]: event?.value || '', survey: this.filters?.survey };
        this.getDeptFilters(true);
      } else if (event.hasOwnProperty('value')) {
        if (event?.disableDependentKey) {
          if (event?.value) {
            delete this.filters[event?.disableDependentKey];
            delete this.dfmFilterData.bodyContent[event?.disableDependentKey];
          }
        }
        this.getLegends();
      }
      if (event?.type === 'range') {
        if (event.emitType === 'rangePickerClick') {
          this.getFieldData(event);
        }
        if (event.emitType === 'rangeSliderEmitter') {
          this.getLegends();
        }
      }
      if ((event.emitType === 'advMultiSelectClick' && event.type === 'advMultiSelect') ||
        (event.emitType === 'simpleRadioClick' && event.type === 'simpleRadioSelect') || (event.emitType === 'advRadioClick' && event.type === 'advRadioSelect')) {
        this.getFieldData(event, true);
      }
      // this.refreshFields(event, position);
    } catch (eventErr) {
      this.loaders['leftFilters'] = false;
      this.loaders['topFilters'] = false;
      console.error(eventErr);
    }
  }

  public displayOptions: any = {
    mapParams: {
      show_chainages: true,
      show_survey: true,
      show_legends: true,
      show_pipeline_segment : true,
    },
    markLines: null,
    tooltipParams: [],
    selectedLegends: [],
  };
  emitDFMDisplayField(event) {
    try {
      if (!event || !event?.key) {
        return
      }
      if (event?.key ==='map_options') {
        for (let eachKey of Object.keys(this.displayOptions?.mapParams)) {
          this.displayOptions.mapParams[eachKey] = event?.value?.includes(eachKey) ? true : false;
        }
        this.displayOptions.mapParams = {...this.displayOptions.mapParams};
        // this.getLegends();
      } else if (event?.key === 'map_parameters') {
        this.mapOptions['selectedParam'] = event?.value;
        this.getLegends();
      } else if (event?.key === 'chart_parameters') {
        this.mapOptions['selectedChartParams'] = event?.value;
        this.getChartData();
      } else if (event?.key === 'tooltip_parameters') {
        this.displayOptions['tooltipParams'] = event?.value;
        this.displayOptions['tooltipParams'] = [ ...this.displayOptions['tooltipParams'] ];
      }
      else if(event?.key === "show_marklines") {
        this.displayOptions['markLines'] = event?.value;
        this.getChartData();
      } else if(event?.key === 'legends_parameters') {
        this.displayOptions['selectedLegends'] = event?.value;
        this.displayOptions['selectedLegends'] = [ ...this.displayOptions['selectedLegends'] ];
      }
    } catch (error) {
      console.log(error)
    }
  }

  refreshFields(event, position) {
    try {
      let eventFieldIndex: any;
      if (!event?.fieldIndex) {
        eventFieldIndex = this.dfmFilterData.headerContent[event.sectionIndex]['data'].findIndex((ele: any) => ele.key === event?.key);
      } else {
        eventFieldIndex = event?.fieldIndex;
      }
      const dfmField = this.dfmFilterData.headerContent[event.sectionIndex]['data'][eventFieldIndex] || {};
      if (dfmField?.refresh_filters?.length) {
        for (let eachField of dfmField?.refresh_filters) {
          const fieldInd: any = this.dfmFilterData.headerContent[event.sectionIndex]['data'].findIndex((ele: any) => ele.key === eachField);
          if (fieldInd > -1) {
            if (this.dfmFilterData.headerContent[event.sectionIndex]['data'][fieldInd]?.showTab) {
              // this.filters[this.dfmFilterData.headerContent[event.sectionIndex]['data'][fieldInd]['key']] = null;
              let eventPayload: any = {
                fieldIndex: fieldInd,
                sectionIndex: event.sectionIndex,
                type: this.dfmFilterData.headerContent[event.sectionIndex]['data'][fieldInd]['type'],
                key: this.dfmFilterData.headerContent[event.sectionIndex]['data'][fieldInd]['key'],
                page: 1,
                records: 50,
              }
              this.getFieldData(eventPayload, true, event?.key);
            }
          }
        }
      }
    } catch (refreshErr) {
      console.error(refreshErr);
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

  getMapData() {
    try {
      this.mappayload = {
        applied_filters: { ...this.filters }
      };
      if (this.mapOptions['selectedParam']) {
        this.mappayload['selected_column'] = this.mapOptions['selectedParam']
      }
      this.mappayload["mapOptions"] = this.displayOptions?.mapParams;
      this.mappayload['legends'] = Object.keys(this.legends || {});
      this.getFiltersAndColdefs(this.mappayload);
      this.loaders['showMap'] = true;
      this.appservice.getMapData(this.mappayload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData['status'] === 'success') {
          this.mapData = respData?.data?.map_data || null;         
          this.mapOptions.mapId = environment.mapId;
          // const mapcenterInd = Math.round((respData?.data?.map_data?.markers.length / 2) || (respData?.data?.map_data?.polylines?.[0]?.path.length / 2)); 
          const mapcenterInd = Math.round((respData?.data?.map_data?.markers ? respData?.data?.map_data?.markers.length : respData?.data?.map_data?.polylines?.[0]?.path.length) / 2)
          this.mapOptions.center = this.mapOptions['center'] || respData?.data?.map_data?.markers?.[(mapcenterInd - 3)] || respData?.data?.map_data?.polylines?.[0]?.path[(mapcenterInd)] || { lat: 24.127831666666665, lng: 52.8955 };
          const projectDet: any = this._auth.getProjectDetails();
          this.mapOptions['center'] = this.mapOptions['center'] || (projectDet?.map_center?.lat && projectDet?.map_center?.lng ?  projectDet.map_center : false) || respData?.data?.map_data?.markers?.[(mapcenterInd - 3)] || respData?.data?.map_data?.polylines?.[0]?.path[(mapcenterInd)] || { lat: 24.127831666666665, lng: 52.8955 };
          this.mapOptions['zoom'] = this.mapOptions['zoom'] || projectDet?.zoom_level || 9;
          this.mapOptions = { ...this.mapOptions };
          this.mapData = { ...this.mapData };
          this.loaders['showMap'] = false;
        } else {
          this.loaders['showMap'] = false;
          this.mapData = {
            legends: {},
            markers: [],
            polylines: []
          };
          this.mapData = {...this.mapData};
          const projectDet: any = this._auth.getProjectDetails();
          this.mapOptions['center'] = (projectDet?.map_center?.lat && projectDet?.map_center?.lng ?  projectDet.map_center : false) || { lat: 24.127831666666665, lng: 52.8955 };
          this.mapOptions['zoom'] = projectDet?.zoom_level || 9;
          this.mapOptions = { ...this.mapOptions };
          this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching map data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders['showMap'] = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    } catch (dataErr) {
      this.loaders['showMap'] = false;
      this.loaders['leftFilters'] = false;
      this.loaders['topFilters'] = false;
      this.loaders['dfm'] = false;
      console.error(dataErr);
    }
  }

  getDeptFilters(isSurveyPeriodChanged?: any) {
    try {
      const data: any = { survey: this.filters.survey };
      if (isSurveyPeriodChanged) {
        data['survey_period'] = this.filters?.survey_period;
      }
      this.loaders['leftFilters'] = true;
      this.appservice.getDependentFilters(data).pipe(takeUntil(this.destroy$)).subscribe(dependentRes => {
        if (dependentRes && dependentRes.status === 'success') {
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
            this.dfmFilterData.bodyContent = this.filters = { ...(dependentRes?.data?.bodyContent || {}), ...this.filters } || {};
            this.dfmFilterData = { ...this.dfmFilterData };
            this.expandAllFilters(isSurveyPeriodChanged ? true : false);
          }
          this.loaders['leftFilters'] = false;
          this.getLegends();
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
          // this.displayOptions = this.displayFilterData?.bodyContent || {};
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
      let selectedKeys: any = [];
      for (let eachItem in this.displayOptions?.mapParams) {
        if (this.displayOptions?.mapParams?.[eachItem]) {
          selectedKeys.push(eachItem);
        }
      }
      this.displayFilterData['bodyContent']['map_options'] = selectedKeys || [];
      this.displayFilterData = { ...this.displayFilterData }; 
    } catch (optErr) {
      console.error(optErr);
    }
  }

  assignMapParam() {
    try {
      this.loaders['leftFilters'] = true;
      setTimeout(() => {
        this.displayFilterData['bodyContent']['map_parameters'] = this.mapOptions['selectedParam'];
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
      if (this.mapOptions['selectedParam']) {
        this.assignMapParam();
      }
      setTimeout(() => {
        if (!this.displayFilterData?.bodyContent?.map_parameters) {
          for (let eachHead of this.displayFilterData?.headerContent) {
            if (eachHead?.data?.length) {
              const mapInd: any = eachHead?.data.findIndex((ele: any) => ele.key === 'map_parameters');
              if (mapInd > -1) {
                const findInd = eachHead?.data[mapInd]?.['options']?.findIndex((ele: any) => ele.value === this.mapOptions['selectedParam']);
                if (!(findInd > -1) || !this.mapOptions['selectedParam']) {
                  this.mapOptions['selectedParam'] = eachHead?.data[mapInd]?.['options']?.[0]?.['value'] || null;
                }
                break;
              }
            }
          }
          this.assignMapParam();
        } else {
          this.mapOptions['selectedParam'] = this.displayFilterData?.bodyContent?.map_parameters || null;
        }
      }, 0);
    } catch(setParamErr) {
      this.loaders['leftFilters'] = false;
      console.error(setParamErr);
    }
  }

  setChartParameters(key?) {
    try {
      if (this.mapOptions['selectedChartParams']) {
        this.displayFilterData['bodyContent']['chart_parameters'] = this.mapOptions['selectedChartParams'];
        this.displayFilterData = { ...this.displayFilterData };
      } else {
        this.mapOptions['selectedChartParams'] = this.displayFilterData?.bodyContent?.chart_parameters || null;
      }
    } catch(setCParamErr) {
      console.error(setCParamErr);
    }
  }

  setChartMarklines() {
    try {
      if (this.displayOptions['markLines']) {
        this.displayFilterData['bodyContent']['show_marklines'] = this.displayOptions['markLines'];
        this.displayFilterData = { ...this.displayFilterData };
      } else {
        this.displayOptions['markLines'] = this.displayFilterData?.bodyContent?.show_marklines || null;
      }
    } catch(markLineError) {
      console.error(markLineError);
    }
  }

  setTooltipParameters() {
    try {
      if (this.displayOptions['tooltipParams'] && this.displayOptions['tooltipParams']?.length) {
        this.displayFilterData['bodyContent']['tooltip_parameters'] = this.displayOptions['tooltipParams'];
        this.displayFilterData = { ...this.displayFilterData }; 
      } else {
        this.displayOptions['tooltipParams'] = this.displayFilterData?.bodyContent?.tooltip_parameters || null;
      }
    } catch(setTTParamErr) {
      console.error(setTTParamErr);
    }
  }

  setLegends() {
    try {
      if (this.displayOptions['selectedLegends'] && this.displayOptions['selectedLegends']?.length) {
        this.displayFilterData['bodyContent']['legends_parameters'] = this.displayOptions['selectedLegends'];
        this.displayFilterData = { ...this.displayFilterData }; 
      } else {
        this.displayOptions['selectedLegends'] = this.displayFilterData?.bodyContent?.legends_parameters || null;
      }
    } catch(setLParamErr) {
      console.error(setLParamErr);
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

  showToggleButtons() {
    this.showTogglePopover = !this.showTogglePopover;
  }

  close(id) {
    const close = document.getElementById(id);
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
    this.showFilterOptions = !this.showFilterOptions;
  }

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

  openAllFilters() {
    try {
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

  onDateSelect(event: any, key: any) {
    try {
      const dateString = new Date(event).toISOString().split('.')[0] + 'Z';
      this.Form_filled_data[key] = dateString;
    } catch (error) {
      console.error(error);
    }
  }

  showFilterRangeSlider(allFilters, sliderTrack) {
    // allFilters.showSlider = !allFilters.showSlider;
    if (!this.Form_filled_data[allFilters.key]) {
      this.Form_filled_data[allFilters.key] = {
        min: allFilters.minValue,
        max: allFilters.maxValue,
      };
    }
    setTimeout(() => {
      this.sliderOne(allFilters, sliderTrack)
      this.sliderTwo(allFilters, sliderTrack)
    }, 100);
  }

  sliderOne(allFilters, sliderTrack) {
    let sliderOne = this.Form_filled_data[allFilters.key]['min'];
    const sliderTwo = this.Form_filled_data[allFilters.key]['max'];
    const minGap = allFilters.minGap;
    const maxValue = allFilters.maxValue;
    if (parseInt(sliderTwo) - parseInt(sliderOne) <= minGap) {
      sliderOne = parseInt(sliderTwo) - minGap;
      this.Form_filled_data[allFilters.key]['min'] = sliderOne;
    }
    this.fillColor(sliderOne, sliderTwo, sliderTrack, maxValue);
  }
  sliderTwo(allFilters, sliderTrack) {
    const sliderOne = this.Form_filled_data[allFilters.key]['min'];
    let sliderTwo = this.Form_filled_data[allFilters.key]['max'];
    const minGap = allFilters.minGap;
    const maxValue = allFilters.maxValue;
    if (parseInt(sliderTwo) - parseInt(sliderOne) <= minGap) {
      sliderTwo = parseInt(sliderOne) + minGap;
      this.Form_filled_data[allFilters.key]['max'] = sliderTwo;
    }
    this.fillColor(sliderOne, sliderTwo, sliderTrack, maxValue);
  }
  fillColor(sliderOne, sliderTwo, sliderTrack, sliderMaxValue) {
    const percent1 = (sliderOne / sliderMaxValue) * 100;
    const percent2 = (sliderTwo / sliderMaxValue) * 100;
    sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #3264fe ${percent1}% , #3264fe ${percent2}%, #dadae5 ${percent2}%)`;
  }
  clearRangeValue(allFilters: any, sliderTrack: any) {
    try {
      this.Form_filled_data[allFilters.key]['min'] = 0;
      this.Form_filled_data[allFilters.key]['max'] = 500;
      this.sliderOne(allFilters, sliderTrack);
      this.sliderTwo(allFilters, sliderTrack);
    } catch (error) {
      console.error(error);
    }
  }

  workSpaceEmitterData(event) {
    if (event?.type) {
      switch (event?.type) {
        case 'add':
          this.addWorkSpace();
          break;
        case 'changetab':
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
        case 'move' :
          this.moveWorkSpace(event?.workSpaceData);
          break;
        case 'move_left' :
          this.moveLeftRightWorkspaceUpdate(event);
          break;
        case 'move_right':
          this.moveLeftRightWorkspaceUpdate(event);
      }
    }
  }
  moveWorkSpace(data)
  {
    try {
      let payload = {
        "type" : "move",
        "workspace_type": this.workSpaceType,
        "workspace_ids" : data.map((e)=> e.workspace_id ),
      }
      this.appservice.configureWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if( respData && respData?.status === 'success')
        {
         this.workSpaceData = data;
         this.workSpaceData = [...this.workSpaceData ];
        }
        else{
          this.workSpaceData = [...this.workSpaceData ];
        }
      }, (err)=>{
        this.workSpaceData = [...this.workSpaceData ];
        console.error(err);
      });
    } catch (error) {
      console.error(error);
    }
  }
  moveLeftRightWorkspaceUpdate(event)
  {
    try {
      let holdElement = this.workSpaceData[event.ind];
      this.workSpaceData[event.ind] = this.workSpaceData[event.type === 'move_left' ? --event.ind : ++event.ind];
      this.workSpaceData[event.ind] = holdElement;
      this.moveWorkSpace(this.workSpaceData);
    } catch (error) {
      console.error(error);
    }
  }
  addWorkSpace() {
    try {
      this.loadWorkSpace({ type: 'new', workspace_type: this.workSpaceType });
    } catch (modalErr) {
      console.error(modalErr);
    }
  }

  editWorkspace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    this.workSpaceData[ind]['isInput'] = true;
  }

  duplicateWorkSpace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    if (!this.workSpaceData[ind]['workspace_id']) {
      return;
    }
    this.loadWorkSpace({ type: 'duplicate', workspace_id: this.workSpaceData[ind]['workspace_id'], workspace_type: this.workSpaceType });
  }

  saveWorkspace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    this.tableEle =  document.querySelector('.table-main-div');
    if(this.tableEle?.style) {
       this.tableHeight = this.tableEle?.style.height;
    }
    this.tableHeight =  this.tableHeight.replace("px","");
    // var pixels = this.tableHeight;    
    // var screenHeight = window.screen.height;
    // this.tableHeight = (pixels / screenHeight) * 100;    
    this.workSpaceData[ind]['isInput']  = false;
    const saveState = this.gridDetails?.getTableState() || [];
    const mapPos: any = this.mapDetails.getMapPosition();
    const payload = {
      "type": "save",
      "workspace_type": this.workSpaceType,
      "workspace_name": this.workSpaceData[ind].workspace_name,
      "workspace_id": this.workSpaceData[ind].workspace_id,
    };
    payload[this.workSpaceType] = { 
      "filters": this.filters || {},
      "tableState": saveState,
      "showInMap": this.displayOptions?.mapParams || {},
      "showFilterOptions": this.showFilterOptions,
      "pinFilters": this.filterPinned,
      "mapState" : {
        "mapMode": this.mapOptions.activeMapType,
        mapPosition: mapPos,
      },
      "selectedVisual": this.mapOptions['selectedVisualType'],
      "chartType": this.chartType,
      "tableHeight" : this.tableHeight || null,
    }
    if (this.mapOptions['selectedParam']) {
      payload[this.workSpaceType].mapState['mapOptions'] = this.mapOptions['selectedParam']
    }
    if (this.mapOptions['selectedChartParams']) {
      payload[this.workSpaceType]['chartParams'] = this.mapOptions['selectedChartParams'] || [];
    }
    if (this.displayOptions['tooltipParams']) {
      payload[this.workSpaceType]['tooltipParams'] = this.displayOptions['tooltipParams'] || [];
    }
    if (this.displayOptions['selectedLegends']) {
      payload[this.workSpaceType]['legends_parameters'] = this.displayOptions['selectedLegends'] || [];
    }
    if (this.displayOptions['markLines']) {
      payload[this.workSpaceType]['markLines'] = this.displayOptions['markLines'] || null;
    }
    this.appservice.configureWorkSpace(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
      if (respData && respData['status'] === 'success') {
        this.workSpaceData.data = respData;
        this.toaster.toast('success', 'Success', respData['message'] || 'Workspace saved successfully.');
        this.loadWorkSpace({ type: 'list', workspace_type: this.workSpaceType });
      } else {
        this.toaster.toast('error', 'Error', respData['message'] || 'Error while saving workspace.');
      }
    }, (error) => {
      console.error(error);
      this.toaster.toast('error', 'Error', 'Error while saving workspace.');
    });
  }

  deleteWorkspace(ind, event) {
    event.stopPropagation();
    event.preventDefault();
    const message1 = `Are you sure do you want to delete this WorkSpace (${this.workSpaceData[ind].workspace_name})?`;
    this.commonPopup.triggerPopup('deletion', 'Confirmation', message1, true, 'delete_workspace', ind);
  }

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
          if (this.activeTab === payload?.workspace_id) {
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

  changeActiveTab(eachSheet) {
    try {
      if (this.activeTab === eachSheet.workspace_id) {
        return;
      }
      this.workSpaceData.forEach((ele) => {
        if (this.activeTab === ele.workspace_id) {
          ele.isInput = false;
        }
      })
      this.activeTab = eachSheet.workspace_id;
      this.filters = eachSheet?.filters || {};
      this.dfmFilterData.bodyContent = eachSheet?.filters || {};
      this.dfmData.bodyContent = eachSheet?.filters || {};
      this.dependentLength = 0;
      this.visibleFilters = [];
      this.loaders.leftFilters = true;
      setTimeout(() => {
        this.mapOptionsChartSatelite =  document.getElementById('mapTypeOptions');
        this.handler = document.querySelector('.handler');
        this.wrapper = this.handler?.closest('.wrapper');
        this.tableEle = this.wrapper?.querySelector('.table-main-div');
        this.tableHeight = eachSheet?.tableHeight ? eachSheet?.tableHeight + 'px' : "0px";
        let tableHeightWithoutPx = this.tableHeight.replace("px","");
        // this.tableEle = document.querySelector('.table-main-div');
        if (this.tableEle?.style) {
          this.tableEle.style.height = this.tableHeight;
        }
        if (this.handler?.style) {
          this.handler.style.bottom = this.tableHeight;
        }
        if (this.mapOptionsChartSatelite?.style) {
          this.mapOptionsChartSatelite.style.bottom = ( parseInt(tableHeightWithoutPx) + 50 ) + "px";
        }
        this.loaders.leftFilters = false;
      }, 10);
      // this.showOptions = eachSheet?.showOptions || [];
      this.showFilterOptions = eachSheet?.hasOwnProperty('showFilterOptions') ? eachSheet?.showFilterOptions : true;
      this.filterPinned = eachSheet?.hasOwnProperty('pinFilters') ? eachSheet?.pinFilters : true;
      // this.showFilterOptions = eachSheet?.showFilterOptions; 
      // this.filterPinned = eachSheet?.pinFilters;
      this.mapOptions.activeMapType = eachSheet?.mapState?.mapMode;
      this.tableState = eachSheet?.tableState;
      if (!this.tableState?.length) {
        this.enableAutoResize = true;
      }
      this.mapOptions.visualList = [
        {
          label: "Table",
          value: "table"
        },
        {
          label: "Chart",
          value: "chart"
        }
      ]
      this.mapOptions['selectedVisualType'] = eachSheet?.selectedVisual || this.mapOptions.visualList[0].value;
      this.mapOptions['selectedParam'] = eachSheet?.mapState?.mapOptions || null;
      if (!eachSheet?.showInMap || !Object.keys(eachSheet?.showInMap || {})?.length) {
        eachSheet.showInMap = {};
      }
      for (let eachItem in this.displayOptions?.mapParams) {
        eachSheet.showInMap[eachItem] = eachSheet.showInMap[eachItem] || false;
      }
      this.displayOptions.mapParams = (Object.keys(eachSheet?.showInMap || {})?.length) ? eachSheet?.showInMap : this.displayOptions.mapParams || {};
      this.mapOptions['selectedChartParams'] = eachSheet?.chartParams || null;
      this.displayOptions['tooltipParams'] = eachSheet?.tooltipParams || null;
      this.displayOptions['selectedLegends'] = eachSheet?.legends_parameters || [];
      this.displayOptions['markLines'] = eachSheet?.markLines || null;
      this.selectedTab = this.tabs?.[0]?.value || this.selectedTab || '';
      this.mapOptions['center'] = eachSheet?.mapState?.mapPosition?.['center'] || null; 
      this.mapOptions['zoom'] = eachSheet?.mapState?.mapPosition?.['zoom'] || null; 
      this.mapOptions['tilt'] = eachSheet?.mapState?.mapPosition?.['tilt'] || null; 
      this.aggridData = null;
      this.chartOptions = {};
      this.chartType = eachSheet?.chartType || 'line';
      if (this.filters?.survey) {
        this.getDisplayOptions({ survey: this.filters.survey });
      }
      this.getFilters();
    // setTimeout(()=>{
    // },0);
      // this.getMapOptions();
    } catch (changeErr) {
      this.loaders.leftFilters = false;
      console.error(changeErr);
    }
  }

  get f() {
    return this.workSpaceDet.controls;
  }

  validateAllFormFields(formGroup: FormGroup) {
    try {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsDirty({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.validateAllFormFields(control);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  cleanAllFormFields(formGroup: FormGroup) {
    try {
      Object.keys(formGroup.controls).forEach((field) => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
          control.markAsPristine({ onlySelf: true });
        } else if (control instanceof FormGroup) {
          this.cleanAllFormFields(control);
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  expandAllFilters(isSurveyPeriodChanged?) {
    try {
      for (let secInd = 0; secInd < this.dfmFilterData.headerContent?.length; secInd++) {
        for (let fieldInd = 0; fieldInd < this.dfmFilterData.headerContent[secInd]?.data?.length; fieldInd++) {
          const element = this.dfmFilterData.headerContent[secInd]?.data?.[fieldInd] || {};
          if (element.key !== 'survey' && (!isSurveyPeriodChanged || (isSurveyPeriodChanged && element.key !== 'survey_period')) && !element?.isDataSufficient) {
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
        }
      }
    } catch (expandErr) {
      console.error(expandErr);
    }
  }

  getFieldData(event: any, isFirstTime?: any, parentKey?){
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
            if (respData?.data) {
              this.injectRangeData(respData, event, 'left');
            } else {
              this.loaders.fields = false;
              this.toaster.toast('info', 'Info', respData.message || 'No Range Found.', true);
            }
          } else if (['advMultiSelect', 'simpleRadioSelect', 'advRadioSelect'].includes(event?.type)) {
            if (!respData?.data || !respData?.data?.length) {
              respData.data = [];
              if (event.key !== 'survey_period') {
                this.filters[event.key] = null;
                this.dfmData.bodyContent[event.key] = null;
                this.dfmFilterData.bodyContent[event.key] = null;
                this.filters = { ...this.filters };
                this.dfmFilterData = { ...this.dfmFilterData };
                this.dfmData = { ...this.dfmData };
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
            // this.setFilterLabels({
            //   sectionIndex: event.sectionIndex,
            //   fieldType: event?.fieldType || event?.type,
            //   key: event?.key,
            //   bodyContent: this.filters,
            // });
            if(event?.key === "survey_period") {
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
          // this.toaster.toast('error', 'Error', respData.message || 'Error while fetching data', true);
        }
      }, (error) => {
        console.error(error);
        this.loaders.fields = false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.', true);
      },
      );
    } catch (error) {
      this.loaders.leftFilters = false;
      this.loaders.fields = false;
      console.error(error);
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
      this.visibleFilters = [];
      this.dfmFilterData.bodyContent = { ...this.filters };
      this.dfmData.bodyContent = { ...this.filters };
      this.dfmFilterData = { ...this.dfmFilterData };
      this.dfmData = { ...this.dfmData };
      setTimeout(() => {
        this.loaders['dfm'] = false;
      }, 10);
      this.getDeptFilters();
      // this.getDisplayOptions({ survey: this.filters.survey });
    } catch (filterErr) {
      this.loaders['dfm'] = false;
      console.error(filterErr);
    }
  }

  injectRangeData(respData: any, event: any, pos: any) {
    try {
      if (pos === 'left') {
        if (this.dfmFilterData?.headerContent?.[event?.sectionIndex]?.['data']?.length) {
          // this.loaders['leftFilters'] = true;
          this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex] = { ...this.dfmFilterData.headerContent[event.sectionIndex]['data'][event.fieldIndex], ...(respData?.data ? respData.data || {} : {}), ...{ showTab: true } };
          this.filters[event?.key] = this.filters[event?.key] || {
            min: respData?.data?.minValue,
            max: respData?.data?.maxValue,
          };
          this.dfmFilterData.bodyContent[event.key] = this.filters[event?.key] || {
            min: respData?.data?.minValue,
            max: respData?.data?.maxValue,
          };
          this.dfmData.bodyContent[event.key] = this.filters[event?.key] || {
            min: respData?.data?.minValue,
            max: respData?.data?.maxValue,
          };
          this.dfmFilterData = { ...this.dfmFilterData };
          this.dfmData = { ...this.dfmData };
          // setTimeout(() => {
          //   this.loaders['leftFilters'] = false;
          // }, 0);
        }
        this.loaders.fields = false;
        // this.setFilterLabels(event);
      } else if (pos === 'top') {
        if (this.dfmData?.headerContent?.[event?.sectionIndex]?.['data']?.length) {
          this.dfmData.headerContent[event.sectionIndex]['data'][event.fieldIndex] = { ...this.dfmData.headerContent[event.sectionIndex]['data'][event.fieldIndex], ...(respData?.data ? respData.data || {} : {}), ...{ showSlider: true } };
          this.dfmData = { ...this.dfmData };
        }
        this.loaders.fields = false;
      }
    } catch (injectErr) {
      this.loaders.fields = false;
      this.loaders['leftFilters'] = false;
      console.error(injectErr);
    }
  }

  // getMapOptions() {
  //   try {
  //     this.loaders['mapOptions'] = true;
  //     this.appservice.getMapOptions().pipe(takeUntil(this.destroy$)).subscribe(respData => {
  //       if (respData && respData.status === 'success') {
  //         this.loaders['mapOptions']= false;
  //         this.showOptions = this.showOptions.length ? this.showOptions : respData?.data?.mapOptions;
  //       } else {
  //         this.loaders['mapOptions'] = false;
  //         // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
  //       }
  //     }, (error) => {
  //       console.error(error);
  //       this.loaders['mapOptions'] = false;
  //       // this.toaster.toast('error', 'Error', 'Error while fetching data.');
  //     });
  //   } catch (filterErr) {
  //     this.loaders['mapOptions'] = false;
  //     console.error(filterErr);
  //   }
  // }

  public refreshingTable: any = false;
  getFiltersAndColdefs(payload) {
    try {
      delete payload['mapOptions'];
      this.appservice.getSelectedFiltersAndColDefs(payload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.aggridData = {
            dataMethod: 'getTableData',
            columnDefs: respData?.data?.columnDefs?.length ? respData.data.columnDefs || [] : [],
            rowData: [],
            defaultColDef: respData?.data?.defaultColDef ? respData.data.defaultColDef || { flex: 1, resizable: true, sortable: true, filter: true } : {},
            payload: payload,
            infiniteScroll: true,
          };
          this.visibleFilters = respData?.data?.selected_filters?.length ? respData.data.selected_filters || [] : [];
          for (let index = 0; index < this.visibleFilters.length; index++) {
            let element = this.visibleFilters[index].value;
            this.visibleFilters[index]['tooltip'] = this.visibleFilters[index].value;
            if (element instanceof Array) {
              let label: any = '';
              for (let i = 0; i < (element.length > 3 ? 3 : element.length); i++) {
                label = label + (!i ? '' : ', ') + element[i];
              }
              const additionalLength = element.length - (element.length > 3 ? 3 : element.length);
              element = label + (additionalLength ? ('( +' + additionalLength + ')') : '');
              this.visibleFilters[index].value = element;
            }
          }
          this.refreshingTable = true;
          setTimeout(() => {
            this.aggridData = { ...this.aggridData };
            this.refreshingTable = false;
          }, 0);
          this.getChartData();
        } else {
          if (!this.aggridData) {
            this.aggridData = {};
          }
          this.aggridData['columnDefs'] = [];
          this.aggridData['rowData'] = [];
          this.aggridData = { ...this.aggridData };
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
      });
    } catch (filterErr) {
      this.refreshingTable = false;
      console.error(filterErr);
    }
  }

  onVisualTypeChange(event) {
    try {
      if (event === 'chart') {
        this.getChartData();
      }
    } catch (visualErr) {
      console.error(visualErr);
    }
  }

  chartTypeChange(event) {
    this.chartType = event?.chartType ? event?.chartType : 'line';
  }

  getChartData() {
    try {
      const chartPayload: any = JSON.parse(JSON.stringify(this.mappayload));
      chartPayload['selected_column'] = this.mapOptions['selectedChartParams'];
      chartPayload['markLines'] = this.displayOptions['markLines'];
      chartPayload['chartType'] = this.chartType;
      delete chartPayload['legends'];
      this.appservice.getChartData(chartPayload).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          if(respData?.data?.tooltip) {
            respData.data.tooltip['formatter'] =  (val) => {
              let c = "";
              if(val?.length) {
                c += respData?.data?.xAxis?.name + ": "+ val?.[0].value?.[0]+ '<br>'
                for (const item of val) {
                  c += (item?.color ? (`<span style="display:inline-block;margin-right:4px;width:15px;height:15px;background-color:` + item?.color + `;"></span>`) : item?.marker) + " " + item?.seriesName + " " + item?.value[1] + '<br>'
                }
              }
              return c
            }
          }
          if (this.chartType) {
            for (let eachSeries of respData?.data?.series) {
              if (eachSeries?.type) {
                eachSeries.type = this.chartType || 'line';
              }
            }
          }
        this.chartOptions = respData?.data;
        this.chartOptions = {...this.chartOptions}
        this.setTableHeight();
        } else {
          this.loaders['mapOptions']= false;
          // this.toaster.toast('error', 'Error', respData['message'] || 'Error while fetching data.');
        }
      }, (error) => {
        console.error(error);
        this.loaders['mapOptions']= false;
        // this.toaster.toast('error', 'Error', 'Error while fetching data.');
      });
    }catch(echartError) {
      console.error(echartError);
    }
  }

  setTableHeight() {
    this.tableEle = document.querySelector('.table-main-div');
    if (this.tableEle?.style) {
      this.tableHeight = this.tableEle?.style.height;
    }
    if (!this.tableHeight) {
      this.tableHeight = '0px';
    }
    let tableHeightWithoutPx = this.tableHeight.replace("px", "");
    if (this.mapOptionsChartSatelite?.style) {
      this.mapOptionsChartSatelite.style.bottom = (parseInt(tableHeightWithoutPx) + 50) + "px";
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (event?.target?.className?.length && event?.target?.className?.includes('showDropdownData')) {
      return;
    }
    this.showTogglePopover = false;
  }


  switchTabs(tab: any) {
    let data : any;
    this.selectedTab  = tab?.value;
  }

  arrowScroll(isleft) {
    const arrow = document.querySelector(".top-header-filters");
    arrow.scrollBy((isleft ? -400 : 400), 0);
  }

  emittedLegend(event) {
    try {
      if (!event?.key) {
        return;
      }
      if (event?.type === 'apply') {
        this.loaders['leftFilters'] = true;
        if (!this.dfmFilterData.bodyContent) {
          this.dfmFilterData.bodyContent = {};
        }
        this.filters[event.key] = this.dfmFilterData.bodyContent[event.key] = {
          min: event.min,
          max: event.max,
        };
        if (event?.previousData?.key) {
          if (this.setLegendFilters(event.previousData.key)) {
            this.getLegends();
          }
        } else {
          this.getLegends();
        }
        setTimeout(() => {
          this.loaders['leftFilters'] = false;
        }, 0);
      } else if (event?.type === 'remove') {
        this.loaders['leftFilters'] = true;
        if (!this.dfmFilterData.bodyContent) {
          this.dfmFilterData.bodyContent = {};
        }
        if (this.setLegendFilters(event.key)) {
          this.getLegends();
        }
        setTimeout(() => {
          this.loaders['leftFilters'] = false;
        }, 0);
      }
    } catch (legendErr) {
      this.loaders['leftFilters'] = false;
      console.error(legendErr);
    }
  }

  setLegendFilters(key) {
    try {
      for (let headInd = 0;  headInd < this.dfmFilterData?.headerContent?.length; headInd++) {
        if (this.dfmFilterData?.headerContent?.[0]?.data?.length) {
          const secInd = this.dfmFilterData?.headerContent?.[0]?.data.findIndex((ele: any) => ele.key === key);
          if (secInd > -1) {
            this.filters[key] = this.dfmFilterData.bodyContent[key] = {
              min: this.dfmFilterData?.headerContent[headInd]['data'][secInd]?.minValue,
              max: this.dfmFilterData?.headerContent[headInd]['data'][secInd]?.maxValue,
            };
            return true;
          }
        }
      }
      return true;
    } catch (setErr) {
      console.error(setErr);
      return true;
    }
  }

  share(ext) {
    try {
      if( !this.filters?.survey || !this.filters?.survey_period ) {
        this.toaster.toast('info', 'Info', 'Please select survey and survey period.');
        return;
      }
      const payload = {
        survey: this.filters?.survey,
        survey_period: this.filters?.survey_period,
      }
      const encodedURL = this._util.jsontoURLSearchParam(payload);
      const downLoadLink = Config.API.DOWNLOAD_FILE + `?params=${encodedURL}`;
      window.open(downLoadLink);
    } catch (shareErr) {
      console.error(shareErr);
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

  pinFilter() {
    try {
      this.filterPinned = !this.filterPinned;
    } catch (filterErr) {
      console.error(filterErr);
    }
  }

  getLegends() {
    try {
      if (!this.filters?.survey || !this.filters?.survey_period) {
        return;
      }
      const legendJSON: any = {
        survey: this.filters?.survey,
        survey_period: this.filters?.survey_period
      }
      this.appservice.getLegends(legendJSON).pipe(takeUntil(this.destroy$)).subscribe(respData => {
        if (respData && respData.status === 'success') {
          this.legends = respData?.data || {};  
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
