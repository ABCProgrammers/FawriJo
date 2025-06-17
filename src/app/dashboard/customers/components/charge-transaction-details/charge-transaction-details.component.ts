import { Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../core/services/http.service';
@Component({
  selector: 'app-charge-transaction-details',
  templateUrl: './charge-transaction-details.component.html',
  styleUrl: './charge-transaction-details.component.scss'
})
export class ChargeTransactionDetailsComponent {
  @Input() data;
  destroy$ = new Subject<void>;
  chargeTransactionDetail;
  constructor(
    private _httpService: HttpService,
    public _activeModal: NgbActiveModal,
  ) {
  }
  ngOnInit() {
    this.getDataList();
  }

  getDataList() {
    this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Wallet.ViewDriverReceivedAmounts}?driverCustomerID=${this.data?.driverCustomerID[0]?.customerID}&pageSize=100000&pageNo=0`;
    this._httpService.get(APIURL).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.chargeTransactionDetail = response.data.map(x => ({
          ...x,
          time: this._httpService._helperService.appendDateWithTime(x?.enterTime),
        })).find(x => x.driverChargeAccountID == this.data?.driverChargeAccountID);
      },
    }).add(() => this._httpService._spinnerService.hide());
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
