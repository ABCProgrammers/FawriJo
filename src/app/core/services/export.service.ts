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
      x?.customerPhone,
      x?.customerLevel?.lookupNameEN?.lookupName,
      x?.businessCategory?.lookupNameEN?.lookupName,
      x?.customerCountry?.lookupNameEN?.lookupName,
      x?.customerCity?.lookupNameEN?.lookupName,
      x?.status?.lookupNameEN?.lookupName,
    ]));
    let sections = [
      {
        heading: ['Customers'],
        data,
        headers: ['ID', 'Full Name', 'Phone', 'Type', 'Business', 'Country', 'City', 'Status'],
      }
    ];
    this._excelService.exportToExcel(sections, 'Customers');
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
