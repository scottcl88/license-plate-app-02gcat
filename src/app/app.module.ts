import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { StorageService } from './storage.service';

import { HttpClientModule } from '@angular/common/http';

import { appInitializer } from './_helpers';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { CommonModule } from '@angular/common';
import { IonicStorageModule } from '@ionic/storage-angular';
import { DateFnsModule } from 'ngx-date-fns';
import { environment } from 'src/environments/environment';
import * as cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Drivers, Storage } from '@ionic/storage';
import { GameService } from './game.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    LoggerModule.forRoot({
      serverLoggingUrl: environment.API_BASE_URL + '/api/Log/AddLog',
      enableSourceMaps: false,
      disableFileDetails: true,
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: environment.ServerLogLevel,
    }),
    IonicModule.forRoot(),
    DateFnsModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [cordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    CommonModule,
    RouterModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [StorageService, GameService] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
