import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MediaTypeEnum } from '../../enums/enums';

@Component({
  selector: 'app-view-video-modal',
  templateUrl: './view-video-modal.component.html',
  styleUrl: './view-video-modal.component.scss'
})
export class ViewVideoModalComponent {
  @Input() data;
  sanitizedUrl!: SafeResourceUrl;
  isIframe = false;
  mediaTypeEnum = MediaTypeEnum;
  constructor(
    public _activeModal: NgbActiveModal,
    private _sanitizer: DomSanitizer
  ) { }
  ngOnInit(): void {
    if (!this.data?.source) return;
    const url = this.data?.source;
    if (url.includes('youtube.com') && this.data?.mediaType == MediaTypeEnum.YoutubeVideo) {
      this.isIframe = true;
      const videoId = url.includes('shorts')
        ? url.split('/').pop()
        : new URL(url).searchParams.get('v');
      this.sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}`
      );
    }
    else if (this.data?.mediaType == MediaTypeEnum.LocalVideo) {
      this.isIframe = false;
      this.sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    else if (url.includes('vimeo.com')) {
      this.isIframe = true;
      const videoId = url.split('/').pop();
      this.sanitizedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${videoId}`
      );
    }
  }
}
