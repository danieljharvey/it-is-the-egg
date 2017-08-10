import { Coords } from "./Coords";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { TileSet } from "./TileSet";
import { BoardSize } from "./BoardSize";

export class Map {

	tileSet: TileSet;
	renderAngle: number = 0;

	boardSize: BoardSize;

	readonly board = [];

	constructor(tileSet: TileSet, boardSize: BoardSize, board = []) {
		this.tileSet = tileSet;
		this.boardSize = boardSize;
		this.board = this.correctBoardSizeChange(board, boardSize);
		this.markAllForRedraw();
	}

	updateBoard(board, boardSize: BoardSize) {
		this.board = board;
		this.boardSize = boardSize;
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

	// is intended next tile empty / a wall?
	checkTileIsEmpty(x, y) {

		const coords = this.correctForOverflow(x, y);

		const tile = this.board[coords.x][coords.y];

		return tile.background;
	}

	markAllForRedraw() {
		const tiles = this.getAllTiles();
		tiles.map(tile => {
			tile.needsDraw = true;
		});
		return;
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

	getPrototypeTile(id) {
		return this.tileSet.getTile(id);
	}

	getTile(id): Tile {
		const prototypeTile = this.getPrototypeTile(id);
		const tile = new Tile(prototypeTile); // create new Tile object with these 
		return tile;
	}

	getRandomTile(tiles) {
		const randomProperty = (obj) => {
		    const keys = Object.keys(obj);
		    const randomKey = keys[ keys.length * Math.random() << 0];
		    return this.getTile(randomKey);
		};
		
		const theseTiles = this.tileSet.getTiles();
		Object.entries(theseTiles).filter(([key, tile]) => {
			if (tile.dontAdd) delete theseTiles[key];
			return true;
		})
		return randomProperty(theseTiles);
	}

	// get empty grid without tiles in
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

	translateRotation(x: number, y: number, clockwise: boolean) {
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
				const tile = this.board[x][y];
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

		const keys = Object.keys(this.tileSet.getTiles());

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

	shrinkBoard() {
		this.boardSize.shrink();
		this.board = this.correctBoardSizeChange(this.board, this.boardSize);
	}

	growBoard() {
		this.boardSize.grow();
		this.board = this.correctBoardSizeChange(this.board, this.boardSize);
	}

	correctBoardSizeChange(board, boardSize: BoardSize) {
		
		const newBoard = [];

		const currentWidth = board.length;
		const currentHeight = board[0].length;

		for (let x = 0; x < boardSize.width; x++) {
			newBoard[x] = [];
			for (let y = 0; y < boardSize.height; y++) {
				if (x < currentWidth && y < currentHeight) {
					// using current board
					const tile = board[x][y];
					newBoard[x][y] = tile;
				} else {
					// adding blank tiles
					const tile = this.getTile(1);
					newBoard[x][y] = tile;
				}
			}
		}
		return newBoard;
	}

}
