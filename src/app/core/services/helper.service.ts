import { Injectable } from '@angular/core';
import { DatePipe, Location } from "@angular/common";
import { isString } from 'lodash-es';
import { NavigationExtras, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
@Injectable({
  providedIn: 'root'
})
export class HelperService {
  fileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/svg+xml'];
  constructor(
    public _datePipe: DatePipe,
    public _router: Router,
    public _location: Location,
  ) { }
  timeInterval(callback: () => void, time: number = 60000) {
    const intervalId = setInterval(callback, time);
    return {
      stop: () => clearInterval(intervalId)
    };
  }
  getFileType(fileName) {
    return fileName?.split('.').pop().trim().toLowerCase();
  }
  dateFormate(input: Date, format?: any) {
    let value = !format && 'yyyy-MM-dd' || format;
    return this._datePipe.transform(input, value);
  }
  trim(value) {
    for (var key in value) {
      if (value[key] && isString(value[key])) {
        value[key] = (value[key]).trim();
      }
      else if (value[key] === null) {
        value[key] = '';
      }
    }
    return value;
  }
  formatDateToISO(date): string | null {
    if (!date) return null;
    const newDate = new Date(date);
    // Create a new Date object with the local time (ignoring time zone conversion)
    const localDate = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  }
  convertFormGroupToFormData(formGroup: FormGroup, preventAppendingControls?: string[]): FormData {
    // preventAppendingControls param sometime you don't need to append control to formdata then you need to pass that control name in that param;
    const formData = new FormData();
    Object.keys(formGroup.controls).forEach(controlName => {
      let isExists = preventAppendingControls?.includes(controlName);
      if (!isExists) {
        const control = formGroup.get(controlName);
        formData.append(controlName, control.getRawValue() ?? '');
      }
    });
    return formData;
  }
  fileToBase64 = async (file: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (file.type !== 'application/pdf') {
          resolve({ fileType: file.type, base64: reader.result, file, fileName: file.name })
        }
        else {
          resolve({ fileType: file.type, file, fileName: file.name })
        }
      }
      reader.onerror = (e) => reject(e)
    })
  checkInvalidImageFormat(data, returnObj = false, extensions: any[] = []): any {

    let invalidError = '';
    let invalidExtentions = false;
    let files;
    let getFiles = data.map(x => { return x.file })
    if (getFiles[0] !== undefined) files = getFiles;
    else files = data;
    for (let file of files) {
      //IN CASE IF WE WANT TO EXTEND THE ALLOWED FILE TYPES FOR UPLOADING
      if (extensions.length)
        this.fileTypes = [...this.fileTypes, ...extensions];
      if (!this.fileTypes.includes(file.type)) {
        invalidExtentions = true;
        invalidError = 'This file not support, supported formates: JPEG, JPG, PNG, SVG, PDF';
        break;
      }
    }
    //REMOVE FROM THE ARRAY TO PREVENT NEWLY ADDED EXTENTIONS DUPLICATION 
    if (extensions.length)
      this.fileTypes.splice((this.fileTypes.length - extensions.length), extensions.length);
    if (returnObj) return { invalidExtentions, invalidError };
    else return invalidExtentions;
  }
  public navigateToRouteWithQueryString(routeName: string, queryParams?: NavigationExtras) {
    if (queryParams == undefined || queryParams == null)
      this._router.navigate([routeName]);
    else
      this._router.navigate([routeName], queryParams);
  }
  public navigateToRoute(routeName: string, params?: NavigationExtras) {
    if (!params)
      this._router.navigate([routeName]);
    else
      this._router.navigate([routeName, params]);
  }
  getAttachmentName(url: string) {
    return url.split('/').pop();
  }
  downloadFile(url: any, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = fileName;

    // Create a click event to trigger the download
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);
  }
  redirectToLastURL() {
    this._location.back();
  }
  appendDateWithTime(time: any, date?: string): string {
    if (!date) return `1970-01-01T${time}`;
    else return `${date}T${time}`
  }
}
