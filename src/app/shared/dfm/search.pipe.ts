import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {

  public transform(value: any, keys: any, term: string) {
    if (!value) {
      return;
    }
    return value.filter((item: any) => {
      let exist_flag = false;
      if (keys) {
        keys.forEach((key: any) => {
          if (!exist_flag) {
            exist_flag = false;
            if (item.hasOwnProperty(key)) {
              if (term && item[key]) {
                if (item[key].toLowerCase().indexOf(term.toLowerCase()) === -1) {
                  exist_flag = false;
                } else {
                  exist_flag = true;
                }
                              // let regExp = new RegExp('\\b' + term, 'gi');
                              // exist_flag = regExp.test(item[key]);
              } else {
                exist_flag = true;
              }
            } else {
              exist_flag = false;
            }
          }
        });
      }
      return (keys && keys.length > 0) ? exist_flag : true;
    });
  }

}
