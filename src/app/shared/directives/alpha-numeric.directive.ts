import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[alphaNumericOnly]',
})
export class AlphaNumericDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (!new RegExp('[^A-Za-z0-9 ]').test(event.key)) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    input.value = '';
  }
}
