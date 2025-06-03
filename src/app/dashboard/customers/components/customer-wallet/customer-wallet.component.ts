import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, debounceTime, distinctUntilChanged, Subject, takeUntil, catchError, of } from 'rxjs';
import { TableColumn, TableConfig } from '../../../../shared/components/data-table/IDataTable';
import { HeaderService } from '../../../../core/services/header.service';
import { HttpService } from '../../../../core/services/http.service';

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
    tableLayout: '1fr 1fr 1fr 1fr .4fr',
  };
  tableColumns: TableColumn[] = [];

  dataList = [];
  transactionTypeList = [];
  filterParams;
  constructor(
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _httpService: HttpService,
  ) {
    this._headerService.setTitle('Customer Wallet');
  }
  ngOnInit() {
    this.initTableColumns();
    this.initFilterForm();
    this.getLookups();
  }

  initFilterForm() {
    this.filterForm = this.fb.group({
      type: [null],
      creationDate: [''],
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
    });
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const transcType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([transcType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.transactionTypeList = [];
      this.getDataList();
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
      { key: 'customerID', label: 'Wallet Transaction ID #' },
      { key: 'customerName3', label: 'Transaction Type' },
      { key: 'charge', label: 'Charge Transaction ID #' },
      { key: 'customerEmail1', label: 'Transaction Amount' },
      { key: 'status', label: 'Status' },
    ];
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
