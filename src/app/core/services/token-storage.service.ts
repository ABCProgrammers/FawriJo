import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

const TOKEN_KEY = '_token';
const USER_KEY = 'currentUser';
const MENUROUTES_KEY = 'menuRoutes';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  screenList = [];
  controllerPermissions = [];
  allowedRoutes: string[] = [];
  constructor(
    private _httpService: HttpService,

  ) { }
  public signOut(): void {
    window.localStorage.clear();
  }

  public saveToken(token: string): void {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  get getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  get getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      let data = JSON.parse(user);
      return (data);
    }
    else return null;
  }
}
