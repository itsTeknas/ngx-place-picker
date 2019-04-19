import { Location } from './../../projects/place-picker/src/lib/location';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public location: Location;

  logLocationChange(location: Location) {
    this.location = location;
    console.log(location);
  }
}
