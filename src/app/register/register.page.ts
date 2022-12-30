/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2022 Scott Lewis, All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios, { AxiosRequestConfig } from 'axios';
import { Observable, of, scheduled } from 'rxjs';
import { environment } from '../../environments/environment';
import { mergeMap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PopoverController, ToastController } from '@ionic/angular';
import { AccountService } from '../account.service';
import { ModalForgotPasswordPage } from '../modal-forgot-password/modal-forgot-password.page';
import { CoreUtilService } from '../core-utils';
import { Device } from '@capacitor/device';
import { RegisterRequest } from 'src/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  public phoneNumber!: string;
  public verificationCode!: string;
  private verified!: boolean;
  private recaptchaWidgetId!: number;
  public showVerification: boolean = false;
  public registerForm!: FormGroup;
  public showErrors!: boolean;
  public verificationForm!: FormGroup;

  public name!: string;
  public email!: string;
  public password!: string;
  public password2!: string;
  public token!: string | null | undefined;
  public errorMessage!: string;
  private isDirty: boolean = false;
  private isLoading: boolean = false;

  public isSaving: boolean = false;
  public submitted: boolean = false;
  public invalidConfirmPassword: boolean = false;

  constructor(private toastController: ToastController, private coreUtilService: CoreUtilService, private storageService: StorageService, private router: Router, private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient, private accountService: AccountService, private popoverController: PopoverController) { }

  get errorCtr() {
    return this.registerForm.controls;
  }
  ngOnInit() {
    this.registerForm = new FormGroup({
      name: new FormControl(this.name, [Validators.required]),
      email: new FormControl(this.email, [Validators.required, Validators.email]),
      password: new FormControl(this.password, [Validators.required]),
      password2: new FormControl(this.password2, [Validators.required, Validators.pattern(this.password)]),
    });
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');
    console.log('Register ngOnInit:', this.token);
  }

  nameChanged(ev: any) {
    console.log("name changed: ", ev.detail.value, this.name);
    if (ev.detail.value != null) {
      this.name = ev.detail.value;
      console.log("name changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  emailChanged(ev: any) {
    console.log("email changed: ", ev.detail.value, this.email);
    if (ev.detail.value != null) {
      this.email = ev.detail.value;
      console.log("email changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  passwordChanged(ev: any) {
    console.log("password changed: ", ev.detail.value, this.password);
    if (ev.detail.value != null) {
      this.password = ev.detail.value;
      console.log("password changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  password2Changed(ev: any) {
    console.log("password2 changed: ", ev.detail.value, this.password2);
    if (ev.detail.value != null) {
      this.password2 = ev.detail.value;
      console.log("password2 changed occurred");
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  async register() {
    this.submitted = true;
    this.invalidConfirmPassword = false;
    if (!this.registerForm.valid) {
      this.showErrors = true;
      return;
    }
    if (this.password !== this.password2) {
      this.invalidConfirmPassword = true;
      this.showErrors = true;
      return;
    }
    this.isSaving = true;
    let request = new RegisterRequest();
    request.name = this.name;
    request.email = this.email;
    request.password = this.password;
    request.confirmPassword = this.password2;

    request.deviceToken = await this.storageService.getDeviceToken();
    request.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    request.utcOffset = new Date().getTimezoneOffset();
    var deviceId = await Device.getId();
    console.log("DeviceId = ", deviceId?.uuid);
    request.deviceId = deviceId?.uuid;
    var deviceInfo = await Device.getInfo();
    request.model = deviceInfo.model;
    request.isVirtual = deviceInfo.isVirtual;
    request.manufacturer = deviceInfo.manufacturer;
    request.operatingSystem = deviceInfo.operatingSystem;
    request.operatingSystemVersion = deviceInfo.osVersion;
    request.platform = deviceInfo.platform;
    request.webViewVersion = deviceInfo.webViewVersion;

    this.accountService.register(request).subscribe(res => {
      console.log("register result: ", res);
      this.isSaving = false;
      this.submitted = false;
      this.coreUtilService.presentToastSuccess('Registration successful, please check your email for verification instructions', 5000);
      this.router.navigate(['/login']);
    }, err => {
      this.isSaving = false;
      this.submitted = false;
      console.log("register error: ", err);
      this.coreUtilService.presentToastError();
      this.errorMessage = err;
      this.showErrors = true;
    });
  }
}
