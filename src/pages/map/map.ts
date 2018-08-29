import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import * as L from 'leaflet';
import { TilesProvider, LocationProvider, DataProvider, DATA_SOURCE } from '../../providers'
import 'leaflet-rotatedmarker';

/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

enum PositionMarkerIconUrl {
  Full = 'assets/icon/nav_full.svg',
  Empty = 'assets/icon/nav_empty.svg'
}

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})

export class MapPage {
  @ViewChild('map') mapContainer: ElementRef;
  map: L.Map;
  readonly minZoom: number = 13;
  readonly maxZoom: number = 19;
  readonly initialPosition = { lat: 17.2884, long: 104.1113 };
  readonly zIndex = {
    low: -10000000,
    high: 10000000
  }

  public isTracking: boolean = false;
  public isAccuracy: boolean = false;


  public lat: number = this.initialPosition.lat;
  public long: number = this.initialPosition.long;
  public speed: number = 0;
  public accuracy: number = 0;
  public compassMagneticHeading: number = 0;

  public selectedPoi = {
    feature: null,
    distance : Infinity,
    duration : Infinity
  };
  

  public positionMarker: L.Marker = null;
  public accuracyMarker: L.Circle = null;

  public universityBuildings: any;

  constructor(platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public tilesProvider: TilesProvider,
    public locationProvider: LocationProvider,
    public dataProvider: DataProvider) {

    platform.ready().then((readySource) => {
      console.log('Platform ready from ', readySource);
    });


  }

  ionViewDidLoad() {
    //good place for initializing first time the view/page loades
    console.log('ionViewDidLoad MapPage');
    console.log('leaflet extended tile layer:', L.TileLayer['MBTiles']);
    this.createMap();    //load map only after the view did 
    this.createPositionMarker();
    this.createAccuracyMarker();

    this.subscribeToMapTileSource();

    this.subscribeToLocationData();
  }

  private loadUniversityBuildingsData() {
    console.log("getting universityBuilding data");
    this.dataProvider.getJsonAsync(DATA_SOURCE.BuildingsUniversity).subscribe(data => {
      console.log("data received", data);
      this.universityBuildings = data;

      let self = this;
      let geo = L.geoJSON(this.universityBuildings, {
        onEachFeature: (feature, layer) => {        
          let popup = new L.Popup();       
          layer.bindPopup(popup);
          layer.on("click",() => {
            this.selectPoi(feature);
            this.updateSelectedPoiInfo();
            popup.setContent(this.createUniversityBuildingsPopupContent());
          })
        },
        style: (geoJsonFeature) => {
          return { opacity: 0 };  //a transparent layer just for registering click events, layer already baked to map in form of a shappefile
        }
      });
      geo.setZIndex(this.zIndex.high); // on top of everything, so it can register clicks
      geo.addTo(this.map);

      console.log("Geo:", geo);
    });
  }

  private selectPoi(feature){
    console.log("poi selected:",feature);
    this.selectedPoi.feature = feature;
  }

  private updateSelectedPoiInfo() { 
    this.updatePoiDistance();
    this.updatePoiDuration();
  }

  private createUniversityBuildingsPopupContent() {
    let poiProps = this.selectedPoi.feature.properties;

    let title = L.DomUtil.create('label');
    title.innerText = poiProps.number ? poiProps.number + " | " + poiProps.name : poiProps.name;

    let subtitle = L.DomUtil.create('p');
    subtitle.innerText =  this.selectedPoi.distance.toString() + " meters";

    let popupButton = L.DomUtil.create('button');
    popupButton.innerText = "Details";
    L.DomEvent.addListener(popupButton, 'click', () => {
      this.goToUniversityBuildingDetailPage();
    });

    let popupContent = L.DomUtil.create('div', 'popup-content-div');
    popupContent.appendChild(title);
    popupContent.appendChild(subtitle);
    popupContent.appendChild(popupButton);

    return popupContent;
  }

  goToUniversityBuildingDetailPage() {
    console.log("going to detail page of university " + JSON.stringify(this.selectedPoi.feature));
    this.navCtrl.push('UniversityBuildingDetailPage', {
      universityBuilding: this.selectedPoi.feature,
      distance: this.selectedPoi.distance
    });
  }


