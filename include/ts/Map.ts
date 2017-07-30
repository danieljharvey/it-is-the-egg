class Map {

	tiles: object;
	renderAngle: number = 0;

	boardSize: object = {
		width: 14,
		height: 14
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

	correctForOverflow(x:number, y:number): Coords {
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
		return this.getTileProperty(tile,'breakable');
	}

	// is intended next tile empty / a wall?
	checkTileIsEmpty(x,y) {

		var coords = this.correctForOverflow(x,y);

		var tile = this.board[coords.x][coords.y];

		return tile.background;
	}

	markAllForRedraw() {
		// force redraw
		for (var x in this.board) {
			for (var y in this.board[x]) {
				this.board[x][y].needsDraw = true;
			}
		}
	}

	getTileAction(tile) {
		return this.getTileProperty(tile,'action');
	}

	generateBlankBoard() {
		var board=[];

		for (var x = 0; x < this.boardSize.width; x++) {
			board[x] = [];
			for (var y = 0; y < this.boardSize.height; y++) {
				var blankTile = this.getTile(1);
				board[x][y] = blankTile;
			}
		}
		return board;
	}

	getTile(id) {
		var tile = JSON.parse(JSON.stringify(this.tiles[id])); // create copy of object so we're not changing original
		return tile;
	}

	getRandomTile(tiles) {
		var randomProperty = (obj) => {
		    var keys = Object.keys(obj);
		    var randomKey = keys[ keys.length * Math.random() << 0];
		    return this.getTile(randomKey);
		};

		var theseTiles = JSON.parse(JSON.stringify(tiles));
		// remove unwanted tiles
		for (var i in theseTiles) {
			if (this.getTileProperty(theseTiles[i],'dontAdd')) {
		    	delete theseTiles[i];
		    }
		}
		return randomProperty(theseTiles);
	}

	getBlankBoard() {
		var newBoard=[];
		for (var x =0; x < this.boardSize.width; x++) {
			newBoard[x]=[];
			for (var y = 0; y < this.boardSize.height; y++) {
				newBoard[x][y] = [];
			}
		}
		return newBoard;
	}

	translateRotation(x,y,clockwise) {
		var coords={
			x:0,
			y:0
		}
		
		var width = this.boardSize.width - 1;
		var height = this.boardSize.height - 1;

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
		var newBoard=this.getBlankBoard();

		var width = this.boardSize.width -1;
		var height = this.boardSize.height -1;

		for (var x in this.board) {
			for (var y in this.board[x]) {
				var coords = this.translateRotation(x,y,clockwise)
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
		
		var coords = this.translateRotation(player.x, player.y, clockwise);
		
		player.x = coords.x;
		player.y = coords.y;
		player.offsetX = 0; //offsetX;
		player.offsetY = 0; //offsetY;

		// if player is still, nudge them in rotation direction
		if (player.direction==0) {
			if (clockwise) {
				player.direction = 1;
			} else {
				player.direction = -1;
			}
		}
	}

	// return array with all tiles in (with x and y added)
	getAllTiles() {
		var allTiles = [];
		for (var x in this.board) {
			for (var y in this.board[x]) {
				var id = this.board[x][y].id;
				var tile = this.getTile(id);
				tile.x = x;
				tile.y = y;
				allTiles.push(tile);
			}
		}
		return allTiles;
	}
	
	cycleTile(x:number, y:number) {
		var currentTile = this.board[x][y];

		var currentKey = currentTile.id;

		var keys = Object.keys(this.tiles);
		
		var newKey = nextKey = false;
		for (var i in keys) {
			if (newKey===false || nextKey) newKey = keys[i];
			if (keys[i]==currentKey) {
				nextKey = true;
			} else {
				nextKey = false;
			}
		}
	    var tile = this.getTile(newKey);
	    this.board[x][y] = tile;
	}

}