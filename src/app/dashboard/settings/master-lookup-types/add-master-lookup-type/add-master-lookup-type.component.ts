import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-add-master-lookup-type',
  templateUrl: './add-master-lookup-type.component.html',
  styleUrl: './add-master-lookup-type.component.scss'
})
export class AddMasterLookupTypeComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  constructor(
    public _httpService: HttpService,
    public _modalService: NgbModal,
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
  ) {
  }
  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.formGroup = this.fb.group({
      lookupTypeName: ['', Validators.required],
      comment: [''],
      status: [true]
    });
    if (this.data?.edit) {
      const dataRow = this.data?.row;
      let obj = {
        lookupTypeName: dataRow?.lookupTypeName,
        comment: dataRow?.comments,
        status: dataRow?.status?.lookupID == 1001 ? true : false,
      }
      this.formGroup.patchValue(obj);
      if (this.data?.view) {
        this.formGroup.disable();
      }
    }
  }
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._httpService._spinnerService.show();
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.formGroup, ['status']);
    formData.append('status', this.formGroup.value.status && '1001' || '1002');
    let URL = this._httpService.apiUrl.Lookup.AddLookupType;
    if (this.data?.edit) {
      formData.append('lookupTypeId', this.data?.row?.lookupTypeID);
      URL = this._httpService.apiUrl.Lookup.EditLookupType;
    }
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
