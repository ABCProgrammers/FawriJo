import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[engOnly]',
})
export class EngOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (!new RegExp('[^A-Za-z ]').test(event.key)) {
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
