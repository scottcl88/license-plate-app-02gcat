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
  selector: 'app-modal-import',
  templateUrl: './modal-import.page.html',
  styleUrls: ['./modal-import.page.scss'],
})
export class ModalImportPage implements OnInit {

  @ViewChild(IonInput) inputText: IonInput;

  public allGames: GameModel[] = [];
  public data: string = "";
  public disabled: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private gameService: GameService, public toastController: ToastController) {
  }

  async ngOnInit() {
  }

  async ionViewDidEnter() {
    //this.inputText.setFocus();
  }

  inputOnChange(e: any) {
    let text = e.detail.value;
    this.data = e.detail.value;
    if (text) {
      this.disabled = false;
    } else {
      this.disabled = true;
    }
  }


  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      gameData: this.data
    });
  }
}
