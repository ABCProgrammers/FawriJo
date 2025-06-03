import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriversWalletsComponent } from './drivers-wallets/drivers-wallets.component';

const routes: Routes = [
  { path: 'wallets', component: DriversWalletsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
