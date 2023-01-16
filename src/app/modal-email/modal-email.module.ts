/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalEmailPage } from './modal-email.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
  ],
  declarations: [ModalEmailPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalEmailPageModule {}
