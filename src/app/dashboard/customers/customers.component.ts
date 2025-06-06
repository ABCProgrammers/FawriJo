import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerType, Status } from '../../shared/enums/enums';
import { HeaderService } from '../../core/services/header.service';
import { HttpService } from '../../core/services/http.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../shared/components/modal-message/modal-message.component';
import { AddCustomerComponent } from './components/add-customer/add-customer.component';
import { TableColumn, TableConfig } from '../../shared/components/data-table/IDataTable';
import { SendCustomerNotificaionModalComponent } from './components/send-customer-notificaion-modal/send-customer-notificaion-modal.component';
import { AppRoutes } from '../../shared/routes/appRoutes';
import { ExportService } from '../../core/services/export.service';
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
    multiSelect: true,
    paging: true,
    hideTotalRecord: true,
    filter: {
      Sort: 1,
      PageSize: this.limit,
    },
    tableLayout: '.2fr .4fr 1fr 1.5fr 1fr 1fr 1fr 1fr .6fr 1fr',
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
  customerType = CustomerType;
  multiSelectedItems = [];
  isBlockedStatus = false;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private _exportService: ExportService,
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
      customerFullName: [''],
      status: [null],
      country: [null],
      city: [null],
      creationDate: [''],
      lastSeen: [''],
      customerLevelID: [null],
      businessCategoryID: [null],
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
    const type$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=26&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, business$, city$, status$, type$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.businessTypeList = response[1].data;
      this.cityList = response[2].data;
      this.tempCityList = [...this.cityList]
      this.statusList = response[3].data.filter(x => x.lookupID == Status.Active || x.lookupID == Status.InActive);
      this.customerTypeList = response[4].data;
      this.getDataList();
    })
  }
  handleCountryChange(event) {
    this.filterForm.get('city').setValue(null);
    if (event)
      this.cityList = this.tempCityList.filter(x => x.lookupParent == event.lookupID);
    else
      this.cityList = this.tempCityList;
  }
  handleExportCustomerClick() {
    this._exportService.exportCustomers(this.dataList);
  }
  handleMultiSelect(event) {
    this.multiSelectedItems = event.selectedItems;
    this.isBlockedStatus = this.multiSelectedItems.every(x => x?.status?.lookupID == Status.Blocked);
  }
  handleMultiActionClick(from) {
    if (from == 'block') {
      this.confirmBlock();
    }
    else {
      this.handSendNotificationClick();
    }
  }
  confirmBlock() {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Confirm Block',
      body: 'Are you sure you want to block the customers?',
      confirmText: 'Yes',
      hideIcon: true,
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.blockCustomers();
        }
      }
    });
  }
  blockCustomers() {
    this._httpService._spinnerService.show();
    let customerIds = this.multiSelectedItems.filter(x => x.status?.lookupID != Status.Blocked).map(x => x.customerID);
    const formData = new FormData();
    formData.append('customerIDs', customerIds.toString());
    this._httpService.post(`${this._httpService.apiUrl.Customers.BlockCustomers}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data updated successfully!');
          this.otherData = { ...this.otherData, clearSelectedRow: true }
          this.pageNo = 1;
          this.getDataList();
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  handSendNotificationClick() {
    const modalRef = this._modalService.open(SendCustomerNotificaionModalComponent);
    let customerIds = this.multiSelectedItems.map(x => x.customerID);
    modalRef.componentInstance.data = { customerIds };
    modalRef.componentInstance.eventData.subscribe(x => {
      if (x) {
        modalRef.dismiss();
        this.otherData = { ...this.otherData, clearSelectedRow: true }
      }
    });
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
      headingText: 'Update Status',
      body: 'Are you sure you want to update the customer status?',
      confirmText: 'Update',
      hideIcon: true,
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.updateStatus(row);
        }
      }
    });
  }
  updateStatus(row) {
    this._httpService._spinnerService.show();
    let status = row?.status?.lookupID == Status.Active ? Status.InActive : Status.Active;
    const formData = new FormData();
    formData.append('status', status.toString());
    formData.append('customerID', row?.customerID);
    this._httpService.post(`${this._httpService.apiUrl.Customers.UpdateCustomerProfile}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data updated successfully!');
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
      { key: 'customerID', label: 'ID #' },
      { key: 'customerName', label: 'Full Name' },
      { key: 'customerPhone', label: 'Phone' },
      { key: 'customerLevel.lookupNameEN.lookupName', label: 'Type' },
      { key: 'businessCategory.lookupNameEN.lookupName', label: 'Business' },
      { key: 'customerCountry.lookupNameEN.lookupName', label: 'Country' },
      { key: 'customerCity.lookupNameEN.lookupName', label: 'City' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: '' },
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
