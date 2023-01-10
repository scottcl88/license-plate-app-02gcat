/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LegalPageRoutingModule } from './legal-routing.module';

import { LegalPage } from './legal.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    LegalPageRoutingModule,
    HeaderModule
  ],
  declarations: [LegalPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class LegalPageModule {}
