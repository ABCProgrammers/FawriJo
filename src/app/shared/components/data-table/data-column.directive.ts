import { Directive, Input, TemplateRef } from '@angular/core';
@Directive({
  selector: 'ng-template[tableDataColumn]',
})
export class DataColumnDirective {
  @Input('tableDataColumn') name!: string;
  constructor(public template: TemplateRef<any>) { }
}
