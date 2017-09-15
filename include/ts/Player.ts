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
  lastAction?: string;
  value?: number;
  img?: string;
  stop?: boolean;
}

export class Player extends Record({
  coords: new Coords(),
  direction: 0,
  oldDirection: 0,
  currentFrame: 0,
  id: 0,
  frames: 1,
  multiplier: 1,
  falling: false,
  type: "egg",
  moveSpeed: 1,
  fallSpeed: 1,
  lastAction: "",
  value: 1,
  img: "",
  stop: false
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
  public lastAction: string;
  public value: number;
  public img: string;
  public stop: boolean;

  constructor(params?: IPlayerParams) {
    params ? super(params) : super();
  }

  public modify(values: IPlayerParams) {
    return this.merge(values) as this;
  }
}