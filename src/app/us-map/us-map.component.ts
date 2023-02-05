import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { UsMapService } from './us-map.service';

@Component({
	selector: 'us-map',
	templateUrl: './us-map.component.html',
	styleUrls: ['./us-map.component.css']
})
export class UsMapComponent implements OnInit {
	@Input() coordinates: any[];
	@Input() fillColor: string = "#FFFFFF";
	@Input() fillStateColor: string = "#bcbcbc";
	@Input() strokeColor: string = "#000000";
	@Output('onMapClick') click = new EventEmitter();
	@ViewChild("svgContainer", { static: false }) svgContainer: ElementRef;

	constructor(public usMapService: UsMapService) { }

	ngOnInit() {
		this.usMapService.getUsMapCoordinates().then(data => this.coordinates = data);
	}

	onUsMapClick(state: any) {
		// console.log("onUsMapClick: ", state);
		// this.click.emit({"state-abbr":state});
		// let selectedState = this.coordinates.find(x => x.id == state);
		// let index = this.coordinates.indexOf(selectedState);
		// this.coordinates[index].c = this.usMapService.selectedStateColor;
	}
}
