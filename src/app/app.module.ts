import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NgbModalConfig, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { JwtInterceptor } from "./core/helpers/jwt.interceptor";
import { ErrorInterceptor } from "./core/helpers/error.interceptor";
import { NgxSpinnerModule } from "ngx-spinner";
import { LayoutsModule } from "./layouts/layouts.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { JwtModule } from "@auth0/angular-jwt";
import { CoreModule } from "./core/core.module";
import { BsDatepickerConfig, BsDaterangepickerConfig } from "ngx-bootstrap/datepicker";

export function tokenGetter() {
  return localStorage.getItem("_token");
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxSpinnerModule,
    LayoutsModule,
    DashboardModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        //  allowedDomains: ["example.com"],
      },
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(configModal: NgbModalConfig, _datePicker: BsDatepickerConfig, _dateRangePicker: BsDaterangepickerConfig) {
    configModal.backdrop = "static";
    configModal.keyboard = true;
    configModal.centered = true;
    configModal.scrollable = true;

    _datePicker.isAnimated = true;
    _datePicker.dateInputFormat = 'DD/MM/YYYY';
    _datePicker.showClearButton = true;
    _datePicker.clearPosition = 'right'
    _datePicker.containerClass = 'theme-default';
    _dateRangePicker.containerClass = 'theme-default';
  }
}
