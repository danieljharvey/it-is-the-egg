import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Renderer } from "./Renderer";

const SPRITE_SIZE: number = 64;

export class Player {

	map: Map;
	renderer: Renderer;
	jetpack: Jetpack;
	collisions: Collisions;

	x: number = 0;
	y: number = 0;
	offsetX: number = 0;
	offsetY: number = 0;
	direction: number = 0;
	oldDirection: number = 0;
	currentFrame: number = 0;
	id: number = 0;
	frames: number = 1;
	multiplier: number = 1;
	falling: boolean = false;
	type: string = "egg";
	moveSpeed: number = 1;
	lastAction: string = "string";
	value: number = 1;
	img: string;

	constructor(params: object, map: Map, renderer: Renderer, jetpack: Jetpack, collisions: Collisions) {
		for (const i in params) {
			this[i] = params[i];
		}
		this.map = map;
		this.renderer = renderer;
		this.jetpack = jetpack;
		this.collisions = collisions;
	}

	doCalcs(timePassed: number) {
		const startCoords = this.getCoords();
		this.setRedrawAroundPlayer();

		const newFrames = this.incrementPlayerFrame(this.direction, this.oldDirection, this.frames, this.currentFrame);
		this.currentFrame = newFrames.currentFrame;
		this.oldDirection = newFrames.oldDirection;
	 	
	 	this.setCoords(
		 	this.checkFloorBelowPlayer(this.getCoords(), timePassed)
		);

	 	this.setCoords(
	 		this.incrementPlayerDirection(this.getCoords(), timePassed)
	 	);

	 	this.setCoords(
	 		this.correctTileOverflow(this.getCoords())
	 	);

		this.checkPlayerTileAction(this.getCoords());

	 	this.checkPlayerCollisions();
	 	this.setRedrawAroundPlayer();

	 	const endCoords = this.getCoords();
	 	if (!endCoords.equals(startCoords)) {
	 		// if in new square, wipe action so we can teleport again etc
	 		console.log('wipe action!');
	 		this.lastAction == "";
	 	}
	}

	getCoords() {
		return new Coords(this.x, this.y, this.offsetX, this.offsetY);
	}

	setCoords(coords: Coords) {
		const fixedCoords = this.map.correctForOverflow(coords.x, coords.y, coords.offsetX, coords.offsetY);
		this.x = fixedCoords.x;
		this.y = fixedCoords.y;
		this.offsetX = fixedCoords.offsetX;
		this.offsetY = fixedCoords.offsetY;
	}

	setRedrawAroundPlayer() {
		const coords = this.getCoords();
		const tiles = this.map.getTilesSurrounding(coords);
		tiles.map(tile => {
			tile.needsDraw = true;
		});
	}

	incrementPlayerFrame(direction: number, oldDirection: number, frames: number, currentFrame: number) {
		if (direction === 0 && oldDirection === 0 && currentFrame === 0) {
			// we are still, as it should be
			return {
				direction: 0,
				frames: frames,
				currentFrame: 0,
				oldDirection: 0
			}
		}

		if (direction === 0 && currentFrame === 0) {
			// if we're still, and have returned to main frame, disregard old movement
			oldDirection = 0;
		}

		// if going left, reduce frame
		if (direction < 0 || oldDirection < 0) {
			currentFrame --;
			if (currentFrame < 0) currentFrame = (frames - 1);
		}

		// if going right, increase frame
		if (direction > 0 || oldDirection > 0) {
			currentFrame++;
			if (currentFrame >= frames) currentFrame = 0;
		}
		return {
			direction: direction,
			frames: frames,
			currentFrame: currentFrame,
			oldDirection: oldDirection
		}
	}

	checkPlayerTileAction(currentCoords: Coords) {

		if (currentCoords.offsetX != 0 || currentCoords.offsetY != 0) return false;
		
		const coords = this.map.correctForOverflow(currentCoords.x, currentCoords.y);

		const tile = this.map.getTileWithCoords(coords);
		
		if (tile.collectable > 0) {
			const score = tile.collectable * this.multiplier;
			const blankTile = this.map.cloneTile(1);
			blankTile.needsDraw = true;
			this.map.changeTile(coords, blankTile);
			this.jetpack.addScore(score);
			return true;
		}

		if (tile.action == "completeLevel") {
			return this.jetpack.completeLevel();
		} else if (tile.action == "teleport") {
			return this.teleport();
		} else if (tile.action == 'pink-switch') {
			return this.switchTiles(15,16);
		} else if (tile.action == 'green-switch') {
			return this.switchTiles(18,19);
		}
	}

