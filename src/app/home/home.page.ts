/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, ModalController, PopoverController } from '@ionic/angular';
import { GameLicensePlateModel, GameModel, LicensePlateModel, LicensePlatesClient } from 'src/api';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { ModalSearchLicensePage } from '../modal-search-license/modal-search-license.page';
import { ModalViewLicensePage } from '../modal-view-license/modal-view-license.page';
import { Subject } from 'rxjs';
import { Account } from '../_models';
import { UsMapService } from '../us-map/us-map.service';
import { ModalEditGamePage } from '../modal-edit-game/modal-edit-game.page';
import { GameService } from '../game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public static readonly STATES: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  @ViewChildren('slides') slides: QueryList<IonItemSliding>;

  public imageBaseUrl: string = environment.API_BASE_URL + "/api/licensePlates/view/";

  public availableStates: string[] = [];

  public allLicensePlates: LicensePlateModel[] = [];
  public availableLicensePlates: LicensePlateModel[] = [];
  public currentLicensePlates: GameLicensePlateModel[] = [];
  public filteredLicensePlates: LicensePlateModel[] = [];

  public failedImages: number[] = [];

  public currentGame: GameModel | undefined = undefined;

  public isAuthenticated: boolean = false;
  private isLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  public account: Account | undefined | null;

  options = {
    addSuffix: true
  };

  sliderOpts = {
    zoom: false,
    slidesPerView: 1.5,
    spaceBetween: 20,
    centeredSlides: true
  };

  public sortArray: string[] = ["Name Asc", "Name Desc", "Added Asc", "Added Desc"];
  public currentSort: number = 0;

  constructor(private usMapService: UsMapService, private gameService: GameService, private router: Router, private popoverController: PopoverController, private alertController: AlertController,
    private modalController: ModalController, private coreUtilService: CoreUtilService, private httpClient: HttpClient) { }

  async ngOnInit() {
    this.availableStates = HomePage.STATES;

    await this.coreUtilService.presentLoading();
    this.isLoading = true;

    this.isAuthenticated = await this.gameService.getIsAuthenticated();
    console.log("User isAuthenticated: ", this.isAuthenticated);
    this.getLicensePlates();
  }

  isImageError(index: number) {
    let foundImage = this.failedImages.findIndex(x => x == index);
    return foundImage >= 0;
  }

  async ionViewDidEnter() {
    this.failedImages = [];
  }

  imageLoadError(index: any) {
    console.log("imageLoadError: ", index);
    this.failedImages.push(index);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  sortList() {
    this.currentSort++;
    if (this.currentSort >= this.sortArray.length) {
      this.currentSort = 0;
    }
    if (this.currentSort == 0) {
      this.currentLicensePlates.sort((a, b) => {
        return a?.licensePlate?.state?.name?.localeCompare(b?.licensePlate?.state?.name ?? "") ?? 0;
      });
    } else if (this.currentSort == 1) {
      this.currentLicensePlates.sort((a, b) => {
        return b?.licensePlate?.state?.name?.localeCompare(a?.licensePlate?.state?.name ?? "") ?? 0;
      });
    } else if (this.currentSort == 2) {
      this.currentLicensePlates.sort((a, b) => (new Date(a.createdDateTime).getTime()) - (new Date(b.createdDateTime).getTime()));
    }
    else if (this.currentSort == 3) {
      this.currentLicensePlates.sort((a, b) => (new Date(b.createdDateTime).getTime()) - (new Date(a.createdDateTime).getTime()));
    }
  }

  async search() {
    const modal = await this.modalController.create({
      component: ModalSearchLicensePage,
      componentProps: {
        availableLicensePlates: this.availableLicensePlates,
        filteredLicensePlates: this.filteredLicensePlates
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved && data.selectedState) {
      this.addLicensePlateToGame(data.selectedState);
    }
  }

  async showStartGameModal() {
    try {
      await this.popoverController?.dismiss();
    } catch (err) {
      console.log("Start Game Modal was not dismissed, if any");
    }
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: true
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('showStartGameModal Modal Dismissed: ', JSON.stringify(data));
    if (data && data.saved && data.title) {
      this.currentGame = undefined;
      this.startNewGame(data.title);
    }
  }

  async showEditGameModal() {
    this.popoverController?.dismiss();
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: false,
        title: this.currentGame?.title
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('showEditGameModal Modal Dismissed: ', JSON.stringify(data));
    if (data && data.saved && data.title && this.currentGame) {
      this.currentGame.title = data.title;
      this.gameService.saveGame(this.currentGame);
    }
  }

  async view(glp: GameLicensePlateModel, i: number) {
    if (await this.slides.get(i)?.getOpenAmount() != 0) {
      return;
    }
    const modal = await this.modalController.create({
      component: ModalViewLicensePage,
      componentProps: {
        glp: glp,
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('view Modal Dismissed: ', JSON.stringify(data));
    if (data) {
      if (data.removed) {
        this.removeLicensePlateFromGame(glp);
      }
      else if (data.saved) {
        glp.createdDateTime = new Date(data.date);
        glp.location = data.location;
        glp.vehicleType = data.vehicleType;
        this.updateLicensePlateFromGame(glp);
      }
    }
  }

  async startNewGame(title: string) {
    if (this.currentGame != undefined) {
      this.confirmNewGame();
      return;
    }
    console.log("Starting new game");
    this.currentGame = new GameModel();

    if (title) {
      this.currentGame.title = title;
    } else {
      let allGames = await this.gameService.getGames();
      this.currentGame.title = `Game #` + (allGames.length + 1);
    }
    this.currentGame.licensePlates = [];
    this.currentGame.startedDateTime = new Date();
    this.currentGame.gameId = this.gameService.getNewGameId();

    this.gameService.addGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.filteredLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
    this.usMapService.coordinates.forEach(x => x.c = this.usMapService.defaultStateColor);
    this.coreUtilService.dismissLoading();
  }

  async confirmNewGame() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'The current game will be ended.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Confirm new game canceled");
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.showStartGameModal();
          },
        },
      ],
    });

    await alert.present();
  }

  addLicensePlateToGame(lp: LicensePlateModel) {
    console.log("Adding license plate: ", lp);

    if (!this.currentGame) {
      console.error("No current game");
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    let largestGlpId = 0;
    this.currentGame.licensePlates.forEach(glp => {
      if (glp && glp.gameLicensePlateId && glp.gameLicensePlateId > largestGlpId) {
        largestGlpId = glp.gameLicensePlateId;
      }
    });

    let newGlp = new GameLicensePlateModel();
    newGlp.createdDateTime = new Date();
    newGlp.gameLicensePlateId = largestGlpId + 1;
    newGlp.licensePlate = new LicensePlateModel();
    newGlp.licensePlate.init(lp);
    newGlp.licensePlate.createdDateTime = new Date();

    console.log("Adding new glp with id: ", largestGlpId);
    this.currentGame.licensePlates.push(newGlp);

    this.gameService.saveGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  updateLicensePlateFromGame(glp: GameLicensePlateModel) {
    console.log("Updating license plate: ", glp);

    if (!this.currentGame) {
      console.error("No current game");
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    let foundGlpIndex = this.currentGame.licensePlates.findIndex(x => x.gameLicensePlateId == glp?.gameLicensePlateId);
    if (foundGlpIndex >= 0) {
      this.currentGame.licensePlates[foundGlpIndex] = new GameLicensePlateModel(glp);
    } else {
      console.error("Not found to remove");
      return;
    }
    this.gameService.saveGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  removeLicensePlateFromGame(glp: GameLicensePlateModel) {
    console.log("Removing license plate: ", glp);

    if (!this.currentGame) {
      console.error("No current game");
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    let foundGlpIndex = this.currentGame.licensePlates.findIndex(x => x.gameLicensePlateId == glp?.gameLicensePlateId);
    if (foundGlpIndex >= 0) {
      this.currentGame.licensePlates.splice(foundGlpIndex, 1);
    } else {
      console.error("Not found to remove");
      return;
    }
    this.gameService.saveGame(this.currentGame);
    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.filteredLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  getLicensePlates() {
    console.time("getLicensePlates");
    let licensePlateClient = new LicensePlatesClient(this.httpClient, environment.API_BASE_URL);
    licensePlateClient.getAll().subscribe({
      next: async (res) => {
        console.timeEnd("getLicensePlates");
        console.log("Successfully retrieved license plates");
        this.setupLists(res);
      }, error: (err) => {
        console.timeEnd("getLicensePlates");
        console.error("retrieved license plates error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  async setupLists(licensePlates: LicensePlateModel[]) {
    this.allLicensePlates = licensePlates.slice(0);
    this.availableLicensePlates = licensePlates.slice(0);
    this.filteredLicensePlates = licensePlates.slice(0);
    this.gameService.loadGameData().then(res => {
      this.currentGame = this.gameService.getCurrentGame();
      if (this.currentGame == null) {
        console.log("Current Game not found after getLicensePlates ", this.currentGame);
        // this.startNewGame("");
        this.coreUtilService.dismissLoading();
      } else {
        this.updateLicensePlateLists();
        this.coreUtilService.dismissLoading();
      }
    });
  }

  updateLicensePlateLists() {
    console.log("Updating lists with count: ", this.currentGame?.licensePlates?.length);

    this.usMapService.coordinates.forEach(x => x.c = this.usMapService.defaultStateColor);

    this.currentGame?.licensePlates?.forEach(lp => {
      let availableLpIndex = this.availableLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (availableLpIndex >= 0) {
        this.availableLicensePlates.splice(availableLpIndex, 1);
      }
      let filteredLpIndex = this.filteredLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (filteredLpIndex >= 0) {
        this.filteredLicensePlates.splice(filteredLpIndex, 1);
      }

      let usMapIndex = this.usMapService.coordinates.findIndex(x => x.id == lp?.licensePlate?.state?.abbreviation);
      if (usMapIndex >= 0) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedStateColor;
      }
    });
    this.currentLicensePlates = this.currentGame?.licensePlates ?? [];
  }


}
