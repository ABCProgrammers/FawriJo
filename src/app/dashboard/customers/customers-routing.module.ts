import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomerWalletComponent } from './components/customer-wallet/customer-wallet.component';
import { CustomerOrdersComponent } from './components/customer-orders/customer-orders.component';

const routes: Routes = [
  { path: '', component: CustomersComponent },
  { path: 'wallet', component: CustomerWalletComponent },
  { path: 'orders', component: CustomerOrdersComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomersRoutingModule { }
