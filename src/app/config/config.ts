import { environment } from './../../environments/environment';

export class Config {
  public static get BASE_POINT_API(): string { return environment.BASE_POINT_API; }
  public static API: any = {
    // IRS Endpoints

         VERIFY_OTP: Config.BASE_POINT_API + 'otp/otp_validate',
         GET_OTP: Config.BASE_POINT_API + 'otp/otp_trigger',

         GET_CARDS_DATA: Config.BASE_POINT_API + '',
         REGISTER_ISSUE: Config.BASE_POINT_API + 'incident/create',

         DASHBOARD_LIST: Config.BASE_POINT_API + 'dashboard/list',
        //  PARSE_UPLOADED_FILE: Config.BASE_POINT_DCP_API + 'ilens_config/plc_mapping',

  }
  public static getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }
  public static CONSTANTS: any = {
    timeoutSec: 20,
    debounceTime: 1500,
    BYPASS_SIGNATURE_LIST: [],
    headerTabs: [],
    userLabels: {},
  }
  public static INCIDENTS: any = [
    {
      "value": "air pollution",
      "label": "Air Pollution"
    },
    {
      "value": "electricity",
      "label": "Electricity"
    },
    {
      "value": "fire accident",
      "label": "Fire Transport"
    },
    {
      "value": "garbage",
      "label": "Garbage"
    },
    {
      "value": "potholes",
      "label": "Potholes"
    },
    {
      "value": "public_transport",
      "label": "Public Transport"
    },
    {
      "value": "road accident",
      "label": "Road Transport"
    },
    {
      "value": "sewage",
      "label": "Sewage"
    },
    {
      "value": "water",
      "label": "Water"
    },
    {
      "value": "others",
      "label": "Others"
    }
  ]
  public static PROJECTCONSTANTS: any = {
    setup_user: [],
    import_data: []
  }
  public static ALERT_MESSAGES: any = {
    CONFIRM_ALART_MESSAGE: 'Are you sure do you want to cancel? Any changes made cannot be saved.'
  }
}
