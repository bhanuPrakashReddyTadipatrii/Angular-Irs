import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(timeStamp: any, args?: any): any {
    if (timeStamp) {
      const noOfSec = Math.floor(((+new Date()) - (+new Date(timeStamp))) / 1000);
      // less than 30 seconds ago will show as 'Just now'
      if (noOfSec < 29) {
        return 'Just now';
      }
      const regularPeriods: any = {
        'year': 31536000,
        'month': 2592000,
        'week': 604800,
        'day': 86400,
        'hour': 3600,
        'minute': 60,
        'second': 1,
      };
      let timeCount: any;
      for (const eachPeriod in regularPeriods) {
        timeCount = Math.floor(noOfSec / regularPeriods[eachPeriod]);
        if (timeCount > 0) {
          if (timeCount === 1) { // for one regular period (1 minute/hour/day)
            return timeCount + ' ' + eachPeriod + ' ago';
          } else { // for multiple regular period (n minutes/hours/days (where n!=1)) 
            return timeCount + ' ' + eachPeriod + 's ago';
          }
        }
      }
    }
    return timeStamp;
  }
}
