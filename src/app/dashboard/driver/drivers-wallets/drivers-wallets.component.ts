import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { HeaderService } from '../../../core/services/header.service';
import { HttpService } from '../../../core/services/http.service';
import { TableConfig, TableColumn } from '../../../shared/components/data-table/IDataTable';
import { AddDriverWalletAmountComponent } from '../components/add-driver-wallet-amount/add-driver-wallet-amount.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { CustomerType, Status } from '../../../shared/enums/enums';
import { ExportService } from '../../../core/services/export.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-drivers-wallets',
  templateUrl: './drivers-wallets.component.html',
  styleUrl: './drivers-wallets.component.scss'
})
export class DriversWalletsComponent {
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
    tableLayout: '.3fr 1fr 1fr .80fr 1fr 1.3fr .60fr .60fr .6fr',
  };
  tableColumns: TableColumn[] = [];

  dataList = [];
  driversList = [];
  statusList = [];
  filterParams;
  showFilter = false;
  statusEnum = Status;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private _exportService: ExportService,
  ) {
    this._headerService.setTitle('Drivers Cliq Transactions');
  }
  ngOnInit() {
    this.initTableColumns();
    this.initFilterForm();
    this.getLookups();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      driverCustomerID: [null],
      status: [null],
      creationDate: [''],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim({ ...data });
      if (formValues?.creationDate) {
        formValues = {
          ...formValues,
          createdFrom: this._httpService._helperService.dateFormate(formValues?.creationDate[0]),
          createdTo: this._httpService._helperService.dateFormate(formValues?.creationDate[1]),
        };
      }
      delete formValues.creationDate;
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const drivers$ = this._httpService.get(`${this._httpService.apiUrl.Customers.GetCustomers}?customerLevelID=${CustomerType.Driver}&status=1001&pageSize=100000`).pipe(catchError(error => of(error)));
    const status$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=1&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([drivers$, status$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.driversList = response[0].data;
      this.statusList = response[1].data.filter(x => x.lookupID !== Status.Blocked);
      this.getDataList();
    })
  }
  handleExportWalletClick() {
    this._exportService.exportDriversWallets(this.dataList);
  }
  handleAddClick(row?) {
    const modalRef = this._modalService.open(AddDriverWalletAmountComponent, { size: 'lg' });
    modalRef.componentInstance.data = { edit: (row && true || false), row };
    modalRef.componentInstance.eventData.subscribe(x => {
      if (x) {
        this.getDataList();
        modalRef.dismiss();
      }
    })
  }
  getDataList(params?) {
    params && this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Wallet.ViewDriverReceivedAmounts}?`;
    let defaultParams = `&pageSize=${this.limit}&pageNo=${this.pageNo - 1}`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data.map(x => ({
          ...x,
          time: this._httpService._helperService.appendDateWithTime(x?.enterTime),
        }));
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  confirmDelete(row) {
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Delete Transaction',
      body: 'Are you sure you want to delete this transaction?',
      confirmText: 'Delete',
      hideIcon: true,
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.deleteCustomer(row);
        }
      }
    });
  }
  deleteCustomer(row) {
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('driverChargeAccountID', row?.driverChargeAccountID);
    this._httpService.post(`${this._httpService.apiUrl.Wallet.DeleteDriverReceivedAmount}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
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
  toggleFilters() {
    this.showFilter = !this.showFilter;
  }
  resetFilterForm() {
    this.pageNo = 1;
    this.filterForm.reset();
  }

  resetControlValue(control) {
    this.filterForm.get(control).setValue('');
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
  initTableColumns() {
    this.tableColumns = [
      { key: 'driverChargeAccountID', label: 'ID #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'dateTime', label: 'Transaction Date' },
      { key: 'transactionFullName', label: 'Transaction By' },
      { key: 'transactionMobile', label: 'Transaction Mobile' },
      { key: 'transactionAmount', label: 'Transaction Amount (JOD)'},
      { key: 'attachment', label: 'Attachment' },
      { key: 'status', label: 'Status' },
      { key: 'action', label: 'Action' },
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
