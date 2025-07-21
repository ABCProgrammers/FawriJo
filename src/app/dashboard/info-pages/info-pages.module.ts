import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermAndConditionsComponent } from './term-and-conditions/term-and-conditions.component';
import { SharedModule } from '../../shared/shared.module';
import { InfoPagesRoutingModule } from './info-pages-routing.module';



@NgModule({
  declarations: [
    PrivacyPolicyComponent,
    TermAndConditionsComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    InfoPagesRoutingModule
  ]
})
export class InfoPagesModule { }
