import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Current Game', url: '/home', icon: 'play' },
    { title: 'Game List', url: '/history', icon: 'list' },
    { title: 'Profile', url: '/profile', icon: 'person' }
  ];
  constructor(public router: Router) { }
  getPath(){
    console.log(this.router.url);
    return "/";
  }
}
