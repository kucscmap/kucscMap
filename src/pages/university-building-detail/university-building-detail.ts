import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { PhotoViewer } from '@ionic-native/photo-viewer';

import { UniversityBuilding } from '../../models/universityBuilding';

/**
 * Generated class for the UniversityBuldingDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-university-building-detail',
  templateUrl: 'university-building-detail.html',
})
export class UniversityBuildingDetailPage {
  item: UniversityBuilding;
  distance : number;
  floorArray = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,public photoViewer: PhotoViewer) {
    let buildingGeojson = navParams.get('universityBuilding');
    this.distance = navParams.get('distance');
    this.item = new UniversityBuilding(buildingGeojson);
    this.floorArray = this.createNumberArray(this.item.floors);
    console.log("floor array",this.floorArray);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UniversityBuildingDetailPage');
  }

  replacePicture(){
    console.log("Picture loading failed, loading error picture.");
    return UniversityBuilding.PictureError;
  }

  showFloor(floor : number){
    console.log("showing floor:", floor);
  }

  showPicture(src : string){
    this.photoViewer.show(src, 'My image title', {share: false});
  }

  private createNumberArray(num : number) : number[]{
    console.log("creating array");
    return Array.from(new Array(num),(val,index)=>index+1);
  }
}
