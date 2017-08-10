import { Coords } from "./Coords";
import { Player } from "./Player";

export class Map {

	tiles: object;
	renderAngle: number = 0;

	boardSize: object = {
		width: 14,
		height: 14,
	};

	board: array = [];

	constructor(tiles: object) {
		this.tiles = tiles;
		this.board = this.generateBlankBoard();
	}

	updateBoard(board: object, boardSize: object) {
		this.board = board;
		this.boardSize = boardSize;
		this.markAllForRedraw();
	}

	correctForOverflow(x: number, y: number): Coords {
		let newX, newY;
		if (x < 0) {
			newX = this.boardSize.width - 1;
		} else if (x >= this.boardSize.width) {
			newX = 0;
		} else {
			newX = x;
		}

		if (y < 0) {
			newY = this.boardSize.height - 1;
		} else if (y >= this.boardSize.height) {
			newY = 0;
		} else {
			newY = y;
		}
		return new Coords(newX, newY);
	}

	getTileProperty(tile, property) {
		if (!tile.hasOwnProperty(property)) return false;
		return tile[property];

	}

	tileIsBreakable(tile) {
		return this.getTileProperty(tile, "breakable");
	}

	// is intended next tile empty / a wall?
	checkTileIsEmpty(x, y) {

		const coords = this.correctForOverflow(x, y);

		const tile = this.board[coords.x][coords.y];

		return tile.background;
	}

	markAllForRedraw() {
		// force redraw
		for (const x in this.board) {
			for (const y in this.board[x]) {
				this.board[x][y].needsDraw = true;
			}
		}
	}

	getTileAction(tile) {
		return this.getTileProperty(tile, "action");
	}

	generateBlankBoard() {
		const board = [];

		for (let x = 0; x < this.boardSize.width; x++) {
			board[x] = [];
			for (let y = 0; y < this.boardSize.height; y++) {
				const blankTile = this.getTile(1);
				board[x][y] = blankTile;
			}
		}
		return board;
	}

	generateRandomBoard() {
		const board = [];

		for (let x = 0; x < this.boardSize.width; x++) {
			board[x] = [];
			for (let y = 0; y < this.boardSize.height; y++) {
				const blankTile = this.getRandomTile(this.tiles);
				board[x][y] = blankTile;
			}
		}
		return board;
	}

	getTile(id) {
		const tile = JSON.parse(JSON.stringify(this.tiles[id])); // create copy of object so we're not changing original
		return tile;
	}

	getRandomTile(tiles) {
		const randomProperty = (obj) => {
		    const keys = Object.keys(obj);
		    const randomKey = keys[ keys.length * Math.random() << 0];
		    return this.getTile(randomKey);
		};

		const theseTiles = JSON.parse(JSON.stringify(tiles));
		// remove unwanted tiles
		for (const i in theseTiles) {
			if (this.getTileProperty(theseTiles[i], "dontAdd")) {
		    	delete theseTiles[i];
		    }
		}
		return randomProperty(theseTiles);
	}

	getBlankBoard() {
		const newBoard = [];
		for (let x = 0; x < this.boardSize.width; x++) {
			newBoard[x] = [];
			for (let y = 0; y < this.boardSize.height; y++) {
				newBoard[x][y] = [];
			}
		}
		return newBoard;
	}

	translateRotation(x, y, clockwise) {
		const coords = {
			x: 0,
			y: 0,
		};

		const width = this.boardSize.width - 1;
		const height = this.boardSize.height - 1;

		if (clockwise) {
			// 0,0 -> 9,0
			// 9,0 -> 9,9
			// 9,9 -> 0,9
			// 0,9 -> 0,0
			coords.x = width - y;
			coords.y = x;
		} else {
			// 0,0 -> 0,9
 			// 0,9 -> 9,9
 			// 9,9 -> 9,0
 			// 9,0 -> 0,0
			coords.x = y;
			coords.y = height - x;
		}
		return coords;
	}

	rotateBoard(clockwise) {
		const newBoard = this.getBlankBoard();

		const width = this.boardSize.width - 1;
		const height = this.boardSize.height - 1;

		for (const x in this.board) {
			for (const y in this.board[x]) {
				const coords = this.translateRotation(x, y, clockwise);
				newBoard[coords.x][coords.y] = this.board[x][y];
				newBoard[coords.x][coords.y].needsDraw = true;
			}
		}
		if (clockwise) {
			this.renderAngle = this.renderAngle + 90;
			if (this.renderAngle > 360) {
				this.renderAngle = this.renderAngle - 360;
			}
		} else {
			this.renderAngle = this.renderAngle - 90;
			if (this.renderAngle < 0) {
				this.renderAngle = 360 + this.renderAngle;
			}
		}

		this.board = newBoard;

		return true;
	}

	rotatePlayer(player: Player, clockwise) {

		const coords = this.translateRotation(player.x, player.y, clockwise);

		player.x = coords.x;
		player.y = coords.y;
		player.offsetX = 0; //offsetX;
		player.offsetY = 0; //offsetY;

		// if player is still, nudge them in rotation direction
		if (player.direction == 0) {
			if (clockwise) {
				player.direction = 1;
			} else {
				player.direction = -1;
			}
		}
	}

	// return array with all tiles in (with x and y added)
	getAllTiles() {
		const allTiles = [];
		for (const x in this.board) {
			for (const y in this.board[x]) {
				const id = this.board[x][y].id;
				const tile = this.getTile(id);
				tile.x = x;
				tile.y = y;
				allTiles.push(tile);
			}
		}
		return allTiles;
	}

	cycleTile(x: number, y: number) {

		const currentTile = this.board[x][y];

		const currentKey = currentTile.id;

		const keys = Object.keys(this.tiles);

		let newKey = false, nextKey = false;
		for (const i in keys) {
			if (newKey === false || nextKey) newKey = keys[i];
			if (keys[i] == currentKey) {
				nextKey = true;
			} else {
				nextKey = false;
			}
		}
	 const tile = this.getTile(newKey);
	 this.board[x][y] = tile;
	}

}
