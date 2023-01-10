/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { AuthService } from '@auth0/auth0-angular';

import { Storage } from '@ionic/storage-angular';
import { mergeMap, switchMap, tap } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { UserClient } from 'src/api';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { CoreUtilService } from './core-utils';
import { Account } from './_models';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage,
    private coreUtilService: CoreUtilService, private logger: NGXLogger, private httpClient: HttpClient, private router: Router) {

  }

  async init() {
    console.log("Storage init")
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async setAccount(accountValue: Account) {
    console.log("Storage account set")
    await this.storage.set('account', accountValue);
  }

  public async getAccount(): Promise<Account> {
    return this._storage?.get('account');
  }

  public async checkLoggedIn() {
    let isLoggedIn = await this._storage?.get('isLoggedIn');
    if (!isLoggedIn && !this.coreUtilService.isNonAuthPage()) {
      this.router.navigate(['/login']);
    }
  }

  public async isLoggedIn(): Promise<boolean> {
    let isLoggedIn = await this._storage?.get('isLoggedIn');
    if (!isLoggedIn) {
      return false;
    }
    return true;
  }

  public async logout() {
    // this.coreUtilService.presentToastSuccess('Logging out...');
    console.log("Logout storage called, clearing storage");

    localStorage.clear();
    await this.storage.set('isLoggedIn', false);
    await this.storage.remove('userPhoneNumber');
    await this.storage.remove('account');
    this.deleteAllCookies();
    this.logoutAuth();

    // var userClient = new UserClient(this.httpClient, environment.API_BASE_URL);
    // userClient.logout().subscribe(
    //   async (res) => {
    //     console.log("logout on server returned: ", res);
    //     if (res) {
    //       localStorage.clear();
    //       await this.storage.set('isLoggedIn', false);
    //       await this.storage.remove('userPhoneNumber');
    //       this.deleteAllCookies();
    //       this.logoutAuth();
    //     } else {
    //       this.coreUtilService.presentToastError();
    //     }
    //   },
    //   async (error) => {
    //     console.error("Error on logout: ", error);
    //     this.logger.error(error);
    //     this.logoutAuth();
    //   }
    // );
  }

  private logoutAuth() {
    //console.log("LogoutAuth with returnTo...", returnTo);
    // this.authService
    //   .buildLogoutUrl({ returnTo: callbackUri })
    //   .pipe(
    //     mergeMap(async (url) => {
    //       await Browser.open({ url, windowName: '_self' });
    //       this.authService.logout({ localOnly: true });
    //     })
    //   )
    //   .subscribe();
    // Use the SDK to build the logout URL
    // this.authService
    //   .buildLogoutUrl({ returnTo: returnTo })
    //   .pipe(
    //     tap((url) => {
    //       console.log('Logging out of authService: ', url);
    //       // Call the logout fuction, but only log out locally
    //       this.authService.logout({ returnTo: returnTo });
    //       // Redirect to Auth0 using the Browser plugin, to clear the user's session
    //       Browser.open({ url: returnTo, windowName: '_self' });
    //       // window.location.replace(returnTo+"/v2/logout");
    //     })
    //   )
    //   .subscribe();
    // this.authService.logout({ returnTo: window.location.origin });
  }

  deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
  public async setDeviceToken(token: string) {
    await this.storage.set('deviceToken', token);
  }

  public async getDeviceToken() {
    return this._storage?.get('deviceToken');
  }

  public async setLoggedIn() {
    await this.storage.set('isLoggedIn', true);
  }


  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public get(key: string) {
    return this._storage?.get(key);
  }
}