	checkPlayerCollisions() {
		this.jetpack.players.map((player) => {
			this.collisions.checkCollision(this,player);
		});
	}

	// find another teleport and go to it
	// if no others, do nothing
	teleport() {
		if (this.lastAction == "teleport") return false;
		const newTile = this.findTile(14);
		if (newTile) {
			this.x = newTile.x;
			this.y = newTile.y;
			this.lastAction = "teleport";
		}
	}

	switchTiles(id1, id2) {
		const tiles = this.map.getAllTiles();
		tiles.map((tile) => {
			if (tile.id === id1) {
				const coords = new Coords(tile.x,tile.y);
				this.map.changeTile(coords,this.map.cloneTile(id2));
			} else if (tile.id === id2) {
				const coords = new Coords(tile.x,tile.y);
				this.map.changeTile(coords,this.map.cloneTile(id1));
			}
		});
	}

	// find random tile of type
	findTile(id) {
		const tiles = this.map.getAllTiles();
		const teleporters = tiles.filter((tile) => {
			if (tile.x == this.x && tile.y == this.y) return false;
			return (tile.id == id);
		});
		if (teleporters.length == 0) return false; // no options
		const newTile = teleporters[Math.floor(Math.random() * teleporters.length)];
		return newTile;
	}

	incrementPlayerDirection(coords: Coords, timePassed: number) {

		const moveAmount = this.calcMoveAmount(this.moveSpeed, this.renderer.tileSize, timePassed);

		if (this.direction < 0 && this.falling === false) {
			if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y)) {
				// turn around
				this.direction = 1;
				return new Coords(coords.x, coords.y, 0, coords.offsetY);
			} else {
				// move
				console.log('move');
				return new Coords(coords.x, coords.y, coords.offsetX - moveAmount, coords.offsetY);
			}
		}

		if (this.direction > 0 && this.falling === false) {
			if (!this.map.checkTileIsEmpty(coords.x + 1, coords.y)) {
				// turn around
				this.direction = -1;
				return new Coords(coords.x, coords.y, 0, coords.offsetY);
			} else {
				// move
				console.log('move');
				return new Coords(coords.x, coords.y, coords.offsetX + moveAmount, coords.offsetY);
			}
		}

		// if we've stopped and ended up not quite squared up, correct this
		if (this.direction == 0 && this.falling === false) {
			if (coords.offsetX > 0) {
				console.log('move');
				return new Coords(coords.x, coords.y, coords.offsetX - moveAmount, coords.offsetY);
			} else if (this.offsetX < 0) {
				console.log('move');
				return new Coords(coords.x, coords.y, coords.offsetX + moveAmount, coords.offsetY);
			}
		}
		return coords;
	}

	calcMoveAmount(moveSpeed: number, tileSize: number, timePassed: number) {
		const fullSize = SPRITE_SIZE; // size of image tiles
		const moveAmount: number = (tileSize / fullSize) * moveSpeed;
		const frameRateAdjusted: number = moveAmount * (timePassed / 2);
		return frameRateAdjusted;
	}

	correctTileOverflow(coords: Coords) {

		if (coords.offsetX > SPRITE_SIZE) {
			return new Coords(coords.x + 1, coords.y, 0, coords.offsetY);
		}

		if (coords.offsetX < (-1 * SPRITE_SIZE)) {
			return new Coords(coords.x -1, coords.y, 0, coords.offsetY);
		}

		if (coords.offsetY > SPRITE_SIZE) {
			return new Coords(coords.x, coords.y + 1, coords.offsetX, 0);
		}

		if (coords.offsetY < (-1 * SPRITE_SIZE)) {
			return new Coords(coords.x, coords.y - 1, coords.offsetX, 0);
		}
		
		return coords;
	}

	checkFloorBelowPlayer(coords: Coords, timePassed: number) {

		if (coords.offsetX !== 0) return coords;

		const belowCoords = this.map.correctForOverflow(coords.x, coords.y + 1, coords.offsetX, coords.offsetY);

		const tile = this.map.getTileWithCoords(belowCoords);

		if (tile.background) {
			const moveAmount: number = this.calcMoveAmount(this.moveSpeed, this.renderer.tileSize, timePassed);
			const fallAmount: number = Math.round(moveAmount * 1.5);		
			this.falling = true;
			return new Coords(coords.x, coords.y, coords.offsetX, coords.offsetY + fallAmount);
		} else if (this.falling && tile.breakable) {
			this.map.changeTile(belowCoords,this.map.cloneTile(1)); // smash block, replace with empty
		} else {
			this.falling = false;
		}
		return coords;
	}
}
