import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Renderer } from "./Renderer";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

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
