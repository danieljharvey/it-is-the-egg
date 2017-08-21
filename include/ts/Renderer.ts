import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";

const SPRITE_SIZE: number = 64;

export class Renderer {

	jetpack: Jetpack;
	map: Map;
	tiles: object;
	playerTypes: object;
	boardSize: BoardSize;
	canvas: Canvas;

	checkResize: boolean = true;

	tileImages: object = {}; // image elements of tiles
	playerImages: object = {}; // image element of players
	tileSize: number;

	constructor(jetpack: Jetpack, map: Map, tiles: object, playerTypes: object, boardSize: BoardSize, canvas: Canvas) {
		this.jetpack = jetpack;
		this.map = map;
		this.tiles = tiles;
		this.playerTypes = playerTypes;
		this.boardSize = boardSize;
		this.canvas = canvas;
		this.loadTilePalette();
		this.loadPlayerPalette();
		this.tileSize = this.canvas.calcTileSize(boardSize);
	}

	render() {
		this.renderBoard();
		this.renderPlayers();
		this.renderFrontLayerBoard();
	}

	resize() {
		this.tileSize = this.canvas.sizeCanvas(this.boardSize);
		this.map.markAllForRedraw();
	}

	loadTilePalette() {
		for (const i in this.tiles) {
			const thisTile = this.tiles[i];
			const tileImage = document.createElement("img");
			tileImage.setAttribute("src", this.getTileImagePath(thisTile));
			tileImage.setAttribute("width", SPRITE_SIZE.toString());
			tileImage.setAttribute("height", SPRITE_SIZE.toString());
			tileImage.addEventListener("load", () => {
		  		this.markTileImageAsLoaded(thisTile.id);
			}, false);
			this.tileImages[thisTile.id] = {
				image:tileImage,
				ready: false
			}
		}
	}

	loadPlayerPalette() {
		for (let i in this.playerTypes) {
			const playerType = this.playerTypes[i];
			const playerImage = document.createElement("img");
			playerImage.setAttribute("src", this.getTileImagePath(playerType));
			playerImage.addEventListener("load", () => {
		  		this.markPlayerImageAsLoaded(playerType.img);
			}, false);
			this.playerImages[playerType.img] = {
				image: playerImage,
				ready: false
			}
		}
	}

	markPlayerImageAsLoaded(img: string) {
		this.playerImages[img].ready = true;
	}

	markTileImageAsLoaded(id: number) {
		this.tileImages[id].ready = true;
	}

	getTileImagePath(tile: Tile): string {
		return this.canvas.imagesFolder + tile.img;
	}

	renderBoard(): void {
		const tiles = this.map.getAllTiles();
		tiles.map(tile => {
			if (tile.needsDraw === false) {
    			this.showUnrenderedTile(tile.x, tile.y);
    			return;
    		}
    		if (!tile.frontLayer) {
    			if (this.renderTile(tile.x, tile.y, tile)) {
	    			tile.needsDraw = false;
				    tile.drawnBefore = true;
				}
    		} else {
    			// render sky behind see through tiles
    			this.drawSkyTile(tile, tile.x, tile.y);
    		}
		});
	}

	drawSkyTile(tile: Tile, x: number, y: number) {
		const skyTile = this.map.cloneTile(1);
		this.renderTile(x, y, skyTile);
	}

	// just go over and draw the over-the-top stuff
	renderFrontLayerBoard() {
	    const tiles = this.map.getAllTiles();
		tiles.map(tile => {
    		if (tile.needsDraw === false) return;
    		if (tile.frontLayer) {
    			if (this.renderTile(tile.x, tile.y, tile)) {
    				tile.needsDraw = false;
				    tile.drawnBefore = true;
    			}
    		}
	    })
	}

 	// debugging tools
	showUnrenderedTile(x: number, y: number) {
		return false;

		const tileSize = this.tileSize;
		const ctx = this.canvas.getDrawingContext();
		ctx.fillStyle = "#f00";
		ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
	}

