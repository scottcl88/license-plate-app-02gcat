/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonItemSliding, ModalController, PopoverController } from '@ionic/angular';
import { CoordinatesPositionModel, GameLicensePlateModel, GameModel, LicensePlateModel, LicensePlatesClient, VehicleType } from 'src/api';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { ModalSearchLicensePage } from '../modal-search-license/modal-search-license.page';
import { ModalViewLicensePage } from '../modal-view-license/modal-view-license.page';
import { Subject } from 'rxjs';
import { Account } from '../_models';
import { UsMapService } from '../us-map/us-map.service';
import { ModalEditGamePage } from '../modal-edit-game/modal-edit-game.page';
import { GameService } from '../game.service';
import { ModalViewImagePage } from '../modal-view-image/modal-view-image.page';
import { UsMapComponent } from '../us-map/us-map.component';
import Swiper, { SwiperOptions, Zoom } from 'swiper';
import { ZoomOptions } from 'swiper/types';
// import { EventsParams, SwiperComponent } from 'swiper/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Position } from '@capacitor/geolocation/dist/esm/definitions';
import { ModalLocationPage } from '../modal-location/modal-location.page';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public static readonly STATES: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  @ViewChildren('slides') slides: QueryList<IonItemSliding>;

  public imageBaseUrl: string = environment.API_BASE_URL + "/api/licensePlates/view/";

  public availableStates: string[] = [];

  public allLicensePlates: LicensePlateModel[] = [];
  public availableLicensePlates: LicensePlateModel[] = [];
  public currentLicensePlates: GameLicensePlateModel[] = [];
  public filteredLicensePlates: LicensePlateModel[] = [];

  public failedImages: number[] = [];

  public currentGame: GameModel | undefined = undefined;

  public isAuthenticated: boolean = false;
  private isLoading: boolean = false;

  private ngUnsubscribe = new Subject();
  public account: Account | undefined | null;

  options = {
    addSuffix: true
  };
  config: SwiperOptions = {
    zoom: {
      maxRatio: 2
    } as ZoomOptions
  };

  sliderOpts = {
    zoom: false,
    slidesPerView: 1.5,
    spaceBetween: 20,
    centeredSlides: true
  };

  public sortArray: string[] = ["Name Asc", "Name Desc", "Added Asc", "Added Desc"];
  public currentSort: number = 0;

  @ViewChild("imgContainer", { static: false }) imgContainer: ElementRef;
  @ViewChild("usMapContainer", { static: false }) usMap: UsMapComponent;
  @ViewChild("canvasContainer", { static: false }) canvasContainer: ElementRef;
  // @ViewChild("newSwiper", { static: false }) newSwiper: SwiperComponent;

  public showZoomMap: boolean = true;
  public showDefaultMap: boolean = true;
  public addStateOpacity: string = "1";
  public isZoomed: boolean = false;

  constructor(private usMapService: UsMapService, private gameService: GameService, private router: Router, private popoverController: PopoverController, private alertController: AlertController,
    private modalController: ModalController, private coreUtilService: CoreUtilService, private httpClient: HttpClient) {
    Swiper.use([Zoom]);
  }

  async ngOnInit() {
    this.availableStates = HomePage.STATES;

    await this.coreUtilService.presentLoading();
    this.isLoading = true;

    this.isAuthenticated = await this.gameService.getIsAuthenticated();
    console.log("User isAuthenticated: ", this.isAuthenticated);
    this.getLicensePlates();
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      //this.svgConvert();
      // this.newSwiper.s_zoomChange.subscribe(
      //   next => {
      //     console.log("zoom subscribe change");
      //     this.isZoomed = true;
      //   }
      // );
    }, 1000);
    //Swiper instance will be displayed in console
  }

  hasCarType(glp: GameLicensePlateModel) {
    return glp.vehicleTypes?.includes(VehicleType.Car);
  }
  hasTruckType(glp: GameLicensePlateModel) {
    return glp.vehicleTypes?.includes(VehicleType.Truck);
  }
  hasOtherType(glp: GameLicensePlateModel) {
    return glp.vehicleTypes?.includes(VehicleType.Other);
  }


  // zoomChange = (): any => {
  //   console.log("ZoomChange called");
  //   this.addStateOpacity = ".5";
  //   this.addStateStyle = "opacity: 1 !important";
  //   this.isZoomed = true;
  // }

  svgConvert() {
    console.log("svgConvert");
    this.showDefaultMap = true;
    this.showZoomMap = true;
    // console.log("svgContainer: ", this.usMap.svgContainer);

    //Select the element:
    const $svg = this.usMap.svgContainer.nativeElement.querySelector('svg')
    const $holder = this.imgContainer.nativeElement;

    // Serialize it as xml string:
    const svgAsXML = (new XMLSerializer()).serializeToString($svg)

    // Encode it as a data string:
    const svgData = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`

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
      console.log("convertSVGtoImg");
      // const $btn = e.target
      const format = 'png';
      // $label.textContent = format

      destroyChildren($holder)

      const img = (await loadImage(svgData) as any);

      const $canvas = this.canvasContainer.nativeElement;//document.createElement('canvas')
      const width = $svg.clientWidth
      const height = $svg.clientHeight
      $canvas.width = width;//$svg.clientWidth
      $canvas.height = height;//$svg.clientHeight
      $canvas.getContext('2d')?.drawImage(img, 0, 0, width, height)

      const dataURL = await $canvas.toDataURL(`image/${format}`, 1.0);

      //const $img = document.createElement('img')
      //$img.src = dataURL
      // $holder?.appendChild($img)

      this.showDefaultMap = false;
      this.showZoomMap = true;
    }

    // this.showZoomMap = true;
    convertSVGtoImg(null);

    let PIXEL_RATIO = (() => {
      const $canvas = this.canvasContainer.nativeElement;
      let ctx = $canvas.getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
          ctx.mozBackingStorePixelRatio ||
          ctx.msBackingStorePixelRatio ||
          ctx.oBackingStorePixelRatio ||
          ctx.backingStorePixelRatio || 1;

      return dpr / bsr;
    })();

    // let createHiDPICanvas = (w: any, h: any, ratio: any) => {
    //   if (!ratio) { ratio = PIXEL_RATIO; }
    //   const $canvas = this.canvasContainer.nativeElement;
    //   $canvas.width = w * ratio;
    //   $canvas.height = h * ratio;
    //   $canvas.style.width = w + "px";
    //   $canvas.style.height = h + "px";
    //   $canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    //   return $canvas;
    // }

    // const width = $svg.clientWidth;
    // const height = $svg.clientHeight;
    // let w = width;
    // let h = height;
    // let ratio = PIXEL_RATIO;
    // const $canvas = this.canvasContainer.nativeElement;
    // $canvas.width = w * ratio;
    // $canvas.height = h * ratio;
    // $canvas.style.width = w + "px";
    // $canvas.style.height = h + "px";
    // $canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);

    // this.showDefaultMap = false;
    // this.showZoomMap = true;
  }

  async openPreview() {
    const $svg = this.usMap.svgContainer.nativeElement.querySelector('svg')

    // Serialize it as xml string:
    const svgAsXML = (new XMLSerializer()).serializeToString($svg)

    // Encode it as a data string:
    const svgData = `data:image/svg+xml,${encodeURIComponent(svgAsXML)}`

    // console.log("svgData: ", svgData);
    const modal = await this.modalController.create({
      component: ModalViewImagePage,
      cssClass: 'transparent-modal',
      componentProps: {
        img: "",
        svgData: svgData,
        mapHeight: $svg.clientHeight,
        mapWidth: $svg.clientWidth
      }
    });
    modal.present();
  }

  isImageError(index: number) {
    let foundImage = this.failedImages.findIndex(x => x == index);
    return foundImage >= 0;
  }

  async ionViewDidEnter() {
    this.failedImages = [];
  }

  imageLoadError(index: any) {
    console.log("imageLoadError: ", index);
    this.failedImages.push(index);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  sortList() {
    this.currentSort++;
    if (this.currentSort >= this.sortArray.length) {
      this.currentSort = 0;
    }
    if (this.currentSort == 0) {
      this.currentLicensePlates.sort((a, b) => {
        return a?.licensePlate?.state?.name?.localeCompare(b?.licensePlate?.state?.name ?? "") ?? 0;
      });
    } else if (this.currentSort == 1) {
      this.currentLicensePlates.sort((a, b) => {
        return b?.licensePlate?.state?.name?.localeCompare(a?.licensePlate?.state?.name ?? "") ?? 0;
      });
    } else if (this.currentSort == 2) {
      this.currentLicensePlates.sort((a, b) => (new Date(a.createdDateTime).getTime()) - (new Date(b.createdDateTime).getTime()));
    }
    else if (this.currentSort == 3) {
      this.currentLicensePlates.sort((a, b) => (new Date(b.createdDateTime).getTime()) - (new Date(a.createdDateTime).getTime()));
    }
  }

  async search() {
    const modal = await this.modalController.create({
      component: ModalSearchLicensePage,
      componentProps: {
        availableLicensePlates: this.availableLicensePlates,
        filteredLicensePlates: this.filteredLicensePlates
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved && data.selectedState) {
      let recordLocationOption = await Preferences.get({ key: "RecordLocationOption" });
      console.log("recordLocationOption: ", recordLocationOption);
      console.log("selectedState: ", data.selectedState);
      if (recordLocationOption && recordLocationOption.value) {
        if (recordLocationOption.value == "alwaysAllow") {
          try {
            const coordinates = await Geolocation.getCurrentPosition();
            let model = new CoordinatesPositionModel();
            model.init(coordinates.coords);
            this.addLicensePlateToGame(data.selectedState, model);
          } catch (err) {
            console.error("Failed to getCurrentPosition", err);
            this.coreUtilService.presentToastError("Please enable location services");
            this.recordLocation(data.selectedState);
          }
        } else if (recordLocationOption.value == "neverAllow") {
          this.addLicensePlateToGame(data.selectedState, undefined);
        } else {
          this.recordLocation(data.selectedState);
        }
      } else {
        this.recordLocation(data.selectedState);
      }
    }
  }

  async recordLocation(selectedState: any) {
    const modal = await this.modalController.create({
      component: ModalLocationPage,
      showBackdrop: true,
      componentProps: {
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('Select Modal Dismissed: ', data);
    if (data && data.saved) {
      await Preferences.set({ key: "RecordLocationOption", value: data.value });
      if (data.value == "alwaysAllow" || data.value == "allowNow") {
        try {
          const coordinates = await Geolocation.getCurrentPosition();
          let model = new CoordinatesPositionModel();
          model.init(coordinates.coords);
          this.addLicensePlateToGame(selectedState, model);
        } catch (err) {
          console.error("Failed to getCurrentPosition", err);
          this.coreUtilService.presentToastError("Please enable location services");
          this.recordLocation(selectedState);
        }
      } else {
        this.addLicensePlateToGame(selectedState, undefined);
      }
    } else {
      this.addLicensePlateToGame(selectedState, undefined);
    }
  }

  async showStartGameModal() {
    try {
      await this.popoverController?.dismiss();
    } catch (err) {
      console.log("Start Game Modal was not dismissed, if any");
    }
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: true
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('showStartGameModal Modal Dismissed: ', JSON.stringify(data));
    if (data && data.saved && data.title) {
      this.currentGame = undefined;
      this.startNewGame(data.title, data.description);
    }
  }

  async showEditGameModal() {
    this.popoverController?.dismiss();
    const modal = await this.modalController.create({
      component: ModalEditGamePage,
      componentProps: {
        isNew: false,
        gameId: this.currentGame?.gameId,
        title: this.currentGame?.title,
        description: this.currentGame?.description
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('showEditGameModal Modal Dismissed: ', JSON.stringify(data));
    if (data && data.saved && data.title && this.currentGame) {
      this.currentGame.title = data.title;
      this.currentGame.description = data.description;
      this.gameService.saveGame(this.currentGame);
    }
  }

  async view(glp: GameLicensePlateModel, i: number) {
    if (await this.slides.get(i)?.getOpenAmount() != 0) {
      return;
    }
    const modal = await this.modalController.create({
      component: ModalViewLicensePage,
      componentProps: {
        glp: glp.clone(),
      },
    });
    modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('view Modal Dismissed: ', JSON.stringify(data));
    if (data) {
      if (data.removed) {
        this.removeLicensePlateFromGame(glp);
      }
      else if (data.saved) {
        console.log("data was saved, updating");
        glp.createdDateTime = new Date(data.date);
        glp.location = data.location;
        glp.vehicleTypes = data.vehicleTypes;
        glp.notes = data.notes;
        this.updateLicensePlateFromGame(glp);
      }
    }
  }

  async startNewGame(title: string, description: string) {
    // if (this.currentGame != undefined) {
    //   this.confirmNewGame();
    //   return;
    // }
    console.log("Starting new game");
    this.currentGame = new GameModel();

    this.currentGame.description = description;

    if (title) {
      this.currentGame.title = title;
    } else {
      let allGames = await this.gameService.getGames();
      this.currentGame.title = `Game #` + (allGames.length + 1);
    }
    this.currentGame.licensePlates = [];
    this.currentGame.startedDateTime = new Date();
    this.currentGame.gameId = this.gameService.getNewGameId();

    this.gameService.addGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.filteredLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
    this.usMapService.coordinates.forEach(x => x.c = this.usMapService.defaultStateColor);
    this.coreUtilService.dismissLoading();
  }

  async confirmNewGame() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      subHeader: 'The current game will end.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log("Confirm new game canceled");
          },
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.showStartGameModal();
          },
        },
      ],
    });

    await alert.present();
  }

  addLicensePlateToGame(lp: LicensePlateModel, coordinates: CoordinatesPositionModel | undefined) {
    console.log("Adding license plate: ", lp);

    if (!this.currentGame) {
      console.error("No current game");
      this.coreUtilService.presentToastError();
      return;
    }

    if (!lp || lp == undefined || lp == null) {
      console.error("lp not set in addLicensePlateToGame");
      this.coreUtilService.presentToastError();
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    let largestGlpId = 0;
    this.currentGame.licensePlates.forEach(glp => {
      if (glp && glp.gameLicensePlateId && glp.gameLicensePlateId > largestGlpId) {
        largestGlpId = glp.gameLicensePlateId;
      }
    });

    let newGlp = new GameLicensePlateModel();
    newGlp.createdDateTime = new Date();
    newGlp.gameLicensePlateId = largestGlpId + 1;
    newGlp.licensePlate = new LicensePlateModel();
    newGlp.licensePlate.init(lp);
    newGlp.licensePlate.createdDateTime = new Date();
    newGlp.vehicleTypes = [VehicleType.Car];
    if (coordinates != undefined) {
      newGlp.location = new CoordinatesPositionModel(coordinates);
    }

    console.log("Adding new glp with id: ", largestGlpId);
    this.currentGame.licensePlates.push(newGlp);

    this.gameService.saveGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  updateLicensePlateFromGame(glp: GameLicensePlateModel) {
    console.log("Updating license plate: ", glp);

    if (!this.currentGame) {
      console.error("No current game");
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    glp.modifiedDateTime = new Date();

    let foundGlpIndex = this.currentGame.licensePlates.findIndex(x => x.gameLicensePlateId == glp?.gameLicensePlateId);
    if (foundGlpIndex >= 0) {
      this.currentGame.licensePlates[foundGlpIndex] = new GameLicensePlateModel(glp);
    } else {
      console.error("Not found to remove");
      return;
    }
    this.gameService.saveGame(this.currentGame);

    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  removeLicensePlateFromGame(glp: GameLicensePlateModel) {
    console.log("Removing license plate: ", glp);

    if (!this.currentGame) {
      console.error("No current game");
      return;
    }

    if (!this.currentGame.licensePlates) {
      this.currentGame.licensePlates = [];
    }

    let foundGlpIndex = this.currentGame.licensePlates.findIndex(x => x.gameLicensePlateId == glp?.gameLicensePlateId);
    if (foundGlpIndex >= 0) {
      this.currentGame.licensePlates.splice(foundGlpIndex, 1);
    } else {
      console.error("Not found to remove");
      return;
    }
    this.gameService.saveGame(this.currentGame);
    this.availableLicensePlates = this.allLicensePlates.slice(0);
    this.filteredLicensePlates = this.allLicensePlates.slice(0);
    this.updateLicensePlateLists();
  }

  getLicensePlates() {
    console.time("getLicensePlates");
    let licensePlateClient = new LicensePlatesClient(this.httpClient, environment.API_BASE_URL);
    licensePlateClient.getAll().subscribe({
      next: async (res) => {
        console.timeEnd("getLicensePlates");
        console.log("Successfully retrieved license plates");
        this.setupLists(res);
      }, error: (err) => {
        console.timeEnd("getLicensePlates");
        console.error("retrieved license plates error: ", err);
        this.coreUtilService.presentToastError();
      }
    });
  }

  async setupLists(licensePlates: LicensePlateModel[]) {
    this.allLicensePlates = licensePlates.slice(0);
    this.availableLicensePlates = licensePlates.slice(0);
    this.filteredLicensePlates = licensePlates.slice(0);
    this.gameService.loadGameData().then(res => {
      this.currentGame = this.gameService.getCurrentGame();
      if (this.currentGame == null) {
        console.log("Current Game not found after getLicensePlates ", this.currentGame);
        // this.startNewGame("");
        this.coreUtilService.dismissLoading();
      } else {
        this.updateLicensePlateLists();
        this.coreUtilService.dismissLoading();
      }
    });
  }

  updateLicensePlateLists() {
    // this.showDefaultMap = true;
    console.log("Updating lists with count: ", this.currentGame?.licensePlates?.length);

    this.usMapService.coordinates.forEach(x => x.c = this.usMapService.defaultStateColor);

    this.currentGame?.licensePlates?.forEach(lp => {
      let availableLpIndex = this.availableLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (availableLpIndex >= 0) {
        this.availableLicensePlates.splice(availableLpIndex, 1);
      }
      let filteredLpIndex = this.filteredLicensePlates.findIndex(x => x.licensePlateId == lp.licensePlate?.licensePlateId);
      if (filteredLpIndex >= 0) {
        this.filteredLicensePlates.splice(filteredLpIndex, 1);
      }
      this.colorState(lp);
    });
    this.currentLicensePlates = this.currentGame?.licensePlates ?? [];
    try {
      //this.svgConvert();
    } catch (err) {
      console.log("svgConvert after update lists failed");
    }
  }

  colorState(glp: GameLicensePlateModel) {
    let usMapIndex = this.usMapService.coordinates.findIndex(x => x.id == glp?.licensePlate?.state?.abbreviation);
    if (usMapIndex >= 0) {
      if (this.hasCarType(glp) && !this.hasTruckType(glp) && !this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedStateColor;
      } else if (!this.hasCarType(glp) && this.hasTruckType(glp) && !this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedTruckColor;
      } else if (!this.hasCarType(glp) && !this.hasTruckType(glp) && this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedOtherColor;
      } else if (this.hasCarType(glp) && this.hasTruckType(glp) && !this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedTruckAndCarColor;
      } else if (this.hasCarType(glp) && !this.hasTruckType(glp) && this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedCarAndOtherColor;
      } else if (!this.hasCarType(glp) && this.hasTruckType(glp) && this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedTruckAndOtherColor;
      } else if (this.hasCarType(glp) && this.hasTruckType(glp) && this.hasOtherType(glp)) {
        this.usMapService.coordinates[usMapIndex].c = this.usMapService.selectedAllColor;
      }
    }
  }

}
