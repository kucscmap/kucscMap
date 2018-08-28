import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { BehaviorSubject } from 'rxjs/Rx';



export enum DATA_SOURCE {
  BuildingsUniversity = 'assets/data/buildingsUniversity.geojson',
  FarmsUniversity = 'path to file'
}
/*
  Generated class for the DataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataProvider {

  public universityBuildings: any;

  private dataReady: BehaviorSubject<boolean>;

  constructor(public api: Api) {
    console.log('Hello DataProvider Provider');
  }

 getJsonAsync(dataSource : DATA_SOURCE, params?: any): any{
  return this.api.getLocal(dataSource, params);
 }

 

}
