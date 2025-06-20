import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewFileComponent } from './components/view-file/view-file.component';
import { ViewUploadedFileComponent } from './components/view-uploaded-file/view-uploaded-file.component';
import { ModalMessageComponent } from './components/modal-message/modal-message.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { InLargeViewModalComponent } from './components/in-large-view-modal/in-large-view-modal.component';
import { sharedDirectives } from "./directives/directive-export";
import { ValidationErrorComponent } from './components/validation-error/validation-error.component';
import { HeadColumnDirective } from './components/data-table/head-column.directive';
import { DataTableComponent } from './components/data-table/data-table.component';
import { AccordionItemDirective } from './components/data-table/accordion-item.directive';
import { CardComponent } from './components/card/card.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ShapeCardComponent } from './components/shape-card/shape-card.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AddNewLookupComponent } from './components/add-new-lookup/add-new-lookup.component';
import { QuillModule } from 'ngx-quill';
import { ViewVideoModalComponent } from './components/view-video-modal/view-video-modal.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ShowAttachmentsComponent } from './components/show-attachments/show-attachments.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './components/terms-conditions/terms-conditions.component';
//import 'quill-emoji/dist/quill-emoji.js';
//import * as Emoji from "quill-emoji";
//import Quill from 'quill'
//Quill.register("modules/emoji", Emoji);

@NgModule({
  declarations: [
    ViewFileComponent,
    ViewUploadedFileComponent,
    ModalMessageComponent,
    ConfirmModalComponent,
    NotFoundComponent,
    InLargeViewModalComponent,
    [...sharedDirectives],
    ValidationErrorComponent,
    HeadColumnDirective,
    DataTableComponent,
    AccordionItemDirective,
    CardComponent,
    ShapeCardComponent,
    AddNewLookupComponent,
    ViewVideoModalComponent,
    ShowAttachmentsComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NgbModule,
    HttpClientModule,
    NgSelectModule,
    BsDatepickerModule.forRoot(),
    NgxIntlTelInputModule,
    AngularSvgIconModule.forRoot(),
    TabsModule,
    QuillModule.forRoot(),
    NgxSliderModule,
  ],
  exports: [
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NgbModule,
    NgxIntlTelInputModule,
    DataTableComponent,
    NgSelectModule,
    ViewFileComponent,
    ViewUploadedFileComponent,
    ModalMessageComponent,
    ConfirmModalComponent,
    InLargeViewModalComponent,
    [...sharedDirectives],
    ValidationErrorComponent,
    CardComponent,
    BsDatepickerModule,
    AngularSvgIconModule,
    ShapeCardComponent,
    TabsModule,
    AddNewLookupComponent,
    QuillModule,
    ViewVideoModalComponent,
    NgxSliderModule,
    ShowAttachmentsComponent,
    NgxChartsModule,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
  ],
  providers: [
    DatePipe,
    DecimalPipe,
  ]
})
export class SharedModule { }
