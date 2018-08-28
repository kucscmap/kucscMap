import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IonicPageModule } from 'ionic-angular';

import { UniversityBuildingDetailPage } from './university-building-detail';

@NgModule({
  declarations: [
    UniversityBuildingDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(UniversityBuildingDetailPage),
    TranslateModule.forChild()
  ],
  exports:[
    UniversityBuildingDetailPage
  ]
})
export class UniversityBuildingDetailPageModule {}
