import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, of, forkJoin, takeUntil, Subject } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-add-master-lookup',
  templateUrl: './add-master-lookup.component.html',
  styleUrl: './add-master-lookup.component.scss'
})
export class AddMasterLookupComponent {
  destroy$ = new Subject<void>;
  @Input() data;
  @Output() eventData = new EventEmitter();
  formGroup: FormGroup;
  booleanOptions = [{ label: 'Yes', value: true }, { label: 'No', value: false }];
  lookupTypeList = [];
  lookupList = [];
  tempLookupList = [];
  lookupImages = {};
  files = [];
  languageList = [];
  activeTab = 40001;
  filesObj = {};
  constructor(
    public _httpService: HttpService,
    public _modalService: NgbModal,
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
  ) {
  }
  ngOnInit() {
    this.initForm();
    this.getLookups()
  }
  getLookups1() {
    this._httpService._spinnerService.show();
    const type = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookupTypes}?status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const lookup = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([type, lookup]).subscribe((data) => {
      this.lookupTypeList = data[0].data;
      this.lookupList = data[1].data;
      if (this.data?.edit) {
        let row = this.data?.row;
        if (row?.lookupParentObj?.lookupID) {
          this.tempLookupList = this.lookupList.filter(data => row.lookupParentObj.lookupID === data.lookupID);
        }
      }
      this._httpService._spinnerService.hide();
    });
  }

  getLookups() {
    this._httpService._spinnerService.show();
    const type = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookupTypes}?status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const lookup = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([type, lookup]).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.lookupTypeList = data[0].data;
      this.lookupList = data[1].data;
      this.languageList = this.lookupList.filter(x => x.lookupTypeID == 40 && x?.status?.lookupID == 1001);
      if (!this.data?.edit)
        this.createLanguageArray();
      if (this.data?.edit) {
        let row = this.data?.row;
        if (row?.lookupParentObj?.lookupID) {
          this.tempLookupList = this.lookupList.filter(data => row.lookupParentObj.lookupID === data.lookupID);
        }
        this.bindFormData();
      }
    }).add(() => this._httpService._spinnerService.hide());
  }
  initForm() {
    this.formGroup = this.fb.group({
      lookupTypeID: [null, [Validators.required]],
      status: [true],
      lookupValue: [''],
      lookupStatic: [false],
      lookupDefault: [false],
      lookupParent: [{ value: null, disabled: true }],
      lookupAction: [''],
      lookupIntegration: [''],
      lookupTextColor: ['', [Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      lookupBGColor: ['', [Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      lookupSort: [''],
      hasParent: [false],
      lookupParentType: [{ value: null, disabled: true }],
      languageArray: this.fb.array([])
    })
  }
  bindFormData() {
    let row = this.data?.row;
    this.f.patchValue(row);
    let hasParent = (row?.lookupParentObj?.lookupID) ? true : false;
    if (hasParent) {
      this.f.get('lookupParentType').enable();
      this.f.get('lookupParent').enable();
    }
    let obj = {
      status: row.status?.lookupID == 1001 && true || false,
      hasParent,
      lookupParentType: row.lookupParentObj?.lookupTypeID
    };
    this.f.patchValue(obj);
    let translations = row.translations;
    this.createLanguageArray(translations);
  }
  initLanguageFormGroup(data?) {
    return this.fb.group(
      {
        languageId: [data?.lookupID],
        lookupName: [data?.lookupName || '', [Validators.required]],
        lookupDesc: [data?.lookupDesc || ''],
        lookupComments: [data?.lookupComments || ''],
        lookupSystem: [data?.lookupSystem || ''],
      }
    )
  }
  createLanguageArray(prevlangList?) {
    this.langArray.clear();
    this.languageList.forEach((item, index) => {
      let prevLangObj = prevlangList && prevlangList[index];
      if (prevLangObj?.languageID?.lookupID == item?.lookupID) {
        const lookupID = prevLangObj?.languageID?.lookupID;
        let obj = { ...prevLangObj, lookupID };
        this.lookupImages[lookupID] = prevLangObj?.lookupImage;
        this.langArray.push(this.initLanguageFormGroup(obj));
      }
      else {
        this.langArray.push(this.initLanguageFormGroup(item));
      }
    })
    this._httpService._spinnerService.hide();
  }
  saveData() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._httpService._spinnerService.show();
    const value = this.f.value;
    const controls = ['status', 'hasParent', 'lookupParentType', 'lookupParent', 'languageArray'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.f, controls);
    formData.append('status', value?.status ? '1001' : '1002');
    if (value?.lookupParent) {
      formData.append('lookupParent', value.lookupParent);
    }
    value.languageArray.forEach((x, index) => {
      let fileObj = this.filesObj[x?.languageId] && this.filesObj[x?.languageId][0];
      let file;
      if (fileObj) file = fileObj.file;
      formData.append('translations' + `[${index}].languageId`, x?.languageId);
      formData.append('translations' + `[${index}].lookupName`, x?.lookupName);
      formData.append('translations' + `[${index}].lookupDesc`, x?.lookupDesc);
      formData.append('translations' + `[${index}].lookupComments`, x?.lookupComments);
      formData.append('translations' + `[${index}].lookupSystem`, x?.lookupSystem);
      formData.append('translations' + `[${index}].lookupImage`, file || '');
    })
    let URL = this._httpService.apiUrl.Lookup.AddLookup;
    if (this.data?.edit) {
      formData.append('lookupID', this.data?.row?.lookupID);
      URL = this._httpService.apiUrl.Lookup.EditLookup;
    }
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.eventData.emit(true);
          this.responseModal('success', 'Data saved successfully!');
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  responseModal(type, message) {
    const modalRef = this._modalService.open(ModalMessageComponent);
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.message = message;
  }
  get langArray() {
    return this.f.get('languageArray') as FormArray;
  }
  handleLanguageTabClick(item) {
    this.activeTab = item.lookupID;
  }
  onFileChange(event, index) {
    this.files = [];
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then((response: any) => {
            if (!this.filesObj[this.activeTab]) {
              this.filesObj[this.activeTab] = [];
              this.filesObj[this.activeTab].push(response);
            }
            else {
              this.filesObj[this.activeTab] = [];
              this.filesObj[this.activeTab].push(response);
            }
          })
        })
      }
    }
  }
  removeFileHandle(event, index, langId) {
    (document.getElementById(this.activeTab.toString()) as HTMLInputElement).value = null;
    this.filesObj[langId] = [];
  }
  handleHasParentChange(event) {
    const parentType = this.f.get('lookupParentType');
    const parent = this.f.get('lookupParent');
    if (event.target.checked) {
      parentType.enable();
      parent.enable();
    }
    else {
      parentType.disable();
      parent.disable();
    }
  }

  handleParentTypeChange(event) {
    this.f.controls['lookupParent'].setValue(null);
    this.tempLookupList = [];
    if (event) {
      this.tempLookupList = this.lookupList.filter(data => event.lookupTypeID === data.lookupTypeID);
    }
  }
  get f() {
    return this.formGroup;
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
