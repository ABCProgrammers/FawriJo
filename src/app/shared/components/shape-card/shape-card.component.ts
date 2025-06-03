import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-shape-card',
  templateUrl: './shape-card.component.html',
  styleUrl: './shape-card.component.scss'
})
export class ShapeCardComponent {
  @Output() containerClick = new EventEmitter();
  @Input() shape: 'rectangle' | 'circle' | 'square' = 'rectangle';
  @Input() imageUrl?: string;
  @Input() text?: string;

  // Custom container style
  @Input() customStyles?: { [key: string]: any };
  @Input() customClass?: string;

  // Image styles and classes
  @Input() imageStyles?: { [key: string]: any };
  @Input() imageClass?: string;

  // Text styles and classes
  @Input() textStyles?: { [key: string]: any };
  @Input() textClass?: string;

  get shapeClass(): string {
    return `shape-${this.shape}`;
  }
  onContainerClick(event: MouseEvent) {
    this.containerClick.emit({ event });
  }
}
