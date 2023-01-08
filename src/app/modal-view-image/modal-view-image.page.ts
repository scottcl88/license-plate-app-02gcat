/**
Copyright 2022 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../storage.service';
import { IonSlides, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { NGXLogger } from 'ngx-logger';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-view-image',
  templateUrl: './modal-view-image.page.html',
  styleUrls: ['./modal-view-image.page.scss'],
})
export class ModalViewImagePage implements OnInit {

  @ViewChild(IonSlides) slides: IonSlides;
  @Input('img')img: any;

  sliderOpts = {
    zoom: true
  };

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  ionViewDidEnter(){
    this.slides.update();

    let svg = document.getElementById("svgMap") as HTMLElement;
    console.log("Svg: ", svg);
    svg.style.setProperty('position', 'fixed');
    svg.style.position = "fixed";
  }

  async zoom(zoomIn: boolean) {
    const slider = await this.slides.getSwiper();
    const zoom = slider.zoom;
    zoomIn ? zoom.in() : zoom.out();
  }

  close() {
    this.modalController.dismiss();
  }
}
