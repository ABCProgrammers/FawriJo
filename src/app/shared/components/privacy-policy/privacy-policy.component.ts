import { Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HeaderService } from '../../../core/services/header.service';
import { HttpService } from '../../../core/services/http.service';
@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  @Input() from;
  destroy$ = new Subject<void>;
  data;
  constructor(
    private _headerService: HeaderService,
    private _httpService: HttpService,

  ) {
    this._headerService.setTitle('Privacy Policy');
  }
  ngOnInit() {
    this.getDataList();
  }
  getDataList() {
    this._httpService._spinnerService.show();
    let APIURL = `${this._httpService.apiUrl.MasterPages.GetMasterPages}?masterPagesIdentifier=privacy`;
    this._httpService.get(APIURL).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.data = response.data[0];
      }
    }).add(() => this._httpService._spinnerService.hide());
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
