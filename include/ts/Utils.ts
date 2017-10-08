import * as _ from "ramda";
import { BoardSize } from "./BoardSize";
import { Coords } from "./Coords";

// wee lad full of reusable functions

export class Utils {
  public static getRandomObjectKey(object: object) {
    const keys = Object.keys(object);
    return this.returnRandomKey(keys);
  }

  public static getRandomArrayKey(array: object[]) {
    const keys = _.keys(array);
    return this.returnRandomKey(keys);
  }

  public static returnRandomKey(keys: any[]) {
    if (keys.length === 0) {
      return false;
    }
    return keys[(keys.length * Math.random()) << 0];
  }

  public static getControlStyle(id: string, property: string) {
    const controlHeader = document.getElementById(id);
    if (!controlHeader) {
      return 0;
    }
    const style = window.getComputedStyle(controlHeader);
    const value = style[property];
    if (isNaN(value)) {
      return parseInt(value, 10);
    }
    return value;
  }

  public static getControlProperty(id: string, property: string) {
    const controlHeader = document.getElementById(id);
    if (!controlHeader) {
      return 0;
    }
    const value = controlHeader[property];
    if (isNaN(value)) {
      return parseInt(value, 10);
    }
    return value;
  }

  public static removeParams(params: object, removeList: string[]) {
    const goodParams = {};
    for (const i in params) {
      if (removeList.indexOf(i) === -1) {
        goodParams[i] = params[i];
      }
    }
    return goodParams;
  }

  public static correctForOverflow(
    coords: Coords,
    boardSize: BoardSize
  ): Coords {
    let newX;
    let newY;
    if (coords.x < 0) {
      newX = boardSize.width - 1;
    } else if (coords.x >= boardSize.width) {
      newX = 0;
    } else {
      newX = coords.x;
    }

    if (coords.y < 0) {
      newY = boardSize.height - 1;
    } else if (coords.y >= boardSize.height) {
      newY = 0;
    } else {
      newY = coords.y;
    }
    return coords.modify({ x: newX, y: newY });
  }

  public static flattenArray(arr: any[]) {
    return [].concat.apply([], arr);
  }

  public static removeDuplicates(arr: any[]) {
    return arr.filter((value, index, self) => {
      return (self.indexOf(value) === index);
    });
  }
}
