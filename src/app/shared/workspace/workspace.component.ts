import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'ucp-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  @Input() workSpaceData;
  @Input() activeTab;
  @Output() workSpaceEmitter = new EventEmitter();
  @Input() footArrowDropDown;
  public dropList: any;
  constructor(private appService : AppService) { }
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public selectedWorkSpace :any ='';
 
  ngOnInit(): void {
    
  }
  
  ngOnChanges(changes: SimpleChanges) {
		if (changes['workSpaceData']) {
			this.workSpaceData = [...this.workSpaceData];
		}
	}
  changeWorkSpace(type, ind?, $event?) {
    let data = {
      "type": type ,
      "ind": ind,
      "$event" : $event ,
    }
    this.workSpaceEmitter.emit(data);
  }
  drop(event: CdkDragDrop<string[]>) {
    try {            
      moveItemInArray(this.workSpaceData, event.previousIndex, event.currentIndex);
      let data = {
        'workSpaceData' : this.workSpaceData ,
        'type' : 'move'
      }
      this.workSpaceEmitter.emit(data);
      } catch (error) {
      console.error(error);
    }
  } 
  handleWheelEvent(event) {
    event.preventDefault();
    this.dropList =  document.querySelector('.drop-list');
    this.dropList.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  }
}
