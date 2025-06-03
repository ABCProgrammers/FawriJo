import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { HttpService } from '../../../../core/services/http.service';
import { ModalMessageComponent } from '../../../../shared/components/modal-message/modal-message.component';
@Component({
  selector: 'app-add-master-lookup',
  templateUrl: './add-master-lookup.component.html',
  styleUrl: './add-master-lookup.component.scss'
})
export class AddMasterLookupComponent {
  formGroup: FormGroup;
  lookupTypeList = [];
  lookupList = [];
  tempLookupList = [];
  files = [];
  lookupImages = [];
  booleanOptions = [{ text: 'Yes', value: true }, { text: 'No', value: false },];
  data;
  isFileReset: boolean;
  hasParent: boolean = false;
  @Output() eventData = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    public _activeModal: NgbActiveModal,
    public _httpService: HttpService,
    public _modalService: NgbModal,
  ) { }
  ngOnInit() {
    this.getLookups();
    this.initForm();
  }
  getLookups() {
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
  initForm() {
    this.formGroup = this.fb.group({
      lookupTypeID: [null, [Validators.required]],
      lookupName: ['', [Validators.required]],
      lookupDesc: [''],
      lookupValue: [''],
      lookupSystem: [''],
      lookupStatic: [null],
      lookupDefault: [null],
      hasParent: [false],
      lookupParentType: [{ value: null, disabled: true }],
      lookupParent: [{ value: null, disabled: true }],
      lookupAction: ['', Validators.pattern(/^\d+$/)],
      lookupIntegration: ['', Validators.pattern(/^\d+$/)],
      lookupComments: [''],
      lookupImage: [''],
      lookupTextColor: ['', [Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      lookupBGColor: ['', [Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      status: [true]
    })
    if (this.data?.edit) {
      let row = this.data?.row;
      this.lookupImages = row.lookupImage;
      this.f.patchValue(row);
      let hasParent = row?.lookupParentObj?.lookupID;
      if (hasParent) {
        this.f.get('lookupParentType').enable();
        this.f.get('lookupParent').enable();
      };
      let obj = {
        lookupParentType: row?.lookupParentObj?.lookupTypeID,
        status: row.status?.lookupID == 1001 && true || false,
        hasParent
      };
      this.f.patchValue(obj);
      this.formGroup.disable();
    }
  }
  onFileChange(event) {
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then(response => {
            this.files.unshift(response);
            this.f.get('lookupImage').setValue('attached');
          })
        })
      }
    }
  }

  fileResetEvent(event) {
    this.isFileReset = event;
  }
  removeFileHandle(event, index) {
    (document.getElementById('image') as HTMLInputElement).value = null;
    this.files.splice(index, 1);
    this.f.get('lookupImage').setValue(null);
  }
  save() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return
    }
    let formData = new FormData();
    let value = this._httpService._helperService.trim(this.formGroup.value);
    formData.append("lookupTypeID", value?.lookupTypeID);
    formData.append("lookupName", value?.lookupName);
    formData.append("lookupDesc", value?.lookupDesc);
    formData.append("lookupValue", value?.lookupValue);
    formData.append("lookupSystem", value?.lookupSystem);
    formData.append("lookupStatic", value?.lookupStatic);
    formData.append("lookupDefault", value?.lookupDefault);
    if (value?.lookupParent != null) {
      formData.append("lookupParent", value?.lookupParent);
    }
    formData.append("lookupAction", value?.lookupAction);
    formData.append("lookupIntegration", value?.lookupIntegration);
    formData.append("lookupComments", value?.lookupComments);
    this.files.forEach(x => {
      formData.append("lookupImage", x.file);
    })
    formData.append("lookupTextColor", value?.lookupTextColor);
    formData.append("lookupBGColor", value?.lookupBGColor);
    formData.append("status", value.status && '1001' || '1002');
    this._httpService._spinnerService.show();
    let url: Observable<any>;
    if (!this.data?.edit)
      url = this._httpService.post(this._httpService.apiUrl.Lookup.AddLookup, formData);//ADD
    else {
      formData.append("lookupID", this.data?.row?.lookupID);
      url = this._httpService.post(this._httpService.apiUrl.Lookup.EditLookup, formData);//EDIT
    }
    url.subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Lookup saved successfully');
          this.eventData.emit(true);
        }
      },
      error: err => {
        console.log(err)
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }
  responseModal(type, message) {
    const ref = this._modalService.open(ModalMessageComponent);
    ref.componentInstance.type = type;
    ref.componentInstance.message = message;
  }
  toggleEdit() {
    this.formGroup.enable();
    let hasParent = this.f.get('hasParent').value;
    if (!hasParent) {
      this.f.get('lookupParentType').disable();
      this.f.get('lookupParent').disable();
    };
  }
  get f() {
    return this.formGroup;
  }

  onHasParent(event) {
    if (event.target.checked) {
      this.f.get('lookupParentType').enable();
      this.f.get('lookupParent').enable();
    }
    else {
      this.f.get('lookupParentType').disable();
      this.f.get('lookupParent').disable();
      this.f.get('lookupParent').setValue(null);
      this.f.get('lookupParentType').setValue(null);
    }
  }
  parentLookupTypeChange(event) {
    this.f.get('lookupParent').setValue(null);
    this.tempLookupList = [];
    if (event) {
      this.tempLookupList = this.lookupList.filter(data => event.lookupTypeID === data.lookupTypeID);
    }
  }
}
