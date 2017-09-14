import { Record } from "immutable";

interface ITileParams {
  id?: number;
  title?: string;
  img?: string;
  background?: boolean;
  needsDraw?: boolean;
  frontLayer?: boolean;
  collectable?: number;
  breakable?: boolean;
  action?: string;
  dontAdd?: boolean;
  createPlayer?: string;
  x?: number;
  y?: number;
  drawnBefore?: boolean;
}

export class Tile extends Record({
  id: 0,
  title: "Title",
  background: false,
  needsDraw: true,
  frontLayer: false,
  collectable: 0,
  breakable: false,
  action: "",
  dontAdd: false,
  createPlayer: "",
  x: 0,
  y: 0,
  drawnBefore: false
}) {
  public id: number;
  public title: string;
  public img: string;
  public background: boolean;
  public needsDraw: boolean;
  public frontLayer: boolean;
  public collectable: number;
  public breakable: boolean;
  public action: string;
  public dontAdd: boolean;
  public createPlayer: string;
  public x: number;
  public y: number;
  public drawnBefore: boolean;

  constructor(params?: ITileParams) {
    params ? super(params) : super();
  }

  public modify(values: ITileParams) {
    return this.merge(values) as this;
  }
}
