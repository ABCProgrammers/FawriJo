import { Component } from '@angular/core';
import { HeaderService } from '../core/services/header.service';
import { HttpService } from '../core/services/http.service';
import { Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { CustomerType } from '../shared/enums/enums';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  destroy$ = new Subject<void>;
  customersData;
  driversData;
  incomeData;
  ordersData;
  dataList = [];
  constructor(
    private headerService: HeaderService,
    private _httpService: HttpService,

  ) { }

  ngOnInit(): void {
    this.headerService.setTitle('Dashboard');
    this.getData();
  }
  getData() {
    this._httpService._spinnerService.show();
    const year = new Date().getFullYear();
    const orders$ = this._httpService.get(`${this._httpService.apiUrl.Dashboard.GetOrdersCount}`).pipe(catchError(error => of(error)));
    const customers$ = this.customers$(year).pipe(catchError(error => of(error)));
    const driver$ = this.dirvers$(year).pipe(catchError(error => of(error)));
    const income$ = this.income$(year).pipe(catchError(error => of(error)));
    forkJoin([customers$, driver$, income$, orders$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.customersData = response[0].data;
      this.driversData = response[1].data;
      this.incomeData = response[2].data;
      this.ordersData = response[3].data;
    }).add(() => this._httpService._spinnerService.hide())
  }
  customers$(year) {
    let APIURL = `${this._httpService.apiUrl.Dashboard.GetRegistrationsByYear}?pageSize=1000&pageNo=0&year=${year}&userLevel=${CustomerType.Vendor}`;
    return this._httpService.get(APIURL);
  }
  dirvers$(year) {
    let APIURL = `${this._httpService.apiUrl.Dashboard.GetRegistrationsByYear}?pageSize=1000&pageNo=0&year=${year}&userLevel=${CustomerType.Driver}`;
    return this._httpService.get(APIURL);
  }
  income$(year) {
    let APIURL = `${this._httpService.apiUrl.Dashboard.GetCompanyIncome}?pageSize=1000&pageNo=0&year=${year}`;
    return this._httpService.get(APIURL);
  }
  getCustomerEventData(event) {
    this.customers$(event?.year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.customersData = response.data;
      }
    })
  }
  getDriverEventData(event) {
    this.dirvers$(event?.year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.driversData = response.data;
      }
    })
  }
  getIncomeEventData(event) {
    this.income$(event?.year).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.incomeData = response.data;
      }
    })
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
