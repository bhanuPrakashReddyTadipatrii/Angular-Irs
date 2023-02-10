import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  public modalSubj = new Subject<any>();

  constructor() { }
  openModal() {
    this.modalSubj.next('open');
  }
}
