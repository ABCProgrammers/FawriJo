import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[totalRows]',
})
export class TotalRowsDirective {
  constructor(public template: TemplateRef<any>) {
  }
}
