import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, of, Observable, Subscription } from 'rxjs';
import { tap, debounceTime, map, filter } from 'rxjs/operators';
import { Location } from './location';
import { Z_RLE } from 'zlib';

declare var google: any;

@Component({
  selector: 'ngx-place-picker',
  templateUrl: './place-picker.component.html',
  styleUrls: ['./place-picker.component.css']
})
export class PlacePickerComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('map')
  private map: ElementRef;

  @Input()
  enableCurrentLocation = false;
  @Input()
  enablePlacesSearch = false;
  @Input()
  defaultLocation: Location;

  @Output()
  locationChanged: EventEmitter<Location> = new EventEmitter<Location>();

  location: Location;

  private googleMap: any;
  private placesSearchService: any;
  private search$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private searchSubscription: Subscription;
  search = '';

  public searchResults: Location[];

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {

    if (!this.defaultLocation) {
      this.location = this.defaultLocation = this.initDefaultLocation();
    }

    if (this.enableCurrentLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          if (this.googleMap) {
            this.googleMap.setCenter(pos);
          }
        }, () => {
          // error fetching location
        });
      } else {
        // Browser doesn't support Geolocation
      }
    }
  }

  ngAfterViewInit() {
    if (window.hasOwnProperty('google')) {
      this.googleMap = new google.maps.Map(this.map.nativeElement, {
        center: { lat: this.defaultLocation.lat, lng: this.defaultLocation.lng },
        disableDefaultUI: true,
        zoomControl: true,
        zoom: this.defaultLocation.zoom || 14
      });

      this.googleMap.addListener('center_changed', (changeEvent) => {
        const center = this.googleMap.getCenter();
        this.location.lat = center.lat();
        this.location.lng = center.lng();
        this.location.zoom = this.googleMap.getZoom();
        this.locationChanged.next(this.location);
      });

      if (google.maps.hasOwnProperty('places')) {
        this.placesSearchService = new google.maps.places.PlacesService(this.googleMap);
        this.searchSubscription = this.search$.pipe(
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
    this.location = result;
    this.clearSearch();
  }

  ngOnDestroy() {
    if (this.googleMap) {
      google.maps.event.clearListeners(this.googleMap, 'center_changed');
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    delete this.googleMap;
    delete this.placesSearchService;
  }

  private initDefaultLocation(): Location {
    return {
        lat: 19.2185598,
        lng: 72.8598972,
        zoom: 14
    }
  }
}
