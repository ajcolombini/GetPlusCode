/// <reference types="@types/google.maps" />

import { Component, ElementRef,  ViewChild } from '@angular/core';
import { MapsService } from 'src/services/maps.service';
import { environment } from 'src/environments/environment';
import { Loader } from '@googlemaps/js-api-loader';
import OpenLocationCode from 'src/services/pluscodes.service';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  private map!: google.maps.Map;

  currentCoords: any;

  // Create a marker object.
  marker: any;
  outline: any;
  address: any;

  @ViewChild('map')
  mapElement!: ElementRef;

  infoWindow: any;
  flightPath: any;


  constructor(
    private mapService: MapsService,
    private clipboard: Clipboard
  ) {

    this.mapService.getCurrentCoordinate().then((coords: any) => {
      this.currentCoords = coords;
      this.setLoader()
    });
  }



  setLoader(): void {

    //console.log(JSON.stringify(this.currentCoords));

    const loader = new Loader({
      apiKey: environment.mapsApiKey,
      version: "weekly",
      libraries: ["places"]
    });



    // Promise for a specific library
    loader
      .importLibrary('maps')
      .then(({ Map }) => {
        this.initMap();
      })
      .catch((e) => {
        console.log(e);
      });
  }



  async initMap(): Promise<void> {

    const bounds = new google.maps.LatLngBounds();
    const markersArray: google.maps.Marker[] = [];

    const options = {
      center: this.currentCoords,
      zoom: 18,
      scaleControl: true,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.HYBRID
    };


    this.map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      options
    );

    //link event click
    google.maps.event.addListener(this.map, 'click', (event: google.maps.KmlMouseEvent) => {
      this.mapClick(event);
    });

    
    this.addMarker();

  }



  searchLocation(): void {
    console.log(this.address);
  }


  // Function to add marker at current location
  addMarker() {
    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });
  }


  mapClick(event: any): void {
    const fullCode = OpenLocationCode.encode(event.latLng.lat(), event.latLng.lng());
    //const shortCode = fullCode.substr(4);
    console.log(fullCode);

    if (!this.marker) {
      this.marker = new google.maps.Marker({
        map: this.map
      });

      this.outline = new google.maps.Polyline({
        map: this.map,
        strokeWeight: 0.8,
        strokeColor: 'darkGray'
      });
    }


    const codeLocation = OpenLocationCode.decode(fullCode);

    this.marker.setPosition(new google.maps.LatLng(codeLocation.latitudeCenter, codeLocation.longitudeCenter));
    this.marker.setTitle(fullCode);


    const path = [
      { lat: codeLocation.latitudeLo, lng: codeLocation.longitudeLo },
      { lat: codeLocation.latitudeHi, lng: codeLocation.longitudeLo },
      { lat: codeLocation.latitudeHi, lng: codeLocation.longitudeHi },
      { lat: codeLocation.latitudeLo, lng: codeLocation.longitudeHi },
      { lat: codeLocation.latitudeLo, lng: codeLocation.longitudeLo }
    ];

    if (this.flightPath != undefined)
      this.flightPath.setMap(null);

    this.flightPath = new google.maps.Polyline({
      path: path,
      strokeColor: 'limegreen',
      strokeOpacity: 1.0,
      strokeWeight: 1,
      map: this.map
    });

    this.flightPath.setPath(path);

    this.addInfoWindow(this.map, fullCode);
  }


  addInfoWindow(map: any, contentString: any) {

    let content =
      '<div id="content" style="color:black!important">' +
      '<div id="siteNotice">' +
      "</div>" +
      '<h2 id="firstHeading"s>' + contentString + '</h2>' +
      '<div id="bodyContent">' +
      "<p>Esse é o Código de Localização</p>" +
      //"<p><ion-button expand='block' (click)=copyToClipboard('" + contentString + "')>Copiar</ion-button></p>"
      "</div>" +
      "</div>";

    if (this.infoWindow != undefined)
      this.infoWindow.close(); // destroy previous

    this.infoWindow = new google.maps.InfoWindow({
      ariaLabel: 'info',
      content: content
    });

    this.marker.addListener("click", () => {
      this.infoWindow.open({
        anchor: this.marker,
        map,
      });
    });
  }

  copyToClipboard(info: string) {
    alert(info);
    this.clipboard.copy(info);
  }


}
