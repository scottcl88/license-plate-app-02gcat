import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreUtilService } from '../core-utils';
import { Account } from '../_models';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();
    public account: Account | null;

    constructor(private router: Router, private coreUtilService: CoreUtilService) {
        this.ngOnInit();
    }

    ngOnInit(): void {
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

        if (this.coreUtilService.isNonAuthPage()) {
            return true;
        }
        // not logged in so redirect to login page with the return url 
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
}