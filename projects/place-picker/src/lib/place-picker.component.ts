import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { Location } from './location';

declare var google: any;

@Component({
  selector: 'ngx-place-picker',
  templateUrl: './place-picker.component.html',
  styleUrls: ['./place-picker.component.css']
})
export class PlacePickerComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @ViewChild('map', { static: true })
  private map: ElementRef;

  @ViewChild('Search')
  public searchElementRef: ElementRef;

  @Input()
  enableCurrentLocation = false;
  @Input()
  enablePlacesSearch = false;
  @Input()
  defaultLocation: Location;
  @Input()
  vSize = 400;
  @Input()
  enableCircleRadius = false;

  @Output()
  locationChanged: EventEmitter<Location> = new EventEmitter<Location>();

  location: Location;

  private googleMap: any;
  private circle = new google.maps.Circle();
  private placesSearchService: any;
  private search$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private searchSubscription: Subscription;
  search = '';

  public searchResults: Location[];

  constructor(
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone
  ) { 
  }

  ngOnInit() {
    // check formatting of defaultLocation
    if (this.defaultLocation) {
      if (!(typeof this.defaultLocation.lat === 'number' && typeof this.defaultLocation.lng === 'number')) {
        //ignoring improperly formatted location
        this.defaultLocation = null;
      }
    }

    if (this.defaultLocation) {
      // Default location superseeds everything
      this.location = this.defaultLocation;
    } else if (this.enableCurrentLocation) {
      // for ngAfterViewInit to immediately use
      this.defaultLocation = this.location = this.initDefaultLocation()
      // initiate location query
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
    } else {
      // library default location
      this.defaultLocation = this.location = this.initDefaultLocation();
    }    
  }

  setRadius(map, location: Location, radius) {
    this.circle.setMap(null);
    this.circle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map,
      center: { lat: location.lat, lng: location.lng },
      radius,
    });
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
        if (this.enableCircleRadius) {
          this.setRadius(this.googleMap, {lat: center.lat(), lng: center.lng()}, 1000)
        }
        this.locationChanged.next(this.location);
      });

      if (this.enableCurrentLocation) {
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
      }

    } else {
      console.error('Google Maps Client not loaded properly');
      console.error('Include the script tag for google maps with the API Key in your index.html');
    }
    this.initAutocomplete();
  }

  initAutocomplete() {
    const input = document.getElementById("placeSearch") as HTMLInputElement;
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields([
      "address_components",
      "geometry",
      "icon",
      "name"
    ]);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        alert('No details available for input:' + input.value);
        return;
      } else {
        this.locationFromPlace(place)
        return;
      }
    });
  }

  public locationFromPlace(place) {
    const components = place.address_components;
    if (components === undefined) {
      return null;
    }

    const areaLevel3 = getShortName(components, 'administrative_area_level_3');
    const locality = getLongName(components, 'locality');

    const cityName = locality || areaLevel3;
    const countryName = getLongName(components, 'country');
    const countryCode = getShortName(components, 'country');
    const stateCode = getShortName(components, 'administrative_area_level_1');
    const name = place.name !== cityName ? place.name : null;

    const coordinates = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    this.selectSearchResult(coordinates)

    const bounds = place.geometry.viewport.toJSON();

    // placeId is in place.place_id, if needed
    return {
      name,
      cityName,
      countryName,
      countryCode,
      stateCode,
      bounds,
      coordinates,
    };
  }

  clearSearch() {
    this.searchResults = [];
    this.changeDetector.detectChanges();
  }

  searchChange($event) {
    this.search$.next(this.search);
  }

  selectSearchResult(result: Location) {
    this.location = {
      lat: result.lat,
      lng: result.lng,
      zoom: 14,
    };
    this.googleMap.setCenter({ lat: result.lat, lng: result.lng });
    if (this.enableCircleRadius) {
      this.setRadius(this.googleMap, { lat: result.lat, lng: result.lng }, 1000)
    }
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
      lat: 0,
      lng: 0,
      zoom: 14
    }
  }
}

function getComponent(components, name: string) {
  return components.filter((component) => component.types[0] === name)[0];
}

function getLongName(components, name: string) {
  const component = getComponent(components, name);
  return component && component.long_name;
}

function getShortName(components, name: string) {
  const component = getComponent(components, name);
  return component && component.short_name;
}