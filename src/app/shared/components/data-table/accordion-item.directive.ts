import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[accordionItem]'
})
export class AccordionItemDirective {
  constructor(public template: TemplateRef<any>) {
  }
}

