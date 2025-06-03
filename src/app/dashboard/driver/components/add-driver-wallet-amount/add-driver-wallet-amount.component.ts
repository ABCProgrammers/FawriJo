import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-add-driver-wallet-amount',
  templateUrl: './add-driver-wallet-amount.component.html',
  styleUrl: './add-driver-wallet-amount.component.scss'
})
export class AddDriverWalletAmountComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  countryList = [];
  driversList = [];
  usersList = [];
  statusList = [];
  uploadAttachment;
  attachment = '';
  //Input Mobile Start
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Jordan];
  onlyCountries: CountryISO[] = [];
  //Input Mobile End
  constructor(
    public _httpService: HttpService,
    public _modalService: NgbModal,
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _lookupService: LookupService,
  ) { }
  ngOnInit() {
    this.initForm();
    this.getLookups();
  }
  initForm() {
    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      lookup: [null],
    });
    if (this.data?.edit) {
      let row = this.data.row;
      //this.f.patchValue(row);
      //this.f.disable();
    }
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const driver$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const user$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, driver$, user$, status$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.driversList = [] || response[1].data;
      this.usersList = [] || response[2].data;
      this.statusList = response[3].data;

      let desc = this.countryList.map(x => x?.translations[0]?.lookupDesc);
      desc.forEach(x => {
        let iso = x.split(':')[1].trim()?.toLowerCase();
        if (iso)
          this.onlyCountries = [...this.onlyCountries, iso];
      });
    }).add(() => { this._httpService._spinnerService.hide() })
  }

  bindFormData() {
    if (this.data?.edit) {
      const dataRow = this.data?.row;
    }
  }
  handleConfirmClick() {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Add Amount',
      body: 'Are you sure you want to add this amount (129 JOD) to driver wallet?',
      confirmText: 'Add Amount',
      hideIcon:true,
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.saveData()
        }
      }
    });
  }
  saveData() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    return;
    const value = this.f.value;
    this._httpService._spinnerService.show();
    let controls = ['customerPhone', 'customerDOB', 'status', 'confirmPassword'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.f, controls);
    formData.append('customerDOB', (this._httpService._helperService.dateFormate(value?.customerDOB)) || '');
    formData.append('customerPhone', value.customerPhone.e164Number);
    formData.append('status', value.status && '1001' || '1002');
    let URL = this._httpService.apiUrl.Customers.AddCustomer;
    if (this.data?.edit) {
      URL = this._httpService.apiUrl.Customers.AddCustomer;
      formData.append('highlightID', this.data?.row?.highlightID);
    }
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit({ highlightSaved: true });
          this.responseModal('success', 'Data saved successfully!')
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  toggleEdit() {
    this.formGroup.enable();
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  onFileChange(event) {
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then(response => {
            this.uploadAttachment = response;
          })
        })
      }
    }
  }
  removeFileHandle(event, inputFile: HTMLInputElement) {
    this.uploadAttachment = null;
    inputFile.value = null;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  get f() {
    return this.formGroup;
  }
}
