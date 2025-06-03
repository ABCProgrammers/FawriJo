import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    CurrencyPipe,
  ],
  exports: [],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
