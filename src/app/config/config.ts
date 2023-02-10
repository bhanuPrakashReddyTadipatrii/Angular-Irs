import { environment } from './../../environments/environment';

export class Config {
    public static get BASE_POINT_API(): string { return environment.BASE_POINT_API; }
    public static API: any = {
         // IRS Endpoints

         VERIFY_OTP: Config.BASE_POINT_API + 'otp/otp_validate',
         GET_OTP: Config.BASE_POINT_API + 'otp/otp_trigger'

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
      public static PROJECTCONSTANTS: any = {
        setup_user: [],
        import_data: []
      }
      public static ALERT_MESSAGES: any = {
        CONFIRM_ALART_MESSAGE: 'Are you sure do you want to cancel? Any changes made cannot be saved.'
      }
}
