import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { LookupService } from '../../../../core/services/lookup.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.scss'
})
export class EditOrderComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  countryList = [];
  cityList = [];
  tempCityList = [];
  orderCategoryList = [];
  orderStatusList = [];

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
      status: [true],
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
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const category$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=17&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const orderStatus$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=17&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, city$, category$, orderStatus$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.cityList = response[1].data;
      this.tempCityList = [...this.cityList];
      this.orderCategoryList = response[2].data;
      this.orderStatusList = response[3].data;
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
