import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../../../core/services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { ModalMessageComponent } from '../../../../../shared/components/modal-message/modal-message.component';

@Component({
  selector: 'app-add-wallet-amount',
  templateUrl: './add-wallet-amount.component.html',
  styleUrl: './add-wallet-amount.component.scss'
})
export class AddWalletAmountComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  amount = new FormControl('', Validators.required);
  constructor(
    private _httpService: HttpService,
    private _modalService: NgbModal,
    public _activeModal: NgbActiveModal,
  ) { }
  ngOnInit() {
  }
  handleConfirmClick() {
    if (this.amount.invalid) {
      this.amount.markAsTouched();
      return;
    }
    const modalRef = this._modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.data = {
      headingText: 'Confirm Adding Wallet Amount',
      body: `Are you sure you want to add this (${(+this.amount.value).toFixed(3)} JOD) amount to driver wallet?`,
      confirmText: 'Confirm Adding',
      hideIcon: true,
    }
    modalRef.componentInstance.eventData.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.saveData()
        }
      }
    });
  }
  saveData() {
    this._httpService._spinnerService.show();
    const formData = new FormData();
    formData.append('customerID', this.data?.driverId);
    formData.append('amount', this.amount.value);
    let URL = this._httpService.apiUrl.Wallet.AddDriverWalletAmount;
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit(true);
          this.responseModal('success', 'Amount added successfully!');
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
