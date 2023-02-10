import { environment } from './../../environments/environment';

export class Config {
    public static get BASE_POINT_API(): string { return environment.BASE_POINT_API; }
    public static get BASE_POINT_VIZ_API(): string { return environment.BASE_POINT_VIZ_API; }
    public static get BASE_POINT_FILE_API(): string { return environment.BASE_POINT_FILE_API; }
    public static API: any = {
         // App Component
         GET_TOKEN: Config.BASE_POINT_API + 'get_token',

         // Login Component
         LOGIN_USER: Config.BASE_POINT_API + 'login',
         GET_CAPTCHA: Config.BASE_POINT_API + 'get_captcha_image',
         FORGOT_PASSWORD: Config.BASE_POINT_API + 'user/forgot_password',
         RESET_PASSWORD: Config.BASE_POINT_API + 'user/reset_password',

         //Log Out
         LOGOUT_USER: Config.BASE_POINT_API + 'logout',
         
         // Project Management
         GET_BASE_PROJECT: Config.BASE_POINT_API + 'get-base-project',
         GET_PROJECT_DATA: Config.BASE_POINT_API + 'get_project_layout',
         FETCH_PROJECT_DATA: Config.BASE_POINT_API + 'fetch_project',
         SAVE_PROJECT_DATA: Config.BASE_POINT_API + 'save_project',
         SAVE_CHAINAGE_DATA: Config.BASE_POINT_API + 'save_chainages',
         FETCH_CHAINAGE_DETAILS: Config.BASE_POINT_API + 'fetch_chainages',

         FETCH_UNITS_DATA: Config.BASE_POINT_API + 'listing_units',
         DELETE_UNITS_DATA: Config.BASE_POINT_API + 'delete_units',
         SAVE_UNITS_DATA: Config.BASE_POINT_API + 'save_units',

         FETCH_PARAMETER_DATA: Config.BASE_POINT_API + 'list_parameters',
         FETCH_UNIT_DATA: Config.BASE_POINT_API + 'fetch_parameter_fields',
         SAVE_PARAMETER_DATA: Config.BASE_POINT_API + 'create_parameter',
         DELETE_PARAMETER_DATA: Config.BASE_POINT_API + 'delete_parameter',
         EDIT_PARAMETER_DATA: Config.BASE_POINT_API + 'edit_parameter',

         FETCH_SURVEY_TEMPLATE_DATA: Config.BASE_POINT_API + 'get_survey_templates_list',
         SAVE_SURVEY_TEMPLATE: Config.BASE_POINT_API + 'create_survey_template',
         DELETE_SURVEY_TEMPLATE: Config.BASE_POINT_API + 'delete_survey_template',
         FETCH_SURVEY_TEMPLATE_LIST: Config.BASE_POINT_API + 'get_template_list',
         PREVIEW_SURVEY: Config.BASE_POINT_API + 'preview_survey',
         GET_SURVEY_NAME: Config.BASE_POINT_API + 'get_survey_name',
         GET_SURVEY_FIELDS: Config.BASE_POINT_API + 'fetch_survey_fields',
         GET_SURVEY_SHEET_DETAILS: Config.BASE_POINT_API + 'survey_template_details',
         GET_SAMPLE_TEMP_DATA :Config.BASE_POINT_API + 'get_sample_survey',


         FETCH_DATA_IMPORT_DETAILS: Config.BASE_POINT_API + 'list_surveys',
        //  FETCH_SURVEYS_LIST: Config.BASE_POINT_API + 'fetch_survey_file_content',
         GET_SHEET_NAME: Config.BASE_POINT_FILE_API + 'data-upload/get-sheet-name',
         SHEET_DETAILS: Config.BASE_POINT_API + 'fetch_survey_sheet_data',
         UPLOAD_SHEET_DETAILS: Config.BASE_POINT_FILE_API + 'data-upload/validate',
        //  SAVE_SURVEY: Config.BASE_POINT_API + 'save_new_survey',
         SAVE_SURVEY: Config.BASE_POINT_FILE_API + 'data-upload/upload',
         EDIT_SURVEY: Config.BASE_POINT_FILE_API +'data-upload/edit-survey',
         DELETE_SURVEY: Config.BASE_POINT_API + 'delete_survey',
         GET_SURVEY_TEMPLATE_DATA: Config.BASE_POINT_API + 'fetch_survey_template',

        //Config Simulate
          UPLOAD_SIMULATE_DATA: Config.BASE_POINT_VIZ_API + 'upload_simulation',
          GET_CONFIGSIMULATE_LIST: Config.BASE_POINT_VIZ_API + 'list_simulation_config',

         // Project Listing 
         CHANGE_PROJECT:  Config.BASE_POINT_API + 'change_project',
         FETCH_PROJECT_LIST: Config.BASE_POINT_API + 'list_projects',
         DELETE_PROJECT_DATA : Config.BASE_POINT_API + 'delete_project',

         // User Management
         USER_TABLE: Config.BASE_POINT_API + 'list_all_users',
         USER_ROLE_TABLE: Config.BASE_POINT_API + 'list_user_roles',
         USER_ACCESS_GROUP: Config.BASE_POINT_API + 'list_access_group',
         
         DELETE_USER_GROUP: Config.BASE_POINT_API + 'delete_access_group',
         DELETE_USER_ROLE: Config.BASE_POINT_API + 'delete_user_roles',
         DELETE_USER: Config.BASE_POINT_API + 'delete_user',

         SAVE_USER_GROUP: Config.BASE_POINT_API + 'create_access_group',
         SAVE_USER_ROLE: Config.BASE_POINT_API + 'create_user_roles',
         SAVE_USER: Config.BASE_POINT_API + 'create_user',
         SAVE_PROFILE_IMAGE: Config.BASE_POINT_API + 'upload_profile_image',
         UPDATE_PASSWORD : Config.BASE_POINT_API + 'user/update_password',
         
         FETCH_USER: Config.BASE_POINT_API + 'list_user_details',
         FETCH_USER_ROLE: Config.BASE_POINT_API + 'fetch_user_role_details',
         FETCH_USER_ACCESS_PERMISSIONS: Config.BASE_POINT_API + 'fetch_access_permissions',

         // Visualize Component
         FETCH_VIZ_FILTERS: Config.BASE_POINT_VIZ_API + 'visualize_default_filter',
         FETCH_DEPEDENT_VIZ_FILTERS: Config.BASE_POINT_VIZ_API + 'survey_filters',
         FETCH_DISPLAY_OPTIONS_FILTERS: Config.BASE_POINT_VIZ_API + 'display_options',
         CONFIGURE_WORKSPACE: Config.BASE_POINT_VIZ_API + 'configure_workspace',
         LISTING_WORKSPACE: Config.BASE_POINT_VIZ_API + 'listing_workspaces',
         LOAD_MAP_DATA:  Config.BASE_POINT_VIZ_API + 'map_details',
         LOAD_TABLE_DATA:  Config.BASE_POINT_VIZ_API + 'table_details',
         GET_CHART_DATA: Config.BASE_POINT_VIZ_API + 'get_e_chart_data',
         FETCH_FIELDS_DATA: Config.BASE_POINT_VIZ_API + 'get_filter_data',
         GET_MAP_OPTIONS: Config.BASE_POINT_VIZ_API + 'get_map_options',
         GET_SELECTED_FILTERS_AND_COLDEFS: Config.BASE_POINT_VIZ_API + 'get_selected_filters',
         GET_LEGENDS: Config.BASE_POINT_VIZ_API + 'get_legends',
         DOWNLOAD_FILE: Config.BASE_POINT_API + 'download_survey',

         //Simulate Component
         GET_SIM_MAP_DATA: Config.BASE_POINT_VIZ_API + 'get_sim_map_data',
         GET_SIM_HEADER_DATA: Config.BASE_POINT_VIZ_API + 'get_simulation_filters',
         GET_SIM_TABLE_DATA: Config.BASE_POINT_VIZ_API + 'get_simulation_table',

         //Compare Component
         FETCH_WORKSPACE_DATA: Config.BASE_POINT_VIZ_API + 'get_workspace_details',
         CONFIGURE_WIDGET: Config.BASE_POINT_VIZ_API + 'widget_actions',

         // Header Component
         GET_PROFILE_IMAGE: Config.BASE_POINT_API + 'get_profile_image',

    }
    public static getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16);
    }
    public static CONSTANTS: any = {
        timeoutSec: 20,
        debounceTime: 1500,
        BYPASS_SIGNATURE_LIST: [],
        headerTabs: [
            {
              label: 'Project Info',
              value: 'project_info',
              route: 'app/projects/',
            },
            {
              label: 'Visualize',
              value: 'visualize',
              route: 'app/dashboard/visualize',
            },
            {
              label: 'Simulate',
              value: 'simulate',
              route: 'app/dashboard/simulate',
            },
            {
              label: 'Compare',
              value: 'compare',
              route: 'app/dashboard/compare',
            }
          ],
        userLabels: {
            users: {
                label: 'Users',
                configRoute: 'app/settings/user-management/config-user',
                messageLabel: 'User',
                errorLabel: 'user',
                permissionKey: 'users',
                titleKey: 'username',
            },
            'user-roles': {
                label: 'User Roles',
                configRoute: 'app/settings/user-management/config-user-role',
                messageLabel: 'User Role',
                errorLabel: 'user role',
                permissionKey: 'user_roles',
                titleKey: 'role',
            },
            'user-access-groups': {
                label: 'User Groups',
                configRoute: 'app/settings/user-management/config-user-access-group',
                messageLabel: 'User Group',
                errorLabel: 'user group',
                permissionKey: 'user_groups',
                titleKey: 'access_group',
            }
        },
      }
      public static PROJECTCONSTANTS: any = {
        setup_user: [
          {
            label: Config.CONSTANTS.userLabels?.users?.label || 'Users',
            value: 'users',
            key: 'users'
          },
          {
            label:  Config.CONSTANTS.userLabels?.['user-roles']?.label || 'Roles',
            value: 'user-roles',
            key: 'user_roles'
          },
          {
            label:  Config.CONSTANTS.userLabels?.['user-access-groups']?.label || 'User Groups',
            value: 'user-access-groups',
            key: 'user_groups'
          }
        ],
        import_data: [
          {
            label: 'Units',
            value: 'units',
            key: 'units'
          },
          {
            label: 'Parameters',
            value: 'parameters',
            key: 'parameters'
          },
          {
            label: 'Surveys Templates',
            value: 'surveys_templates',
            key: 'survey_templates'
          },
          {
            label: 'Surveys',
            value: 'surveys',
            key: 'surveys'
          },
          {
            label: 'Simulate',
            value: 'simulate',
            key: 'simulate'
          }
        ]
      }
      public static ALERT_MESSAGES: any = {
        CONFIRM_ALART_MESSAGE: 'Are you sure do you want to cancel? Any changes made cannot be saved.'
      }
}
