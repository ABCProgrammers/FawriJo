import { Component, EventEmitter, HostListener, Inject, Input, Output, ViewChild } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { TokenStorageService } from '../../core/services/token-storage.service';
import { HttpService } from '../../core/services/http.service';
import { DOCUMENT } from '@angular/common';
import { NgbDropdown, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  iscollapse: boolean = false;
  marginleft: number = 50;
  showTitle: boolean = true;
  pageTitle = '';
  portalList = [];
  userDetails;
  constructor(
    public _headerService: HeaderService,
    private _httpService: HttpService,
    public _tokenService: TokenStorageService,
    public _modalService: NgbModal,
    @Inject(DOCUMENT) private document: Document
  ) { }
  ngOnInit() {
    this.userDetails = this._tokenService.getUser;
    this._headerService.pageTitle.subscribe(title => this.pageTitle = title);
    this._headerService.isHeaderCollpased.subscribe((value: any) => {
      this.iscollapse = value;
    });
  }
  handleLogoutClick() {
    this._tokenService.signOut();
    this._httpService._helperService.navigateToRoute('/login');
  }
  getInitials(fullName) {
    fullName = fullName.trim();
    let words = fullName.split(' ');
    let firstNameInitial = words[0][0].toUpperCase();
    let secondNameInitial = words[1][0].toUpperCase();

    // Return the initials
    return firstNameInitial + secondNameInitial;
  }

  SideNavToggle() {
    this.iscollapse = !this.iscollapse
    this._headerService.isHeaderCollpased.next(this.iscollapse);
  }
}
