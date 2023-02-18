/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { IonSlides, ModalController } from '@ionic/angular';
import Swiper, { SwiperOptions, Zoom } from 'swiper';
import { UsMapComponent } from '../us-map/us-map.component';

@Component({
  selector: 'app-modal-view-image',
  templateUrl: './modal-view-image.page.html',
  styleUrls: ['./modal-view-image.page.scss'],
})
export class ModalViewImagePage implements OnInit {

  // @ViewChild('swiper', { static: false }) swiper: SwiperComponent;
  @ViewChild("canvasContainer", { static: false }) canvasContainer: ElementRef;
  @ViewChild("imgContainer2", { static: false }) imgContainer: ElementRef;
  @ViewChild('newSwiper') newSwiper: any;
  private slidesRef: any;

  public svgData: any;
  public mapHeight: number;
  public mapWidth: number;

  config: SwiperOptions = {
    zoom: true
  };

  constructor(private modalController: ModalController) {
    Swiper.use([Zoom]);
  }

  ngOnInit() {
    console.log("ngOnInit");
    // console.table({
    //   test: "123"
    // })
    // console.table({
    //   isBeginning: this.slidesRef.isBeginning,
    //   isEnd: this.slidesRef.isEnd
    // });
  }
  ngAfterViewInit(): void {
    console.log(this.newSwiper.swiperRef);
    setTimeout(() => {
      this.testSvgConvert();
    }, 0);
    //Swiper instance will be displayed in console
  }
  public swiperInit(swiper: any) {
    console.log("SwiperInit: ", swiper);
    this.slidesRef = swiper;
    this.testSvgConvert();
  }

  async zoom(zoomIn: boolean) {
    const zoom = this.newSwiper.swiperRef.zoom;
    zoomIn ? zoom.in() : zoom.out();
  }

  close() {
    this.modalController.dismiss();
  }
  // @ViewChild(UsMapComponent) usMap: UsMapComponent;

  testSvgConvert() {
    // console.log("svgContainer: ", this.usMap.svgContainer);

    //Select the element:
    // const $svg = this.usMap.svgContainer.nativeElement.querySelector('svg')
    const $holder = this.imgContainer.nativeElement;
    // const $label = document.getElementById('img-format')

    // Serialize it as xml string:
    // const svgAsXML = (new XMLSerializer()).serializeToString($svg)

    // Encode it as a data string:
    // const svgData = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`

    // console.log("svgData: ", svgData);

    const destroyChildren = ($element: any) => {
      while ($element.firstChild) {
        const $lastChild = $element.lastChild ?? false
        if ($lastChild) $element.removeChild($lastChild)
      }
    }

    const loadImage = async (url: any) => {
      const $img = document.createElement('img')
      $img.src = url
      return new Promise((resolve, reject) => {
        $img.onload = () => resolve($img)
        $img.onerror = reject
      })
    }

    const convertSVGtoImg = async (e: any) => {
      // const $btn = e.target
      const format = 'png';
      // $label.textContent = format

      destroyChildren($holder)

      const img = (await loadImage(this.svgData) as any);

      const $canvas = this.canvasContainer.nativeElement;//document.createElement('canvas')
      const width = this.mapWidth;//$svg.clientWidth
      const height = this.mapHeight;//$svg.clientWidth
      $canvas.width = width;//$svg.clientWidth
      $canvas.height = height;//$svg.clientHeight
      $canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)

      const dataURL = await $canvas.toDataURL(`image/${format}`, 1.0);
      console.log(dataURL)

      const $img = document.createElement('img')
      $img.src = dataURL
      // $holder?.appendChild($img)
    }

    convertSVGtoImg(null);

  }
}
