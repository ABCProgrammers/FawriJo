import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../core/services/http.service';
import { ModalMessageComponent } from '../modal-message/modal-message.component';
@Component({
  selector: 'app-add-new-lookup',
  templateUrl: './add-new-lookup.component.html',
  styleUrls: ['./add-new-lookup.component.scss']
})
export class AddNewLookupComponent {
  formGroup: FormGroup;
  data;
  @Output() eventData = new EventEmitter();
  constructor(
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _httpService: HttpService,
    public _modalService: NgbModal,
  ) { }
  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.formGroup = this.fb.group({
      lookupName: ['', [Validators.required]],
      lookupDesc: [''],
      status: [true],
    })
  }
  save() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return
    }
    let value = this._httpService._helperService.trim(this.formGroup.value);
    let formData = new FormData();
    formData.append("lookupTypeID", this.data?.lookupTypeId);
    formData.append("lookupName", value.lookupName);
    if (this.data?.parentId > 0)
      formData.append("lookupParent", this.data?.parentId);
    formData.append("lookupDesc", value.lookupDesc || '');
    formData.append("status", value.status && '1001' || '1002');
    this._httpService._spinnerService.show();
    let lookup;
    lookup = this._httpService.post(this._httpService.apiUrl.Lookup.AddLookup, formData);//ADD
    lookup.subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'The data has been saved successfully');
          this.eventData.emit(true);
        }
      },
      error: err => {
        console.log(err)
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  responseModal(type, message) {
    const ref = this._modalService.open(ModalMessageComponent);
    ref.componentInstance.type = type;
    ref.componentInstance.message = message;
  }
  toggleEdit() {
    this.formGroup.enable();
  }
  get f() {
    return this.formGroup;
  }
}
