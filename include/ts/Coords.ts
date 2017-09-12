import { Record } from "immutable";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

interface ICoordsParams {
  x?: number;
  y?: number;
  offsetX?: number;
  offsetY?: number;
}

export class Coords extends Record({ x: 0, y: 0, offsetX: 0, offsetY: 0 }) {
  public x: number;
  public y: number;
  public offsetX: number;
  public offsetY: number;

  constructor(params?: ICoordsParams) {
    params ? super(params) : super();
  }

  public modify(values: ICoordsParams) {
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
