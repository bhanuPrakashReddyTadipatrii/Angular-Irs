// tslint:disable:component-selector ter-indent ter-arrow-parens align max-line-length no-this-assignment prefer-template no-increment-decrement no-inferrable-types

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
@Component({
  selector: 'ucp-select-renderer',
  templateUrl: './select-renderer.component.html',
  styleUrls: ['./select-renderer.component.scss'],
})
export class SelectRendererComponent implements ICellRendererAngularComp {
  public params;
  public settings: any = {};
  public disableField: any= false;
  public disableFunc: any;
  agInit(params): void {
    this.params = params;
    this.settings = this.params.settings;
    if(this.settings.disableFunc instanceof Function) {
      this.disableField = true;
      this.disableFunc = this.settings.disableFunc;
    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  emitData(data: any) {
    if (this.params.onSelect instanceof Function) {
      const params = {
        data,
        rowData: this.params.node.data,
        rowIndex: this.params.rowIndex,
        headerKey: this.settings['headerKey'],
      };
      this.params.onSelect(params);
    }
  }

  onSelectValueChange() {
    this.emitData(this.params.node.data[this.settings['headerKey']]);
  }

  onSelectAll(fullObject = false) {
    if (fullObject) {
      this.params.node.data[this.settings['headerKey']] = this.settings['options'];
    } else {
      this.params.node.data[this.settings['headerKey']] = this.settings['options'].map(el => el[this.settings['bindValue'] || 'value']);
    }
    this.onSelectValueChange();
  }

  onDeSelectAll() {
    this.params.node.data[this.settings['headerKey']] = [];
  }
}
