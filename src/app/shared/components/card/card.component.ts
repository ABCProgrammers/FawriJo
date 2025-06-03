import { Component, HostBinding, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() data;
  @HostBinding('style') get hostStyles() {
    return this.data?.style;
  }
  constructor() {
  }
  ngOnInit() {
  }
}
