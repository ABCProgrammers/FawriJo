import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  view = false;
  edit = false;
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
      senderName: [''], //Readonly
      senderMobile: [''], //Readonly
      fromCountryID: [null, Validators.required],
      fromCityID: [null, Validators.required],
      fromFullAddress: [''],
      toCountry: [''], //Readonly
      toCityID: [null, Validators.required],
      toFullAddress: [''],
      receiverName: [''],
      receiverMobile: [''],
      customerOrderCategoryID: [null, Validators.required],
      orderStatus: [''], //Readonly
      customerOrderDesc: [''],
      customerOrderPrice: ['', Validators.required],
      deliveryFees: [''],
      commission: [''], //Readonly
      customerOrderComments: [''],
    });
    if (this.data?.edit || this.data?.view) {
      let row = this.data.row;
      this.view = this.data?.view;
      this.edit = this.data?.edit;
      let obj = {
        senderName: row?.fromCustomerID[0]?.fullName,
        senderMobile: row?.fromCustomerID[0]?.customerPhone,
        fromCountryID: row?.fromCountryID?.lookupID,
        fromCityID: row?.fromCityID?.lookupID,
        fromFullAddress: row?.fromFullAddress,
        toCountry: row?.fromCountryID?.lookupNameEN?.lookupName,
        toCityID: row?.toCityID?.lookupID,
        toFullAddress: row?.toFullAddress,
        receiverName: row?.receiverName,
        receiverMobile: row?.receiverMobile,
        customerOrderCategoryID: row?.customerOrderCategoryID?.lookupID,
        orderStatus: row?.customerOrderStatus?.lookupNameEN?.lookupName,
        customerOrderDesc: row?.customerOrderDesc,
        customerOrderPrice: row?.customerOrderPrice,
        deliveryFees: row?.orderDeliveryFees,
        commission: row?.orderCompanyComission || 0,
        customerOrderComments: row?.customerOrderComments,
      }
      this.f.patchValue(obj);
      if (this.edit) {
        let controls = ['senderName', 'senderMobile', 'toCountry', 'orderStatus','commission'];
        controls.forEach(x => {
          this.f.get(x).disable();
        })
      }
      else if (this.view)
        this.f.disable();
    }
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const category$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=18&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, city$, category$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.cityList = response[1].data;
      this.tempCityList = [...this.cityList];
      this.orderCategoryList = response[2].data;
      let desc = this.countryList.map(x => x?.translations[0]?.lookupDesc);
      desc.forEach(x => {
        let iso = x.split(':')[1].trim()?.toLowerCase();
        if (iso)
          this.onlyCountries = [...this.onlyCountries, iso];
      });
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  handleCountryChange(event) {
    this.f.get('fromCityID').setValue(null);
    this.f.get('toCityID').setValue(null);
    this.cityList = [];
    if (event) {
      this.cityList = this.tempCityList.filter(x => x.lookupParent == event.lookupID);
      this.f.get('toCountry').setValue(event?.lookupNameEN);
    }
  }
  saveData() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    const value = this.f.value;
    this._httpService._spinnerService.show();
    let controls = ['senderName', 'senderMobile', 'receiverMobile', 'toCountry', 'orderStatus'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.f, controls);
    formData.append('receiverMobile', value.receiverMobile.e164Number);
    formData.append('customerOrderID', this.data?.row.customerOrderID);
    let URL = this._httpService.apiUrl.Orders.EditOrder;
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
