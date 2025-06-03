import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Status } from '../../shared/enums/enums';
import { HeaderService } from '../../core/services/header.service';
import { HttpService } from '../../core/services/http.service';
import { LookupService } from '../../core/services/lookup.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { AddCustomerComponent } from './components/add-customer/add-customer.component';
import { TableColumn, TableConfig } from '../../shared/components/data-table/IDataTable';
import { SendCustomerNotificaionModalComponent } from './components/send-customer-notificaion-modal/send-customer-notificaion-modal.component';
import { AppRoutes } from '../../shared/routes/appRoutes';
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent {
  destroy$ = new Subject<void>;
  filterForm: FormGroup;
  pageNo = 1;
  total = 0;
  limit = 10;
  tableConfig: TableConfig = {
    paging: true,
    hideTotalRecord: true,
    filter: {
      Sort: 1,
      PageSize: this.limit,
    },
    tableLayout: '.4fr 1fr 1.5fr 1fr 1fr 1fr 1fr .6fr 1fr',
  };
  tableColumns: TableColumn[] = [];

  dataList = [];
  statusList = [];
  countryList = [];
  cityList = [];
  tempCityList = [];
  customerTypeList = [];
  businessTypeList = [];
  filterParams;
  showFilter = false;
  statusEnum = Status;
  otherData;
  appRoutes = AppRoutes;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    public _modalService: NgbModal,
    public _lookupService: LookupService,
  ) {
    this._headerService.setTitle('Customers');
  }
  ngOnInit() {
    this.initTableColumns();
    this.initFilterForm();
    this.getLookups();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      search: [''],
      status: [null],
      country: [null],
      city: [null],
      creationDate: [''],
      lastSeen: [''],
      online: [null],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim({ ...data });
      if (formValues?.creationDate) {
        formValues = {
          ...formValues,
          dateOfRegisterationFrom: this._httpService._helperService.dateFormate(formValues?.creationDate[0]),
          dateOfRegisterationTo: this._httpService._helperService.dateFormate(formValues?.creationDate[1]),
        };
      }
      delete formValues.creationDate;
      if (formValues?.lastSeen) {
        formValues = {
          ...formValues,
          lastSeenFrom: this._httpService._helperService.dateFormate(formValues?.lastSeen[0]),
          lastSeenTo: this._httpService._helperService.dateFormate(formValues?.lastSeen[1]),
        };
      }
      delete formValues.lastSeen;
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const business$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=17&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, business$, city$, status$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.businessTypeList = response[1].data;
      this.cityList = response[2].data;
      this.tempCityList = [...this.cityList]
      this.statusList = response[3].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);
      this.getDataList();
    })
  }
  handSendNotificationClick() {
    const modalRef = this._modalService.open(SendCustomerNotificaionModalComponent);
  }
  handleAddClick(row?) {
    const modalRef = this._modalService.open(AddCustomerComponent, { size: 'xl' });
    modalRef.componentInstance.data = { edit: (row && true || false), row };
    modalRef.componentInstance.eventData.subscribe(x => {
      this.getDataList();
      modalRef.dismiss();
    })
  }
  getDataList(params?) {
    params && this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Customers.GetCustomers}?`;
    let defaultParams = `&pageSize=${this.limit}&pageNo=${this.pageNo - 1}`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data;
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  toggleFilters() {
    this.showFilter = !this.showFilter;
  }
  resetFilterForm() {
    this.pageNo = 1;
    this.filterForm.reset();
  }

  confirmDelete(row) {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Customer',
      body: 'Are you sure you want to delete this customer?',
      confirmText: 'Delete',
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.deleteRow(row);
        }
      }
    });
  }
  deleteRow(row) {
    return;
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('highlightID', row?.highlightID);
    this._httpService.post(`${this._httpService.apiUrl.Customers.AddCustomer}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data deleted successfully!');
          this.pageNo = 1;
          this.getDataList();
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
  resetControlValue(control) {
    this.filterForm.get(control).setValue('');
  }
  clearSelectedRow() {
    this.otherData = { ...this.otherData, clearSelectedRow: true }
  }
  handleChangePageSize(event) {
    let value = +event.target.value;
    this.tableConfig.filter.PageSize = value;
    this.limit = value;
    this.pageNo = 1;
    this.getDataList();
  }
  onPageChange(page: number) {
    this.pageNo = page;
    this.getDataList(this.filterParams);
  }
  onSortChange(sort: any) {
    if (sort?.direction && sort?.column) {
      switch (sort.column) {
        case "lookupNameEN":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 3 : 2;
          break;
        case "sort":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 5 : 4;
          break;
        case "videos":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 7 : 6;
          break;
        case "cards":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 9 : 8;
          break;
        case "qbanks":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 11 : 10;
          break;
        case "books":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 13 : 12;
          break;
        case "status":
          this.tableConfig.filter.Sort = sort.direction === "desc" ? 15 : 14;
          break;
        default:
          break;
      }
    } else {
      this.tableConfig.filter.Sort = 1;
    }
    this.getDataList(this.filterParams);
  }
  initTableColumns() {
    this.tableColumns = [
      { key: 'customerID', label: 'ID' },
      { key: 'customerName', label: 'Name' },
      { key: 'customerPhone', label: 'Phone' },
      { key: 'customerEmail', label: 'Type' },
      { key: 'businessCategory.lookupNameEN.lookupName', label: 'Business' },
      { key: 'customerCountry.lookupNameEN.lookupName', label: 'Country' },
      { key: 'customerCity.lookupNameEN.lookupName', label: 'City' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: '' },
    ];
  }
  handleMultiSelect(event) {
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
