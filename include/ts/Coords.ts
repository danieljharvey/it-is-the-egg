import { Record } from "immutable";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

type CoordsParams = {
  x?: number,
  y?: number,
  offsetX?: number,
  offsetY?: number
};

export class Coords extends Record({ x: 0, y: 0, offsetX: 0, offsetY: 0 }) {
  public x: number;
  public y: number;
  public offsetX: number;
  public offsetY: number;

  constructor(params?: CoordsParams) {
      params ? super(params) : super();
  }

  public modify(values: CoordsParams) {
      return this.merge(values) as this;
  }

  public getActualPosition() {
    const fullX: number = this.x * SPRITE_SIZE + this.offsetX;
    const fullY: number = this.y * SPRITE_SIZE + this.offsetY;
    return {
      fullX,
      fullY
    };
  }
}
/*
export class Coords {
  public readonly x: number = 0;
  public readonly y: number = 0;
  public readonly offsetX: number = 0;
  public readonly offsetY: number = 0;

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
*/