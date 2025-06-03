import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "../shared/components/not-found/not-found.component";
import { DashboardComponent } from "./dashboard.component";
const routes: Routes = [
  { path: "dashboard", component: DashboardComponent },
  { path: "settings", loadChildren: () => import("./settings/settings.module").then((m) => m.SettingsModule) },
  { path: "master-pages", loadChildren: () => import("./master-pages/master-pages.module").then((m) => m.MasterPagesModule) },
  { path: "contact-info", loadChildren: () => import("./contacts-and-social-media/contacts-and-social-media.module").then((m) => m.ContactsAndSocialMediaModule) },
  { path: "users", loadChildren: () => import("./users/users.module").then((m) => m.UsersModule) },
  { path: "customers", loadChildren: () => import("./customers/customers.module").then((m) => m.CustomersModule) },
  { path: "drivers", loadChildren: () => import("./driver/driver.module").then((m) => m.DriverModule) },
  { path: "**", component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
