import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, takeUntil, Subject, catchError, of } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { LookupService } from '../../../core/services/lookup.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-addresses',
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class AddressesComponent {

  destroy$ = new Subject<void>;
  formGroup: FormGroup;
  dataList = [];
  countryList = [];
  addressTypeList = [];
  constructor(
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    private _lookupService: LookupService,
  ) {
  }
  ngOnInit() {
    this.initForm();
    this.getLookups();
  }
  initForm() {
    this.formGroup = this.fb.group({
      addresses: this.fb.array([])
    });
  }
  initArrayFormGroup(data?) {
    return this.fb.group(
      {
        addressID: [data?.addressID || ''],
        addressCountry: [data?.addressCountry || null, [Validators.required]],
        addressType: [data?.addressType || null, [Validators.required]],
        addressDetails: [data?.addressDetails || null, [Validators.required]],
        add: [false],
        edit: [false],
        status: [data?.status ?? true],
      }
    )
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const addressType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=68&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, addressType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.addressTypeList = response[1].data;
      this.getDataList();
    });
  }
  getDataList(params?) {
    let APIURL = `${this._httpService.apiUrl.ContactsSM.GetAddress}?`;
    let defaultParams = `&pageSize=1000&pageNo=0&sort=1`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService._spinnerService.show();
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data;
        this.bindDataToFormArray()
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  bindDataToFormArray() {
    this.formArray.clear();
    if (this.dataList.length) {
      this.dataList.forEach(item => {
        let obj = {
          addressID: item?.addressID,
          addressCountry: item?.addressCountry ? item?.addressCountry[0]?.lookupID : null,
          addressType: item?.addressType?.lookupID,
          addressDetails: item?.addressDetails,
          status: item?.status?.lookupID == 1001 ? true : false,
        }
        this.formArray.push(this.initArrayFormGroup(obj));
      })
      this.formArray.disable();
    }
  }
  saveData(row: FormGroup) {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    this._httpService._spinnerService.show();
    const value = row.value;
    const formData = this._httpService._helperService.convertFormGroupToFormData(row, ['status', 'edit', 'add', 'addressID']);
    let URL = this._httpService.apiUrl.ContactsSM.AddContacts;
    formData.append('status', value?.status ? '1001' : '1002');
    if (!value.edit) {
      URL = this._httpService.apiUrl.ContactsSM.AddAddress;
    }
    else {
      URL = this._httpService.apiUrl.ContactsSM.EditAddress;
      formData.append('addressID', value?.addressID);
    }
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data saved successfully!');
          this.getDataList();
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  confirmDelete(row, index) {
    if (!row.value?.addressID) {
      this.formArray.removeAt(index);
      return;
    }
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Address',
      body: 'Are you sure you want to delete this address?',
      confirmText: 'Delete',
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.deleteRow(row, index);
        }
      }
    });
  }
  deleteRow(row, index) {
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('addressID', row.value?.addressID);
    this._httpService.post(`${this._httpService.apiUrl.ContactsSM.DeleteAddress}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data deleted successfully!');
          this.formArray.removeAt(index);
          this.getDataList();
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  checkHasRowPendingChanges() {
    let isEdited = this.f.value.addresses.some(x => x.add || x.edit);
    if (isEdited) {
      this.responseModal('error', 'To proceed, please save the current changes.');
      return true;
    }
    return false;
  }
  handleAddRowClick() {
    if (this.checkHasRowPendingChanges()) return;
    if (this.formArray.invalid) {
      this.formArray.markAllAsTouched();
      return;
    }
    this.formArray.push(this.initArrayFormGroup());
    const lastAdded = this.formArray.at(this.formArray.length - 1) as FormGroup;
    lastAdded.get('add').setValue(true);
  }
  handleEditClick(row: FormGroup) {
    if (this.checkHasRowPendingChanges()) return;
    let edit = row.get('edit');
    edit.setValue(true);
    row.enable();
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  get formArray() {
    return this.f.get('addresses') as FormArray;
  }
  get f() {
    return this.formGroup;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
