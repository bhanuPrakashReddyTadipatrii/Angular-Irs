import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpLayerService } from './http-layer.service';
import { Config } from '../config/config';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private _http: HttpClient, private _httplayer: HttpLayerService) {
  }

  // ----------------------------Service call Types--------------------------------//
  postService(api, data) {
    return this._httplayer.post(api, data);
  }

  getService(api, data?) {
    if (data) {
      return this._httplayer.get(api, data);
    }
    return this._httplayer.get(api);
  }

  deleteService(api, data) {
    return this._httplayer.delete(api, data);
  }

  // ------------------------------Route Functions--------------------------------------//
  getCurrentUrl(route: any) {
    const mainUrl = window.location.href.split('/#/');
    return mainUrl[0] + '/#/' + route;
  }

  // -----------------------------MQTT Functions-----------------------------------------//
  getMqttConfigDetails(payload: any): Observable<any> {
    return this.postService(Config.API.GET_MQTT_CONFIG_DETAILS, payload);
  }

  registerMqttTopics(payload: any): Observable<any> {
    return this._httplayer.post(Config.API.REGISTER_MQTT_TOPICS, payload);
  }

  // Service call Functions

  // ----------------------------App Component-------------------------------------------//
  getConfigurationJSON() {
    return this._httplayer.get('assets/jsons/configuration.json');
  }
  getTokenInfo(query = ''): Observable<any> {
    return this._httplayer.get(Config.API.GET_TOKEN + query);
  }

  // -----------------------------Modal Component-----------------------------------------//
  userLogin(data): Observable<any> {
    return this.postService(Config.API.GET_AD_TOKEN, data);
  }

  // ------------------------------Login Component---------------------------------------//
  loginUser(data): Observable<any> {
    return this.postService(Config.API.LOGIN_USER, data);
  }
  getCaptcha(data): Observable<any> {
    return this.postService(Config.API.GET_CAPTCHA, data);
  }
  forgotPassword(data): Observable<any> {
    return this.postService(Config.API.FORGOT_PASSWORD, data);
  }
  resetPassword(data): Observable<any> {
    return this.postService(Config.API.RESET_PASSWORD, data);
  }
  getBaseProject(data): Observable<any> {
    return this.getService(Config.API.GET_BASE_PROJECT);
  }

  //------------------------------------Log Out--------------------------//
  logoutUser(data): Observable<any> {
    return this.postService(Config.API.LOGOUT_USER, data);
  }

  // ----------------------------------User Management--------------------------------//
  getUserDetails(data?): Observable<any> {
    return this.getService(Config.API.USER_TABLE, data);
  }
  getUserRoleDetails(data?): Observable<any> {
    return this.getService(Config.API.USER_ROLE_TABLE, data);
  }
  getUserAccessGroupDetails(data?): Observable<any> {
    return this.getService(Config.API.USER_ACCESS_GROUP);
  }

  deleteUser(data): Observable<any> {
    return this.postService(Config.API.DELETE_USER, data);
  }
  deleteUserRole(data): Observable<any> {
    return this.postService(Config.API.DELETE_USER_ROLE, data);
  }
  deleteUserGroup(data): Observable<any> {
    return this.postService(Config.API.DELETE_USER_GROUP, data);
  }

  saveUserGroup(data): Observable<any> {
    return this.postService(Config.API.SAVE_USER_GROUP, data);
  }
  saveUser(data): Observable<any> {
    return this.postService(Config.API.SAVE_USER, data);
  }
  saveProfileImage(data): Observable<any> {
    return this.postService(Config.API.SAVE_PROFILE_IMAGE, data);
  }
  saveUserRole(data): Observable<any> {
    return this.postService(Config.API.SAVE_USER_ROLE, data);
  }
  updatePassword(data): Observable<any> {
    return this.postService(Config.API.UPDATE_PASSWORD, data);
  }

  fetchUser(data): Observable<any> {
    return this.postService(Config.API.FETCH_USER, data);
  }
  fetchUserRole(data): Observable<any> {
    return this.getService(Config.API.FETCH_USER_ROLE, data);
  }
  fetchUserAccessPermissions(): Observable<any> {
    return this.getService(Config.API.FETCH_USER_ACCESS_PERMISSIONS);
  }

  // ----------------------------- Project Management---------------------------------//

  // -------------------------------Project Listing-----------------------------------//

  fetchProjects(): Observable<any> {
    return this.getService(Config.API.FETCH_PROJECT_LIST);
    // return this.getService('assets/jsons/view-all-projects.json');
  }

  deleteProjectData(data): Observable<any> {
    return this.postService(Config.API.DELETE_PROJECT_DATA, data);
  }

  switchProjects(data): Observable<any> {
    return this.getService(Config.API.CHANGE_PROJECT, data);
  }

  getProjectData(): Observable<any> {
    return this.getService(Config.API.GET_PROJECT_DATA);
    // return this.getService('assets/jsons/project-info.json');
  }
  saveProjectData(data): Observable<any> {
    return this.postService(Config.API.SAVE_PROJECT_DATA, data);
  }
  saveChainages(data): Observable<any> {
    return this.postService(Config.API.SAVE_CHAINAGE_DATA, data);
  }
  fetchProjectData(data): Observable<any> {
    return this.getService(Config.API.FETCH_PROJECT_DATA, data);
  }
  fetchChainageDetails(data): Observable<any> {
    return this.postService(Config.API.FETCH_CHAINAGE_DETAILS, data);
  }

  //-----------------------------Units-------------------------------------//
  fetchUnitData(): Observable<any> {
    return this.getService(Config.API.FETCH_UNITS_DATA);
  }
  saveUnitData(data): Observable<any> {
    return this.postService(Config.API.SAVE_UNITS_DATA, data);
  }
  deleteUnitData(data): Observable<any> {
    return this.postService(Config.API.DELETE_UNITS_DATA, data);
  }

  //-----------------------------Parameters-------------------------------//

  fetchParameterData(): Observable<any> {
    return this.getService(Config.API.FETCH_PARAMETER_DATA);
    // return this.getService('assets/jsons/userData.json');
  }
  getUnitList(): Observable<any> {
    return this.getService(Config.API.FETCH_UNIT_DATA);
  }
  saveParamData(data): Observable<any> {
    return this.postService(Config.API.SAVE_PARAMETER_DATA, data);
  }
  deleteParameterData(data): Observable<any> {
    return this.postService(Config.API.DELETE_PARAMETER_DATA, data);
  }
  editParameterData(data): Observable<any> {
    return this.getService(Config.API.EDIT_PARAMETER_DATA, data);
  }


  //-------------------------------------Survey Template------------------------------//

  fetchSurveyTemplateDetails(): Observable<any> {
    return this.getService(Config.API.FETCH_SURVEY_TEMPLATE_DATA);
  }
  saveSurveyTemplate(data): Observable<any> {
    return this.postService(Config.API.SAVE_SURVEY_TEMPLATE, data);
  }
  deleteSurveyTemplateData(data): Observable<any> {
    return this.postService(Config.API.DELETE_SURVEY_TEMPLATE, data);
  }
  getSurveyName(): Observable<any> {
    return this.getService(Config.API.GET_SURVEY_NAME);
    // return this.getService('assets/jsons/survey-name.json');
  }
  fetchSurveyField(): Observable<any> {
    return this.getService(Config.API.GET_SURVEY_FIELDS);
    // return this.getService('assets/jsons/survey-dropdown.json');
  }
  fetchSurveySheetList(data): Observable<any> {
    return this.postService(Config.API.GET_SURVEY_SHEET_DETAILS, data);
    // return this.getService('assets/jsons/surveys.json');
  }
  getSampleTemplateData(data): Observable<any> 
  {
    return this.getService(Config.API.GET_SAMPLE_TEMP_DATA,data);
  }

  //-----------------------------Surveys--------------------------------------------// 

  getDataImportDetails(): Observable<any> {
    return this.getService(Config.API.FETCH_DATA_IMPORT_DETAILS);
  }
  getSurveysList(data): Observable<any> {
    // return this.postService(Config.API.FETCH_SURVEYS_LIST, data);
    return this.postService(Config.API.GET_SHEET_NAME, data);
  }
  fetchSurveyTemplateList(): Observable<any> {
    return this.getService(Config.API.FETCH_SURVEY_TEMPLATE_LIST);
  }
  sheetDetails(data): Observable<any> {
    return this.postService(Config.API.SHEET_DETAILS, data);
    // return this.getService('assets/jsons/survey-table.json');
  }
  saveSurvey(data): Observable<any> {
    return this.postService(Config.API.SAVE_SURVEY, data);
  }
  previewSurveyData(data): Observable<any> {
    return this.postService(Config.API.PREVIEW_SURVEY, data);
  }
  editsurveyData(data): Observable<any> {
    return this.getService(Config.API.EDIT_SURVEY, data);
  }
  deleteSurvey(data): Observable<any> {
    return this.postService(Config.API.DELETE_SURVEY, data);
  }
  uploadSurvey(data): Observable<any> {
    return this.postService(Config.API.UPLOAD_SHEET_DETAILS, data);
  }
  getSurveyTemplate(data): Observable<any> {
    return this.getService(Config.API.GET_SURVEY_TEMPLATE_DATA, data);
  }

  //-----------------------------Config Simulate--------------------------------------------// 
  getConfigSimulateData(data): Observable<any> {
    return this.getService(Config.API.GET_CONFIGSIMULATE_LIST, data);
  }
  saveSimulate(data): Observable<any> {
    return this.postService(Config.API.UPLOAD_SIMULATE_DATA, data);
  }




  //--------------------------------------Visualize Component---------------------------------------//
  defaultVisualizeFilters(): Observable<any> {
    return this.getService(Config.API.FETCH_VIZ_FILTERS);
    // return this.getService('assets/jsons/visualise-filters-1.json');
  }

  defaultDisplayOptions(data): Observable<any> {
    return this.getService(Config.API.FETCH_DISPLAY_OPTIONS_FILTERS,data);
    // return this.getService('assets/jsons/display-options.json',data);
  }

  getDependentFilters(data): Observable<any> {
    return this.getService(Config.API.FETCH_DEPEDENT_VIZ_FILTERS, data);
    // return this.getService('assets/jsons/all-filters.json');
  }

  getLegends(data): Observable<any> {
    return this.getService(Config.API.GET_LEGENDS, data);
  }

  getMapData(data): Observable<any> {
    // return this.getService('assets/jsons/map.json');
    return this.getService(Config.API.LOAD_MAP_DATA, data);
  }

  getTableData(data): Observable<any> {
    return this.getService(Config.API.LOAD_TABLE_DATA, data);
    // return this.getService('assets/jsons/table-json-row.json', data);
  }

  getChartData(data): Observable<any> {
    // return this.getService('assets/jsons/chart-data.json', data);
    return this.getService(Config.API.GET_CHART_DATA, data);
  }

  configureWorkSpace(data): Observable<any> {
    return this.postService(Config.API.CONFIGURE_WORKSPACE, data);
  }

  listingWorkSpace(data): Observable<any> {
    return this.getService(Config.API.LISTING_WORKSPACE, data);
    // return this.getService('assets/jsons/listing-workspace.json', data);
  }

  getFieldData(data): Observable<any> {
    return this.getService(Config.API.FETCH_FIELDS_DATA, data);
    // return this.getService('assets/jsons/all-filters.json', data);
  }

  getMapOptions(): Observable<any> {
    return this.getService(Config.API.GET_MAP_OPTIONS);
  } 

  getSelectedFiltersAndColDefs(data): Observable<any> {
    return this.getService(Config.API.GET_SELECTED_FILTERS_AND_COLDEFS, data);
    // return this.getService('assets/jsons/table-json-col.json', data);
  }
  
  //----------------------------------------Simulate Component--------------------------------//

  getSimulateMapData(data): Observable<any> {
    return this.getService(Config.API.GET_SIM_MAP_DATA, data);
  }
  getSimulateHeaderData(data): Observable<any> {
    return this.getService(Config.API.GET_SIM_HEADER_DATA, data);
  }
  getSimulateTableData(data): Observable<any> {
    return this.getService(Config.API.GET_SIM_TABLE_DATA, data);
  }

  //-----------------------------------------Compare Component---------------------------------//
  getWorkspaceDetails(data): Observable<any> {
    return this.getService(Config.API.FETCH_WORKSPACE_DATA, data);
    // return this.getService('assets/jsons/fetch-workspacedata.json', data);

  }

  configureWidget(data): Observable<any> {
    return this.getService(Config.API.CONFIGURE_WIDGET, data);
    // return this.getService('assets/jsons/configure-widget.json', data);
  }


  //---------------------------------------Temporary Map data File---------------------------------//
  getTempMapData(data): Observable<any> {
    return this.getService('assets/jsons/latest-mapData.json');
  }

  //----------------------------------------Header Component---------------------------------------//
  getProfileImage(): Observable<any> {
    return this.getService(Config.API.GET_PROFILE_IMAGE);
  }


  // IRS Endpoints
  getOTP(data): Observable<any> {
    return this.postService(Config.API.GET_OTP, data);
  }
  verifyOTP(data): Observable<any> {
    return this.postService(Config.API.VERIFY_OTP, data);
  }

}