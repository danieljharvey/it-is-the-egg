import { Renderer } from "./Renderer";
import { TileSet } from "./TileSet";

import * as _ from "ramda";

// used in editor, draws a bunch of 32x32 tiles for selecting

export class TileChooser {

	tileSet: TileSet;
	renderer: Renderer;
	chosenTileID: number = 0;

	constructor(tileSet: TileSet, renderer: Renderer) {
		this.tileSet = tileSet;
		this.renderer = renderer;
	}

	chooseTile(id) {
		this.chosenTileID = id;
		this.highlightChosenTile(id);
	}

	highlightChosenTile(id) {
		const tileChooser = document.getElementById("tileChooser");
		let children = tileChooser.children;
		for (let i = 0; i < children.length; i++) {
			let child = children[i];
			const className = child.getAttribute("class");
			if (className == "tile" + id) {
				child.setAttribute("style", "border: 1px red solid;");
			} else {
				child.setAttribute("style", "border: 1px white solid;");
			}
		}
	}

	makeTileImages(tiles) {
		return _.map((tile) => {
			const tileImage = document.createElement("img");
			tileImage.setAttribute("src", this.renderer.getTileImagePath(tile));
			tileImage.setAttribute("width", "32");
			tileImage.setAttribute("height", "32");
			tileImage.setAttribute("padding", "2px");
			tileImage.setAttribute("style", "border: 1px white solid;");
			tileImage.setAttribute("class", "tile" + tile.id);
			tileImage.onclick = () => {
				this.chooseTile(tile.id);
			};
			return tileImage;
		}, tiles);
	}

	render() {
		const tiles = this.tileSet.getTiles();
		const images = this.makeTileImages(tiles);
		const tileChooser = document.getElementById("tileChooser");
		for (let i in images) {
			tileChooser.appendChild(images[i]);
		}
	}
}
