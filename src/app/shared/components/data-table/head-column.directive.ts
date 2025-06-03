import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[tableHeadColumn]',
})
export class HeadColumnDirective {
  @Input('tableHeadColumn') name!: string;
  constructor(public template: TemplateRef<any>) {
  }
}
