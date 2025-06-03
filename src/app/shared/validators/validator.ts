import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function atLeastOneRequired(controlNames: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const hasValue = controlNames.some(name => !!control.get(name)?.value);
    return hasValue ? null : { atLeastOneRequired: true };
  };
}
export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value !== null && (isNaN(value) || value < min || value > max)) {
      return { range: true };
    }
    return null;
  };
}
export function matchControlsValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) return null;

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      return null;
    }
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}
