import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactsAndSocialMediaComponent } from './contacts-and-social-media.component';

const routes: Routes = [
  { path: '', component: ContactsAndSocialMediaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsAndSocialMediaRoutingModule { }
