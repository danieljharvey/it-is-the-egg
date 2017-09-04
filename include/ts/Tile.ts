export class Tile {
  public id: number;
  public title: string;
  public img: string;
  public background: boolean = false;
  public needsDraw: boolean = true;
  public frontLayer: boolean = false;
  public collectable: number = 0;
  public breakable: boolean = false;
  public action: string = "";
  public dontAdd: boolean = false;
  public createPlayer: string = "";

  constructor(params: object) {
    // fill this object with entries from params
    (Object as any).entries(params).map(([key, value]) => {
      this[key] = value;
    });
  }
}
