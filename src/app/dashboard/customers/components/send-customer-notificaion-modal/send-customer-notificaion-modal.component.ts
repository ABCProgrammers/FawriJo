import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-send-customer-notificaion-modal',
  templateUrl: './send-customer-notificaion-modal.component.html',
  styleUrl: './send-customer-notificaion-modal.component.scss'
})
export class SendCustomerNotificaionModalComponent {
  formGroup: FormGroup;
  constructor(
    public _activeModal: NgbActiveModal,
    private fb: FormBuilder,

  ) { }

  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.formGroup = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      schedule: [true],
      sendDate: [new Date(), Validators.required],
      sendTime: ['10:24 PM', Validators.required],
    });
  }
}
