import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import leaflet, { LatLng, LatLngBounds } from 'leaflet';
import { TilesProvider, LocationProvider } from '../../providers'

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})

export class MapPage {
  @ViewChild('map') mapContainer: ElementRef;
  map: leaflet.Map;
  readonly minZoom: number = 13;
  readonly maxZoom: number = 15;
  readonly initialPosition = { lat: 17.2884, long: 104.1113 };


  public lat: number = null;
  public long: number = null;
  public accuracy: number = null;
  public compassMagneticHeading: number = null;

  public positionMarker: leaflet.CircleMarker = null;

  constructor(platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public tilesProvider: TilesProvider,
    public locationProvider: LocationProvider) {
    platform.ready().then((readySource) => {
      console.log('Platform ready from ', readySource);
    });
  }

  ionViewDidLoad() {
    //good place for initializing first time the view/page loades
    console.log('ionViewDidLoad MapPage');
    console.log('leaflet extended tile layer:', leaflet.TileLayer['MBTiles']);
    this.createMap();    //load map only after the view did load
    this.createPositionMarker();

    this.tilesProvider.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.addMapTileSource();
      }
    })

    this.subscribeToLocationData();
  }


  createMap() {
    const boundSW: LatLng = new leaflet.LatLng(17.2550, 104.067);
    const boundNE: LatLng = new leaflet.LatLng(17.3230, 104.178);
    const mapBounds: LatLngBounds = new leaflet.LatLngBounds(boundSW, boundNE);
    const initialMapPosition: LatLngBounds = new leaflet.LatLngBounds(
      new leaflet.LatLng(17.2788, 104.095), //southWest
      new leaflet.LatLng(17.3027, 104.1204)); //northEast

    this.map = leaflet.map('map', {
      attributionControl: true,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      maxBounds: mapBounds
    }).fitBounds(initialMapPosition);
  }

  addMapTileSource() {

    let offlineTileLayer = new leaflet.TileLayer['MBTiles'](
      '',
      {
        tms: true,
        maxZoom: this.maxZoom
      },
      this.tilesProvider.getDabase()
    );

    offlineTileLayer.addTo(this.map);

    // leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: 'Patrik',
    //   maxZoom: this.maxZoom
    // }).addTo(this.map);
  }


  subscribeToLocationData() {
    console.log("subscribing to location data");
    this.locationProvider.gpsReady.subscribe(() => {
      console.log(`GPS ready;
       latlong = [${this.locationProvider.lat}, ${this.locationProvider.long}];
       acc = ${this.locationProvider.accuracy}`)

      this.lat = this.locationProvider.lat;
      this.long = this.locationProvider.long;
      this.accuracy = this.locationProvider.accuracy;


      if (this.lat && this.long) {
        //maybe it would be better to update this position periodically, e.g.30 fps
        this.updatePositionMarker(this.lat, this.long);
      }
    });

    this.locationProvider.compassReady.subscribe(() => {
      // console.log(`Compass ready;
      // magnetic heading = ${this.locationProvider.compassMagneticHeading}`);

      this.compassMagneticHeading = this.locationProvider.compassMagneticHeading;
    })
  }

  private createPositionMarker() {
    this.positionMarker = leaflet.circleMarker(new leaflet.LatLng(this.initialPosition.lat, this.initialPosition.long));
    this.positionMarker.addTo(this.map);
  }

  private updatePositionMarker(lat: number, long: number) {
    //maybe here we can filter out big accidental jumps in location

    console.log("market latlong before:", JSON.stringify(this.positionMarker.getLatLng()));

    console.log("setting marker to:" + lat + ", " + long);
    this.positionMarker.setLatLng(leaflet.latLng(lat, long));
    console.log("market latlong before:", JSON.stringify(this.positionMarker.getLatLng()));

  }

  test() {
    //load map only after the view did load
    this.map = leaflet.map("map", { center: new leaflet.LatLng(38.9013, -77.036), zoom: 10 });
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Patrik',
      maxZoom: 18
    }).addTo(this.map);
  }
}
