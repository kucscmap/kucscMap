/**
 * A generic model that our Master-Detail pages list, create, and delete.
 *
 * Change "Item" to the noun your app will use. For example, a "Contact," or a
 * "Customer," or a "Animal," or something like that.
 *
 * The Items service manages creating instances of Item, so go ahead and rename
 * that something that fits your app as well.
 */
export class Item {

  static readonly defaultItem: any = {
    "id" : 0,
    "fullName": "Burt Bear",
    "faculty": "Nature",
    "department": "Eating",
    "role": "Defender",
    "profilePic": "assets/img/staff/avatar.png",
    "office": "",
    "universityEmail": "burt@pidgeon.post",
    "external":"",
    "about": ""
  };

  constructor(fields: any) {
    // Quick and dirty extend/assign fields to this model
    for (const f in fields) {
      // @ts-ignore
      this[f] = fields[f];
    }

    if(!fields['profilePic']){
      this["profilePic"] = Item.defaultItem.profilePic;
    }
  }

}

export interface Item {
  [prop: string]: any;
}
