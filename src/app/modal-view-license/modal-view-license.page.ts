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
  public vehicleTypes: VehicleType[];
  public isDirty: boolean = false;

  public isLoaded: boolean = false;

  public isCarChecked: boolean = true;
  public isTruckChecked: boolean = false;
  public isOtherChecked: boolean = false;

  public isCarDisabled: boolean = true;
  public isTruckDisabled: boolean = false;
  public isOtherDisabled: boolean = false;

  constructor(private logger: NGXLogger, private modalController: ModalController, private pickerController: PickerController, public toastController: ToastController) {
  }

  async ngOnInit() {
    this.isoDate = formatISO(this.glp.createdDateTime);
    this.location = this.glp.location ?? "";
    this.vehicleTypes = this.glp.vehicleTypes ?? [VehicleType.Car];
    // this.isCarChecked = true;
    // this.isTruckChecked = false;
    // this.isOtherChecked = false;
    this.updateChecked();
  }

  async ngAfterViewInit() {
    this.isLoaded = true;
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

  checkedChange(type: string) {
    if (!this.isLoaded) return;
    console.log("Current Types: ", this.vehicleTypes);
    let found = this.vehicleTypes.find(x => x == type);
    if (found) {
      let index = this.vehicleTypes.indexOf(found);
      this.vehicleTypes.splice(index, 1);
    } else {
      let vt = type as VehicleType;
      this.vehicleTypes.push(vt);
    }
    this.isDirty = true;

    console.log("New Types: ", this.vehicleTypes);
    this.updateChecked();
  }

  updateChecked() {
    let foundCar = this.vehicleTypes.find(x => x == "Car");
    if (foundCar) {
      this.isCarChecked = true;
    } else {
      this.isCarChecked = false;
    }
    let foundTruck = this.vehicleTypes.find(x => x == "Truck");
    if (foundTruck) {
      this.isTruckChecked = true;
    } else {
      this.isTruckChecked = false;
    }
    let foundOther = this.vehicleTypes.find(x => x == "Other");
    if (foundOther) {
      this.isOtherChecked = true;
    } else {
      this.isOtherChecked = false;
    }

    if (this.vehicleTypes.length == 1) {
      if (this.vehicleTypes[0] == VehicleType.Car) {
        this.isCarChecked = true;
        this.isCarDisabled = true;
        this.isTruckDisabled = false;
        this.isOtherDisabled = false;
      } else if (this.vehicleTypes[0] == VehicleType.Truck) {
        this.isTruckChecked = true;
        this.isTruckDisabled = true;
        this.isOtherDisabled = false;
        this.isCarDisabled = false;
      } else if (this.vehicleTypes[0] == VehicleType.Other) {
        this.isOtherChecked = true;
        this.isOtherDisabled = true;
        this.isTruckDisabled = false;
        this.isCarDisabled = false;
      }
    } else {
      this.isOtherDisabled = false;
      this.isTruckDisabled = false;
      this.isCarDisabled = false;
    }
  }

  cancel() {
    console.log("cancel changes");
    this.isoDate = formatISO(this.glp.createdDateTime);
    this.location = this.glp.location ?? "";
    this.vehicleTypes = this.glp.vehicleTypes ?? [VehicleType.Car];
    this.isCarChecked = true;
    this.isTruckChecked = false;
    this.isOtherChecked = false;
    this.updateChecked();
    this.isDirty = false;
    this.datetime.value = this.isoDate;
  }

  dismiss(removed: boolean, saved: boolean) {
    this.modalController.dismiss({
      removed: removed,
      saved: saved,
      date: this.isoDate,
      location: this.location,
      vehicleTypes: this.vehicleTypes
    });
  }
}
