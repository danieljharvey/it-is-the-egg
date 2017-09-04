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
  readonly coords: Coords;
  readonly direction: number = 0;
  readonly oldDirection: number = 0;
  readonly currentFrame: number = 0;
  readonly id: number = 0;
  readonly frames: number = 1;
  readonly multiplier: number = 1;
  readonly falling: boolean = false;
  readonly type: string = "egg";
  readonly moveSpeed: number = 1;
  readonly fallSpeed: number = 1;
  readonly lastAction: string = "string";
  readonly value: number = 1;
  readonly img: string;

  constructor(params: object) {
    for (const i in params) {
      if (params[i]) {
        this[i] = params[i];
      }
    }
  }

  public modify(params: object): Player {
    const newParams = (Object as any).assign({}, this, params);
    return new Player(newParams);
  }
}
