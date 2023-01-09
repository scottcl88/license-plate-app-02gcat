/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalEditGamePage } from './modal-edit-game.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    // ModalRatingRoutingModule
  ],
  declarations: [ModalEditGamePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalEditGamePageModule {}
