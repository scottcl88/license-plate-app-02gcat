/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2022 Scott Lewis, All rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserClient, UpdateUserRequest } from 'src/api';
import { StorageService } from '../storage.service';
import { AlertController, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { CoreUtilService } from '../core-utils';
import { AccountService } from '../account.service';
import { Subject } from 'rxjs';
import { Account } from '../_models';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  public userAuth: any;
  public user: any;
  public name: string;
  public email: string;
  public allowNotifications: boolean = true;
  public showFeedback: boolean = true;
  public subscribeMarketingEmail: boolean = true;
  public isAuthenticated: boolean = false;
  public contentClass: string = "";
  public qrClass: string = "d-none";
  public qrShown: boolean = false;
  public isSaving: boolean = false;
  public radius: number = 5;
  public isDirty: boolean = false;
  private isLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  public account: Account | undefined | null;

  constructor(
    private coreUtilService: CoreUtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private logger: NGXLogger,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private httpClient: HttpClient,
    public popoverController: PopoverController,
    private storageService: StorageService,
    public modalController: ModalController,
    public alertController: AlertController,
    private accountService: AccountService
  ) { }

  async ngOnInit() {
    console.log('Profile ngOnInit...');
    this.accountService.account
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        console.log("Profile checking isAuthenticated", res);
        this.account = res;
        this.isAuthenticated = (this.account && this.account?.token) ? true : false;
      });
    await this.coreUtilService.presentLoading();
    this.isLoading = true;
    this.userAuth = this.account;

    if (this.isAuthenticated) {
      this.isLoading = true;
      this.loadUser();
    } else {
      this.coreUtilService.dismissLoading();
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
  
  nameChanged(ev: any) {
    console.log("Name changed: ", ev.detail.value, this.user?.name);
    if (ev.detail.value != null) {
      this.name = ev.detail.value;
      console.log("Name changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  emailChanged(ev: any) {
    console.log("email changed: ", ev.detail.value, this.user?.email);
    if (ev.detail.value != null) {
      this.email = ev.detail.value;
      console.log("email changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  goToHistory() {
    if (this.isDirty) {
      this.confirmLeave('/history');
    } else {
      this.router.navigate(['/history']);
    }
  }
  goToPreferences() {
    if (this.isDirty) {
      this.confirmLeave('/preferences');
    } else {
      this.router.navigate(['/preferences']);
    }
  }
  doNavigate(path: string) {
    this.router.navigate([path]);
  }
  allowNotificationsSelected(ev: any) {
    this.allowNotifications = ev.detail.checked;
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  showFeedbackSelected(ev: any) {
    this.showFeedback = ev.detail.checked;
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  subscribeMarketingEmailSelected(ev: any) {
    this.subscribeMarketingEmail = ev.detail.checked;
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  doDelete() {
    let userClient = new UserClient(this.httpClient, environment.API_BASE_URL);
    userClient.delete().subscribe({
      next: (res: any) => {
        if (res) {
          this.coreUtilService.presentToastSuccess('Deleted successfully!');
          this.storageService.logout();
        } else {
          this.coreUtilService.presentToastError('Failed to delete profile');
        }
      },
      error: (err: any) => {
        this.coreUtilService.presentToastError('Failed to delete profile');
        this.logger.error(err);
      }
    });
  } 
  async confirmLeave(navigateToPath: string) {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Are you sure?',
      message: 'Your changes are not saved. <br> Are you sure you want to leave?',
      buttons: [
        {
          text: 'Yes, Leave',
          cssClass: 'danger',
          handler: () => {
            console.log('Confirm Okay');
            this.doNavigate(navigateToPath);
          },
        },
        {
          text: 'No, Stay',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }
      ],
    });

    await alert.present();
  }
  async confirmDelete() {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Confirm!',
      message: 'Are you sure you want to delete your account?<br><br>All games and account information will be <b>permanently</b> deleted.<br><br><b><u>This cannot be reversed.</u></b>',
      buttons: [
        {
          text: 'Yes, Delete',
          cssClass: 'danger',
          handler: () => {
            console.log('Confirm Okay');
            this.doDelete();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }
      ],
    });

    await alert.present();
  }
  async confirmLogout() {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Confirm!',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Log out',
          cssClass: 'danger',
          handler: () => {
            console.log('Confirm Okay');
            this.doLogout();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          },
        }
      ],
    });

    await alert.present();
  }
  async doLogout() {
    this.accountService.logout();
  }
  async saveUser() {
    this.isSaving = true;
    let userClient = new UserClient(this.httpClient, environment.API_BASE_URL);
    let request = new UpdateUserRequest();
    request.name = this.name;
    userClient.update(request).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        this.coreUtilService.dismissLoading();
        if (res) {
          this.coreUtilService.presentToastSuccess('Updated successfully!');
        } else {
          this.coreUtilService.presentToastError('Failed to update profile');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        this.coreUtilService.dismissLoading();
        this.coreUtilService.presentToastError('Failed to udpate profile');
        this.logger.error(err);
      }
    });
  }
  async loadUser() {
    let userClient = new UserClient(this.httpClient, environment.API_BASE_URL);
    userClient.getUser().subscribe({
      next: (res: any) => {
        if (res) {
          this.user = res;
          this.radius = res?.maxRadius;
          if (res.email != null) {
            this.email = res.email;
            console.log("email coming from UserClient");
          } else {
            this.email = this.userAuth.email;
          }
          if (res.name != null) {
            this.name = res.name;
            console.log("Name coming from UserClient");
          } else {
            this.name = this.userAuth.name;
          }
          this.allowNotifications = res.allowNotifications;
          this.showFeedback = res.showFeedback;
        } else {
          this.coreUtilService.presentToastError('Failed to get user profile');
        }
        console.log("Loaded user 1: ", res);
        this.coreUtilService.dismissLoading();
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
      },
      error: (err: any) => {
        this.coreUtilService.presentToastError('Unexpected error getting user profile');
        this.logger.error(err);
        this.coreUtilService.dismissLoading();
        this.isLoading = false;
      }
    });
  }
}
