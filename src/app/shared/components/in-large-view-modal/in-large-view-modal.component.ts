import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../../core/services/helper.service';
import { FileExtensionEnum } from '../../enums/enums';

@Component({
  selector: 'app-in-large-view-modal',
  templateUrl: './in-large-view-modal.component.html',
  styleUrls: ['./in-large-view-modal.component.scss']
})
export class InLargeViewModalComponent {
  @Input() data;
  fileType = '';
  viewSrc;
  constructor(
    public _activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private _helperService: HelperService) {

  }
  ngOnInit() {
    this.fileType = this.getFileType(this.data?.file);
    if (this.fileType == 'pdf')
      this.viewSrc = this.viewFile(this.data?.file);
  }

  getFileType(fileName) {
    return fileName?.split('.').pop().trim().toLowerCase();
  }
  viewFile(file) {
    let src = URL.createObjectURL(file);
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }
}
