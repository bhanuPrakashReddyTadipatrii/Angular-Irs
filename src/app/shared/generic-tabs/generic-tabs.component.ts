import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ucp-generic-tabs',
  templateUrl: './generic-tabs.component.html',
  styleUrls: ['./generic-tabs.component.scss']
})
export class GenericTabsComponent implements OnInit {
  @Input() items: any;
  @Output() activeTab = new EventEmitter();
  @Input() activeResultTab = '';

  constructor() { }

  ngOnInit() {
    if (this.items && this.items[0] && !this.activeResultTab) {
      this.activeResultTab = this.items[0]['value'];
    }
  }

  changeResultTab(item: any) {
    item.nextId = item.value;
    this.activeResultTab = item.nextId;
    this.activeTab.emit({ item });
  }

}
