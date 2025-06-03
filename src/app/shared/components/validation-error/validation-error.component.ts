import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'validation-error',
  templateUrl: './validation-error.component.html',
  styleUrls: ['./validation-error.component.scss']
})
export class ValidationErrorComponent {
  @Input() control: FormControl;
  @Input() errorMessages: { [key: string]: string };

  // Get an array of validator keys for the current control
  get validationKeys(): string[] {
    if (this.control && this.control.errors) {
      return Object.keys(this.control.errors);
    }
    return [];
  }
}
