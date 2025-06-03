import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private router: Router,
    private _tokenService: TokenStorageService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._tokenService.getToken;
    if (currentUser) {
      // logged in so return true
      return true;
    }
    else {
      // not logged in so redirect to login page with the return url
      this.router.navigate(['/login']);
      return false;
    }
  }

}
