import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import leaflet, { LatLng, LatLngBounds } from 'leaflet';
import { TilesProvider } from '../../providers'

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
  map: any;
  readonly minZoom : number = 13;
  readonly maxZoom : number = 15;


  constructor(platform: Platform, public navCtrl: NavController, public navParams: NavParams, tilesProvider: TilesProvider) {
    platform.ready().then((readySource) => {
      console.log('Platform ready from ', readySource);
    });
  }

  ionViewDidLoad() {
    //good place for initializing first time the view/page loades
    console.log('ionViewDidLoad MapPage');
    console.log('leaflet extended tile layer:', leaflet.TileLayer['MBTiles']);
    this.createMap();    //load map only after the view did load
    this.addMapTileSource();
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

  addMapTileSource(){
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Patrik',
      maxZoom: this.maxZoom
    }).addTo(this.map);
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
