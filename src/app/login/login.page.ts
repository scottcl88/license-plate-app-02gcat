/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios, { AxiosRequestConfig } from 'axios';
import { Observable, of, scheduled } from 'rxjs';
import { environment } from '../../environments/environment';
import { mergeMap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserClient } from 'src/api';
import { StorageService } from '../storage.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
// import { AuthService } from '@auth0/auth0-angular';
import { AccountService } from '../account.service';
import { ModalForgotPasswordPage } from '../modal-forgot-password/modal-forgot-password.page';
import { CoreUtilService } from '../core-utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public phoneNumber!: string;
  public verificationCode!: string;
  private verified!: boolean;
  private recaptchaWidgetId!: number;
  public showVerification: boolean = false;
  public loginForm!: FormGroup;
  public showErrors!: boolean;
  public verificationForm!: FormGroup;

  public email: string = "";
  public password: string = "";
  public errorMessage!: string;
  private isDirty: boolean = false;
  private isLoading: boolean = false;
  public isSaving: boolean = false;

  private token!: string;
  public submitted: boolean = false;

  @ViewChild('emailId', { static: false })
  ionInput!: { setFocus: () => void; };

  constructor(public formBuilder: FormBuilder, private modalController: ModalController, private route: ActivatedRoute, private coreUtilService: CoreUtilService, private storageService: StorageService, private router: Router,
    private httpClient: HttpClient, private accountService: AccountService, private popoverController: PopoverController) { }

  get errorCtr() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.verified = false;

    this.loginForm = this.formBuilder.group({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required]),
    });

    this.verificationForm = new FormGroup({
      verificationCode: new FormControl(this.verificationCode, [Validators.required]),
    });

    console.log('Login ngOnInit:');

    if (this.router.url.indexOf("forgot-password") > 0) {
      this.resetPassword();
    }

    this.route.queryParams
      .subscribe(params => {
        this.token = params['token'];

        if (this.router.url.indexOf("verify-email") > 0) {
          this.verifyEmail();
        }
      }
      );

    this.ionInput?.setFocus();
  }

  ngAfterOnInit() {
    this.ionInput.setFocus();
  }

  emailChanged(ev: any) {
    if (ev.detail.value != null) {
      this.email = ev.detail.value;
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  passwordChanged(ev: any) {
    if (ev.detail.value != null) {
      this.password = ev.detail.value;
    }
    if (!this.isLoading) {
      this.isDirty = true;
    }
  }
  login() {
    this.submitted = true;
    console.log("LoginForm: ", this.loginForm, this.loginForm.valid, this.loginForm.errors);
    if (!this.loginForm.valid) {
      this.showErrors = true;
      return;
    }
    this.isSaving = true;
    this.accountService.login(this.email, this.password).subscribe(res => {
      console.log("Login result: ", res);
      this.isSaving = false;
      this.submitted = false;
      this.router.navigate(['/']);
    }, err => {
      console.log("Login error: ", err);
      this.isSaving = false;
      this.errorMessage = err;
      this.showErrors = true;
      this.submitted = false;
    });
  }
  register() {
    this.router.navigate(['/register']);
  }
  async resetPassword() {
    const modal = await this.popoverController.create({
      component: ModalForgotPasswordPage,
      componentProps: {
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved) {
      // this.email = data.email;
      this.accountService.forgotPassword(data.email).subscribe(res => {
        console.log("Forgot password sent", res);
        this.coreUtilService.presentToastSuccess('Check your email! If your email was found, a link to reset your password was sent.', 5000);
      }, err => {
        console.log("Forgot password failed", err);
        this.coreUtilService.presentToastError();

      });
    }
  }
  async verifyEmail() {
    this.accountService.verifyEmail(this.token).subscribe(res => {
      console.log("Verify email result: ", res);
      this.coreUtilService.presentToastSuccess("Verification successful, you can now login");
    }, err => {
      console.log("Verify email error: ", err);
      this.coreUtilService.presentToastError();
      this.errorMessage = err;
      this.showErrors = true;
    });
  }
}
