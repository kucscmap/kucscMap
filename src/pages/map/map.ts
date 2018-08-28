import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import * as L from 'leaflet';
import { TilesProvider, LocationProvider, DataProvider, DATA_SOURCE } from '../../providers'
import 'leaflet-rotatedmarker';
import { ThrowStmt } from '../../../node_modules/@angular/compiler';
import { GeoJsonObject } from '../../../node_modules/@types/geojson';

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
  readonly maxZoom: number = 20;
  readonly initialPosition = { lat: 17.2884, long: 104.1113 };

  public isTracking: boolean = false;
  public isAccuracy: boolean = false;


  public lat: number = this.initialPosition.lat;
  public long: number = this.initialPosition.long;
  public accuracy: number = 0;
  public compassMagneticHeading: number = 0;

  public positionMarker: L.Marker = null;
  public accuracyMarker: L.Circle = null;


  // public universityBuildings: any = {
  //   "type": "FeatureCollection",
  //   "name": "university_buildings",
  //   "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  //   "features": [
  //     { "type": "Feature", "properties": { "id": 1, "name": "canteen", "number": 10 }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[104.113343010585524, 17.290484677250621], [104.113369631200285, 17.290662600600999], [104.113614540856048, 17.290815106193005], [104.114013850077413, 17.290586347757607], [104.113689078577366, 17.290220333669609], [104.113343010585524, 17.290484677250621]]]] } },
  //     { "type": "Feature", "properties": { "id": 0, "name": "language", "number": 13 }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[104.113991120879191, 17.289625202339177], [104.11397914160257, 17.28964045299], [104.114322547532637, 17.290075096007392], [104.114398416284629, 17.290029344159151], [104.114458312667779, 17.290094159274133], [104.114582098526299, 17.289998842920689], [104.114626022540605, 17.2900445947765], [104.114697898200376, 17.289991217610265], [104.114665953462705, 17.289930215115628], [104.114785746229018, 17.289853961968902], [104.11471786366144, 17.289777708790581], [104.114765780767968, 17.289743394850031], [104.114422374837886, 17.289304938379953], [104.113991120879191, 17.289625202339177]], [[104.11442471498016, 17.289561783294754], [104.1145558399908, 17.289708843696474], [104.114478766548586, 17.289758885445117], [104.114498742726468, 17.289788687838112], [104.114455374740061, 17.289774073125358], [104.114372966324723, 17.289827578711552], [104.114255909105381, 17.289672966491761], [104.11442471498016, 17.289561783294754]]]] } },
  //     { "type": "Feature", "properties": { "id": 3, "name": "Main Auditoriumm", "number": 14 }, "geometry": { "type": "MultiPolygon", "coordinates": [[[[104.113161306404308, 17.289483317389724], [104.11344989974917, 17.289244778505228], [104.113075159137182, 17.288788263571316], [104.112700418525165, 17.288993901069059], [104.113161306404308, 17.289483317389724]], [[104.113201825671226, 17.289262117606292], [104.113178535857742, 17.28930235688496], [104.113075159137182, 17.289215989308602], [104.113208238298753, 17.289167986510769], [104.113242078140928, 17.289192570856606], [104.113218519972946, 17.289233273803585], [104.113291604145843, 17.289235524835384], [104.113265759965699, 17.289276652253388], [104.113201825671226, 17.289262117606292]]]] } }
  //   ]
  // }

  public universityBuildings: any;

  constructor(platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public tilesProvider: TilesProvider,
    public locationProvider: LocationProvider,
    public dataProvider : DataProvider) {

    platform.ready().then((readySource) => {
      console.log('Platform ready from ', readySource);
    });


  }

  private loadUniversityBuildingsData(){
    console.log("getting universityBuilding data");
    this.dataProvider.getJsonAsync(DATA_SOURCE.BuildingsUniversity).subscribe(data => {
      console.log("data received", data);
      this.universityBuildings = data; 
      
      let self = this;
      let geo = L.geoJSON(this.universityBuildings,{
        onEachFeature: (feature, layer) => {
            let popupContent = this.createUniversityBuildingsPopupContent(feature, self);         
            layer.bindPopup(popupContent);
        }
      });
      console.log("Geo:", geo);
      geo.addTo(this.map);
    });
  }

  private createUniversityBuildingsPopupContent(feature, self: this) {
    let title = L.DomUtil.create('label');
    title.innerText = feature.properties.number;
    let subtitle = L.DomUtil.create('p');
    subtitle.innerText = feature.properties.name;
    let popupButton = L.DomUtil.create('button');
    popupButton.innerText = "Details";
    L.DomEvent.addListener(popupButton, 'click', function (event) {
      self.goToUniversityBuildingDetailPage(feature);
    });
    let popupContent = L.DomUtil.create('div', 'popup-content-div');
    popupContent.appendChild(title);
    popupContent.appendChild(subtitle);
    popupContent.appendChild(popupButton);
    return popupContent;
  }

  goToUniversityBuildingDetailPage(universityBuilding : any) {
    //this.navCtrl.push(MerchantPage, { merchantId: merchantId });
    console.log("going to detail page of university "+ JSON.stringify(universityBuilding));

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

      this.lat = this.locationProvider.lat;
      this.long = this.locationProvider.long;
      this.accuracy = this.locationProvider.accuracy;

      if (!this.lat || !this.long || !this.accuracy) {
        return;
      }

      this.updatePositionMarkerLocation(this.lat, this.long);

      if (this.isTracking) {
        this.trackLocation();
      }

      if (this.isAccuracy) {
        this.updateAccuracyMarkerLocation(this.lat, this.long);
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
    //this.positionMarker = L.circleMarker(new L.LatLng(this.initialPosition.lat, this.initialPosition.long));
    this.positionMarker = new L.Marker(new L.LatLng(this.initialPosition.lat, this.initialPosition.long), {
      rotationAngle: 0,
      rotationOrigin: 'center center',
    });

    this.changePositionMarkerIcon(PositionMarkerIconUrl.Full);
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
    this.accuracyMarker = L.circle(new L.LatLng(this.initialPosition.lat, this.initialPosition.long), {
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


  test() {
    //load map only after the view did load
    this.map = L.map("map", { center: new L.LatLng(38.9013, -77.036), zoom: 10 });
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Patrik',
      maxZoom: 18
    }).addTo(this.map);
  }
}
