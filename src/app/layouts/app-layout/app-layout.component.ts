import { Component, HostListener } from '@angular/core';
import { HeaderService } from '../../core/services/header.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  isCollapsed = false;
  windowsWidth = 992;
  dynamicStyles = { 'margin-left': '270px' };
  count = 0;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
  }
  constructor(
    public _headerService: HeaderService,
  ) {
  }
  ngOnInit() {
    this._headerService.isHeaderCollpased.subscribe((value: any) => {
      this.isCollapsed = value;
      if (this.windowsWidth <= 991) {
        if (this.count > 0)
          this.dynamicStyles = { 'margin-left': '45px' };
        this.count++;
      }
      else {
        if (this.isCollapsed)
          this.dynamicStyles = { 'margin-left': '45px' };
        else
          this.dynamicStyles = { 'margin-left': '270px' };
      }
    })
  }
  private updateWindowWidth() {
    this.windowsWidth = window.innerWidth;
    if (this.windowsWidth <= 991) {
      this.dynamicStyles = { 'margin-left': '45px' };
      this._headerService.isHeaderCollpased.next(true);
    }
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.updateWindowWidth();
    });
  }
}