  private subscribeToMapTileSource() {
    this.tilesProvider.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.addMapTileSource();
      }
    });
  }

  createMap() {
    const boundSW: L.LatLng = new L.LatLng(17.2550, 104.067);
    const boundNE: L.LatLng = new L.LatLng(17.3230, 104.178);
    const mapBounds: L.LatLngBounds = new L.LatLngBounds(boundSW, boundNE);
    const initialMapPosition: L.LatLngBounds = new L.LatLngBounds(
      new L.LatLng(17.2788, 104.095), //southWest
      new L.LatLng(17.3027, 104.1204)); //northEast

    this.map = L.map('map', {
      attributionControl: true,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      maxBounds: mapBounds
    }).fitBounds(initialMapPosition);

    L.control.scale().addTo(this.map);


    this.loadUniversityBuildingsData();
  }


  addMapTileSource() {

    let offlineTileLayer = new L.TileLayer['MBTiles'](
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

      this.lat = this.locationProvider.lat ? this.locationProvider.lat : this.lat;
      this.long = this.locationProvider.long ? this.locationProvider.long : this.long;
      this.accuracy = this.locationProvider.accuracy;
      this.speed = this.locationProvider.speed;

      if (!this.lat || !this.long || !this.accuracy) {
        return;
      }

      this.updatePositionMarkerLocation(this.lat, this.long);
      this.updateAccuracyMarkerLocation(this.lat, this.long);

      if(this.selectedPoi.feature){
        this.updatePoiDistance();
        this.updatePoiDuration();
      }

      if (this.isTracking) {
        this.trackLocation();
      }

      if (this.isAccuracy) {
        this.updateAccuracyMarkerRadius(this.accuracy);
      }

    });

    this.locationProvider.compassReady.subscribe(() => {
      // console.log(`Compass ready;
      // magnetic heading = ${this.locationProvider.compassMagneticHeading}`);

      this.compassMagneticHeading = this.locationProvider.compassMagneticHeading;

      if (!this.compassMagneticHeading) {
        return;
      }

      this.updatePositionMarkerHeading(this.compassMagneticHeading);
    })
  }

  private createPositionMarker() {
    this.positionMarker = new L.Marker(new L.LatLng(this.lat, this.long), {
      rotationAngle: 0,
      rotationOrigin: 'center center',
    })

    this.changePositionMarkerIcon(PositionMarkerIconUrl.Full);
    this.positionMarker.setZIndexOffset(this.zIndex.low);
    this.positionMarker.addTo(this.map);
  }

  private updatePositionMarkerLocation(lat: number, long: number) {
    //maybe here we can filter out big accidental jumps in location
    this.positionMarker.setLatLng(L.latLng(lat, long));
  }

  private changePositionMarkerIcon(iconUrl: PositionMarkerIconUrl) {
    this.positionMarker.setIcon(L.icon({
      iconUrl: iconUrl,
      iconSize: [20, 20],
    }));
  }

  private updatePositionMarkerHeading(heading: number) {
    //maybe here we can filter out0  compass accuracy problems

    if (heading >= 0 && heading <= 360) {
      this.positionMarker.setRotationAngle(Math.round(heading));
    }
  }

  switchTracking() {
    this.isTracking = !this.isTracking;
    console.log("isTracking:", this.isTracking);
  }

  private trackLocation() {
    this.map.panTo(L.latLng(this.lat, this.long));
  }


  private createAccuracyMarker() {
    this.accuracyMarker = L.circle(new L.LatLng(this.lat, this.long), {
      stroke: true,
      weight: 2,
      color: '#c20404',
      fillColor: '#f03',
      fillOpacity: 0.2
    })
  }

  switchAccuracy() {
    this.isAccuracy = !this.isAccuracy;
    console.log("isAccuracy:", this.isTracking);
    if (this.isAccuracy) {
      this.accuracyMarker.addTo(this.map);
      this.accuracyMarker.bringToBack();
      this.changePositionMarkerIcon(PositionMarkerIconUrl.Empty);
    } else {
      this.accuracyMarker.removeFrom(this.map);
      this.changePositionMarkerIcon(PositionMarkerIconUrl.Full);
    }
  }

  private updateAccuracyMarkerRadius(accuracy: number) {
    // accuracy radius is half of the accuracy from sensor
    this.accuracyMarker.setRadius(Math.round(accuracy / 2));
  }

  private updateAccuracyMarkerLocation(lat: number, long: number) {
    //maybe here we can filter out big accidental jumps in location
    this.accuracyMarker.setLatLng(L.latLng(lat, long));
  }

  private updatePoiDistance() : void {
    //should calculate air distance from user latlong to the provided latlong
    let target = L.latLng({
      lat: this.selectedPoi.feature.properties.centroid_lat,
      lng :this.selectedPoi.feature.properties.centroid_long
    })
    let source = L.latLng({
      lat: this.lat,
      lng :this.long
    })
    this.selectedPoi.distance = Math.trunc(this.map.distance(source, target));
  }

  private updatePoiDuration() : void {
    if (!this.speed || this.speed == 0) {
      this.selectedPoi.duration = Infinity;
    }

    let time = this.selectedPoi.distance / this.speed;
    time = Math.trunc(0.25 * time); //because its direct distance, so 25% to compensate for roads
    this.selectedPoi.duration = time;
  }


  test() {
    //load map only after the view did load
    this.map = L.map("map", { center: new L.LatLng(38.9013, -77.036), zoom: 10 });
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Patrik',
      maxZoom: 18
    }).addTo(this.map);
  }
}
