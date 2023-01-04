import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/', icon: 'home' },
    { title: 'Finished Games', url: '/history', icon: 'reader' },
    { title: 'Profile', url: '/profile', icon: 'person' }
  ];
  constructor() { }
}
