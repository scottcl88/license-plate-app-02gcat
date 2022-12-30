/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoginPageRoutingModule } from './login-routing.module';

import { LoginPage } from './login.page';
import { HeaderModule } from '../header/header.module';
import { ModalForgotPasswordModule } from '../modal-forgot-password/modal-forgot-password.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    LoginPageRoutingModule,
    HeaderModule,
    ModalForgotPasswordModule
  ],
  declarations: [LoginPage]
})
export class LoginPageModule {}
