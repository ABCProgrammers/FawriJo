import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'input[numbersOnly]',
})
export class NumberOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (new RegExp('[0-9]').test(event.key)) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}
