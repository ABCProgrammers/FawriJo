import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';

@Component({
  selector: 'app-send-customer-notificaion-modal',
  templateUrl: './send-customer-notificaion-modal.component.html',
  styleUrl: './send-customer-notificaion-modal.component.scss'
})
export class SendCustomerNotificaionModalComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  minDate;
  constructor(
    public _activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private _httpService: HttpService,
    private _modalService: NgbModal,
  ) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    this.minDate = currentDate;
  }
  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.formGroup = this.fb.group({
      notificationTitle: ['', Validators.required],
      notificationText: ['', Validators.required],
      schedule: [false],
      scheduledDate: [''],
      scheduledTime: [''],
    });
  }
  handleScheduleChange(event) {
    let checked = event.target.checked;
    let date = this.formGroup.get('scheduledDate');
    let time = this.formGroup.get('scheduledTime');
    if (checked) {
      date.addValidators([Validators.required]);
      time.addValidators([Validators.required]);
    }
    else {
      date.clearValidators();
      time.clearValidators();
    }
    date.updateValueAndValidity();
    time.updateValueAndValidity();
  }
  onQuillContentChanged(event) {
    const delta = event.editor.editor.delta.ops;
    const converter = new QuillDeltaToHtmlConverter(delta as any, {});
    const html = converter.convert();
    this.formGroup.get('notificationText').setValue(html, { emitEvent: false });
  }
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const value = this.formGroup.value;
    this._httpService._spinnerService.show();
    let controls = ['scheduledDate', 'scheduledTime'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.formGroup, controls);
    formData.append('customerIDs', this.data.customerIds);
    if (value.schedule) {
      formData.append('scheduledDate', this._httpService._helperService.dateFormate(value.scheduledDate));
      //const currentDate = new Date();
      let time = value.scheduledTime;
      //currentDate.setHours(time.hour, time.minute, time.second, 0);
      const values = `${time.hour}:${time.minute}:${time.second}`
      formData.append('scheduledTime', values);
    }
    let URL = this._httpService.apiUrl.Notifications.SendNotification;
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit(true);
          this.responseModal('success', 'Data saved successfully!')
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
