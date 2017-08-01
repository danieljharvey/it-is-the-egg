class Player {
	
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

	constructor(params: object, map: Map, renderer: Renderer, jetpack: Jetpack, collisions: Collisions) {
		for (var i in params) {
			this[i] = params[i];
		}
		this.map = map;
		this.renderer = renderer;
		this.jetpack = jetpack;
		this.collisions = collisions;
	}

	doCalcs() {
		this.setRedrawAroundPlayer();
		this.incrementPlayerFrame();
	    this.checkFloorBelowPlayer();
	    this.incrementPlayerDirection();	
	    this.checkPlayerCollisions();
	}

	setRedrawAroundPlayer() {
		// first just do the stuff around player
		for (var x = this.x - 1; x < this.x + 2; x++) {
			for (var y = this.y - 1; y < this.y + 2; y++) {
				var coords = this.map.correctForOverflow(x,y);
				this.map.board[coords.x][coords.y].needsDraw = true;
			}
		}
	}

	incrementPlayerFrame() {
		if (this.direction===0 && this.oldDirection===0 && this.currentFrame===0) {
			// we are still, as it should be
			return false;
		}
		if (this.direction===0 && this.currentFrame===0) {
			// if we're still, and have returned to main frame, disregard old movement
			this.oldDirection=0;
		}

		// if going left, reduce frame
		if (this.direction < 0 || this.oldDirection < 0) {
			this.currentFrame --;
			if (this.currentFrame <0) this.currentFrame=(this.frames -1);
		}

		// if going left, reduce frame
		if (this.direction > 0 || this.oldDirection > 0) {
			this.currentFrame++;
		    if (this.currentFrame >= this.frames) this.currentFrame = 0;
		}
	}

	checkPlayerTileAction() {

		if (this.offsetX != 0 || this.offsetY != 0) return false;

		var coords: Coords = this.map.correctForOverflow(this.x, this.y);

		var board = this.map.board;

		var tile = board[coords.x][coords.y];

		var collectable = this.map.getTileProperty(tile,'collectable');
		
		if (collectable) {
			var score = collectable * this.multiplier;
			var blankTile = this.map.getTile(1);
			blankTile.needsDraw = true;
			board[coords.x][coords.y] = blankTile;
			this.jetpack.addScore(score);
			return true;
		}

		if (this.falling) {
			var belowCoords = this.map.correctForOverflow(coords.x, coords.y + 1);
			
			var tile = board[belowCoords.x][belowCoords.y];

			if (this.map.tileIsBreakable(tile)) {
				board[belowCoords.x][belowCoords.y] = this.map.getTile(1); // smash block, replace with empty
				return true;
			}
		} 

		var tile = board[coords.x][coords.y];
		var action = this.map.getTileAction(tile);

		if (action=='rotateLeft') {
			this.jetpack.rotateBoard(false);
		} else if (action=='rotateRight') {
			this.jetpack.rotateBoard(true);
		} else if (action=='completeLevel') {
			this.jetpack.completeLevel();
		} else if (action=='teleport') {
			this.teleport();
		}
	}

	checkPlayerCollisions() {
		for (var i in this.jetpack.players) {
			var player = this.jetpack.players[i];
			this.collisions.checkCollision(this, player);	
		}
	}
	
	// find another teleport and go to it
	// if no others, do nothing
	teleport() {
		
	}

	incrementPlayerDirection() {

		if (this.falling) return false;
		/*
		if (this.direction !== 0 && !this.checkTileIsEmpty(this.x - 1, this.y) && !this.checkTileIsEmpty(this.x + 1, this.y)) {
			// trapped
			this.oldDirection = this.direction;
			this.direction = 0;
			return false;
		}*/

		if (this.direction < 0) {
			if (!this.map.checkTileIsEmpty(this.x - 1, this.y)) {
				// turn around
				this.direction = 1;
				this.offsetX = 0;
			} else {
				// move
				this.offsetX-=this.moveSpeed;
			}
		}

		if (this.direction > 0) {
			if (!this.map.checkTileIsEmpty(this.x + 1, this.y)) {
				// turn around
				this.offsetX = 0;
				this.direction = -1;
			} else {
				// move
				this.offsetX+=this.moveSpeed;;
			}
		}

		// if we've stopped and ended up not quite squared up, correct this
		if (this.direction ==0 && this.falling==false) {
			if (this.offsetX > 0) {
				this.offsetX -= this.moveSpeed;
			} else if (this.offSetX < 0) {
				this.offsetX += this.moveSpeed;
			}
		}
		this.checkIfPlayerIsInNewTile();
	}

	checkIfPlayerIsInNewTile() {
		if (this.offsetX > this.renderer.tileSize) {
			this.offsetX = 0;
			this.x ++;
			this.checkPlayerTileAction();
		}
		if (this.offsetX < (-1 * this.renderer.tileSize)) {
			this.offsetX = 0;
			this.x --;
			this.checkPlayerTileAction();
		}
		if (this.offsetY > this.renderer.tileSize) {
			this.offsetY = 0;
			this.y ++;
			this.checkPlayerTileAction();
		}
		if (this.offsetY < (-1 * this.renderer.tileSize)) {
			this.offsetY = 0;
			this.y --;
			this.checkPlayerTileAction();
		}
		// have we gone over the edge?
		var coords = this.map.correctForOverflow(this.x, this.y);
		this.x = coords.x;
		this.y = coords.y;
	}

	checkFloorBelowPlayer() {
		
		if (this.offsetX !== 0) return false;

		var coords = this.map.correctForOverflow(this.x, this.y + 1);

		var tile = this.map.board[coords.x][coords.y];

		if (tile.background) {
			this.falling = true;
			this.offsetY += this.moveSpeed;
		} else if (this.falling && this.map.tileIsBreakable(tile)) {
			this.offsetY += this.moveSpeed;
		} else {
			this.falling = false;
			this.checkPlayerTileAction();
		}

		this.checkIfPlayerIsInNewTile();
	}
}
