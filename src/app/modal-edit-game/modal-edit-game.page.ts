/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { GameClient, GameModel, LicensePlateModel } from 'src/api';
import { environment } from 'src/environments/environment';
import { GameService } from '../game.service';

@Component({
  selector: 'app-modal-edit-game',
  templateUrl: './modal-edit-game.page.html',
  styleUrls: ['./modal-edit-game.page.scss'],
})
export class ModalEditGamePage implements OnInit {

  @ViewChild(IonInput) inputText: IonInput;

  public allGames: GameModel[] = [];
  public gameId: number;
  public title: string = "";
  public description: string = "";
  public isNew: boolean = false;
  public disabled: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private gameService: GameService, public toastController: ToastController) {
  }

  async ngOnInit() {
    this.getAllGames();
    if (this.isNew) {
      let gameNumber = this.allGames.length + 1;
      this.title = `Game #${gameNumber}`;
    }
  }

  async ionViewDidEnter() {
    this.inputText.setFocus();
    console.log("Game title: ", this.title);
  }

  async getAllGames() {
    this.allGames = await this.gameService.getGames();
    if (this.isNew) {
      let gameNumber = this.allGames.length;
      let text = `Game #${gameNumber}`;
      let tries = 0;
      let foundMatch = false;
      do {
        gameNumber++;
        text = `Game #${gameNumber}`;
        tries++;
        foundMatch = (this.allGames.find(x => x.title == text) != null);
      } while (tries <= 10 && foundMatch);
      this.title = text;
    }
  }

  inputOnChange(e: any) {
    let text = e.detail.value;
    this.title = e.detail.value;
    console.log("inputOnChange: ", text);
    if (text) {
      let foundTitle = this.allGames.find(x => x.title == text && x.gameId != this.gameId);
      if (foundTitle) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    } else {
      this.disabled = true;
    }
  }

  descriptionOnChange(e: any){
    this.description = e.detail.value;
  }


  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      title: this.title,
      description: this.description
    });
  }
}
