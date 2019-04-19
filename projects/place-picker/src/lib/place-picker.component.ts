import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { tap, debounceTime, map, filter } from 'rxjs/operators';
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
    lat: 19.2185598,
    lng: 72.8598972,
    zoomLevel: 14
  };

  @Output()
  searchSelected: EventEmitter<Location> = new EventEmitter<Location>();

  @Output()
  locationPicked: EventEmitter<Location> = new EventEmitter<Location>();

  location: Location;

  @ViewChild('map')
  private map: ElementRef;

  private googleMap: any;
  private placesSearchService: any;
  private search$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  search = '';

  public searchResults: Location[];

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.location = this.defaultLocation;
  }

  ngAfterViewInit() {
    if (window.hasOwnProperty('google')) {
      this.googleMap = new google.maps.Map(this.map.nativeElement, {
        center: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng },
        disableDefaultUI: true,
        zoomControl: true,
        zoom: this.defaultLocation.zoomLevel
      });

      if (google.maps.hasOwnProperty('places')) {
        this.placesSearchService = new google.maps.places.PlacesService(this.googleMap);
        this.search$.pipe(
          filter((query) => !!query),
          debounceTime(200),
          tap((search) => {
            console.log('Searching: ', search);
          }),
          map((searchQuery) => {
            const placesRequest = {
              query: searchQuery,
              fields: ['name', 'geometry', 'icon'],
            };
            return placesRequest;
          }),
        ).subscribe((placesRequest) => {
          this.placesSearchService.findPlaceFromQuery(placesRequest, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              console.log(results);
              this.googleMap.setCenter(results[0].geometry.location);
              this.searchResults = (results as unknown as any[])
                .map(p => ({
                  lat: p.geometry.location.lat(),
                  lng: p.geometry.location.lng(),
                  name: p.name,
                  icon: p.icon
                })) as unknown as Location[];
              this.changeDetector.detectChanges();
            }
          });
        });
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
    this.changeDetector.detectChanges();
  }

  searchChange($event) {
    this.search$.next(this.search);
  }

  selectSearchResult(result: Location) {
    this.searchSelected.next(result);
    this.clearSearch();
  }
}
