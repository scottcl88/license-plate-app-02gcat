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
  selector: 'app-modal-location',
  templateUrl: './modal-location.page.html',
  styleUrls: ['./modal-location.page.scss'],
})
export class ModalLocationPage implements OnInit {

  public locationValue: string = "";
  public displayAsk: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private gameService: GameService, public toastController: ToastController) {
  }

  async ngOnInit() {
  }

  radioChanged(e: any) {
    console.log("radioChanged: ", e);
    this.locationValue = e.detail.value;
    this.dismiss(true);
  }

  dismiss(saved: boolean) {
    console.log("dismissing: ", saved, this.locationValue)
    this.modalController.dismiss({
      saved: saved,
      value: this.locationValue
    });
  }
}
