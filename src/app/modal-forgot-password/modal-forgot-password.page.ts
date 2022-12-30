/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-modal-forgot-password',
  templateUrl: './modal-forgot-password.page.html',
  styleUrls: ['./modal-forgot-password.page.scss'],
})
export class ModalForgotPasswordPage implements OnInit {

  public email: string | undefined;

  constructor(private logger: NGXLogger, private httpClient: HttpClient, private storageService: StorageService, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
   }

  async ngOnInit() {

  }

  emailChange(ev: any){    
    this.email = ev.detail.value;
  }


  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.popoverController.dismiss({
      saved: saved,
      email: this.email
    });
  }
}
