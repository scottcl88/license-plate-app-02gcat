/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IonImg, IonItemSliding, IonSearchbar, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { LicensePlateModel } from 'src/api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-search-license',
  templateUrl: './modal-search-license.page.html',
  styleUrls: ['./modal-search-license.page.scss'],
})
export class ModalSearchLicensePage implements OnInit {

  @ViewChild(IonSearchbar) searchBar: IonSearchbar;

  @ViewChildren('images') images: QueryList<IonImg>;

  public availableLicensePlates: LicensePlateModel[] = [];
  public filteredLicensePlates: LicensePlateModel[] = [];

  public failedImages: number[] = [];

  public imageBaseUrl: string = environment.API_BASE_URL + "/api/licensePlates/view/";

  constructor(private logger: NGXLogger, private modalController: ModalController, private popoverController: PopoverController, public toastController: ToastController) {
  }

  async ngOnInit() {
  }

  isImageError(index: number){
    let foundImage = this.failedImages.findIndex(x => x == index);
    return foundImage >= 0;
  }

  async ionViewDidEnter() {
    this.searchBar.setFocus();
    this.failedImages = [];
  }

  imageLoadError(index: any){
    console.log("imageLoadError: ", index);
    this.failedImages.push(index);
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
