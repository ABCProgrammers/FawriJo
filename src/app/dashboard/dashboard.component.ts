import { Component } from '@angular/core';
import { HeaderService } from '../core/services/header.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(
    public headerService: HeaderService,

  ) { }

  ngOnInit(): void {
    this.headerService.setTitle('Dashboard');
  }
}
