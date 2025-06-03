import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[digitsOnly]',
})
export class DigitsOnlyDirective {
  constructor(private elementRef: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    const initialValue = this.elementRef.nativeElement.value;
    const parsedValue = parseInt(initialValue, 10);
    this.elementRef.nativeElement.value = isNaN(parsedValue) || parsedValue <= 0 ? '' : parsedValue;
    if (initialValue !== this.elementRef.nativeElement.value) {
      event.stopPropagation();
    }
  }
}
