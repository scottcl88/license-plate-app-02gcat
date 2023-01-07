import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { CreateGameRequest, GameClient, GameId, GameLicensePlateModel, GameModel, LicenseGameRequest, LicensePlateId, LicensePlateModel, LicensePlatesClient, StateModel } from 'src/api';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { ModalSearchLicensePage } from '../modal-search-license/modal-search-license.page';
import { ModalViewLicensePage } from '../modal-view-license/modal-view-license.page';
import { es } from 'date-fns/locale';
import { Subject, takeUntil } from 'rxjs';
import { Account } from '../_models';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public static readonly STATES: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  public availableStates: string[] = [];

  public allLicensePlates: LicensePlateModel[] = [];
  public availableLicensePlates: LicensePlateModel[] = [];
  public currentLicensePlates: GameLicensePlateModel[] = [];
  public filteredLicensePlates: LicensePlateModel[] = [];

  public currentGame: GameModel | null = null;

  public isAuthenticated: boolean = false;
  private isLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  public account: Account | undefined | null;

  options = {
    addSuffix: true
  };

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router, private accountService: AccountService, private popoverController: PopoverController, private alertController: AlertController, private modalController: ModalController, private httpClient: HttpClient, private coreUtilService: CoreUtilService) { }

  async ngOnInit() {
    this.availableStates = HomePage.STATES;
    // this.getLicensePlates();

    await this.coreUtilService.presentLoading();
    this.isLoading = true;

    this.accountService.account
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        console.log("Profile checking isAuthenticated", res);
        this.account = res;
        this.isAuthenticated = (this.account && this.account?.token) ? true : false;


        if (this.isAuthenticated) {
          this.isLoading = true;
          this.getLicensePlates();
        } else {
          this.coreUtilService.dismissLoading();
          this.isLoading = false;
          this.goToLogin();
        }
      });
    // this.userAuth = this.account;
  }

  goToLogin() {
    this.router.navigate(['/login']);
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

  async view(glp: GameLicensePlateModel) {
    const modal = await this.modalController.create({
      component: ModalViewLicensePage,
      componentProps: {
        glp: glp,
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.removed) {
      this.removeLicensePlateFromGame(glp);
    }
  }

  getCurrentGame() {
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.getCurrent().subscribe({
      next: (res) => {
        console.log("Successfully got current game");
        this.currentGame = res;
        if (this.currentGame == null) {
          this.startNewGame();
        } else {
          this.updateLicensePlateLists();
          this.coreUtilService.dismissLoading();
        }
      }, error: (err) => {
        console.error("Start new game error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  startNewGame() {
    if (this.currentGame != null) {
      this.confirmNewGame();
      return;
    }
    let request = new CreateGameRequest();
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.create(request).subscribe({
      next: (res) => {
        console.log("Successfully started game");
        this.currentGame = res ?? new GameModel();
        this.availableLicensePlates = this.allLicensePlates.slice(0);
        this.filteredLicensePlates = this.allLicensePlates.slice(0);
        this.updateLicensePlateLists();
        this.coreUtilService.dismissLoading();
      }, error: (err) => {
        console.error("Start new game error: ", err);
        this.coreUtilService.presentToastError();
        this.coreUtilService.dismissLoading();
      }
    });
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
            this.currentGame = null;
            this.startNewGame();
          },
        },
      ],
    });

    await alert.present();
    this.popoverController.dismiss();
  }

  addLicensePlateToGame(lp: LicensePlateModel) {
    let request = new LicenseGameRequest();
    request.gameId = new GameId();
    request.gameId.value = this.currentGame?.gameId;
    request.licensePlateId = new LicensePlateId();
    request.licensePlateId.value = lp.licensePlateId;
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.add(request).subscribe({
      next: (res) => {
        console.log("Successful add to game");
        this.currentGame = res;
        this.updateLicensePlateLists();
      }, error: (err) => {
        console.error("add to game error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  removeLicensePlateFromGame(lp: LicensePlateModel) {
    let request = new LicenseGameRequest();
    request.gameId = new GameId();
    request.gameId.value = this.currentGame?.gameId;
    request.licensePlateId = new LicensePlateId();
    request.licensePlateId.value = lp.licensePlateId;
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.remove(request).subscribe({
      next: (res) => {
        console.log("Successful remove from game");
        this.currentGame = res;
        this.updateLicensePlateLists();
      }, error: (err) => {
        console.error("remove from error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  getLicensePlates() {
    let licensePlateClient = new LicensePlatesClient(this.httpClient, environment.API_BASE_URL);
    licensePlateClient.getAll().subscribe({
      next: (res) => {
        console.log("Successfully retrieved license plates");
        this.allLicensePlates = res.slice(0);
        this.availableLicensePlates = res.slice(0);
        this.filteredLicensePlates = res.slice(0);
        this.getCurrentGame();
      }, error: (err) => {
        console.error("retrieved license plates error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  updateLicensePlateLists() {
    let filteredLps: GameLicensePlateModel[] = [];
    this.currentGame?.licensePlates?.forEach(lp => {
      let foundLp = this.allLicensePlates.find(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (foundLp) {
        filteredLps.push(foundLp);
      }
      let availableLpIndex = this.availableLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (availableLpIndex >= 0) {
        this.availableLicensePlates.splice(availableLpIndex, 1);
      }
      let filteredLpIndex = this.filteredLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (filteredLpIndex >= 0) {
        this.filteredLicensePlates.splice(filteredLpIndex, 1);
      }
    });
    this.currentLicensePlates = this.currentGame?.licensePlates ?? [];
  }
}
