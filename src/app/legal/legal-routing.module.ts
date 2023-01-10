/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LegalPage } from './legal.page';

const routes: Routes = [
  {
    path: '',
    component: LegalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalPageRoutingModule {}
