import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

export class Coords {
  readonly x: number = 0;
  readonly y: number = 0;
  readonly offsetX: number = 0;
  readonly offsetY: number = 0;

  constructor(x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
    this.x = Math.floor(x) as number;
    this.y = Math.floor(y) as number;
    this.offsetX = offsetX as number;
    this.offsetY = offsetY as number;
  }

  public getActualPosition() {
    const fullX: number = this.x * SPRITE_SIZE + this.offsetX;
    const fullY: number = this.y * SPRITE_SIZE + this.offsetY;
    return {
      fullX,
      fullY
    };
  }

  public equals(otherCoords: Coords) {
    if (this.x !== otherCoords.x) {
      return false;
    }
    if (this.y !== otherCoords.y) {
      return false;
    }
    if (this.offsetX !== otherCoords.offsetX) {
      return false;
    }
    if (this.offsetY !== otherCoords.offsetY) {
      return false;
    }
    return true;
  }

  public modify(params: object): Coords {
    const newParams = (Object as any).assign({}, this, params);
    return new Coords(
      newParams.x,
      newParams.y,
      newParams.offsetX,
      newParams.offsetY
    );
  }
}
