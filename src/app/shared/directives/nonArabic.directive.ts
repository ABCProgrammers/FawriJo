import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[nonArabic]',
})
export class NonArabicOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const nonArabicPattern: RegExp = /^[^\u0600-\u06FF]*$/;
    if (new RegExp(nonArabicPattern).test(event.key)) {
      return true;
    }
    event.preventDefault();
    return false;
  }

  //@HostListener('paste', ['$event'])
  //onPaste(event: ClipboardEvent) {
  //  event.preventDefault();
  //  const input = event.target as HTMLInputElement;
  //  input.value = '';
  //}
}
