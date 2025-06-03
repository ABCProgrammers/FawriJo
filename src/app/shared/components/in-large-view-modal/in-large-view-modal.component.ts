import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-in-large-view-modal',
  templateUrl: './in-large-view-modal.component.html',
  styleUrls: ['./in-large-view-modal.component.scss']
})
export class InLargeViewModalComponent {
  @Input() data;
  constructor(public _activeModal: NgbActiveModal) { }

  ngOnInit() { }
}
