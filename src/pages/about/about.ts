import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
})
export class AboutPage {

  public name : string;
  public version : string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public appVersion: AppVersion) {
   appVersion.getAppName().then((name) =>   this.name = name);
   appVersion.getVersionNumber().then((version) =>   this.version = version);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AboutPage');
  }

}
