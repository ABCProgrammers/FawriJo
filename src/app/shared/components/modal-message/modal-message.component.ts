import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-modal-message',
  templateUrl: './modal-message.component.html',
  styleUrls: ['./modal-message.component.scss'],
})
export class ModalMessageComponent implements OnInit {
  @Input() type: string;
  @Input() message: string;
  @Input() routeName: any;
  @Output() eventData = new EventEmitter<string>();

  @Input() errors;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) { }
  ngOnInit(): void {
    if (this.type == 'success') {
      setTimeout(() => {
        if (this.routeName) {
          this.router.navigateByUrl(this.routeName);
        }
        this.toLoadData();
        this.activeModal.dismiss();
      }, 3000);
    }
  }
  toLoadData() {
    this.eventData.emit();
  }
}
