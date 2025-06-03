import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private _tokenService: TokenStorageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      let errors = [];
      if (err.status === 401) {
        // auto logout if 401 response returned from api
        this._tokenService.signOut();
        location.reload();
      }
      else if (err.status == 400) {
        if (err?.error?.errors[0]?.ErrorMessageEn || err?.error?.errors[0]?.errorMessageEn) {
          errors = err?.error?.errors;
        }
        else {
          errors = [{ errorMessageEn: err.error?.info?.info }]; 
        }
      }
      return throwError(errors);
    }))
  }
}
