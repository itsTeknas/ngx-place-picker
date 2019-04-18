import { PlacePickerModule } from './../../projects/place-picker/src/lib/place-picker.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PlacePickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
