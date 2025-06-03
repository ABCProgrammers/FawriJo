import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  pageTitle = new BehaviorSubject('');
  isHeaderCollpased = new Subject();
  constructor() { }
  setTitle(title: any) {
    this.pageTitle.next(title);
  }
}
