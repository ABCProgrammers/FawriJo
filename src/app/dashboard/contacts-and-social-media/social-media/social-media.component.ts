import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, takeUntil, Subject, catchError, of } from 'rxjs';
import { HttpService } from '../../../core/services/http.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.component.html',
  styleUrl: './social-media.component.scss'
})
export class SocialMediaComponent {

  destroy$ = new Subject<void>;
  formGroup: FormGroup;
  dataList = [];
  countryList = [];
  socialMethodList = [];
  constructor(
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
  ) {
  }
  ngOnInit() {
    this.initForm();
    this.getLookups();
  }
  initForm() {
    this.formGroup = this.fb.group({
      socialMedia: this.fb.array([])
    });
  }
  initArrayFormGroup(data?) {
    return this.fb.group(
      {
        socialMediaID: [data?.socialMediaID || ''],
        socialMediaCountry: [data?.socialMediaCountry || null, [Validators.required]],
        socialMediaMethod: [data?.socialMediaMethod || null, [Validators.required]],
        socialMediaLink: [data?.socialMediaLink || null, [Validators.required]],
        socialMediaSMID: [data?.socialMediaSMID || null, [Validators.required]],
        add: [false],
        edit: [false],
        status: [data?.status ?? true],
      }
    )
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const socialMethod$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=25&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, socialMethod$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.socialMethodList = response[1].data;
      this.getDataList();
    });
  }
  getDataList(params?) {
    let APIURL = `${this._httpService.apiUrl.ContactsSM.GetSocialMedia}?`;
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
          socialMediaID: item?.socialMediaID,
          socialMediaCountry: item?.socialMediaCountry ? item?.socialMediaCountry[0]?.lookupID : null,
          socialMediaMethod: item?.socialMediaMethod?.lookupID,
          socialMediaLink: item?.socialMediaLink,
          socialMediaSMID: item?.socialMediaSMID,
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
    const formData = this._httpService._helperService.convertFormGroupToFormData(row, ['status', 'edit', 'add', 'socialMediaID', 'socialMediaMethod']);
    let URL = this._httpService.apiUrl.ContactsSM.AddContacts;
    formData.append('status', value?.status ? '1001' : '1002');
    if (!value.edit) {
      URL = this._httpService.apiUrl.ContactsSM.AddSocialMedia;
      formData.append('socialMediaMethod', value?.socialMediaMethod);
    }
    else {
      URL = this._httpService.apiUrl.ContactsSM.EditSocialMedia;
      formData.append('socialMediatMethod', value?.socialMediaMethod);
      formData.append('socialMediaID', value?.socialMediaID);
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
    if (!row.value?.socialMediaID) {
      this.formArray.removeAt(index);
      return;
    }
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete',
      body: 'Are you sure you want to delete this social media info?',
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
    formData.append('socialMediaID', row.value?.socialMediaID);
    this._httpService.post(`${this._httpService.apiUrl.ContactsSM.DeleteSocialMedia}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
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
    let isEdited = this.f.value.socialMedia.some(x => x.add || x.edit);
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
    return this.f.get('socialMedia') as FormArray;
  }
  get f() {
    return this.formGroup;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
