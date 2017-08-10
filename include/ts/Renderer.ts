import { Jetpack } from "./Jetpack";
import { Map } from "./Map";

const SPRITE_SIZE: number = 64;

export class Renderer {

	jetpack: Jetpack;
	map: Map;
	tiles: object;
	playerTypes: object;

	tileSize: number = 48;

	checkResize: boolean = true;
	imagesFolder: string = "img/";

	animationHandle: number;

	canvas; // canvas object
	ctx; // canvas context for drawing
	tileImages: object = {}; // image elements of tiles
	playerImages: object = {}; // image element of players
	playerTypes: object = {};

	constructor(jetpack: Jetpack, map: Map, tiles: object, playerTypes: object) {
		this.jetpack = jetpack;
		this.map = map;
		this.tiles = tiles;
		this.playerTypes = playerTypes;
		this.loadTilePalette();
		this.loadPlayerPalette();
		this.loadCanvas();
	}

	renderTitleScreen(callback) {
		this.sizeCanvas();
		const titleImage: HTMLElement = document.createElement("img");
		titleImage.addEventListener("load", () => {
		  this.drawTheBigEgg(titleImage, 0.02, true, callback);
		}, false);
		titleImage.setAttribute("src", this.imagesFolder + "large/the-egg.png");
		titleImage.setAttribute("width", 1024);
		titleImage.setAttribute("height", 1024);
	}

	drawTheBigEgg(titleImage, opacity, show, callback) {

		this.ctx.globalAlpha = 1;
		this.wipeCanvas("rgb(0,0,0)");

		this.ctx.globalAlpha = opacity;
		//this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft,top,this.tileSize,this.tileSize);

		this.ctx.drawImage(titleImage, 0, 0, titleImage.width, titleImage.height, 0, 0, this.canvas.width, this.canvas.height);
		if (show) {
			opacity += 0.01;
			if (opacity >= 1) {
				// wait, fade the egg
				const v = setTimeout(() => {
					// and start fading!
					this.drawTheBigEgg(titleImage, opacity, false, callback);
				}, 1000);
				return false;
			}
		} else {
			opacity = opacity - 0.03;
			if (opacity <= 0) {
				callback();
				titleImage = null;
				return false;
			}
		}
		this.animationHandle = window.requestAnimationFrame(() => {
	    	this.drawTheBigEgg(titleImage, opacity, show, callback);
	    });
	}

	render() {
		if (this.jetpack.paused) return false;
		this.sizeCanvas();
		//this.wipeCanvas('rgba(0,0,0,0.02)');
		this.renderBoard();
		this.renderPlayers();
		this.renderFrontLayerBoard();
		this.jetpack.doPlayerCalcs();
		//this.wipeCanvas('rgba(255,255,0,0.04)');
		this.animationHandle = window.requestAnimationFrame(() => this.render());
	}

	loadTilePalette() {
		for (const i in this.tiles) {
			const thisTile = this.tiles[i];
			const tileImage = document.createElement("img");
			tileImage.setAttribute("src", this.getTileImagePath(thisTile));
			tileImage.setAttribute("width", SPRITE_SIZE);
			tileImage.setAttribute("height", SPRITE_SIZE);
			this.tileImages[thisTile.id] = tileImage;
		}
	}

	loadPlayerPalette() {
		for (let i in this.playerTypes) {
			const playerType = this.playerTypes[i];
			const playerImage = document.createElement("img");
			playerImage.setAttribute("src", this.getTileImagePath(playerType));
			this.playerImages[playerType.img] = playerImage;
		}
	}

	getTileImagePath(tile: object): string {
		return this.imagesFolder + tile.img;
	}

	sizeCanvas() {
		if (!this.checkResize) return false;
		const maxBoardSize = this.getMaxBoardSize();

		this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + "px";

		const controlHeader = document.getElementById("controlHeader");
		console.log('controlheader',controlHeader);
		controlHeader.style.width = maxBoardSize.toString() + 'px';		

		this.tileSize = maxBoardSize / this.map.boardSize.width;
		this.loadCanvas();
		this.map.markAllForRedraw();

		this.checkResize = false; // all done
	}

	getMaxBoardSize(): number {
		let width = window.innerWidth;
		let height = window.innerHeight;

		const wrapper = document.getElementById('wrapper');
		const wrapMargin = parseInt(window.getComputedStyle(wrapper).margin);

		const controlHeader = document.getElementById("controlHeader");
		const controlSpacing = parseInt(window.getComputedStyle(controlHeader).marginTop);

		height = height - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
		width = width - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;

		if (width > height) {
			const difference = (height % this.map.boardSize.width);
			height = height - difference;
			return height;
		} else {
			const difference = (width % this.map.boardSize.width);
			width = width - difference;
			return width;
		}
	}

