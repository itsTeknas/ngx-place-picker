import { Location } from './location';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-place-picker',
  templateUrl: './place-picker.component.html',
  styleUrls: ['./place-picker.component.css']
})
export class PlacePickerComponent implements OnInit {

  @Input()
  enableCurrentLocation = true;

  @Input()
  enablePlacesSearch = false;

  @Input()
  defaultLocation: Location = {
    lat: 0,
    lon: 0,
    zoomLevel: 8
  };

  @Output()
  locationPicked: EventEmitter<Location> = new EventEmitter<Location>();

  location: Location;

  constructor() { }

  ngOnInit() {
    this.location = this.defaultLocation;
  }

}
