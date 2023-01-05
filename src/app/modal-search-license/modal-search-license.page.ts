/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { LicensePlateModel } from 'src/api';

@Component({
  selector: 'app-modal-search-license',
  templateUrl: './modal-search-license.page.html',
  styleUrls: ['./modal-search-license.page.scss'],
})
export class ModalSearchLicensePage implements OnInit {

  @ViewChild(IonSearchbar) searchBar: IonSearchbar;

  public availableLicensePlates: LicensePlateModel[] = [];
  public filteredLicensePlates: LicensePlateModel[] = [];

  constructor(private logger: NGXLogger, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
  }

  async ngOnInit() {
  }

  async ionViewDidEnter() {
    this.searchBar.setFocus();
  }

  searchOnChange(e: any) {
    let text = e.detail.value.toLocaleLowerCase();
    console.log("searchOnChange: ", text);
    if (text) {
      this.filteredLicensePlates = this.availableLicensePlates.filter(x => x.state?.name?.toLowerCase()?.startsWith(text) || x.state?.abbreviation?.toLocaleLowerCase() == text);
      if (this.filteredLicensePlates.length <= 0) {
        this.filteredLicensePlates = this.availableLicensePlates.filter(x => x.state?.name?.toLowerCase()?.includes(text));
      }
    } else {
      this.filteredLicensePlates = this.availableLicensePlates;
    }
  }


  dismiss(saved: boolean, lp: LicensePlateModel | null) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      selectedState: lp
    });
  }
}