	wipeCanvas(fillStyle: string): void {
		this.ctx.fillStyle = fillStyle;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	loadCanvas(): void {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = this.map.boardSize.width * this.tileSize;
		this.canvas.height = this.map.boardSize.height * this.tileSize;
		this.ctx = this.canvas.getContext("2d");
	}

	renderBoard(): void {
	    for (let x = 0; x < this.map.boardSize.width; x++) {
	    	for (let y = 0; y < this.map.boardSize.height; y++) {
	    		const tile = this.map.board[x][y];

	    		if (tile.needsDraw === false) {
	    			this.showUnrenderedTile(x, y);
	    			continue;
	    		}
	    		const frontLayer = this.tileIsFrontLayer(tile);
	    		if (!frontLayer) {
	    			if (this.renderTile(x, y, tile, false)) {
		    			tile.needsDraw = false;
					    tile.drawnBefore = true;
					}
	    		} else {
	    			// render sky behind see through tiles
	    			this.drawSkyTile(tile, x, y);
	    		}
	    	}
	    }
	}

	tileIsFrontLayer(tile: object) {
		return this.map.getTileProperty(tile, "frontLayer");
	}

	drawSkyTile(tile: object, x: number, y: number) {
		const skyTile = this.map.getTile(1);
		const skyTileImage = this.tileImages[skyTile.id];
		this.renderTile(x, y, tile, skyTileImage);
	}

	// just go over and draw the over-the-top stuff
	renderFrontLayerBoard() {
	    for (let x = 0; x < this.map.boardSize.width; x++) {
	    	for (let y = 0; y < this.map.boardSize.height; y++) {
	    		const tile = this.map.board[x][y];
	    		if (tile.needsDraw === false) continue;
	    		if (this.tileIsFrontLayer(tile)) {
	    			if (this.renderTile(x, y, tile, false)) {
	    				tile.needsDraw = false;
					    tile.drawnBefore = true;
	    			}
	    		}
	    	}
	    }
	}

 	// debugging tools
	showUnrenderedTile(x: number, y: number) {
		return false;
		this.ctx.fillStyle = "#f00";
		this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
	}

	renderPlayers() {
		for (const i in this.jetpack.players) {
			const player = this.jetpack.players[i];
			this.renderPlayer(player);
		}
	}

	renderTile = function(x: number, y: number, tile: object, overwriteImage: object|boolean): boolean {

	    if (overwriteImage) {
	    	const img = overwriteImage;
	    } else {
	    	const img = this.tileImages[tile.id];
	    }

	    if (!img) {
	    	console.log("Could not find tile image for id " + tile.id);
	    	return false;
	    }

	    let left = x * this.tileSize;
	    let top = y * this.tileSize;
	    const opacity = 1;

	    this.ctx.globalAlpha = opacity;

		   if (this.map.renderAngle == 0 || this.map.getTileProperty(tile, "dontRotate")) {
			this.ctx.drawImage(img, left, top, this.tileSize, this.tileSize);
		} else {

			const angleInRad = this.map.renderAngle * (Math.PI / 180);

			const offset = this.tileSize / 2;

			left = left + offset;
		 top = top + offset;

		 this.ctx.translate( left, top );
		 this.ctx.rotate( angleInRad );

		 this.ctx.drawImage(img, -offset, -offset, this.tileSize, this.tileSize);

		 this.ctx.rotate( -angleInRad );
		 this.ctx.translate( -left, -top );
		}

	    return true;
	};

	renderPlayer(player: Player) {

		const offsetRatio = (this.tileSize / SPRITE_SIZE);

		const left = (player.x * this.tileSize) + (player.offsetX * offsetRatio);
		const top = (player.y * this.tileSize) + (player.offsetY * offsetRatio);

		const clipLeft = player.currentFrame * SPRITE_SIZE;
		const clipTop = 0;

		this.ctx.globalAlpha = 1;
		
		const image = this.playerImages[player.img];

		this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, this.tileSize, this.tileSize);

	 	if (left < 0) {
	    	// also draw on right
	    	const secondLeft = (this.tileSize * this.map.boardSize.width) + player.offsetX;
	    	this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, this.tileSize, this.tileSize);
	    }

	 	if ((left + this.tileSize) > (this.tileSize * this.map.boardSize.width)) {
	    	// also draw on left
	    	const secondLeft = left - (this.tileSize * this.map.boardSize.width);
	    	this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, this.tileSize, this.tileSize);
	    }
	}

	drawRotatingBoard(clockwise: boolean, completed: () => void) {

	    const cw = this.canvas.width;
	    const ch = this.canvas.height;

		   const savedData = new Image();
	    savedData.src = this.canvas.toDataURL("image/png");

		   if (clockwise) {
			this.drawRotated(savedData, 1, 0, 90, completed);
		} else {
			this.drawRotated(savedData, -1, 0, -90, completed);
		}
	}

	drawRotated(savedData: Image, direction: number, angle: number, targetAngle: number, completed: () => void) {
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

		const offset = this.canvas.width / 2;

		const left = offset;
	 const top = offset;

	 this.wipeCanvas("rgba(0,0,0,0.1)");

	 this.ctx.translate( left, top );
	 this.ctx.rotate( angleInRad );

	 this.ctx.drawImage(savedData, -offset, -offset);

	 this.ctx.rotate( -angleInRad );
	 this.ctx.translate( -left, -top );

	 angle += (direction * this.jetpack.moveSpeed);

	 this.animationHandle = window.requestAnimationFrame(() => {
	    	this.drawRotated(savedData, direction, angle, targetAngle, completed);
	    });
	}

}
