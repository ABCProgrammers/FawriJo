import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../../core/services/header.service';
import { HttpService } from '../../../core/services/http.service';
import { ModalMessageComponent } from '../../../shared/components/modal-message/modal-message.component';
import { ViewUploadedFileComponent } from '../../../shared/components/view-uploaded-file/view-uploaded-file.component';
import { LanguageEnum } from '../../../shared/enums/enums';
import { AppRoutes } from '../../../shared/routes/appRoutes';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html/dist/commonjs/QuillDeltaToHtmlConverter';
@Component({
  selector: 'app-add-master-page',
  templateUrl: './add-master-page.component.html',
  styleUrl: './add-master-page.component.scss'
})
export class AddMasterPageComponent {
  destroy$ = new Subject<void>;
  formGroup: FormGroup;
  countryList = [];
  activeTabs = LanguageEnum.Arabic;
  languageList = [];
  edit = false;
  view = false;
  masterPageId = 0;
  uploadedFileUpper;
  upperFile = '';
  uploadedFileLower;
  lowerFile = '';
  appRoutes = AppRoutes;
  constructor(
    private _httpService: HttpService,
    private _modalService: NgbModal,
    private fb: FormBuilder,
    private _headerService: HeaderService,
    private _activeRoute: ActivatedRoute,
  ) { }
  ngOnInit() {
    this._headerService.setTitle('Create New Master Page');
    this.initForm();
    this._activeRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.edit = params['action'] === 'edit';
      this.view = params['action'] === 'view';
      this.masterPageId = +params['id'] || 0;
      if (this.edit)
        this._headerService.setTitle('Edit Master Page');
      if (this.view)
        this._headerService.setTitle('Master Page Details');

      this.getLookups();
    })
  }
  initForm() {
    this.formGroup = this.fb.group({
      masterPagesIdentifier: ['', Validators.required],
      masterPagesCountry: [null],
      languages: this.fb.array([]),
      status: [true],
    });
  }
  initLangFormGroup(item?) {
    return this.fb.group({
      languageID: [item?.languageID || ''],
      masterPagesName: [item?.masterPagesName || ''],
      masterPagesText: [item?.masterPagesText || ''],
      status: [1001],
    })
  }
  get langArray(): FormArray {
    return this.f.get('languages') as FormArray;
  }
  getLookups() {
    this._httpService._spinnerService.show();
    const country$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=2&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    const language$ = this._httpService.get(`${this._httpService.apiUrl.Lookup.GetLookups}?lookupTypeId=40&status=1001&pageSize=1000`).pipe(catchError(error => of(error)));
    forkJoin([country$, language$]).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      this.countryList = response[0].data;
      this.languageList = response[1].data;
      // IN CASE OF ADD ONLY
      if (!this.masterPageId) {
        this.languageList.forEach((item, index) => {
          this.langArray.push(this.initLangFormGroup({ languageID: item?.lookupID }));
        });
      }
      else {
        // IN CASE OF EDIT OR VIEW
        this.bindFormData();
      }
    }).add(() => this._httpService._spinnerService.hide());
  }
  bindFormData() {
    let data = JSON.parse(localStorage.getItem('masterPageDetails'));
    this.upperFile = data?.masterPageUpperImage;
    this.lowerFile = data?.masterPageButtonImage;
    let obj = {
      masterPagesCountry: data?.masterPagesCountry ? data?.masterPagesCountry.map(x => x.lookupID) : null,
      masterPagesIdentifier: data?.masterPageIdentifier,
      status: data?.status?.lookupID == 1001 ? true : false,
    }
    this.f.patchValue(obj);
    let languages = data?.languages;
    this.languageList.forEach((lang, index) => {
      let langObj = languages[index];
      if (langObj?.language?.lookupID == lang?.lookupID) {
        let obj = {
          languageID: langObj?.language?.lookupID,
          masterPagesName: langObj?.masterPageName,
          masterPagesText: langObj?.masterPageText,
          status: langObj?.status?.lookupID == 1001 ? true : false,
        }
        this.langArray.push(this.initLangFormGroup(obj));
      }
      else {
        this.langArray.push(this.initLangFormGroup({ languageID: lang?.lookupID }));
      }
    });
    (this.view) && this.f.disable(); 
  }
  onQuillContentChanged(event, index) {
    const delta = event.editor.editor.delta.ops;
    const converter = new QuillDeltaToHtmlConverter(delta as any, {});
    const html = converter.convert();
    let formGroup = this.langArray.at(index) as FormGroup;
    formGroup.get('masterPagesText').setValue(html, { emitEvent: false });
  }
  saveData() {
    if (this.f.invalid) {
      this.f.markAllAsTouched();
      return;
    }
    const value = this.f.getRawValue();
    let atLeastOneLang = value?.languages.some(x => x.masterPagesName?.trim() && x.masterPagesText?.trim());
    if (!atLeastOneLang) {
      this.langArray.setErrors({ atLeastOneRequired: true });
      return;
    }
    this._httpService._spinnerService.show();
    let controls = ['status', 'languages', 'masterPagesCountry'];
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.f, controls);
    formData.append('masterPagesCountry', value?.masterPagesCountry && value.masterPagesCountry.toString() || '');
    formData.append('status', value.status && '1001' || '1002');
    this.uploadedFileUpper?.file && formData.append('masterPageUpperImage', this.uploadedFileUpper.file);
    this.uploadedFileLower?.file && formData.append('masterPageButtonImage', this.uploadedFileLower.file);
    value?.languages.forEach((lang, index) => {
      for (let key in lang) {
        formData.append(`languages[${index}].${key}`, lang[key]);
      }
    })
    let URL = this._httpService.apiUrl.MasterPages.AddMasterPages;
    if (this.edit) {
      URL = this._httpService.apiUrl.MasterPages.EditMasterPages;
      formData.append('masterPagesID', this.masterPageId.toString());
    }
    this._httpService.post(`${URL}`, formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: response => {
        if (response.isSuccess) {
          this.responseModal('success', 'Data saved successfully!');
          this._httpService._helperService.navigateToRoute(AppRoutes.MasterPages.Listing);
        }
      },
      error: err => {
        this.responseModal('error', err[0].errorMessageEn || err[0].ErrorMessageEn || err?.info);
      }
    }).add(() => { this._httpService._spinnerService.hide() })
  }

  onFileChange(event, from) {
    let files = [...event.target.files];
    if (files.length > 0) {
      let isInvalid = this._httpService._helperService.checkInvalidImageFormat(files);
      if (!isInvalid) {
        files.forEach((file: File) => {
          this._httpService._helperService.fileToBase64(file).then(response => {
            if (from == 'upper')
              this.uploadedFileUpper = response;
            else
              this.uploadedFileLower = response;
          })
        })
      }
    }
  }
  handleLanguageTabClick(lang) {
    this.activeTabs = lang.lookupID;
  }
  viewUploadedFiles(from) {
    let file = from == 'upper' ? this.upperFile : this.lowerFile;
    const modalRef = this._modalService.open(ViewUploadedFileComponent);
    modalRef.componentInstance.data = { uploadedFile: file };
    modalRef.componentInstance.file = file;
  }
  removeFileHandle(event, from) {
    event.stopPropagation();
    from == 'upper' ? this.uploadedFileUpper = null : this.uploadedFileLower = null;
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
    localStorage.removeItem('masterPageDetails');
  }
}
