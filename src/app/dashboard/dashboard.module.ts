import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { SharedModule } from "../shared/shared.module";
import { DashboardComponent } from './dashboard.component';
import { RegisteredCustomersComponent } from './components/registered-customers/registered-customers.component';
import { RegisteredDriversComponent } from './components/registered-drivers/registered-drivers.component';
import { IncomeChartComponent } from './components/income-chart/income-chart.component';
@NgModule({
  declarations: [DashboardComponent, RegisteredCustomersComponent, RegisteredDriversComponent, IncomeChartComponent],
  imports: [CommonModule, DashboardRoutingModule, SharedModule],
})
export class DashboardModule {}
