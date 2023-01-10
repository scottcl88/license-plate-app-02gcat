import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';
import { CoreUtilService } from './core-utils';
import { Account } from './_models';
import { AuthenticateByDeviceRequest, RegisterRequest, UserClient, UserId } from 'src/api';

const baseUrl = `${environment.API_BASE_URL}/api/user`;

import { Device } from '@capacitor/device';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private title = new BehaviorSubject<string>('Food Lewis');
    private title$ = this.title.asObservable();
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(
        private router: Router,
        private storageService: StorageService,
        private coreUtilService: CoreUtilService,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
        // this.init();
    }
    setTitle(title: string) {
        this.title.next(title);
    }

    getTitle(): Observable<string> {
        return this.title$;
    }
    async init() {
        console.log("Account Service init");
        if (!this.accountValue) {
            let storageAccount = await this.storageService.getAccount();
            console.log("Account Service init storageAccount: ", storageAccount);
            this.accountSubject.next(storageAccount);

            try {
                if (!storageAccount) {
                    if (this.storageService.get("Secret")) {
                        await this.setupDeviceWithSecret();
                    }
                    await this.loginWithDevice();
                    console.log("Finished setup with device id");
                }
            } catch (err) {
                console.error("Error during account init: ", err);
            }
        }
    }

    private get accountValue(): Account | null {
        return this.accountSubject.value;
    }

    public get isAuthenticated(): boolean {
        const accountValue = this.accountSubject.value;
        const isLoggedIn = accountValue && accountValue.token;
        return isLoggedIn ? true : false;
    }

    async setupDeviceWithSecret(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let deviceId = (await Device.getId()).uuid;
            let userClient = new UserClient(this.http, environment.API_BASE_URL);
            userClient.generateSecret(deviceId).subscribe({
                next: async (res: any) => {
                    console.log("Secret was generated");
                    this.storageService.set("Secret", res?.secret);
                    resolve(true);
                },
                error: (err: any) => {
                    console.error("Failed to generate secret: ", err);
                    resolve(false);
                    // reject(err);
                }
            });
        });
    }

    async loginWithDevice(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            let deviceId = (await Device.getId()).uuid;
            let secret = await this.storageService.get("Secret");

            let request = new AuthenticateByDeviceRequest();
            request.deviceId = deviceId;
            request.secret = secret;
            let userClient = new UserClient(this.http, environment.API_BASE_URL);
            userClient.authenticateByDevice(request).subscribe({
                next: (res: any) => {
                    console.log("authenticateByDevice successful");
                    this.accountSubject.next(res);
                    this.storageService.setAccount(res);
                    this.startRefreshTokenTimer();
                    resolve(true);
                },
                error: (err: any) => {
                    console.error("Failed to authenticateByDevice: ", err);
                    reject(err);
                }
            });
        });
    }

    login(email: string, password: string) {
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.storageService.setAccount(account);
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    logout() {
        console.log("Logout called in account service");
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe(res => {
            console.log("revoke-token completed, clearing account");
            this.clearAccount();
        }, err => {
            console.error("logout revoke-token error: ", err);
            this.clearAccount();
        });
    }

    clearAccount() {
        this.stopRefreshTokenTimer();
        this.storageService.logout();
        this.accountSubject.next(null);
        if (!this.coreUtilService.isNonAuthPage()) {
            this.router.navigate(['/login']);
        }
    }

    refreshToken() {
        //console.log("refreshToken called", this.accountSubject.getValue(), this.accountValue, this.storageService.getAccount())
        let token = this.accountValue?.refreshToken;
        if (!token) {
            console.error("Cannot refresh token with null");
            this.logout();
            return of();
        }
        return this.http.post<any>(`${baseUrl}/refresh-token`, { token }, { withCredentials: true })
            .pipe(map((account) => {
                console.log("Refresh-token completed. ", JSON.stringify(account));
                this.accountSubject.next(account);
                this.storageService.setAccount(account);
                console.log("Account set: ", JSON.stringify(this.accountValue));
                this.startRefreshTokenTimer();
                return account;
            }));
    }

    register(account: RegisterRequest) {
        return this.http.post(`${baseUrl}/register`, account);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token });
    }

    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email });
    }

    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token });
    }

    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl);
    }

    getById(id: UserId) {
        return this.http.get<Account>(`${baseUrl}/${id.value}`);
    }
    create(params: any) {
        return this.http.post(baseUrl, params);
    }

    update(id: UserId, params: any) {
        return this.http.put(`${baseUrl}/${id.value}`, params)
            .pipe(map((account: any) => {
                if (!this.accountValue) {
                    return account;
                }
                // update the current account if it was updated
                if (account.id === this.accountValue.userId.value) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }

    delete(id: UserId) {
        return this.http.delete(`${baseUrl}/${id.value}`)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (id.value === this.accountValue?.userId.value)
                    this.logout();
            }));
    }

    // helper methods

    private refreshTokenTimeout: string | number | NodeJS.Timeout | undefined;

    private startRefreshTokenTimer() {
        if (!this.accountValue?.token) {
            return;
        }
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.token.split('.')[1]));
        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken()?.subscribe(res => {
                console.log("startRefreshTokenTimer refreshToken done");
            }, err => {
                console.error("startRefreshTokenTimer refreshToken error", err);
                this.logout();
            })
        }, timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}