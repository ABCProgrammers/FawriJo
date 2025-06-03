import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[nonEng]',
})
export class NonEnglisOnlyDirective {
  @HostListener('keypress', ['$event'])
  onInputChange(event: KeyboardEvent) {
    const nonEnglishPattern: RegExp = /^[^a-zA-Z]*$/;
    if (new RegExp(nonEnglishPattern).test(event.key)) {
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
