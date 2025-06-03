import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[tFoot]',
})
export class TableFootDirective {
  constructor(public template: TemplateRef<any>) {
  }
}
