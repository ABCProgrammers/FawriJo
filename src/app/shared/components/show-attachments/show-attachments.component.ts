import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-show-attachments',
  templateUrl: './show-attachments.component.html',
  styleUrls: ['./show-attachments.component.scss']
})
export class ShowAttachmentsComponent {
  @Input() data;
  constructor(
    public _activeModal: NgbActiveModal,
  ) { }
}
