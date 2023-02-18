/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalViewImagePage } from './modal-view-image.page';
import { HeaderModule } from '../header/header.module';
import { UsMapModule } from '../us-map/us-map.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    ReactiveFormsModule,
    UsMapModule
  ],
  declarations: [ModalViewImagePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalViewImageModule {}
