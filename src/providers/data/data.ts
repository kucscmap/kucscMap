import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Api } from '../api/api';
import { BehaviorSubject, Observable } from 'rxjs/Rx';



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

  private dataReadyUniversityBuildings: BehaviorSubject<boolean>;

  constructor(public api: Api) {
    console.log('Hello DataProvider Provider');
    this.dataReadyUniversityBuildings = new BehaviorSubject(false);
    this.getJsonAsync(DATA_SOURCE.BuildingsUniversity);
  }

  private getJsonAsync(dataSource: DATA_SOURCE, params?: any) {
    this.api.getLocal(dataSource, params).subscribe((data) => {
      this.universityBuildings = data;
      this.enhanceUniversityBuildingData();
      this.dataReadyUniversityBuildings.next(true);
    });
  }

  private enhanceUniversityBuildingData(){
    this.universityBuildings.features = this.universityBuildings.features.map((item) => {
      item.properties['displayName'] = ""
      item.properties['displayName'] += item.properties.number != null ? item.properties.number : "";
      item.properties['displayName'] += item.properties.name != null ?  " | " + item.properties.name : "";
      return item;
    });
  }


  query(params?: any): any[] {
    let buildings = this.universityBuildings.features;

    if (!params) {
      return buildings;
    }
    return buildings.filter((item) => {
      for (let key in params) {
        let field = item.properties[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    })
  }


  add(item: any) {
  }

  delete(item: any) {
  }

  getDataState(dataSource: DATA_SOURCE) {
    if (dataSource == DATA_SOURCE.BuildingsUniversity) {
      return this.dataReadyUniversityBuildings.asObservable();
    }

    //make if for the other type of data observable instead of this
    return this.dataReadyUniversityBuildings.asObservable();
  }
}
