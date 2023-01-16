/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {

  }

  async init() {
    console.log("Storage init")
    
    await this.storage.defineDriver(CordovaSQLiteDriver);

    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async logout() {
    console.log("Logout storage called, clearing storage");

    localStorage.clear();
    await this.storage.set('isLoggedIn', false);
    await this.storage.remove('userPhoneNumber');
    await this.storage.remove('account');
    this.deleteAllCookies();
  }

  public deleteAllCookies() {
    let cookies = document.cookie.split(";");

    for (const element of cookies) {
      let cookie = element;
      let eqPos = cookie.indexOf("=");
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  public async setDeviceToken(token: string) {
    await this.storage.set('deviceToken', token);
  }

  public async getDeviceToken() {
    return this._storage?.get('deviceToken');
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public get(key: string) {
    return this._storage?.get(key);
  }
}
