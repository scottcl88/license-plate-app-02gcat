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
import { UserClient } from 'src/api';
import { StorageService } from '../storage.service';
import { AlertController, LoadingController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { CoreUtilService } from '../core-utils';
import { AccountService } from '../account.service';
import { Subject } from 'rxjs';
import { Account } from '../_models';
import { GoogleGameServices } from 'capacitor-google-game-services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy {

  public name: string;
  public imageUrl: string;
  public isAuthenticated: boolean = false;

  public isLoading: boolean = false;

  private ngUnsubscribe = new Subject();

  constructor(
    private coreUtilService: CoreUtilService,
    public popoverController: PopoverController,
    private storageService: StorageService,
    public modalController: ModalController,
    public alertController: AlertController
  ) { }

  async ngOnInit() {
    console.log('Profile ngOnInit...');

    await this.coreUtilService.presentLoading();

    this.isLoading = true;

    this.isAuthenticated = (await GoogleGameServices.isAuthenticated()).isAuthenticated;

    if (this.isAuthenticated) {
      this.isLoading = true;
      this.loadPlayer();
    } else {
      this.coreUtilService.dismissLoading();
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async loadPlayer() {
    let player = (await GoogleGameServices.getCurrentPlayer()).player;
    console.log("Player loaded: ", player);
    this.name = player.displayName;
    this.imageUrl = player.iconImageUrl;
    console.log("Player loaded DisplayName: ", player.displayName);
    console.log("Player loaded iconImageUrl: ", player.iconImageUrl);
    this.coreUtilService.dismissLoading();
  }

  doDelete() {
    this.coreUtilService.presentToastSuccess('Deleted successfully!');
    this.storageService.logout();
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

  async viewSaves() {
    GoogleGameServices.showSavedGamesUI();
  }
}
