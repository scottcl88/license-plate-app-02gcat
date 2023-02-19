/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { HeaderModule } from '../header/header.module';
import { ModalEmailPageModule } from '../modal-email/modal-email.module';
import { ModalImportPageModule } from '../modal-import/modal-import.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    ProfilePageRoutingModule,
    HeaderModule,
    ModalEmailPageModule,
    ModalImportPageModule
  ],
  declarations: [ProfilePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ProfilePageModule {}
