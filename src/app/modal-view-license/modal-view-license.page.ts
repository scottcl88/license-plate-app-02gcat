/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { GameLicensePlateModel, LicensePlateModel } from 'src/api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-view-license',
  templateUrl: './modal-view-license.page.html',
  styleUrls: ['./modal-view-license.page.scss'],
})
export class ModalViewLicensePage implements OnInit {

  @ViewChild(IonSearchbar) searchBar: IonSearchbar;

  public glp: GameLicensePlateModel;
  public imageBaseUrl: string = environment.API_BASE_URL + "/api/licensePlates/view/";
  public imageFailed: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
  }

  async ngOnInit() {
  }

  onImageError(){
    this.imageFailed = true;
  }

  dismiss(removed: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      removed: removed
    });
  }
}
