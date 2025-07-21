
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TokenStorageService } from '../core/services/token-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../core/services/http.service';
import { ModalMessageComponent } from '../shared/components/modal-message/modal-message.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { AppRoutes } from '../shared/routes/appRoutes';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, SharedModule],
  standalone: true,
})
export class LoginComponent {
  unsubscribe = new Subject<void>();
  formGroup: FormGroup;
  isPasswordVisible = false;
  loginPage = true;
  isPrivacy = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _tokenService: TokenStorageService,
    private jwtService: JwtHelperService,
    private fb: FormBuilder,
    private _httpService: HttpService,
    private _modalService: NgbModal,
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
    this.activatedRoute.queryParams.pipe(takeUntil(this.unsubscribe)).subscribe(params => {
      let redirectUrl = params['redirectUrl'];
      if (params?.['token']) {
        localStorage.clear();
        localStorage.setItem('redirectUrl', redirectUrl);
        this._tokenService.saveToken(params['token']);
        let data = this.jwtService.decodeToken(params['token']);
        this._tokenService.saveUser(data);
        this.router.navigateByUrl('/dashboard');
      }
    });
  }
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  login() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this._httpService._spinnerService.show();
    const formData = this._httpService._helperService.convertFormGroupToFormData(this.formGroup);
    this._httpService.post(`${this._httpService.apiUrl.User.Login}`, formData).subscribe({
      next: response => {
        if ((response as any).userID) {
          localStorage.clear();
          this._tokenService.saveToken(response['token']);
          this._tokenService.saveUser(response);
          this.router.navigateByUrl('/dashboard');
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
  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
