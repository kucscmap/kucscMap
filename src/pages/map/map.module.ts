import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {TranslateModule} from '@ngx-translate/core';
import { MapPage } from './map';
import { core } from '../../../node_modules/@angular/compiler';

@NgModule({
  declarations: [
    MapPage,
  ],
  imports: [
    IonicPageModule.forChild(MapPage),
    TranslateModule.forChild()
  ],
})
export class MapPageModule {}
