import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let buildingGeojson = navParams.get('universityBuilding');
    this.item = new UniversityBuilding(buildingGeojson);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UniversityBuildingDetailPage');
  }

  replacePicture(){
    console.log("Picture loading failed, loading error picture.");
    return UniversityBuilding.PictureError;
  }
}
