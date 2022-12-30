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
// import { AuthService } from '@auth0/auth0-angular';
import { AccountService } from '../account.service';
import { ModalForgotPasswordPage } from '../modal-forgot-password/modal-forgot-password.page';
import { CoreUtilService } from '../core-utils';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  public phoneNumber!: string;
  public verificationCode!: string;
  private verified!: boolean;
  private recaptchaWidgetId!: number;
  public showVerification: boolean = false;
  public loginForm!: FormGroup;
  public showErrors!: boolean;
  public verificationForm!: FormGroup;

  public password!: string;
  public password2!: string;
  public token: string | null | undefined;
  public errorMessage!: string;
  private isDirty: boolean = false;
  private isLoading: boolean = false;
  public isSaving: boolean = false;
  public submitted: boolean = false;
  public invalidConfirmPassword: boolean = false;
  public resetForm!: FormGroup;

  constructor(private toastController: ToastController, private coreUtilService: CoreUtilService, private storageService: StorageService, private router: Router, private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient, private accountService: AccountService, private popoverController: PopoverController) { }

  ngOnInit() {
    this.resetForm = new FormGroup({
      password: new FormControl(this.password, [Validators.required]),
      password2: new FormControl(this.password2, [Validators.required, Validators.pattern(this.password)]),
    });
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token');
    console.log('Reset password ngOnInit:', this.token);
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
  get errorCtr() {
    return this.resetForm.controls;
  }
  resetPassword() {
    this.submitted = true;
    this.invalidConfirmPassword = false;
    if (!this.resetForm.valid) {
      this.showErrors = true;
      return;
    }
    if (this.password !== this.password2) {
      this.invalidConfirmPassword = true;
      this.showErrors = true;
      return;
    }
    this.isSaving = true;
    this.accountService.resetPassword(this.token ?? "", this.password, this.password2).subscribe(res => {
      console.log("resetPassword result: ", res);
      this.coreUtilService.presentToastSuccess('Password reset successful, you can now login');
      this.isSaving = false;
      this.router.navigate(['/login']);
      this.submitted = false;
    }, err => {
      console.log("resetPassword error: ", err);
      this.coreUtilService.presentToastError();
      this.errorMessage = err;
      this.showErrors = true;
      this.isSaving = false;
      this.submitted = false;
    });
  }
}
