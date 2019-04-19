import { Location } from './../../projects/place-picker/src/lib/location';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  logLocationChange(location: Location) {
    console.log(location);
  }
}
