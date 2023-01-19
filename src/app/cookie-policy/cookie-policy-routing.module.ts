/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CookiePolicyPage } from './cookie-policy.page';

const routes: Routes = [
  {
    path: '',
    component: CookiePolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CookiePolicyPageRoutingModule {}
