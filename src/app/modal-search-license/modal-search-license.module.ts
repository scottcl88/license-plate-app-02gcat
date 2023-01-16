/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalSearchLicensePage } from './modal-search-license.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,
    // ModalRatingRoutingModule
  ],
  declarations: [ModalSearchLicensePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalSearchLicensePageModule {}
