import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

  constructor(public http: HttpClient) {
    console.log('Hello TilesProvider Provider');
    this.extendTileLayer();
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
}
