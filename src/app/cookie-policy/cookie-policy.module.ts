/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CookiePolicyPageRoutingModule } from './cookie-policy-routing.module';

import { CookiePolicyPage } from './cookie-policy.page';
import { HeaderModule } from '../header/header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    ReactiveFormsModule,
    CookiePolicyPageRoutingModule,
    HeaderModule
  ],
  declarations: [CookiePolicyPage],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CookiePolicyPageModule {}
