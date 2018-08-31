import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { IonicPage, NavController, NavParams, Searchbar, ToastController } from 'ionic-angular';
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

/**You can use this class to smooth continues measurements, e.g. to prevent sudden changes in the values
 * 
 */
class MeasurementSmoother {
  private _store: number[] = [];
  private _length: number;

  constructor(length : number){
    if(length < 1){
      this._length = 1;
    }else{
      this._length = length;
    }
  };

  push(val: number) {
    if(this._store.length > this._length){
      this.pop();
    }
    this._store.push(val);
  }

  private pop(): number | undefined {
    return this._store.shift();
  }

  getValues() : number[] {
    return this._store;
  }

  getLength() : number {
    return this._length
  }

  getAverage(): number {
    if(this._store.length == 0){
      return 0;
    }

    let sum = 0;

    for (let index = 0; index < this._store.length; index++) {
      sum += this._store[index];
    }

    return sum / this._store.length;
  }
}

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})

export class MapPage {
  @ViewChild('map') mapContainer: ElementRef;
  @ViewChild(Searchbar) searchBar;
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
  public speedAvg : number = 0;
  public accuracy: number = 0;
  public compassMagneticHeading: number = 0;

  public speedSmoothed: number = 0;
  public measurementSmoother = new MeasurementSmoother(3);

  public timer = null;

  public selectedPoi = {
    feature: null,
    distance: Infinity,
    time: Infinity,
  };

  public trackedPoi = {
    feature: null,
    distance: Infinity,
    time: Infinity,
    elapsedTime : 0,
  };



  public positionMarker: L.Marker = null;
  public accuracyMarker: L.Circle = null;

  public universityBuildings: any;

  currentItems: any = [];

