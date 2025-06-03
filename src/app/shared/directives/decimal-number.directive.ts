import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[decimalOnly]'
})
export class DecimalNumberDirective {
  private regex: RegExp = new RegExp(/^\d*\.?\d{0,50}$/g);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  @Input('decimalOnly') decimalPlaces: number;
  constructor(private el: ElementRef) { }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
  @HostListener("blur")
  setInputFocusOut(): void {
    let value = +(this.el.nativeElement.value)
    if (value > 0) {
      this.el.nativeElement.value = value.toFixed(this.decimalPlaces || 3);
    }
  }
}
