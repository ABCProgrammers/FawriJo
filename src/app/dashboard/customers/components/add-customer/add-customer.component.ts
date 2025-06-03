import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { matchControlsValidator } from '../../../../shared/validators/validator';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss'
})
export class AddCustomerComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  countryList = [];
  majorList = [];
  cityList = [];
  tempCityList = [];
  customerTypeList = [];
  businessTypeList = [];
  uploadProfileImage;
  profileImage = '';
  uploadCardImage;
  cardImage = '';
  uploadLicenseImage;
  licenseImage = '';

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
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', Validators.required],
      customerPassword: ['', Validators.required],
      customerCountry: [null, Validators.required],
      customerCity: [null],
      customerDOB: [null],
      customerFavLanguage: [null],
      customerVerified: [true],
      status: [true],
    });
    if (this.data?.edit) {
      let row = this.data.row;
      this.f.patchValue(row);
      this.profileImage = row?.customerProfileImage;
      let obj = {
        customerFavLanguage: row?.customerFavLanguage?.lookupID,
        customerCountry: row?.customerCountry?.lookupID,
        customerCity: row?.customerCity?.lookupID,
        customerDOB: new Date(this._httpService._helperService.formatDateToISO(row?.customerDOB)),
      };
      this.f.patchValue(obj);
      this.f.disable();
    }
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const business$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=17&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, business$, city$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.businessTypeList = response[1].data;
      this.cityList = response[2].data;
      this.tempCityList = [...this.cityList];
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
  togglePasswordVisibility(ref: HTMLInputElement) {
    ref.type = ref.type == 'text' ? 'password' : 'text';
  }

  handleCountryChange(event) {
    this.f.get('customerCity').setValue(null);
    this.cityList = [];
    if (event)
      this.cityList = this.tempCityList.filter(x => x.lookupParent == event.lookupID);
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
  onFileChange(event, from) {
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then(response => {
            if (from == 'profile')
              this.uploadProfileImage = response;
            else if (from == 'card')
              this.uploadCardImage = response;
            else if (from == 'license')
              this.uploadLicenseImage = response;
          })
        })
      }
    }
  }
  removeFileHandle(event, inputFile: HTMLInputElement, from) {
    if (from == 'profile')
      this.uploadProfileImage = null;
    else if (from == 'card')
      this.uploadCardImage = null;
    else if (from == 'license')
      this.uploadLicenseImage = null;
    inputFile.value = null;
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
  get f() {
    return this.formGroup;
  }
}
