import { Record } from "immutable";

interface ITileParams {
  id?: number;
  title?: string;
  img?: string;
  background?: boolean;
  frontLayer?: boolean;
  collectable?: number;
  breakable?: boolean;
  action?: string;
  dontAdd?: boolean;
  createPlayer?: string;
  x?: number;
  y?: number;
}

export class Tile extends Record({
  id: 0,
  title: "Title",
  background: false,
  frontLayer: false,
  collectable: 0,
  breakable: false,
  action: "",
  dontAdd: false,
  createPlayer: "",
  x: 0,
  y: 0,
}) {
  public id: number;
  public title: string;
  public img: string;
  public background: boolean;
  public frontLayer: boolean;
  public collectable: number;
  public breakable: boolean;
  public action: string;
  public dontAdd: boolean;
  public createPlayer: string;
  public x: number;
  public y: number;

  constructor(params?: ITileParams) {
    params ? super(params) : super();
  }

  public modify(values: ITileParams) {
    return this.merge(values) as this;
  }
}
