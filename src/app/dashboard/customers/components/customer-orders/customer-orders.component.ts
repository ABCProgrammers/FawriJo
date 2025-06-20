import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeaderService } from '../../../../core/services/header.service';
import { HttpService } from '../../../../core/services/http.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { TableConfig, TableColumn } from '../../../../shared/components/data-table/IDataTable';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
import { Status } from '../../../../shared/enums/enums';
import { AppRoutes } from '../../../../shared/routes/appRoutes';
import { EditOrderComponent } from '../edit-order/edit-order.component';
import { OrderTrackingComponent } from '../order-tracking/order-tracking.component';
import { ExportService } from '../../../../core/services/export.service';
@Component({
  selector: 'app-customer-orders',
  templateUrl: './customer-orders.component.html',
  styleUrl: './customer-orders.component.scss'
})
export class CustomerOrdersComponent {
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
    tableLayout: '.6fr 1.25fr .60fr .70fr 1.2fr 1fr .60fr .85fr .80fr .80fr 1.35fr',
  };
  tableColumns: TableColumn[] = [];

  dataList = [];
  statusList = [];
  countryList = [];
  cityList = [];
  tempCityList = [];
  categoryList = [];
  customerList = [];
  filterParams;
  showFilter = false;
  statusEnum = Status;
  otherData;
  appRoutes = AppRoutes;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private _exportService: ExportService,
  ) {
    this._headerService.setTitle('Customers Orders');
  }
  ngOnInit() {
    this.initTableColumns();
    this.initFilterForm();
    this.getLookups();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      fromCustomerID: [null],
      orderStatus: [null],
      fromCountryID: [null],
      fromCityID: [null],
      toCityID: [null],
      orderCategoryID: [null],
      creationDate: [''],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim({ ...data });
      if (formValues?.creationDate) {
        formValues = {
          ...formValues,
          enteredFrom: this._httpService._helperService.dateFormate(formValues?.creationDate[0]),
          enteredTo: this._httpService._helperService.dateFormate(formValues?.creationDate[1]),
        };
      }
      delete formValues.creationDate;
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const category$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=18&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const city$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=3&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=19&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const customers$ = this._httpService.get(`${this._httpService.apiUrl.Customers.GetCustomers}?status=1001&pageSize=100000`).pipe(catchError(error => of(error)));
    forkJoin([country$, category$, city$, status$, customers$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.categoryList = response[1].data;
      this.cityList = response[2].data;
      this.tempCityList = [...this.cityList]
      this.statusList = response[3].data;
      this.customerList = response[4].data;
      this.getDataList();
    })
  }
  handleCountryChange(event) {
    this.filterForm.get('fromCityID').setValue(null);
    this.filterForm.get('toCityID').setValue(null);
    if (event)
      this.cityList = this.tempCityList.filter(x => x.lookupParent == event.lookupID);
    else
      this.cityList = this.tempCityList;
  }
  handleOrderTrackingClick(row) {
    const modalRef = this._modalService.open(OrderTrackingComponent, { size: 'xl' });
    modalRef.componentInstance.data = { orderId: row?.customerOrderID };
  }
  handleOrderDetailsClick(row, from) {
    const modalRef = this._modalService.open(EditOrderComponent, { size: 'xl' });
    modalRef.componentInstance.data = { [from]: true, row };
    modalRef.componentInstance.eventData.subscribe(x => {
      this.getDataList();
      modalRef.dismiss();
    })
  }
  getDataList(params?) {
    params && this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Orders.GetOrders}?`;
    let defaultParams = `&pageSize=${this.limit}&pageNo=${this.pageNo - 1}`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data.map(x => ({
          ...x,
          time: this._httpService._helperService.appendDateWithTime(x?.enterTime)
        }));
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  handleExportCustomerOrdersClick() {
    this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Orders.GetOrders}?`;
    let defaultParams = `&pageSize=${100000}&pageNo=${0}`;
    let url = this.filterParams && `${APIURL}${this.filterParams}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const dataList = response.data.map(x => ({ ...x, time: this._httpService._helperService.appendDateWithTime(x?.enterTime) }));
        this._exportService.exportCustomersOrders(dataList);
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
      headingText: 'Delete Order',
      body: 'Are you sure you want to delete this order?',
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
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('customerOrderID', row?.customerOrderID);
    this._httpService.post(`${this._httpService.apiUrl.Orders.DeleteOrders}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
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
      { key: 'customerOrderID', label: 'ID #' },
      { key: 'fromCustomerID', label: 'Customer' },
      { key: 'fromCityID.lookupNameEN.lookupName', label: 'City' },
      { key: 'customerOrderCategoryID.lookupNameEN.lookupName', label: 'Category' },
      { key: 'price', label: 'Price & Fees (JOD)' },
      { key: 'receiverName', label: 'Receiver Name' },
      { key: 'toCityID.lookupNameEN.lookupName', label: 'City' },
      { key: 'enterDate', label: 'Created At' },
      { key: 'enterUser[0].fullName', label: 'Created By' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ];
  }
  handleMultiSelect(event) {
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
