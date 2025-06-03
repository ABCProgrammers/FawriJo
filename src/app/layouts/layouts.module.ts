import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar/side-bar.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    SideBarComponent,
    TopBarComponent,
    AppLayoutComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class LayoutsModule { }
