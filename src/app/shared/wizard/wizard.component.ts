import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'ucp-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent implements OnInit, OnChanges {

  @Input() data: any;
  @Output() step = new EventEmitter();
  @Input() changeStep: any;
  @Input() settings = {
    showHrLine: true // Horizontal Line
  };

  constructor() {
    this.step = new EventEmitter<any>();

  }

  // ngOnChnages
  ngOnChanges(change: SimpleChanges) {
    try {
      if (change['changeStep'] && change['changeStep'].currentValue) {
        this.stepUpdate(change['changeStep'].currentValue);
      }
    } catch (error) {
      console.error(error);
    }
  }

  ngOnInit() {
  }
  onclick(step: any) {
    try {
      if (step['stepnumber'] && !step['stopStateChange']) {
        this.stepUpdate(step['stepnumber']);
      }
      this.step.emit(step);
    } catch (error) {
      console.error(error);
    }
  }
  stepUpdate(number: any) {
    try {
      this.data.forEach((eachStep: any) => {
        if (eachStep['stepnumber'] === number) {
          eachStep['active'] = true;
        } else {
          eachStep['active'] = false;
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
  emitdata(step: any, i: any) {}
}
