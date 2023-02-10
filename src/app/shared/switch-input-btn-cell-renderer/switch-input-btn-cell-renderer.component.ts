import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';


@Component({
  selector: 'ucp-switch-input-btn-cell-renderer',
  template: `<label class="switcher-control"><input type="checkbox" class="switcher-input"
  [checked]="params.node.data[settings?.headerKey || 'isEnable']"
  [disabled]="settings?.disabled"
  [(ngModel)]="params.node.data[settings?.headerKey || 'isEnable']"
  (change)="onClick($event)"> <span class="switcher-indicator"></span></label>
  <div class="state">
    <label></label>
  </div>`,
  styleUrls: []
})
export class SwitchInputBtnCellRendererComponent implements ICellRendererAngularComp {
  public params;
  public hidden: boolean = false;
  public settings: any = {};

  agInit(params): void {
    this.params = params;
    this.settings = this.params.settings;

    if (params.hidden instanceof Function) {
      this.hidden = params.hidden({ data: params.node.data });
    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick(event: any) {
    if (this.params.onClick instanceof Function) {
      const params = {
        rowData: this.params.node.data,
        rowIndex: this.params.rowIndex,
      };
      this.params.onClick(params);
    }
  }

}
