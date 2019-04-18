import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, debounce, debounceTime, map, filter } from 'rxjs/operators';
import { Location } from './location';

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
  private placesSearchService: any;
  private search$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  search = '';

  public searchResults = [];

  constructor() { }

  ngOnInit() {
    this.location = this.defaultLocation;
    this.search$.pipe(
      filter((query) => !!query),
      debounceTime(200),
      tap((search) => {
        console.log('Searching: ', search);
      }),
      map((searchQuery) => {
        const placesRequest = {
          query: searchQuery,
          fields: ['name', 'geometry'],
        };
        this.placesSearchService.findPlaceFromQuery(placesRequest, (results, status) => {
          this.searchResults = results;
          console.log(results);
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.googleMap.setCenter(results[0].geometry.location);
          }
        });
      })

    ).subscribe((ok) => {

    });
  }

  ngAfterViewInit() {
    if (window.hasOwnProperty('google')) {
      this.googleMap = new google.maps.Map(this.map.nativeElement, {
        center: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng },
        zoom: 8
      });

      if (google.maps.hasOwnProperty('places')) {
        this.placesSearchService = new google.maps.places.PlacesService(this.googleMap);
      } else {
        console.error('Places API not enabled or present in the script import');
      }

    } else {
      console.error('Google Maps Client not loaded properly');
      console.error('Include the script tag for google maps with the API Key in your index.html');
    }
  }

  clearSearch() {
    this.searchResults = [];
  }

  searchChange($event) {
    this.search$.next(this.search);
  }
}
