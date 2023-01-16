/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
})
export class HeaderPage implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() menuButton: boolean = true;
  @Input() titleStyle: string;
  @Input() titleMarginLeft: string;
  constructor() {
  }

  async ngOnInit() {
    console.log('header ngOnInit...');
    if(!this.titleStyle){
      this.titleStyle = "font-weight: 400;";
    }
    if(this.titleMarginLeft){
      this.titleStyle += "margin-left: " + this.titleMarginLeft;
    }
  }
  async ngOnDestroy() {
  }
}
