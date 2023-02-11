/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2023 Scott Lewis, All rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { CoreUtilService } from '../core-utils';
import { Subject } from 'rxjs';
import { GoogleGameServices } from 'capacitor-google-game-services';
import { CoordinatesPositionModel, EmailGameDataRequest, GameClient } from 'src/api';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ModalEmailPage } from '../modal-email/modal-email.page';
import { GameService } from '../game.service';
import { Preferences } from '@capacitor/preferences';
import { ModalLocationPage } from '../modal-location/modal-location.page';

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

  public recordLocationOption: string;
  public recordLocationOptionText: string;

  constructor(
    private coreUtilService: CoreUtilService,
    public popoverController: PopoverController,
    private storageService: StorageService,
    public modalController: ModalController,
    public alertController: AlertController,
    private httpClient: HttpClient,
    private gameService: GameService
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
    this.recordLocationOption = await (await Preferences.get({ key: "RecordLocationOption" })).value ?? "";
    switch (this.recordLocationOption) {
      case "alwaysAllow": {
        this.recordLocationOptionText = "Always Allow";
        break;
      } case "allowNow": {
        this.recordLocationOptionText = "Ask";
        break;
      } case "denyNow": {
        this.recordLocationOptionText = "Ask";
        break;
      } case "neverAllow": {
        this.recordLocationOptionText = "Never Allow";
        break;
      }
    }
  }

  async recordLocation() {
    const modal = await this.modalController.create({
      component: ModalLocationPage,
      showBackdrop: true,
      componentProps: {
        displayAsk: true,
        locationValue: this.recordLocationOption
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved) {
      await Preferences.set({ key: "RecordLocationOption", value: data.value });
      this.recordLocationOption = data.value;
      switch (this.recordLocationOption) {
        case "alwaysAllow": {
          this.recordLocationOptionText = "Always Allow";
          break;
        } case "allowNow": {
          this.recordLocationOptionText = "Ask";
          break;
        } case "denyNow": {
          this.recordLocationOptionText = "Ask";
          break;
        } case "neverAllow": {
          this.recordLocationOptionText = "Never Allow";
          break;
        }
      }
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

  signIn() {
    GoogleGameServices.signIn();
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

  async showEmailModal() {
    console.log("showEmailModal called");
    const modal = await this.modalController.create({
      component: ModalEmailPage,
      componentProps: {
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved && data.email) {
      this.exportData(data.email);
    }
  }

  async exportData(email: string) {
    console.log("ExportData called for email: ", email);
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    let request = new EmailGameDataRequest();
    request.email = email;
    let allGames = await this.gameService.getGames();
    request.jsonData = JSON.stringify(allGames);
    gameClient.emailGameData(request).subscribe({
      next: async (res) => {
        console.log("Sent email", res);
        if (res) {
          this.coreUtilService.presentToastSuccess("Email sent");
        } else {
          this.coreUtilService.presentToastError();
        }
      }, error: (err) => {
        console.error("Failed to send email: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }
}
