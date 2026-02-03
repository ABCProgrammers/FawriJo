import { Injectable } from '@angular/core';
import { ExcelService, IExcelExportData } from './excel.service';
import { DatePipe, DecimalPipe } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private _excelService: ExcelService, private _datePipe: DatePipe, private _decimalPipe: DecimalPipe) {
  }
  dateFormate(date, format = 'mediumDate') {
    return this._datePipe.transform(date, format);
  }
  currencyFormate(date, format = '2.3-3') {
    return this._decimalPipe.transform(date, format);
  }
  exportCustomers(customers: any[]) {
    let data = customers.map(x => ([
      x?.customerID,
      x?.fullName,
      x?.nationalID,
      x?.customerPhone,
      x?.customerLevel?.lookupNameEN?.lookupName,
      x?.businessCategory?.lookupNameEN?.lookupName,
      x?.customerCountry?.lookupNameEN?.lookupName,
      x?.customerCity?.lookupNameEN?.lookupName,
      x?.deliveredOrders,
      this.currencyFormate(x?.activeWalletAmount),
      x?.status?.lookupNameEN?.lookupName,
      x?.customerLoggedIn ? 'Yes' : 'No',
    ]));
    let sections = [
      {
        heading: ['Customers'],
        data,
        headers: ['ID', 'Full Name', 'National ID', 'Phone', 'Type', 'Business', 'Country', 'City', 'Delivered Orders', 'Current Wallet', 'Status', 'Logged In'],
      }
    ];
    this._excelService.exportToExcel(sections, 'Customers');
  }
  exportCustomersOrders(orders: any[]) {
    let data = orders.map(x => ([
      x?.customerOrderID,
      x?.fromCustomerID[0]?.fullName,
      x?.fromCustomerID[0]?.customerPhone,
      x?.fromCityID?.lookupNameEN?.lookupName,
      x?.fromFullAddress,
      x?.customerOrderCategoryID?.lookupNameEN?.lookupName,
      `${this.currencyFormate(x?.customerOrderPrice)} JOD`,
      `${this.currencyFormate(x?.orderDeliveryFees)} JOD`,
      `${this.currencyFormate(x?.orderCompanyComission || 0)} JOD`,
      x?.receiverName,
      x?.toCityID?.lookupNameEN?.lookupName,
      x?.toFullAddress,
      x?.enterUser[0]?.fullName,
      `${this.dateFormate(x?.enterDate)} ${this.dateFormate(x?.time, 'shortTime')}`,
      x?.customerOrderStatus?.lookupNameEN?.lookupName,
      x?.customerOrderComments,
      x?.customerOrderDesc,
    ]));
    let sections = [
      {
        heading: ['Customers Orders'],
        data,
        headers: ['ID', 'Customer Name', 'Customer Phone', 'Customer City', 'Customer Address', 'Category', 'Price', 'Fees', 'Company',
          'Receiver Name', 'Receiver City', 'Receiver Address', 'Created By', 'Created Date', 'Status', 'Comments', 'Description'],
      }
    ];
    this._excelService.exportToExcel(sections, 'Customers_Orders');
  }
  exportDriverWalletDetails(wallets: any[]) {
    let data = wallets.map(x => ([
      x?.walletTransactionID,
      `${this.dateFormate(x?.enterDate)}`,
      x?.transactionType?.lookupNameEN?.lookupName,
      x?.driverChargeAccountID,
      `${this.currencyFormate(x?.transactionAmount)}`,
      x?.status?.lookupNameEN?.lookupName,
    ]));
    let sections = [
      {
        heading: ['Driver Wallet Details Report'],
        data,
        headers: ['Wallet Transaction ID #', 'Transaction Date', 'Transaction Type', 'Charge Transaction ID #', 'Transaction Amount', 'Status'],
      }
    ];
    this._excelService.exportToExcel(sections, 'Driver_Wallet_Details');
  }
  exportDriversWallets(wallets: any[]) {
    let data = wallets.map(x => ([
      x?.driverChargeAccountID,
      x?.driverCustomerID[0]?.fullName,
      x?.driverCustomerID[0]?.customerPhone,
      `${this.dateFormate(x?.enterDate)}`,
      x?.transactionFullName,
      x?.transactionMobile,
      `${this.currencyFormate(x?.transactionAmount)}`,
      x?.status?.lookupNameEN?.lookupName,
    ]));
    let sections = [
      {
        heading: ['Drivers Wallets Report'],
        data,
        headers: ['ID #', 'Customer Name', 'Phone', 'Transaction Date', 'Transaction By', 'Transaction Mobile', 'Transaction Amount', 'Status'],
      }
    ];
    this._excelService.exportToExcel(sections, 'Drivers_Wallets');
  }
}
