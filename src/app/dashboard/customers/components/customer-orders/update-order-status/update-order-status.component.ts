import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject, } from 'rxjs';
import { HttpService } from '../../../../../core/services/http.service';
import { ModalMessageComponent } from '../../../../../shared/components/modal-message/modal-message.component';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
@Component({
  selector: 'app-update-order-status',
  templateUrl: './update-order-status.component.html',
  styleUrl: './update-order-status.component.scss'
})
export class UpdateOrderStatusComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  orderStatusList = [];
  orderStatus = new FormControl(null, [Validators.required]);
  constructor(
    public _httpService: HttpService,
    public _modalService: NgbModal,
    public _activeModal: NgbActiveModal,
  ) { }
  ngOnInit() {
    this.getLookups();
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const orderStatus$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=19&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([orderStatus$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.orderStatusList = response[0].data;
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  confirmDelete() {
    if (this.orderStatus.invalid) {
      this.orderStatus.markAllAsTouched();
      return;
    }
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Update Status',
      body: `Are you sure you want to update the status of order #${this.data?.orderId} ?`,
      confirmText: 'Confirm',
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.saveData();
        }
      }
    });
  }
  saveData() {
    const formData = new FormData();
    let URL = this._httpService.apiUrl.Orders.UpdateOrderStatus;
    formData.append('orderId', this.data?.orderId);
    formData.append('newStatusId', this.orderStatus.value);
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit(true);
          this.responseModal('success', 'Order status updated successfully!')
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
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
