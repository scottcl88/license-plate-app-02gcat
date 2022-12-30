/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { HeaderModule } from '../header/header.module';
import { ModalForgotPasswordModule } from '../modal-forgot-password/modal-forgot-password.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    HeaderModule,
    ModalForgotPasswordModule
  ],
  declarations: [RegisterPage]
})
export class RegisterPageModule {}
