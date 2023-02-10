import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ucp-visual-charts',
  templateUrl: './visual-charts.component.html',
  styleUrls: ['./visual-charts.component.scss']
})
export class VisualChartsComponent implements OnInit {

  @Input() uniqueId: any;
  @Input() chartOptions: any;
  @Output() typeEmitter = new EventEmitter();
  @Output() mouseOverEmitter = new EventEmitter();
  @Output() mouseOutEmitter = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    if (this.chartOptions?.tooltip) {
      this.chartOptions['tooltip']['trigger'] = 'axis';
    }
    this.chartOptions = {...this.chartOptions}
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartOptions']) {
      if (this.chartOptions?.tooltip) {
        this.chartOptions['tooltip']['trigger'] = 'axis';
      }
      this.chartOptions = {...this.chartOptions}
    }
  }

  public chartInstance: any;
  initChart(event) {
    this.chartInstance = event;
    this.chartInstance.on('magictypechanged', (params) => {
      if (params?.currentType) {
        this.typeEmitter.emit({chartType: params?.currentType || 'line'});
      }
    });

    this.chartInstance.on('mouseover', (params) => {
      if (params) {
        this.mouseOverEmitter.emit({...params, uniqueId: this.uniqueId});
      }
    });

    this.chartInstance.on('mouseout', (params) => {
      if (params) {
        this.mouseOutEmitter.emit({...params, uniqueId: this.uniqueId});
      }
    });
  }
}
