import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[alphabetOnly]',
})
export class AlphabetOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    if (!new RegExp('[^A-Za-zء-ي ]').test(event.key)) {
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