  constructor(platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public tilesProvider: TilesProvider,
    public locationProvider: LocationProvider,
    public dataProvider: DataProvider,
    public renderer: Renderer2,
    private toastCtrl: ToastController
  ) {

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

  subscribeToLocationData() {
    console.log("subscribing to location data");
    this.locationProvider.gpsReady.subscribe(() => {

      this.lat = this.locationProvider.lat ? this.locationProvider.lat : this.lat;
      this.long = this.locationProvider.long ? this.locationProvider.long : this.long;
      this.accuracy = this.locationProvider.accuracy;
      this.speed = this.locationProvider.speed;
      this.speedAvg = this.toSinglePrecision( (this.speedAvg + this.speed) / 2 );
      this.measurementSmoother.push(this.speed);
      this.speedSmoothed = this.toSinglePrecision(this.measurementSmoother.getAverage());


      if (!this.lat || !this.long || !this.accuracy) {
        return;
      }

      this.updatePositionMarkerLocation(this.lat, this.long);
      this.updateAccuracyMarkerLocation(this.lat, this.long);

      if (this.selectedPoi.feature) {
        this.updatePoiInfo(this.selectedPoi);
      }

      if (this.trackedPoi.feature) {
        this.updatePoiInfo(this.trackedPoi);
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


  private loadUniversityBuildingsData() {
    console.log("getting universityBuilding data");
    this.dataProvider.getDataState(DATA_SOURCE.BuildingsUniversity).subscribe(rdy => {
      if (!rdy) {
        console.log("Uni buildings data not yet ready");
        return;
      }

      console.log("Uni buildings data ready!!!");
      this.universityBuildings = this.dataProvider.universityBuildings;

      let self = this;
      let geo = L.geoJSON(this.universityBuildings, {
        onEachFeature: (feature, layer) => {
          let popup = new L.Popup();
          layer.bindPopup(popup);
          layer.on("click", () => {
            this.selectPoi(feature);
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

  private selectPoi(feature) {
    console.log("poi selected:", feature);
    this.selectedPoi.feature = feature;
    if (feature) {
      this.updatePoiInfo(this.selectedPoi);
    }

  }

  private selectTrackingPoi(feature) {
    console.log("poi for tracking selected:", feature);
    this.trackedPoi.feature = feature;
    if (feature) {
      this.updatePoiInfo(this.trackedPoi);
    }
  }

  private updatePoiInfo(poi: any) {
    this.updatePoiDistance(poi);
    this.updatePoiTime(poi);
  }

  private createUniversityBuildingsPopupContent() {
    let poiProps = this.selectedPoi.feature.properties;

    let title = L.DomUtil.create('label');
    title.innerText = poiProps.number ? poiProps.number + " | " + poiProps.name : poiProps.name;

    let subtitle = L.DomUtil.create('p');
    subtitle.innerText = this.selectedPoi.distance.toString() + " meters";

    let popupButtonDetail = L.DomUtil.create('button');
    popupButtonDetail.innerText = "Details";
    L.DomEvent.addListener(popupButtonDetail, 'click', () => {
      this.goToUniversityBuildingDetailPage();
    });

    let popupButtonTrack = L.DomUtil.create('button');
    popupButtonTrack.innerText = "Track";
    L.DomEvent.addListener(popupButtonTrack, 'click', () => {
      this.trackPoi(this.selectedPoi.feature);
    });

    let popupContent = L.DomUtil.create('div', 'popup-content-div');
    popupContent.appendChild(title);
    popupContent.appendChild(subtitle);
    popupContent.appendChild(popupButtonDetail);
    popupContent.appendChild(popupButtonTrack);

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


  private toSinglePrecision(number: number) : number{
    return (Math.trunc(number*10) / 10)
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

  switchTracking(value?:boolean) {
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

  private updatePoiDistance(poi : any): void {
    //should calculate air distance from user latlong to the provided latlong
    let target = L.latLng({
      lat: poi.feature.properties.ctr_lat,
      lng: poi.feature.properties.ctr_long
    })
    let source = L.latLng({
      lat: this.lat,
      lng: this.long
    })
    poi.distance = this.getDistance(source, target);
  }

  getDistance(source: L.LatLngExpression, target: L.LatLngExpression): number {
    return Math.trunc(this.map.distance(source, target));
  }

  private updatePoiTime(poi : any): void {
    if (!this.speedAvg || this.speedAvg == 0) {
      poi.time = Infinity;
    }

    let time = poi.distance / this.speedAvg;
    time = Math.trunc(1.25 * time); //because its direct distance, so 25% to compensate for roads
    poi.time = time;
  }


  /**
  * Perform a service for the proper items.
  */
  getItems(ev) {
    let val = ev.target.value;
    console.log("getItems called with value:", val)
    if (!val || !val.trim()) {
      this.currentItems = [];
      return;
    }
    this.currentItems = this.dataProvider.query({
      name: val,
      number: val
    }).map((item) => {
      //This distance is only for displaying in the searchh results
      item.properties['distance'] = this.getDistance(
        [item.properties.ctr_lat, item.properties.ctr_long],
        [this.lat, this.long]);
      return item;
    });
    console.log("currentItems", this.currentItems);
  }

  closeSearchResults() {
    console.log("closeSearchResults()");
    this.currentItems = [];
  }

  /**
   * Navigate to the detail page for this item.
   */
  openItem(item: any) {
    console.log("openItem()");
    this.selectPoi(item);
    this.goToUniversityBuildingDetailPage();
  }

  showPoiOnMap(item: any) {
    console.log("showPoiOnMap()")
    this.isTracking = false;
    this.selectPoi(item);
    this.map.flyTo([item.properties.ctr_lat, item.properties.ctr_long], 17);
  }

  trackPoi(item: any) {
    console.log("trackPoi()")

    //change this to id
    if(this.trackedPoi.feature && this.trackedPoi.feature.properties.id == item.properties.id){
      console.log("Poi is already being tracked");
      return;
    }

    if(this.trackedPoi.feature){
      this.changedTrackPoiNotification();
    }

    this.speedAvg = 0; //resseting average speed;
    this.selectTrackingPoi(item);
    this.startTimer();

    //deactivate search while tracking
    this.disableSearchBar(true);

    //add pin or marker to tracked buildinglocation
    //if distance too close, display message: You are already at the building
    //if arrived to destination, display message arrived (maybe also notification), with ok button
  }

  private changedTrackPoiNotification(){
    let toast = this.toastCtrl.create({
      message: 'Changed tracking target.',
      duration: 2000,
      position: 'top'
    });

    toast.present();
  }

  private startTimer(){
    this.trackedPoi.elapsedTime = 0;
    if(this.timer){
      this.stopTimer();
    }
    this.timer = setInterval(() => {
      this.trackedPoi.elapsedTime++;
    },1000)

  }

  private stopTimer(){
    clearInterval(this.timer);
    this.timer = null;
  }

  cancelPoiTracking() {
    console.log("tracking canceled");
    this.disableSearchBar(false);
    this.trackedPoi.feature = null;
    this.stopTimer();
  }

  private disableSearchBar(disabled: boolean) {
    let input = this.searchBar.getElementRef().nativeElement.querySelector('input');
    this.renderer.setStyle(input, 'background-color', disabled ? 'rgb(235, 235, 228)' : '#fff');

    if (disabled) {
      this.renderer.setAttribute(input, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(input, 'disabled')
    }
    //clearing value is maybe not required
    //input.value = '';
  }

  formatTime(time : number) : string{
    if(time == Infinity){
      return 'Infinity';
    }

    let seconds = time % 60;
    let minutes = Math.trunc(time / 60);
    let hours = Math.trunc(minutes / 60);

    let formatedTime = '';
    if(hours > 0){ formatedTime = hours + 'h '; }
    if(minutes > 0 || (hours > 0 && seconds > 0)){ formatedTime += minutes + 'm '; }
    if(seconds > 0){ formatedTime += seconds + 's';}
    
    return formatedTime;
  }

  formatDistance(distance : number) : string{
    if(distance == Infinity){
      return 'Infinity';
    }
    if (distance >= 1000){
      return distance / 1000 + " km"
    }

    return distance + " m"

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
