/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingController, ToastController } from "@ionic/angular";
import { NGXLogger } from "ngx-logger";

@Injectable({
  providedIn: 'root',
})
export class CoreUtilService {
  private loadingElement: any;

  constructor(private logger: NGXLogger, private router: Router,
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

  isNonAuthPage() {
    let forgotPasswordFound = this.router.url.indexOf("forgot-password") > 0;
    let resetPasswordFound = this.router.url.indexOf("reset-password") > 0;
    let registerFound = this.router.url.indexOf("register") > 0;
    let verifyEmailFound = this.router.url.indexOf("verify-email") > 0;
    let legalFound = this.router.url.indexOf("legal") > 0;
    let privacyPolicyFound = this.router.url.indexOf("privacy-policy") > 0;
    let termsOfUseFound = this.router.url.indexOf("terms-of-use") > 0;
    if (forgotPasswordFound || resetPasswordFound || registerFound || verifyEmailFound || legalFound || privacyPolicyFound || termsOfUseFound) {
      return true;
    }
    return false;
  }
}
