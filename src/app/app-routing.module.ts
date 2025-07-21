import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppLayoutComponent } from "./layouts/app-layout/app-layout.component";
import { LoginComponent } from "./login/login.component";
import { AuthGuard } from "./core/guards/auth.guard";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "", loadChildren: () => import("./dashboard/info-pages/info-pages.module").then((m) => m.InfoPagesModule) },
  {
    path: "",
    component: AppLayoutComponent,
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
    canActivate: [AuthGuard]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
