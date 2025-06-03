import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterPagesComponent } from './master-pages.component';
import { AddMasterPageComponent } from './add-master-page/add-master-page.component';

const routes: Routes = [
  { path: '', component: MasterPagesComponent },
  { path: 'add-master-page', component: AddMasterPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterPagesRoutingModule { }
