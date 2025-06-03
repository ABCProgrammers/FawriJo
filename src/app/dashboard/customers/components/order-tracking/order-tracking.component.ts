import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent {
  @Input() data;
  constructor(
    public _activeModal: NgbActiveModal,
  ) { }
  ngOnInit() {
  }
}
