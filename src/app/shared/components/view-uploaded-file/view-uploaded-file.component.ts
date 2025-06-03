import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../../core/services/helper.service';
import { FileExtensionEnum } from '../../enums/enums';

@Component({
  selector: 'app-view-uploaded-file',
  templateUrl: './view-uploaded-file.component.html',
  styleUrls: ['./view-uploaded-file.component.scss']
})
export class ViewUploadedFileComponent {
  @Input() file;
  @Input() data;
  fileType = '';
  viewSrc = ''
  fileExtensionEnum = FileExtensionEnum;
  constructor(
    public _activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private _helperService: HelperService) {

  }
  ngOnInit() {
    console.log(this.data)
    if (!this.data?.isUploaded) {
      this.fileType = this.getFileType(this.file);
    }
    else {
      this.fileType = this.data.uploadedFile.fileType;
      this.file = this.viewFile(this.data.uploadedFile.file);
    }
    if (this.data?.mode === 'View Only') {
      this.fileType = this.getFileType(this.data.data);
      this.viewSrc = this.data?.data;
    }
  }

  getFileType(fileName) {
    return fileName?.split('.').pop().trim().toLowerCase();
  }
  viewFile(file) {
    let src = URL.createObjectURL(file);
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }
  openMP4FileModal(ref) {
    if (this.data?.mode === 'View Only') {
      this.file = this.viewSrc;
    }
    this._activeModal.close();
    this._modalService.open(ref, { size: 'lg' });
  }
}
