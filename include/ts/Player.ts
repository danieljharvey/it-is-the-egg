function Player(params: object, map: Map) {
	
	var self = this;

	this.construct = function(params: object, map: Map) {
		for (var i in params) {
			this[i] = params[i];
		}
		this.map = map;
	}

	this.doCalcs = function() {
		this.setRedrawAroundPlayer();
		this.incrementPlayerFrame();
	    //this.checkFloorBelowPlayer(player);
	    //this.incrementPlayerDirection(player);	
	    //this.checkPlayerCollisions(player);
	}

	this.setRedrawAroundPlayer = function() {
		// first just do the stuff around player
		for (var x = this.x - 1; x < this.x + 2; x++) {
			for (var y = this.y - 1; y < this.y + 2; y++) {
				var coords = this.map.correctForOverflow(x,y);
				this.map.board[coords.x][coords.y].needsDraw = true;
			}
		}
	}

	this.incrementPlayerFrame = function() {
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

	this.checkPlayerTileAction = function() {
		if (this.offsetX != 0 || this.offsetY != 0) return false;

		var board = this.map.board;

		var tile = board[this.x][this.y];
		var collectable = this.map.getTileProperty(tile,'collectable');
		if (collectable) {
			var score = collectable * this.multiplier;
			this.addScore(score);
			var blankTile = this.map.getTile(1);
			blankTile.needsDraw = true;
			board[this.x][this.y] = blankTile;
		}

		if (this.falling) {
			var coords=this.map.correctForOverflow(this.x, this.y + 1);
			
			var tile = board[coords.x][coords.y];

			if (this.tileIsBreakable(tile)) {
				board[coords.x][coords.y] = this.map.getTile(1); // smash block, replace with empty
			}
		} else {
			var tile = board[this.x][this.y];
			var action = this.map.getTileAction(tile);
			
			if (action=='rotateLeft') {
				this.map.rotateBoard(false);
			} else if (action=='rotateRight') {
				this.map.rotateBoard(true);
			}
		}
	}

	this.checkPlayerCollisions = function(player) {
		for (var i in this.players) {
			var player2 = this.players[i];
			if (player.id !== player2.id) {
				this.checkCollision(player, player2);	
			}
		}
	}

	this.incrementPlayerDirection = function(player) {

		if (player.falling) return false;
		/*
		if (player.direction !== 0 && !this.checkTileIsEmpty(player.x - 1, player.y) && !this.checkTileIsEmpty(player.x + 1, player.y)) {
			// trapped
			player.oldDirection = player.direction;
			player.direction = 0;
			return false;
		}*/

		if (player.direction < 0) {
			if (!this.checkTileIsEmpty(player.x - 1, player.y)) {
				// turn around
				player.direction = 1;
			} else {
				// move
				player.offsetX-=this.moveSpeed;;
			}
		}

		if (player.direction > 0) {
			if (!this.checkTileIsEmpty(player.x + 1, player.y)) {
				// turn around
				player.direction = -1;
			} else {
				// move
				player.offsetX+=this.moveSpeed;;
			}
		}

		// if we've stopped and ended up not quite squared up, correct this
		if (player.direction ==0 && player.falling==false) {
			if (player.offsetX > 0) {
				player.offsetX -= this.moveSpeed;
			} else if (player.offSetX < 0) {
				player.offsetX += this.moveSpeed;
			}
		}
		this.checkIfPlayerIsInNewTile(player);
	}

	this.checkIfPlayerIsInNewTile = function(player) {
		if (player.offsetX > this.tileSize) {
			player.offsetX = 0;
			this.checkPlayerTileAction(player);
			player.x ++;
			if (player.x >= this.boardSize.width) {
				player.x = 0; // wrap around
			}
		}
		if (player.offsetX < (-1 * this.tileSize)) {
			player.offsetX = 0;
			this.checkPlayerTileAction(player);
			player.x --;
			if (player.x < 0) {
				player.x = this.boardSize.width - 1; // wrap around
			}
		}
		if (player.offsetY > this.tileSize) {
			player.offsetY = 0;
			this.checkPlayerTileAction(player);
			player.y ++;
			if (player.y >= this.boardSize.height) {
				player.y = 0; // wrap around
			}
		}
		if (player.offsetY < (-1 * this.tileSize)) {
			player.offsetY = 0;
			this.checkPlayerTileAction(player);
			player.y --;
			if (player.y < 0) {
				player.y = this.boardSize.height - 1; // wrap around
			}
		}
	}

		this.checkFloorBelowPlayer = function(player) {
		
		if (player.offsetX !== 0) return false;

		var coords = this.correctForOverflow(player.x, player.y + 1);

		var tile = this.board[coords.x][coords.y];

		if (tile.background) {
			player.falling = true;
			player.offsetY += this.moveSpeed;
		} else if (player.falling && this.tileIsBreakable(tile)) {
			player.offsetY += this.moveSpeed;
		} else {
			player.falling = false;
			this.checkPlayerTileAction(player);
		}

		this.checkIfPlayerIsInNewTile(player);
	}

	

	

	this.construct(params, map);

}