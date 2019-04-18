import { NgModule } from '@angular/core';
import { PlacePickerComponent } from './place-picker.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PlacePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    PlacePickerComponent
  ]
})
export class PlacePickerModule { }
