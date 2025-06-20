import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { IMenu } from "./IMenu";
import { HeaderService } from "../../core/services/header.service";
import { Router } from "@angular/router";
import { TokenStorageService } from "../../core/services/token-storage.service";
import { SubjectService } from "../../core/services/subject.service";
import { AppRoutes } from "../../shared/routes/appRoutes";
import { HttpService } from "../../core/services/http.service";
@Component({
  selector: "app-side-bar",
  templateUrl: "./side-bar.component.html",
  styleUrls: ["./side-bar.component.scss"],
})

export class SideBarComponent {
  windowsWidth = 0;
  menu: IMenu[] = [];
  isCollapsed = false;
  menuList = [];
  floatClass = {};
  menuId = '';
  appRoutes = AppRoutes;
  constructor(
    private _headerService: HeaderService,
    private _httpService: HttpService,
    private _tokenStorageService: TokenStorageService,
  ) {
  }
  ngOnInit() {
    this._headerService.isHeaderCollpased.subscribe((value: any) => {
      this.isCollapsed = value;
    });
    this.setMenus();
  }
  SideNavToggle() {
    this.isCollapsed = true;
    this._headerService.isHeaderCollpased.next(this.isCollapsed);
  }
  setMenus() {
    this.menuList = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        iconDark: '/assets/images/left-menu/dashboard.svg',
        routeName: AppRoutes.Dashboard.Home,
        hasSubMenu: false,
        subMenu: []
      },
      {
        id: 'system_settings',
        name: 'System Settings',
        iconDark: '/assets/images/left-menu/settings.svg',
        routeName: '',
        hasSubMenu: true,
        subMenu: [
          { name: 'Master Lookup Types', routeName: '/settings/master-lookup-types', iconDark: '/assets/images/left-menu/type.svg' },
          { name: 'Master Lookups', routeName: '/settings/master-lookups', iconDark: '/assets/images/left-menu/lookup.svg' },
          { name: 'Master Pages', routeName: AppRoutes.MasterPages.Listing, iconDark: '/assets/images/left-menu/page-1.svg' },
          { name: 'Contacts & Social Media', routeName: AppRoutes.ContactInfo.Home, iconDark: '/assets/images/left-menu/page-1.svg' },
        ]
      },
      {
        id: 'users',
        name: 'Users',
        iconDark: '/assets/images/left-menu/user-1.svg',
        routeName: AppRoutes.Users.Listing,
        hasSubMenu: false,
        subMenu: []
      },
      {
        id: 'customers',
        name: 'Customers',
        iconDark: '/assets/images/left-menu/user-1.svg',
        routeName: AppRoutes.Customers.Listing,
        hasSubMenu: false,
        subMenu: []
      },
      {
        id: 'customers_orders',
        name: 'Customer Orders',
        iconDark: '/assets/images/left-menu/user-1.svg',
        routeName: AppRoutes.Customers.Orders,
        hasSubMenu: false,
        subMenu: []
      },
      {
        id: 'drivers_cliq',
        name: 'Drivers Cliq Transactions',
        iconDark: '/assets/images/left-menu/user-1.svg',
        routeName: AppRoutes.Drivers.Wallets,
        hasSubMenu: false,
        subMenu: []
      }, 
    ]
  }
  toggleSubMenu(menuItem: any): void {
    if (menuItem.subMenu) {
      if (this.menuId == menuItem.id)
        menuItem.subMenuVisible = !menuItem.subMenuVisible;
      else {
        this.menuList.forEach(x => {
          x.subMenuVisible = false;
        })
        menuItem.subMenuVisible = !menuItem.subMenuVisible;
      }
      this.menuId = menuItem.id;
    }
  }
  logout() {
    localStorage.clear();
  }
}
