import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriversWalletsComponent } from './drivers-wallets/drivers-wallets.component';
import { SharedModule } from '../../shared/shared.module';
import { AddDriverWalletAmountComponent } from './components/add-driver-wallet-amount/add-driver-wallet-amount.component';


@NgModule({
  declarations: [
    DriversWalletsComponent,
    AddDriverWalletAmountComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule,
    SharedModule,
  ]
})
export class DriverModule { }
