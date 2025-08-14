import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject, debounceTime } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { matchControlsValidator } from '../../../../shared/validators/validator';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { Status } from '../../../../shared/enums/enums';
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
  uploadLicenseImage;
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
    this.f.get('fullName').valueChanges.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        let fullNameArray = value.trim().split(' ');
        if (fullNameArray.length > 1) {
          let firstName = fullNameArray[0];
          let familyName = fullNameArray.pop();
          this.f.patchValue({ firstName, familyName });
        }
        else {
          this.f.get('firstName').setValue(value);
          this.f.get('familyName').setValue('');
        }
      }
      else
        this.f.get('firstName').setValue('');
    })

  }
  initForm() {
    this.formGroup = this.fb.group({
      fullName: ['', Validators.required],
      firstName: ['', Validators.required],
      familyName: ['', Validators.required],
      nationalID: ['', Validators.required],
      customerPhone: ['', Validators.required],
      customerPassword: ['', Validators.required],
      customerCountry: [null, Validators.required],
      customerCity: [null, Validators.required],
      customerLevelID: [null, Validators.required],
      businessCategoryID: [null],
      customerVerified: [true],
      status: [true],
    });
    if (this.data?.edit) {
      let row = this.data?.row;
      this.f.patchValue(row);
      this.profileImage = row?.customerProfileImage;
      let obj = {
        customerCountry: row?.customerCountry?.lookupID,
        customerCity: row?.customerCity?.lookupID,
        customerLevelID: row?.customerLevel?.lookupID,
        businessCategoryID: row?.businessCategory?.lookupID,
        status: row?.status?.lookupID == Status.Active ? true : false,
      };
      this.f.patchValue(obj);
      this.f.disable();
      this.f.get('customerPassword').clearValidators();
      this.f.get('customerPassword').updateValueAndValidity();
    }
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const business$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=17&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const type$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=26&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, business$, city$, type$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.businessTypeList = response[1].data;
      this.cityList = response[2].data;
      this.tempCityList = [...this.cityList];
      this.customerTypeList = response[3].data;
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
    const value = this.f.value;
    this._httpService._spinnerService.show();
    let controls = ['customerPhone', 'status'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.f, controls);
    formData.append('customerPhone', value.customerPhone.e164Number);
    formData.append('status', value.status && '1001' || '1002');
    this.uploadProfileImage?.file && formData.append('customerProfileImage', this.uploadProfileImage.file);
    this.uploadCardImage?.file && formData.append('IDCardImage', this.uploadCardImage.file);
    this.uploadLicenseImage?.file && formData.append('licenseImage', this.uploadLicenseImage.file);
    let URL = this._httpService.apiUrl.Customers.AddCustomer;
    if (this.data?.edit) {
      URL = this._httpService.apiUrl.Customers.UpdateCustomerProfile;
      formData.append('customerID', this.data?.row?.customerID);
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
