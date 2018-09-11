import { Injectable } from '@angular/core';

import { Item } from '../../models/item';
import { staff } from '../../assets/data/staff';

@Injectable()

/**Item represents a teachers
 * 
 */
export class Items {


  readonly defaultItem = Item.defaultItem;

  items: Item[] = [];

  constructor() {
    let items = staff;

    for (let item of items) {
      this.items.push(new Item(item));
    }
  }

  query(params?: any) {
    if (!params) {
      return this.items; 
    }

    return this.items.filter((item) => {
      for (let key in params) {
        let field = item[key];
        if (typeof field == 'string' && field.toLowerCase().indexOf(params[key].toLowerCase()) >= 0) {
          return item;
        } else if (field == params[key]) {
          return item;
        }
      }
      return null;
    });
  }

  getAll(): Item[]{
    return this.items;
  }

  add(item: Item) {
    this.items.push(item);
  }

  delete(item: Item) {
    this.items.splice(this.items.indexOf(item), 1);
  }
}
