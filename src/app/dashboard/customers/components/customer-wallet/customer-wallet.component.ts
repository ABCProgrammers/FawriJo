import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { TableColumn, TableConfig } from '../../../../shared/components/data-table/IDataTable';
import { HeaderService } from '../../../../core/services/header.service';
import { HttpService } from '../../../../core/services/http.service';
import { ActivatedRoute } from '@angular/router';
import { ExportService } from '../../../../core/services/export.service';
import { AppRoutes } from '../../../../shared/routes/appRoutes';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChargeTransactionDetailsComponent } from '../charge-transaction-details/charge-transaction-details.component';

@Component({
  selector: 'app-customer-wallet',
  templateUrl: './customer-wallet.component.html',
  styleUrl: './customer-wallet.component.scss'
})
export class CustomerWalletComponent {
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
    tableLayout: '1fr 1fr 1fr 1fr 1fr .4fr',
  };
  tableColumns: TableColumn[] = [];

  dataList = [];
  transactionTypeList = [];
  filterParams;
  driverId = 0;
  totalAmount = 0;
  driverName = '';
  appRoutes = AppRoutes;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _activeRoute: ActivatedRoute,
    private _exportService: ExportService,
    private _modalService: NgbModal,

  ) {
    this._headerService.setTitle('Drivers Cliq Transactions');
  }
  ngOnInit() {
    this.initTableColumns();
    this._activeRoute.queryParams.subscribe(params => {
      this.driverId = +params['id'];
      this.driverName = params['name'];
      this.getDataList();
    })
    this.initFilterForm();
    this.getLookups();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      transactionType: [null],
      creationDate: [''],
    });
    this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((data) => {
      this.pageNo = 1;
      let formValues = this._httpService._helperService.trim({ ...data });
      if (formValues?.creationDate) {
        formValues = {
          ...formValues,
          fromDate: this._httpService._helperService.dateFormate(formValues?.creationDate[0]),
          toDate: this._httpService._helperService.dateFormate(formValues?.creationDate[1]),
        };
      }
      delete formValues.creationDate;
      this.filterParams = new URLSearchParams(formValues).toString();
      this.getDataList(this.filterParams);
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const transcType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=20&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([transcType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.transactionTypeList = response[0].data;
    })
  }
  getDataList(params?) {
    params && this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Wallet.ViewDriverWalletDetails}?`;
    let defaultParams = `&driverCustomerID=${this.driverId}&pageSize=${this.limit}&pageNo=${this.pageNo - 1}`;
    let url = params && `${APIURL}${params}${defaultParams}` || `${APIURL}${defaultParams}`;
    this._httpService.get(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.dataList = response.data.map(x => ({
          ...x,
          time: this._httpService._helperService.appendDateWithTime(x?.enterTime),
        }));
        this.totalAmount = response?.info?.totalAllRecordsCount;
        this.total = response?.info?.totalRecordsCount;
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  handleChargeIdClick(row) {
    if (!row?.driverChargeAccountID) return;
    const ref = this._modalService.open(ChargeTransactionDetailsComponent, { size: 'lg' });
    ref.componentInstance.data = { ...row };
  }
  handleExportWalletClick() {
    this._exportService.exportDriverWalletDetails(this.dataList);
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
      { key: 'walletTransactionID', label: 'Cliq Transaction ID #' },
      { key: 'dateTime', label: 'Transaction Date' },
      { key: 'transactionType.lookupNameEN.lookupName', label: 'Transaction Type' },
      { key: 'charge', label: 'Charge Transaction ID #' },
      { key: 'transactionAmount', label: 'Transaction Amount', currency: { decimalFormat: '2.3-3', appendText: ' JOD' } },
      { key: 'status', label: 'Status' },
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
