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

/*
// much more burnable player object
// properties are protected so they can't be changed
// only change is via constructor - destroy and make new if change required

export class Player {
  public readonly coords: Coords;
  public readonly direction: number = 0;
  public readonly oldDirection: number = 0;
  public readonly currentFrame: number = 0;
  public readonly id: number = 0;
  public readonly frames: number = 1;
  public readonly multiplier: number = 1;
  public readonly falling: boolean = false;
  public readonly type: string = "egg";
  public readonly moveSpeed: number = 1;
  public readonly fallSpeed: number = 1;
  public readonly lastAction: string = "string";
  public readonly value: number = 1;
  public readonly img: string;
  public readonly stop: boolean = false;

  constructor(params: object) {
    for (const i in params) {
      if (params[i] !== undefined) {
        this[i] = params[i];
      }
    }
  }

  public modify(params: object): Player {
    const newParams = (Object as any).assign({}, this, params);
    return new Player(newParams);
  }
}
*/
