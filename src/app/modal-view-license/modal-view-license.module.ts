/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

// import { ModalRatingRoutingModule } from './results-routing.module';

import { ModalViewLicensePage } from './modal-view-license.page';
import { HeaderModule } from '../header/header.module';
import { DateFnsModule } from 'ngx-date-fns';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderModule,    
    DateFnsModule
    // ModalRatingRoutingModule
  ],
  declarations: [ModalViewLicensePage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ModalViewLicensePageModule {}
