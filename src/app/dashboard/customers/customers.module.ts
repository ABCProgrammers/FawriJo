import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomersRoutingModule } from './customers-routing.module';
import { CustomersComponent } from './customers.component';
import { AddCustomerComponent } from './components/add-customer/add-customer.component';
import { SharedModule } from '../../shared/shared.module';
import { SendCustomerNotificaionModalComponent } from './components/send-customer-notificaion-modal/send-customer-notificaion-modal.component';
import { CustomerWalletComponent } from './components/customer-wallet/customer-wallet.component';
import { EditOrderComponent } from './components/edit-order/edit-order.component';
import { CustomerOrdersComponent } from './components/customer-orders/customer-orders.component';
import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
import { ChargeTransactionDetailsComponent } from './components/charge-transaction-details/charge-transaction-details.component';
import { AddWalletAmountComponent } from './components/customer-wallet/add-wallet-amount/add-wallet-amount.component';
@NgModule({
  declarations: [
    CustomersComponent,
    AddCustomerComponent,
    SendCustomerNotificaionModalComponent,
    CustomerWalletComponent,
    EditOrderComponent,
    CustomerOrdersComponent,
    OrderTrackingComponent,
    ChargeTransactionDetailsComponent,
    AddWalletAmountComponent,
  ],
  imports: [
    CommonModule,
    CustomersRoutingModule,
    SharedModule,
  ]
})
export class CustomersModule { }
