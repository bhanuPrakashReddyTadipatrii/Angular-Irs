import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ucp-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input() showFilterOptions: any;
  @Input() loaders: any;
  @Input() filterPinned: any;
  @Input() tabs: any;
  @Input() selectedTab: any;
  @Input() dfmFilterData: any;
  @Input() displayFilterData: any;
  @Output() switchTabsOut = new EventEmitter();
  @Output() emitDFMFieldOut = new EventEmitter();
  @Output() emitDFMDisplayFieldOut = new EventEmitter();
  @Output() scrollEmitterOut = new EventEmitter();
  @Output() showFiltersOut = new EventEmitter();
  @Output() clearAllFiltersOut = new EventEmitter();
  @Output() pinFilterOut = new EventEmitter();
  @Output() showMoreOpt = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  switchTabs(eachTab) {
    this.switchTabsOut.emit(eachTab);
  }

  emitDFMField(event) {
    this.emitDFMFieldOut.emit(event);
  }

  emitDFMDisplayField(event) {
    this.emitDFMDisplayFieldOut.emit(event);
  }

  emitOnScroll(event) {
    this.scrollEmitterOut.emit(event);
  }

  showFilters(event) {
    this.showFiltersOut.emit();
  }

  clearAllFilters() {
    this.clearAllFiltersOut.emit();
  }

  pinFilter() {
    this.pinFilterOut.emit();
  }

  moreFilter(type) {
    this.showMoreOpt.emit(type);
  }
}
