import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterPagesRoutingModule } from './master-pages-routing.module';
import { MasterPagesComponent } from './master-pages.component';
import { AddMasterPageComponent } from './add-master-page/add-master-page.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    MasterPagesComponent,
    AddMasterPageComponent
  ],
  imports: [
    CommonModule,
    MasterPagesRoutingModule,
    SharedModule,
  ]
})
export class MasterPagesModule { }
