import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryPageRoutingModule } from './history-routing.module';

import { HistoryPage } from './history.page';
import { ModalSearchLicensePageModule } from '../modal-search-license/modal-search-license.module';
import { ModalViewLicensePageModule } from '../modal-view-license/modal-view-license.module';
import { DateFnsModule } from 'ngx-date-fns';
import { ModalEditGamePage } from '../modal-edit-game/modal-edit-game.page';
import { ModalEditGamePageModule } from '../modal-edit-game/modal-edit-game.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryPageRoutingModule,
    ModalSearchLicensePageModule,
    ModalViewLicensePageModule,
    DateFnsModule,
    ModalEditGamePageModule
  ],
  declarations: [HistoryPage]
})
export class HistoryPageModule {}
