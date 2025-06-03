import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { MasterLookupsComponent } from './master-lookups/master-lookups.component';
import { MasterLookupTypesComponent } from './master-lookup-types/master-lookup-types.component';
import { AddMasterLookupTypeComponent } from './master-lookup-types/add-master-lookup-type/add-master-lookup-type.component';
import { AddMasterLookupComponent } from './master-lookups/add-master-lookup/add-master-lookup.component';

@NgModule({
  declarations: [
    MasterLookupsComponent,
    MasterLookupTypesComponent,
    AddMasterLookupTypeComponent,
    AddMasterLookupComponent,
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
  ]
})
export class SettingsModule { }
