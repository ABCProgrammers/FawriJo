import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsAndSocialMediaRoutingModule } from './contacts-and-social-media-routing.module';
import { ContactsAndSocialMediaComponent } from './contacts-and-social-media.component';
import { ContactsComponent } from './contacts/contacts.component';
import { SocialMediaComponent } from './social-media/social-media.component';
import { AddressesComponent } from './addresses/addresses.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ContactsAndSocialMediaComponent,
    ContactsComponent,
    SocialMediaComponent,
    AddressesComponent
  ],
  imports: [
    CommonModule,
    ContactsAndSocialMediaRoutingModule,
    SharedModule,
  ]
})
export class ContactsAndSocialMediaModule { }
