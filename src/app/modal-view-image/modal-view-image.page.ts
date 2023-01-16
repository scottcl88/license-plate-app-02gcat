/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { IonSlides, ModalController } from '@ionic/angular';

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
