import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject, debounceTime } from 'rxjs';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { HttpService } from '../../../core/services/http.service';
import { LookupService } from '../../../core/services/lookup.service';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  uploadedFile;
  rolesList = [];
  userTypeList = [];
  genderList = [];
  @ViewChild('inputFile') inputFile: ElementRef;
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Jordan];
  onlyCountries: CountryISO[] = [CountryISO.Jordan];
  constructor(
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
    private _lookupService: LookupService,
  ) {
  }
  ngOnInit() {
    this.initForm();
    this.getLookups();
    this.f.get('fullNameEN').valueChanges.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        let fullNameArray = value.trim().split(' ');
        if (fullNameArray.length > 1) {
          let firstName = fullNameArray[0];
          let lastName = fullNameArray.pop();
          this.f.patchValue({ firstName, lastName });
        }
        else {
          this.f.get('firstName').setValue(value);
          this.f.get('lastName').setValue('');
        }
      }
      else
        this.f.get('firstName').setValue('');
    })
  }
  initForm() {
    this.formGroup = this.fb.group({
      userNo: ['', Validators.required],
      userLogin: ['', Validators.required],
      fullNameEN: ['', Validators.required],
      fullNameAR: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userGender: [24001],
      userJobTitle: [''],
      userMobile: ['', Validators.required],
      userEmail: ['', [Validators.email]],
      userType: [null, Validators.required],
      remarks: [''],
      status: [true]
    });
    if (this.data?.edit) {
      const dataRow = this.data?.row;
      this.formGroup.patchValue(dataRow);
      let obj = {
        userGender: dataRow?.userGender?.lookupID,
        userType: dataRow?.userType?.lookupID,
        status: dataRow?.status?.lookupID == 1001 ? true : false,
      }
      this.formGroup.patchValue(obj);
    }
  }
  getLookups() {
    const gender$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=24&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const userType$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=41&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([gender$, userType$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.genderList = response[0].data;
      this.userTypeList = response[1].data;
    });
  }
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._httpService._spinnerService.show();
    const values = this.f.value;
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.formGroup, ['status', 'userMobile']);
    formData.append('userMobile', values?.userMobile?.e164Number);
    formData.append('status', this.formGroup.value.status && '1001' || '1002');
    formData.append('profileImage', this.uploadedFile?.file || '');
    let URL = this._httpService.apiUrl.User.AddUser;
    if (this.data?.edit) {
      URL = this._httpService.apiUrl.User.EditUser;
      formData.append('userID', this.data?.row?.userID);
    }
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit(true);
          this.responseModal('success', 'Data saved successfully!')
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  removeFileHandle(event) {
    this.uploadedFile = null;
  }
  onFileChange(event) {
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then((response: any) => {
            this.uploadedFile = response;
            this.inputFile.nativeElement.value = null;
          })
        })
      }
    }
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  get f() {
    return this.formGroup;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
