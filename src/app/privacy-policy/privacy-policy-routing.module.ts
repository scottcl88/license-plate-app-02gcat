/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivacyPolicyPage } from './privacy-policy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPolicyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivacyPolicyPageRoutingModule {}
