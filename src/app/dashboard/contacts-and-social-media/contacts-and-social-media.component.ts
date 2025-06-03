import { Component } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';

@Component({
  selector: 'app-contacts-and-social-media',
  templateUrl: './contacts-and-social-media.component.html',
  styleUrl: './contacts-and-social-media.component.scss'
})
export class ContactsAndSocialMediaComponent {
  constructor(
    private _headerService: HeaderService,
  ) {
    this._headerService.setTitle('Contacts & Social Media');
  }

}
