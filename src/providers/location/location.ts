import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation'


import 'rxjs/add/operator/filter';
import { BehaviorSubject } from '../../../node_modules/rxjs';

/*
  Generated class for the LocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationProvider {

  readonly geolocatioOptions : GeolocationOptions = {enableHighAccuracy : true}

  public gpsReady: BehaviorSubject<boolean>;
  public compassReady: BehaviorSubject<boolean>;

  public time : any = null;
  public lat : number = null;
  public long : number = null;
  public accuracy : number = null;
  public heading : number = null;
  public speed : number = null;
  public compassMagneticHeading : number = null;
  public compassTime : number = null;

  constructor(public http: HttpClient, private geolocation: Geolocation, private deviceOrientation: DeviceOrientation) {
    console.log('Hello from LocationProvider');

    this.gpsReady = new BehaviorSubject(false);
    this.compassReady = new BehaviorSubject(false);
  }

  watchGeo : any = this.geolocation.watchPosition(this.geolocatioOptions)
  .filter((p) => p.coords !== undefined) //Filter Out Errors
  .subscribe(position => {
    this.time = position.timestamp;
    this.lat = position.coords.latitude;
    this.long = position.coords.longitude;
    this.accuracy = position.coords.accuracy;
    this.heading = position.coords.heading;
    this.speed = position.coords.speed;
  
    this.gpsReady.next(true);
   // console.log(position.coords.longitude + ' ' + position.coords.latitude);
  });
  
  
  watchCompass : any =  this.deviceOrientation.watchHeading()
  .subscribe(
    (data: DeviceOrientationCompassHeading) => {
      this.compassMagneticHeading = data.magneticHeading;
      this.compassTime = data.timestamp;

      this.compassReady.next(true);
     // console.log(data);
    }
  );

  calculateDistance(lat: number, long : number) : number{
      //should calculate air distance from user latlong to the provided latlong

    return 0;
  }

}
