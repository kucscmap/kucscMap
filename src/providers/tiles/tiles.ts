import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Platform } from 'ionic-angular';
import leaflet from 'leaflet';

/*
  Generated class for the TilesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TilesProvider {

  private readonly mapDbName : string = "csc-map";
  readonly base64Prefix : string = 'data:image/gif;base64,';
  private databaseReady: BehaviorSubject<boolean>;
  db: any;
 

  constructor(public http: HttpClient, private platform : Platform) {
    console.log('Hello TilesProvider Provider');
    let self = this;
    self.databaseReady = new BehaviorSubject(false);
    self.extendTileLayer();

    self.platform.ready().then(() => {
      if ((<any>window).SQLitePlugin && (<any>window).plugins.sqlDB) {
        console.log('has sqlitePlugin-ext and dbCopy(sqlDB)');
        let copysuccess = function () {
          console.log('&quot;copy success&quot;');    
          //self.buildMap();
          self.openDatabase();
        };

        let copyerror = function (e) {
          //db already exists or problem in copying the db file. Check the Log.
          console.log('&quot;Error Code = &quot;' + JSON.stringify(e));
          //e.code = 516 =&amp;amp;gt; if db exists
          if (e.code == 516) {
            console.log('removing existent database file..new copy');
            (<any>window).plugins.sqlDB.remove(this.mapDbName, 0, removesuccess, removeerror);
          }
        }.bind(this);

        //either use self in functions which may be call from diffeent context
        //or ".bind(this)" at the end of function declaration
        let removesuccess = function () {
          console.log('&quot;remove success&quot;');
          (<any>window).plugins.sqlDB.copy(self.mapDbName, 0, copysuccess, copyerror);
        };

        let removeerror = function () {
          console.log('&quot;remove error&quot;');
        };

        (<any>window).plugins.sqlDB.copy(this.mapDbName, 0, copysuccess, copyerror);
      }
    });
   
  }

  extendTileLayer(){
    console.log("extending tile layer");
    console.log("extended layer before extension", leaflet.TileLayer['MBTiles']);
    let self = this;
    leaflet.TileLayer['MBTiles'] = leaflet.TileLayer.extend({
      //db: SQLitePlugins
      mbTilesDB: null,
      createTile: function (coords, done) {
        let tile = document.createElement('img');
        tile['_layer'] = this;
        tile.onload = this._tileOnLoad.bind(this, done,tile);
        tile.onerror = this._tileOnError.bind(this, done,tile);

        // on(tile, 'load', bind(this._tileOnLoad, this, done, tile));
		    // on(tile, 'error', bind(this._tileOnError, this, done, tile))

        //one of the following 3 settings makes the tiles not load
        // if (this.options.crossOrigin) {
        //   tile.crossOrigin = '';
        // }

        // tile['alt'] = '';
        // tile.setAttribute('role', 'presentation');
        //end of the 3 settings

        tile.src = this.getTileUrl(coords, tile);
        
        return tile;
      },
      initialize: function (url, options, db) {
        console.log('initializing custom layer');
        console.log('sql plugin:' + db);
        this.mbTilesDB = db;
        leaflet.Util.setOptions(this, options);
      },
      getTileUrl: function (tilePoint, tile) {
        console.log('gettingcustm custom layer URL');
        //console.log("Tile: " + JSON.stringify(tile));
        console.log("TilePoint: " + JSON.stringify(tilePoint));
       

        let z = tilePoint.z;
        let x = tilePoint.x;
        let y = this._globalTileRange.max.y - tilePoint.y; 

        console.log('get tile [z, x ,y]' + '[' + z + ',' + x + ',' + y + ']');

        this.mbTilesDB.executeSql('SELECT BASE64(tile_data) AS base64_data FROM images INNER JOIN map ON images.tile_id = map.tile_id WHERE zoom_level = ? AND tile_column = ? AND tile_row = ?', [z, x, y],
          function (res) {
            console.log('success query:', JSON.stringify(res));
            let src = self.base64Prefix + res.rows.item(0).base64_data;
            tile.src = src;
          }, function (er) {
            console.log('error with executeSql', er);
          });
          return leaflet.Util.emptyImageUrl;
      }
    });

    console.log("tiles extended");
    console.log("extended layer after extension", leaflet.TileLayer['MBTiles'])
  }

  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  getDabase(){
    return this.db;
  }

  openDatabase(){
    let self = this;
    let dbOptions: any;

    if (self.platform.is('android')) {
      dbOptions = { name: self.mapDbName, location: 'default' };
    }
    else {
      dbOptions = { name: self.mapDbName, iosDatabaseLocation: 'Documents' };
    }

    self.db = (<any>window).sqlitePlugin.openDatabase(dbOptions);

    if(self.db){
      console.log("database is open");
      self.databaseReady.next(true);
    }else{
      console.log("Database failed to open");
    }

  }
}
