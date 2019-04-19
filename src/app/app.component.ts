import { Location } from './../../projects/place-picker/src/lib/location';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public location: Location;

  public defaultLocation: Location = {
    lat: 0,
    lng: 0,
    zoom: 3
  }

  public poorlyFormattedLocation = {
    
    lng: -1,
    zoom: 3
  }

  logLocationChange(location: Location) {
    this.location = location;
    console.log(location);
  }
}
