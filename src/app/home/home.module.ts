import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { ModalSearchLicensePageModule } from '../modal-search-license/modal-search-license.module';
import { ModalViewLicensePageModule } from '../modal-view-license/modal-view-license.module';
import { DateFnsModule } from 'ngx-date-fns';
import { UsMapModule } from '../us-map/us-map.module';
import { ModalViewImageModule } from '../modal-view-image/modal-view-image.module';
// import { SwiperModule } from 'swiper/angular';
import { ModalEditGamePageModule } from '../modal-edit-game/modal-edit-game.module';
import { ModalLocationPageModule } from '../modal-location/modal-location.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ModalSearchLicensePageModule,
    ModalViewLicensePageModule,
    DateFnsModule,
    UsMapModule,
    ModalViewImageModule,
    // SwiperModule,
    ModalEditGamePageModule,
    ModalLocationPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
