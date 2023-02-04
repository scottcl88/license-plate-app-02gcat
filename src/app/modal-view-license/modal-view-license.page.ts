/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, IonSearchbar, ModalController, PickerController, PopoverController, ToastController } from '@ionic/angular';
import { formatISO } from 'date-fns';
import { NGXLogger } from 'ngx-logger';
import { GameLicensePlateModel, LicensePlateModel, VehicleType } from 'src/api';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-view-license',
  templateUrl: './modal-view-license.page.html',
  styleUrls: ['./modal-view-license.page.scss'],
})
export class ModalViewLicensePage implements OnInit {

  @ViewChild(IonDatetime) datetime: IonDatetime;

  public glp: GameLicensePlateModel;
  public imageBaseUrl: string = environment.API_BASE_URL + "/api/licensePlates/view/";
  public imageFailed: boolean = false;
  public isoDate: string;
  public location: string;
  public vehicleType: VehicleType;
  public isDirty: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private pickerController: PickerController, public toastController: ToastController) {
  }

  async ngOnInit() {
    this.isoDate = formatISO(this.glp.createdDateTime);
    this.location = this.glp.location ?? "";
    this.vehicleType = this.glp.vehicleType ?? VehicleType.Car;
  }

  onImageError() {
    this.imageFailed = true;
  }

  dateChanged(e: any) {
    console.log("DateChanged: ", e);
    if (this.isoDate != e.detail.value) {
      this.isDirty = true;
      this.isoDate = e.detail.value;
    }
  }

  async openVehiclePicker() {
    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'types',
          options: [
            {
              text: 'Car',
              value: VehicleType.Car,
            },
            {
              text: 'Truck',
              value: VehicleType.Truck,
            },
            {
              text: 'Other',
              value: VehicleType.Other,
            },
          ],
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Confirm',
          handler: (selected) => {
            console.log("Value:: ", selected);
            let newType = selected.types.value;
            if (this.glp.vehicleType != newType) {
              this.isDirty = true;
            } else {
              this.isDirty = false;
            }
            this.vehicleType = newType;
          },
        },
      ],
    });

    await picker.present();
  }

  cancel() {
    console.log("cancel changes");
    this.isoDate = formatISO(this.glp.createdDateTime);
    this.location = this.glp.location ?? "";
    this.vehicleType = this.glp.vehicleType ?? VehicleType.Car;
    this.isDirty = false;
    this.datetime.value = this.isoDate;
  }

  dismiss(removed: boolean, saved: boolean) {
    this.modalController.dismiss({
      removed: removed,
      saved: saved,
      date: this.isoDate,
      location: this.location,
      vehicleType: this.vehicleType
    });
  }
}
