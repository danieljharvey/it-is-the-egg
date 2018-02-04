import { TileSet } from "../logic/TileSet";
import { Renderer } from "./Renderer";

import * as _ from "ramda";

// used in editor, draws a bunch of 32x32 tiles for selecting

export class TileChooser {
  public renderer: Renderer;
  public chosenTileID: number = 0;

  constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  public chooseTile(id) {
    this.chosenTileID = id;
    this.highlightChosenTile(id);
  }

  public highlightChosenTile(id) {
    const tileChooser = document.getElementById("tileChooser");
    const children = tileChooser.children;
    const childrenArray = [].slice.call(children);
    childrenArray.forEach(child => {
      const className = child.getAttribute("class");
      if (className === "tile" + id) {
        child.setAttribute("style", "border: 1px red solid;");
      } else {
        child.setAttribute("style", "border: 1px white solid;");
      }
    });
  }

  public makeTileImages(tiles) {
    return _.map(tile => {
      const tileImage = document.createElement("img");
      tileImage.setAttribute("src", this.renderer.getTileImagePath(tile));
      tileImage.setAttribute("width", "32");
      tileImage.setAttribute("height", "32");
      tileImage.setAttribute("padding", "2px");
      tileImage.setAttribute("alt", tile.title);
      tileImage.setAttribute("style", "border: 1px white solid;");
      tileImage.setAttribute("class", "tile" + tile.id);
      tileImage.onclick = () => {
        this.chooseTile(tile.id);
      };
      return tileImage;
    }, tiles);
  }

  public render() {
    const tiles = TileSet.getTiles();
    const images = this.makeTileImages(tiles);
    const tileChooser = document.getElementById("tileChooser");
    (Object as any).values(images).forEach(image => {
      tileChooser.appendChild(image);
    });
  }
}
