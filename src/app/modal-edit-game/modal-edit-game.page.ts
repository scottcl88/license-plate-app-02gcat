/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, IonSearchbar, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { GameClient, GameModel, LicensePlateModel } from 'src/api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-edit-game',
  templateUrl: './modal-edit-game.page.html',
  styleUrls: ['./modal-edit-game.page.scss'],
})
export class ModalEditGamePage implements OnInit {

  @ViewChild(IonInput) inputText: IonInput;

  public allGames: GameModel[] = [];
  public title: string;
  public isNew: boolean = false;
  public disabled: boolean = false;

  constructor(private logger: NGXLogger, private httpClient: HttpClient, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
  }

  async ngOnInit() {
    await this.getAllGames();
    let gameNumber = this.allGames.length;
    this.title = `Game #${gameNumber}`;
  }

  async ionViewDidEnter() {
    this.inputText.setFocus();
  }

  getAllGames() {
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    gameClient.getAll().subscribe({
      next: (res) => {
        this.allGames = res;
        let gameNumber = this.allGames.length;
        this.title = `Game #${gameNumber}`;
        console.log("Got all games: ", res);
      }, error: (err) => {
        console.error("Error on getAll: ", err);
      }
    });
  }

  inputOnChange(e: any) {
    let text = e.detail.value.toLocaleLowerCase();
    this.title = e.detail.value;
    console.log("inputOnChange: ", text);
    if (text) {
      let foundTitle = this.allGames.find(x => x.title?.toLocaleLowerCase() == text);
      if (foundTitle) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    }else{
      this.disabled = true;
    }
  }


  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      title: this.title
    });
  }
}
