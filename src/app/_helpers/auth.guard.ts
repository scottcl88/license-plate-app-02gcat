import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../account.service';
import { Account } from '../_models';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();
    public account: Account | null;

    constructor(private router: Router, private accountService: AccountService) {
        this.ngOnInit();
    }

    ngOnInit(): void {
        this.accountService.account
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(res => {
                this.account = res;
            });
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next(null);
        this.ngUnsubscribe.complete();
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log("AuthGuard canActivate: ", this.account, route, state);
        if (this.account) {
            // check if route is restricted by role
            if (route.data.roles && !route.data.roles.includes(this.account.role)) {
                console.log("canActivate not authorized");
                // role not authorized so redirect to home page
                this.router.navigate(['/']);
                return false;
            }
            console.log("canActivate authorized");
            // authorized so return true
            return true;
        }

        console.log("canActivate not logged in");
        let forgotPasswordFound = this.router.url.indexOf("forgot-password") > 0;
        let resetPasswordFound = this.router.url.indexOf("reset-password") > 0;
        let registerFound = this.router.url.indexOf("register") > 0;
        let verifyEmailFound = this.router.url.indexOf("verify-email") > 0;
        if (!forgotPasswordFound && !resetPasswordFound && !registerFound && !verifyEmailFound) {
            return true;
        }
        // not logged in so redirect to login page with the return url 
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}