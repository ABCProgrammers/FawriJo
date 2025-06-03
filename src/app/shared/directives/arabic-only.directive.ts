import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[arabicOnly]',
})
export class ArabicOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (!new RegExp('[^ء-ي ]').test(event.key)) {
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
