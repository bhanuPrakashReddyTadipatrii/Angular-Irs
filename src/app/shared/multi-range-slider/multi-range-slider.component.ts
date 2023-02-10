import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { debounceTime, distinctUntilChanged} from 'rxjs/operators';
import { Subject} from 'rxjs';
import { Config } from '../../config/config';

@Component({
  selector: 'ucp-multi-range-slider',
  templateUrl: './multi-range-slider.component.html',
  styleUrls: ['./multi-range-slider.component.scss']
})
export class MultiRangeSliderComponent implements OnInit {
  options: any = {
    floor: null,
    ceil: null
  };
  @Input() index: any = null;
  @Input() field: any = null;
  @Input() dualRange: any = {};
  public showSlider: any = true;
  @Output() sliderEmitter = new EventEmitter();
  public sliderChanges = new Subject<any>();
  public minRangeData : any;
  public maxRangeData : any;

  constructor() { }

  ngOnInit(): void {
    this.options.floor = this.field.minValue;
    this.options.ceil = this.field.maxValue;
    setTimeout(() => this.showMultiRangeSlider(this.field), 0);
    this.sliderChanges.pipe(
      debounceTime(Config.CONSTANTS.debounceTime)).subscribe((result) => {
        if (this.minRangeData < this.options.floor) {
          this.minRangeData =this.options.floor;
        }
        if (this.maxRangeData > this.options.ceil) {
          this.maxRangeData = this.options.ceil;
        }
        this.dualRange.min = this.minRangeData ;
        this.dualRange.max = this.maxRangeData;
        let sliderJSON: any = {min: this.minRangeData,max: this.maxRangeData};
        if (this.field && this.field?.hasOwnProperty('showToggle') && this.field?.toggleKey) {
          sliderJSON[this.field?.toggleKey] = this.dualRange?.[this.field?.toggleKey]
        }
        this.sliderEmitter.emit(sliderJSON);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    try {
      if (changes['field']) {
        this.options.floor = this.field.minValue;
        this.options.ceil = this.field.maxValue;
        setTimeout(() => this.showMultiRangeSlider(this.field, true), 0);
      }
    } catch (err) {
      console.error(err);
    }
  }

  showMultiRangeSlider(field, key?) {
    this.showSlider = false;
    if (!this.dualRange) {
      this.dualRange = {
        min: field.minValue,
        max: field.maxValue,
      };
    }
    if (key && (this.options.floor !== field.minValue && this.options.ceil !== field.maxValue)) {
      this.dualRange.min = field.minValue;
      this.dualRange.max = field.maxValue;
    } else {
      if (this.dualRange.min < field.minValue) {
        this.dualRange.min = field.minValue;
      }
      if (this.dualRange.max > field.maxValue) {
        this.dualRange.max = field.maxValue;
      }
    }
    this.minRangeData = this.dualRange.min
    this.maxRangeData = this.dualRange.max
    this.options.floor = field.minValue;
    this.options.ceil = field.maxValue;
    this.options = { ...this.options };
    setTimeout(() => {   
      this.showSlider = true;
    }, 0);
  }
  
  changedData() {
    this.maxRangeData = this.dualRange.max;
    this.minRangeData = this.dualRange.min;
    let sliderJSON: any = {min: this.minRangeData,max: this.maxRangeData};
    if (this.field && this.field?.hasOwnProperty('showToggle') && this.field?.toggleKey) {
      sliderJSON[this.field?.toggleKey] = this.dualRange?.[this.field?.toggleKey]
    }
    this.sliderEmitter.emit(sliderJSON);
  }

  inputChange(event) {
    if (event.which === 69 || event.which === 101) {
      return;
    }
    this.sliderChanges.next();
  }

  clearRangeValue(field: any) {
    try {
      this.dualRange['min'] = field.minValue;
      this.dualRange['max'] = field.maxValue;
      this.maxRangeData = this.dualRange.max;
      this.minRangeData = this.dualRange.min;
      if (this.field && this.field?.hasOwnProperty('showToggle') && this.field?.toggleKey) {
        this.dualRange[this.field?.toggleKey] = false;
      }
      this.sliderEmitter.emit(this.dualRange)
    } catch (error) {
      console.error(error);
    }
  }

  isValid() {
    return !isNaN(this.options?.floor) && !isNaN(this.options?.ceil);
  } 
}
