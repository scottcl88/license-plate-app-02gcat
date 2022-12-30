import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public states: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  public filteredStates: string[] = [];

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.filteredStates = this.states;
  }

  searchOnChange(e: any) {
    let text = e.detail.value;
    console.log("searchOnChange: ", text);
    if (text) {
      this.filteredStates = this.states.filter(x => x.indexOf(text) >= 0);
    } else {
      this.filteredStates = this.states;
    }
  }

  selectedState(state: string) {

  }
}
