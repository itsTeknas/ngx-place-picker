# ngx-place-picker

Angular components to help pick location using google maps and places API
<br>
[Live Preview](https://itsteknas.github.io/ngx-place-picker/).

## Installation

`npm install --save ngx-place-picker`

## Usage

``` html
<ngx-place-picker 
    (locationChanged)="this.logLocationChange($event)" 
    [enablePlacesSearch]="true"
    [enableCurrentLocation]="true">
</ngx-place-picker>
```

## Inputs

**`[enableCurrentLocation]`** *`(boolean)`*: Defaults the map to current location

**`[enablePlacesSearch]`** *`(boolean)`*: Enable a search bar to search via Google places API

**`[defaultLocation]`** *`(Location)`*: Pass a default location to center the map

```
{
    lat: 0,
    lng: 0,
    zoom: 14
}
```

**`[vSize]`** *`(number)`*: vertical size of the map, Horizontal size is taken from the parent

## Outputs

**`(locationChanged)`** *`(Location)`*: Selected location

## Library initialization

Add the script tag for Google maps in your html file
```
<script async defer src="https://maps.googleapis.com/maps/api/js?key=<API_KEY>&libraries=places">
  </script>
```
Replace the **API_KEY** with api key obtained from google cloud console

You can skip the `&libraries=places` if you don't intend to use the search.

If your app immediately shows the map widget, you'll have to remove `async defer` from the script tag