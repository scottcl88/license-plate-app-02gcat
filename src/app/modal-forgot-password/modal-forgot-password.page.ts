/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-forgot-password',
  templateUrl: './modal-forgot-password.page.html',
  styleUrls: ['./modal-forgot-password.page.scss'],
})
export class ModalForgotPasswordPage implements OnInit {

  public email: string | undefined;
  public loginForm!: FormGroup;
  public showErrors!: boolean;
  public submitted: boolean = false;

  constructor(private logger: NGXLogger, private httpClient: HttpClient, public formBuilder: FormBuilder, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
  }

  get errorCtr() {
    return this.loginForm.controls;
  }

  async ngOnInit() {

    this.loginForm = this.formBuilder.group({
      email: new FormControl("", [Validators.required, Validators.email])
    });
  }

  emailChanged(ev: any) {
    this.email = ev.detail.value;
  }


  dismiss(saved: boolean) {
    this.submitted = true;
    if (!this.loginForm.valid) {
      this.showErrors = true;
      return;
    }
    this.submitted = false;
    this.showErrors = false;
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.popoverController.dismiss({
      saved: saved,
      email: this.email
    });
  }
}
