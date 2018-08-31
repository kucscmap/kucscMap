export class UniversityBuilding {

    static readonly PictureFolder = "assets/img/university-buildings/";
    static readonly PictureError = "assets/img/university-buildings/error.jpg"
    static readonly Default : any = {
        number: 999,
        name: "Undefined",
        about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque consequat lacus tristique, ullamcorper felis eu, scelerisque lorem. Sed scelerisque, tortor quis dictum auctor, justo tortor commodo nisl, sit amet euismod neque lacus quis felis. Morbi at eros vitae risus porta suscipit. Nam et pulvinar nibh.",
        gallery : UniversityBuilding.PictureFolder + "default/",
        address : "Unknown"
    }

    number: number;
    name: string;
    about: string;
    gallery : string;
    address : string;
    floors : number;
    [prop: string]: any;

    constructor(universityBuildingGeoJson?: any) {
        this.number = UniversityBuilding.Default.number;
        this.name = UniversityBuilding.Default.name;
        this.about = UniversityBuilding.Default.about;
        this.gallery = UniversityBuilding.Default.gallery;
        this.address = UniversityBuilding.Default.address;

        if(universityBuildingGeoJson && universityBuildingGeoJson.properties){
            for (const f in universityBuildingGeoJson.properties) {
                // @ts-ignore
                this[f] = universityBuildingGeoJson.properties[f];
            }

            this.createPicturePath();
        }
     
    }

    private createPicturePath(){
        if(this.number === 999){
            return;
        }

        this.gallery = UniversityBuilding.PictureFolder + this.number + "/"
    }

    getTitlePicture() : string {
        return this.gallery + "0.jpg"
    }

    getPicture(pictureNumber : number) : string {
        return this.gallery + pictureNumber +".jpg";
    }

    getErrorPicture(pictureNumber : number) : string {
        return UniversityBuilding.PictureError;
    }

    getHeading() : string{
        return this.number ? this.number + " | " + this.name : this.name;
      }
}