	renderPlayers() {
		for (const i in this.jetpack.players) {
			const player = this.jetpack.players[i];
			this.renderPlayer(player);
		}
	}

	getTileImage(id: number) {
		const tileImage = this.tileImages[id];
		if (tileImage.ready) {
			return tileImage.image;
		}
		return false;
	}

	renderTile = function(x: number, y: number, tile: Tile): boolean {

		const ctx = this.canvas.getDrawingContext();
		const tileSize = this.tileSize;

	    const img = this.getTileImage(tile.id);

	    if (!img) {
	    	//console.log("Could not find tile image for id " + tile.id);
	    	return false;
	    }

	    let left = x * tileSize;
	    let top = y * tileSize;
	    const opacity = 1;

	    ctx.globalAlpha = opacity;

		if (this.map.renderAngle == 0) {
			ctx.drawImage(img, left, top, tileSize, tileSize);
		} else {

			const angleInRad = this.map.renderAngle * (Math.PI / 180);

			const offset = tileSize / 2;

			left = left + offset;
			top = top + offset;

		 	ctx.translate( left, top );
		 	ctx.rotate( angleInRad );

		 	ctx.drawImage(img, -offset, -offset, tileSize, tileSize);

		 	ctx.rotate( -angleInRad );
		 	ctx.translate( -left, -top );
		}

	    return true;
	};

	getPlayerImage(img: string) {
		const playerImage = this.playerImages[img];
		if (playerImage.ready) {
			return playerImage.image;
		}
		return false;
	}

	renderPlayer(player: Player) {

		const ctx = this.canvas.getDrawingContext();
		const tileSize = this.tileSize;

		const offsetRatio = (tileSize / SPRITE_SIZE);

		const left = (player.x * tileSize) + (player.offsetX * offsetRatio);
		const top = (player.y * tileSize) + (player.offsetY * offsetRatio);

		const clipLeft = player.currentFrame * SPRITE_SIZE;
		const clipTop = 0;

		ctx.globalAlpha = 1;
		
		const image = this.getPlayerImage(player.img);
		if (!image) {
			//console.log('player image not loaded', player.img);
			return false;
		}

		ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, tileSize, tileSize);

	 	if (left < 0) {
	    	// also draw on right
	    	const secondLeft = (tileSize * this.boardSize.width) + player.offsetX;
	    	ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
	    }

	 	if ((left + tileSize) > (tileSize * this.boardSize.width)) {
	    	// also draw on left
	    	const secondLeft = left - (tileSize * this.boardSize.width);
	    	ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
	    }
	}

	drawRotatingBoard(clockwise: boolean, completed: () => void) {

		const canvas = this.canvas.getCanvas();

	    const cw = canvas.width;
	    const ch = canvas.height;

		const savedData = new Image();
	    savedData.src = canvas.toDataURL("image/png");

		if (clockwise) {
			this.drawRotated(savedData, 1, 0, 90, completed);
		} else {
			this.drawRotated(savedData, -1, 0, -90, completed);
		}
	}

	drawRotated(savedData: HTMLImageElement, direction: number, angle: number, targetAngle: number, completed: () => void) {
			
		const canvas = this.canvas.getCanvas();

		if (direction > 0) {
			if (angle >= targetAngle) {
				completed();
				return false;
			}
		} else {
			if (angle <= targetAngle) {
				completed();
				return false;
			}
		}

		const angleInRad = angle * (Math.PI / 180);

		const offset = canvas.width / 2;

		const ctx = this.canvas.getDrawingContext();

		const left = offset;
	 	const top = offset;

	 	this.canvas.wipeCanvas("rgba(0,0,0,0.1)");

	 	ctx.translate( left, top );
	 	ctx.rotate( angleInRad );

	 	ctx.drawImage(savedData, -offset, -offset);

	 	ctx.rotate( -angleInRad );
	 	ctx.translate( -left, -top );

	 	angle += (direction * this.jetpack.moveSpeed);

	 	this.jetpack.animationHandle = window.requestAnimationFrame(() => {
	    	this.drawRotated(savedData, direction, angle, targetAngle, completed);
	    });
	}

}
