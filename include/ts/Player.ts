import { Record } from "immutable";
import { Coords } from "./Coords";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

interface IPlayerParams {
  coords?: Coords;
  direction?: number;
  oldDirection?: number;
  currentFrame?: number;
  id?: number;
  frames?: number;
  multiplier?: number;
  falling?: boolean;
  type?: string;
  moveSpeed?: number;
  fallSpeed?: number;
  value?: number;
  img?: string;
  stop?: boolean;
  lastAction?: string;
  title?: string;
  moved?: boolean;
}

export class Player extends Record({
  coords: new Coords(),
  currentFrame: 0,
  direction: 0,
  fallSpeed: 1,
  falling: false,
  frames: 1,
  id: 0,
  img: "",
  lastAction: "",
  moveSpeed: 1,
  moved: false,
  multiplier: 1,
  oldDirection: 0,
  stop: false,
  title: "",
  type: "egg",
  value: 1
}) {
  public coords: Coords;
  public direction: number;
  public oldDirection: number;
  public currentFrame: number;
  public id: number;
  public frames: number;
  public multiplier: number;
  public falling: boolean;
  public type: string;
  public moveSpeed: number;
  public fallSpeed: number;
  public value: number;
  public img: string;
  public stop: boolean;
  public lastAction: string;
  public title: string;
  public moved: boolean;

  constructor(params?: IPlayerParams) {
    const superParams = params ? params : undefined;
    super(superParams);
  }

  public modify(values: IPlayerParams) {
    return this.merge(values) as this;
  }

  public first() {
    return this.first();
  }
}
