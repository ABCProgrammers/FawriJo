import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterLookupsComponent } from './master-lookups/master-lookups.component';
import { MasterLookupTypesComponent } from './master-lookup-types/master-lookup-types.component';


const routes: Routes = [
  { path: 'master-lookup-types', component: MasterLookupTypesComponent },
  { path: 'master-lookups', component: MasterLookupsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
