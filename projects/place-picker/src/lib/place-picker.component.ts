import { Location } from './location';
import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

declare var google: any;

@Component({
  selector: 'ngx-place-picker',
  templateUrl: './place-picker.component.html',
  styleUrls: ['./place-picker.component.css']
})
export class PlacePickerComponent implements OnInit, AfterViewInit {

  @Input()
  enableCurrentLocation = true;

  @Input()
  enablePlacesSearch = false;

  @Input()
  limitSearchResults = 3;

  @Input()
  defaultLocation: Location = {
    lat: 0,
    lng: 0,
    zoomLevel: 8
  };

  @Output()
  locationPicked: EventEmitter<Location> = new EventEmitter<Location>();

  location: Location;

  @ViewChild('map')
  private map: ElementRef;

  private googleMap: any;

  constructor() { }

  ngOnInit() {
    this.location = this.defaultLocation;
  }

  ngAfterViewInit() {
    if (google) {
      this.googleMap = new google.maps.Map(this.map.nativeElement, {
        center: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng },
        zoom: 8
      });
    } else {
      console.error("Google Maps Client not loaded properly, include the script tag in your index.html")
    }
  }
}
