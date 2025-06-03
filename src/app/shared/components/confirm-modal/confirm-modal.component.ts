import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  @Input() data;
  @Output() eventData = new EventEmitter();
  constructor(
    public _activeModel: NgbActiveModal,
  ) { }

  confirm(value) {
    if (value) this.eventData.emit(value);
    else this.eventData.emit(value);
    this._activeModel.dismiss();
  }
}
