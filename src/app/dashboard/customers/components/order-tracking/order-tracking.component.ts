import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  orderTracking = [];
  constructor(
    public _activeModal: NgbActiveModal,
    private _httpService: HttpService,
  ) { }
  ngOnInit() {
    this.getData();
  }
  getData() {
    this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.Orders.GetOrderStatusLog}?pageSize=1000&pageNo=0&customerOrderID=${this.data?.orderId}`;
    this._httpService.get(APIURL).subscribe({
      next: (response) => {
        this.orderTracking = response.data.map(x => ({
          ...x,
          time: this._httpService._helperService.appendDateWithTime(x?.orderNewStatusTime)
        }));
      }
    }).add(() => this._httpService._spinnerService.hide())
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
