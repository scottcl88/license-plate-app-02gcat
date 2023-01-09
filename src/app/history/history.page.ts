import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { CreateGameRequest, GameClient, GameId, GameModel, LicenseGameRequest, LicensePlateId, LicensePlateModel, LicensePlatesClient, StateModel, UpdateGameRequest } from 'src/api';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { ModalSearchLicensePage } from '../modal-search-license/modal-search-license.page';
import { ModalViewLicensePage } from '../modal-view-license/modal-view-license.page';
import { es } from 'date-fns/locale';
import { ModalEditGamePage } from '../modal-edit-game/modal-edit-game.page';

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

  constructor(private activatedRoute: ActivatedRoute, private popoverController: PopoverController, private alertController: AlertController, private modalController: ModalController, private httpClient: HttpClient, private coreUtilService: CoreUtilService) { }

  ngOnInit() {
    this.availableStates = HistoryPage.STATES;
    this.getFinishedGames();
  }
  getFinishedGames() {
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.getAll().subscribe({
      next: (res) => {
        console.log("Successfully got all games");
        this.games = res ?? [];
      }, error: (err) => {
        console.error("get all games error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }
  async showEditGameModal(game: GameModel) {
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: true
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved && data.title) {
      this.saveGame(game, data.title);
    }
  }
  async saveGame(game: GameModel, title: string){
    let request = new UpdateGameRequest();
    request.title = title;
    request.gameId = new GameId();
    request.gameId.value = game.gameId;
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.update(request).subscribe({
      next: (res) => {
        console.log("Successfully updated game");
        this.game = res ?? [];
      }, error: (err) => {
        console.error("updated game error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

}
