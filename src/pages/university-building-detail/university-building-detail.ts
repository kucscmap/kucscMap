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

  showFloorPicture(floor : number){
    //this must be redone for IOS deployment
    let androidFilePath = "file:///android_asset/www/";
    console.log("showing floor:", androidFilePath + this.item.getFloorPicture(floor));
    this.showPicture(androidFilePath + this.item.getFloorPicture(floor), floor.toString());
  }

  /**the photoViewer plugin handles creating the path correctly when the image path
   * is inserted into and "img" element as "src" attribute. Directly injecting the image path
   * as the attribute of "show()" function does not display the image correctly.
   * See function "showFloorPicture()" to see a hack how to make it work in that case.
   * 
   * @param src 
   * @param pictureName 
   */
  showPicture(src : string, pictureName : string = this.item.name){
    console.log("showing picture:",src);
    this.photoViewer.show(src, pictureName, {share: false});
  }

  private createNumberArray(num : number) : number[]{
    console.log("creating array");
    return Array.from(new Array(num),(val,index)=>index+1);
  }
}
