
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { CreateGameRequest, GameClient, GameId, GameModel, LicenseGameRequest, LicensePlateId, LicensePlateModel, LicensePlatesClient, StateModel, UpdateGameRequest } from 'src/api';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { ModalSearchLicensePage } from '../modal-search-license/modal-search-license.page';
import { ModalViewLicensePage } from '../modal-view-license/modal-view-license.page';
import { es } from 'date-fns/locale';
import { ModalEditGamePage } from '../modal-edit-game/modal-edit-game.page';
import { GameService } from '../game.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  public static readonly STATES: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  public availableStates: string[] = [];

  public games: GameModel[] = [];

  public game: GameModel;

  public currentGame: GameModel | null = null;

  options = {
    addSuffix: true
  };

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private popoverController: PopoverController, private alertController: AlertController,
    private modalController: ModalController, private coreUtilService: CoreUtilService, private gameService: GameService) { }

  ngOnInit() {
    this.availableStates = HistoryPage.STATES;
  }
  async ionViewDidEnter() {
    await this.coreUtilService.presentLoading();
    this.getGames();
  }
  goToHome() {
    this.router.navigate(['/home']);
  }
  editGame(game: GameModel) {
    this.showEditGameModal(game);
  }
  async confirmDeleteGame(game: GameModel) {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'Delete this game',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Confirm new game canceled");
          },
        },
        {
          text: 'Yes, Delete',
          cssClass: 'danger',
          role: 'confirm',
          handler: () => {
            this.deleteGame(game);
          },
        },
      ],
    });

    await alert.present();
  }
  async getGames() {
    try {
      this.games = await this.gameService.getGames();
    } catch (err) {
      console.error("Error on getGames: ", err);
    }
    this.coreUtilService.dismissLoading();
  }
  async showEditGameModal(game: GameModel) {
    console.log("ShowEditGameModel: ", game);
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: false,
        title: game.title
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved && data.title) {
      this.saveGame(game, data.title);
    }
  }
  async saveGame(game: GameModel, title: string) {
    let gameIndex = this.games.findIndex(x => x.gameId == game.gameId);
    if (gameIndex >= 0) {
      this.games[gameIndex].title = title;
    }
    this.gameService.saveGame(this.games[gameIndex]);
    this.getGames();
  }
  async deleteGame(game: GameModel) {
    game.deletedDateTime = new Date();
    this.gameService.saveGame(game);
    this.getGames();
  }
  async restartGame(game: GameModel) {
    this.games.forEach(async (x) => {
      if (x.gameId == game.gameId) {
        x.finishedDateTime = undefined;
        x.startedDateTime = new Date();
      } else {
        x.finishedDateTime = new Date();
      }
      console.log("restarting game: ", x);
      await this.gameService.saveGame(x);
    });
    this.goToHome();
  }
}
