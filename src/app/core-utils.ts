/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
// import { AuthService } from "@auth0/auth0-angular";
import { LoadingController, ToastController } from "@ionic/angular";
import { NGXLogger } from "ngx-logger";

@Injectable({
  providedIn: 'root',
})
export class CoreUtilService {
  private loadingElement: any;

  constructor(private logger: NGXLogger,
    private loadingController: LoadingController, private toastController: ToastController) {

  }
  async presentLoading() {
    this.loadingElement = await this.loadingController.create({
      message: 'Loading',
      cssClass: '',
      // spinner: null,
      showBackdrop: true
    });
    await this.loadingElement.present();
  }
 
  dismissLoading() {
    this.loadingElement?.dismiss();
  }
  async presentToastError(message: string = 'Error occurred') {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger',
      position: 'middle',
    });
    toast.present();
  }

  async presentToastSuccess(message: string = 'Success', duration: number = 1500) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: 'success',
      position: 'middle',
    });
    toast.present();
  }
}
