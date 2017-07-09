
function Jetpack() {
	
	var self = this;

	this.moveSpeed = 6;
	this.renderAngle = 0;
	this.paused = true;

	this.animationHandle;

	this.tiles={
		0: {
			'id':0,
			'title':'Sky',
			'img':'sky.png',
			'background':true,
			'needsDraw':true
		},
		1: {
			'id':1,
			'title':'Water',
			'img':'water.png',
			'background':false,
			'dontAdd':true,
			'needsDraw':true
		},
		2: {
			'id':2,
			'title':'Mud',
			'img':'mud.png',
			'background':false,
			'needsDraw':true
		},
		3: {
			'id':3,
			'title':'Mud Window',
			'img':'mud-window.png',
			'background':true,
			'needsDraw':true,
			'frontLayer':true
		},
		4: {
			'id':4,
			'title':'Cacti',
			'img':'cacti.png',
			'background':true,
			'needsDraw':true,
			'frontLayer':true
		},
		5: {
			'id':5,
			'title':'Plant',
			'img':'plant.png',
			'background':true,
			'needsDraw':true,
			'frontLayer':true
		},
		6: {
			'id':6,
			'title':'Crate',
			'img':'crate.png',
			'background':false,
			'needsDraw':true
		}
	}

	this.playerTypes={
		'egg': {
			'id':'egg',
			'title':"It is of course the egg",
			'img':'egg-sprite.png',
			'frames':18
		}
	}
	
	this.imagesFolder = 'img/';

	this.tileSize = 48;

	this.boardSize = {
		width: 12,
		height: 12
	};

	this.board = [];
	this.players = [];
	this.canvas; // canvas object
	this.ctx; // canvas context for drawing
	this.tileImages = {}; // image elements of tiles

	this.go = function() {
		var board = this.generateRandomBoard();
		this.board = this.addWaterToBoard(board);
		this.loadTilePalette();
		this.loadCanvas();
		this.createPlayers();
	}

	this.startRender = function() {
		if (!this.paused) return false;
		window.cancelAnimationFrame(this.animationHandle);
		this.paused = false;
		this.animationHandle = window.requestAnimationFrame(self.render);

	}

	this.pauseRender = function() {
		this.paused = true;
		window.cancelAnimationFrame(this.animationHandle);
	}

	this.render = function() {
		if (this.paused) return false;
		//self.wipeCanvas('rgba(0,0,0,0.02)');
		self.renderBoard();
		self.renderPlayers();	
		self.renderFrontLayerBoard();
		self.doPlayerCalcs();
		//self.wipeCanvas('rgba(255,255,0,0.04)');	
		self.animationHandle = window.requestAnimationFrame(self.render);
	}

	this.wipeCanvas = function(fillStyle) {
		this.ctx.fillStyle = fillStyle;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
	}

	this.loadCanvas = function() {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = this.boardSize.width * this.tileSize;
		this.canvas.height = this.boardSize.height * this.tileSize;
	    this.ctx = this.canvas.getContext("2d");
	}

	this.renderBoard = function() {
	    for (var x =0; x < this.boardSize.width; x++) {
	    	for (var y =0; y < this.boardSize.height; y++) {
	    		var tile = this.board[x][y];
	    		
	    		if (tile.needsDraw === false) {
	    			this.showUnrenderedTile(x,y);
	    			continue;
	    		}
	    		var frontLayer = this.tileIsFrontLayer(tile);
	    		if (!frontLayer) {
	    			if (this.renderTile(x,y,tile,false)) {
		    			tile.needsDraw = false;
					    tile.drawnBefore = true;	
					}
	    		} else {
	    			// render sky behind see through tiles
	    			var skyTileImage = this.tileImages[0];
	    			this.renderTile(x, y, tile, skyTileImage);
	    		}
	    	}
	    }
	}

	// just go over and draw the over-the-top stuff
	this.renderFrontLayerBoard = function() {
	    for (var x =0; x < this.boardSize.width; x++) {
	    	for (var y =0; y < this.boardSize.height; y++) {
	    		var tile = this.board[x][y];
	    		if (tile.needsDraw === false) continue;
	    		if (this.tileIsFrontLayer(tile)) {
	    			if (this.renderTile(x,y,tile,false)) {
	    				tile.needsDraw = false;
					    tile.drawnBefore = true;	
	    			}		
	    		}
	    	}
	    }
	}
 	// debugging tools
	this.showUnrenderedTile = function(x,y) {
		return false;
		this.ctx.fillStyle = '#f00';
		this.ctx.fillRect(x * this.tileSize,y * this.tileSize,this.tileSize,this.tileSize);
	}

	this.tileIsFrontLayer = function(tile) {
		if (tile.hasOwnProperty('frontLayer') && tile.frontLayer) {
			return true;
		} 
		return false;
	}

	this.renderPlayers = function() {
		for (var i in this.players) {
			this.renderPlayer(this.players[i]);
		}
	}

	this.renderTile = function(x,y,tile, overwriteImage) {

	    if (overwriteImage) {
	    	var img = overwriteImage;
	    } else {
	    	var img = this.tileImages[tile.id];	
	    }
	    
	    if (!img) {
	    	console.log("Could not find tile image for id "+tile.id);
	    	return false;
	    }

	    var left = x * this.tileSize;
	    var top = y * this.tileSize;
	    var opacity = 1;

	    this.ctx.globalAlpha = opacity;
	    
	    
	
		if (this.renderAngle == 0) {
			this.ctx.drawImage(img,left,top,this.tileSize,this.tileSize);
		} else {

			var angleInRad = this.renderAngle * (Math.PI/180);
			
			var offset = this.tileSize / 2;

			left = left + offset;
		    top = top + offset;

		    this.ctx.translate( left, top );
		  	this.ctx.rotate( angleInRad );

		    this.ctx.drawImage(img, -offset, -offset, this.tileSize,this.tileSize);

		    this.ctx.rotate( -angleInRad );
		    this.ctx.translate( -left, -top );
		}    
	    
	    return true;
	}

	this.renderPlayer = function(player) {
	 	var left = (player.x * this.tileSize) + player.offsetX;
	    var top = (player.y * this.tileSize) + player.offsetY;

	    var clipLeft = player.currentFrame * 64;
	    var clipTop = 0;

	    this.ctx.globalAlpha = 1;
	    this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, left,top,this.tileSize,this.tileSize);

	    if (left < 0) {
	    	// also draw on right
	    	var secondLeft = (this.tileSize * this.boardSize.width) + player.offsetX;
	    	this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, secondLeft,top,this.tileSize,this.tileSize);
	    }

	    if ((left + this.tileSize) > (this.tileSize * this.boardSize.width)) {
	    	// also draw on left
	    	var secondLeft = left - (this.tileSize * this.boardSize.width);
	    	this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, secondLeft,top,this.tileSize,this.tileSize);
	    }

	    
	}

	this.doPlayerCalcs = function() {
		for (var i in this.players) {
			var player = this.players[i]
			this.setRedrawAroundPlayer(player);
			this.incrementPlayerFrame(player);
		    this.checkFloorBelowPlayer(player);
		    this.incrementPlayerDirection(player);	
		}
	}

	// also need to do other side of screen if on edge
	this.setRedrawAroundPlayer = function(player) {
		// first just do the stuff around player
		for (var x = player.x - 1; x < player.x + 2; x++) {
			for (var y = player.y - 1; y < player.y + 2; y++) {
				var coords = this.correctForOverflow(x,y);
				this.board[coords.x][coords.y].needsDraw = true;
			}
		}
	}

	this.correctForOverflow = function(x,y) {
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
		return {'x':newX,'y':newY};
	}

	this.incrementPlayerFrame = function(player) {
		if (player.direction===0 && player.oldDirection===0 && player.currentFrame===0) {
			// we are still, as it should be
			return false;
		}
		if (player.direction===0 && player.currentFrame===0) {
			// if we're still, and have returned to main frame, disregard old movement
			player.oldDirection=0;
		}

		// if going left, reduce frame
		if (player.direction < 0 || player.oldDirection < 0) {
			player.currentFrame --;
			if (player.currentFrame <0) player.currentFrame=(player.frames -1);
		}

		// if going left, reduce frame
		if (player.direction > 0 || player.oldDirection > 0) {
			player.currentFrame++;
		    if (player.currentFrame >= player.frames) player.currentFrame = 0;
		}

	}

	this.checkFloorBelowPlayer = function(player) {
		var y = player.y + 1;
		if (y >= this.boardSize.height) y = 0;

		var tile = this.board[player.x][y];
		if (tile.background) {
			player.falling = true;
			player.offsetY += this.moveSpeed;
		} else {
			player.falling = false;
		}
		this.checkIfPlayerIsInNewTile(player);
	}

	// is intended next tile empty / a wall?
	this.checkTileIsEmpty = function(x,y) {
		//var x = player.x + player.direction;
		if (x >= this.boardSize.width) {
			x = 0; // wrap around
		}

		if (x < 0) {
			x = this.boardSize.width - 1; // wrap around
		}

		var tile = this.board[x][y];

		return tile.background;
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
		this.checkIfPlayerIsInNewTile(player);
	}

	this.checkIfPlayerIsInNewTile = function(player) {
		if (player.offsetX > this.tileSize) {
			player.offsetX = 0;
			player.x ++;
			if (player.x >= this.boardSize.width) {
				player.x = 0; // wrap around
			}
		}
		if (player.offsetX < (-1 * this.tileSize)) {
			player.offsetX = 0;
			player.x --;
			if (player.x < 0) {
				player.x = this.boardSize.width - 1; // wrap around
			}
		}
		if (player.offsetY > this.tileSize) {
			player.offsetY = 0;
			player.y ++;
			if (player.y >= this.boardSize.height) {
				player.y = 0; // wrap around
			}
		}
		if (player.offsetY < (-1 * this.tileSize)) {
			player.offsetY = 0;
			player.y --;
			if (player.y < 0) {
				player.y = this.boardSize.height - 1; // wrap around
			}
		}
	}

	this.generateRandomBoard = function() {
		var board=[];
		for (var x =0; x < this.boardSize.width; x++) {
			board[x]=[];
			for (var y = 0; y < this.boardSize.height; y++) {
				var randomTile = this.getRandomTile(this.tiles);
				board[x][y] = randomTile;
			}
		}
		return board;
	}

	this.addWaterToBoard = function(board) {
		return board; // don't do this for now

		var bottomRow = this.boardSize.height - 1; // compensate for beginning at zero
		for (var x = 0; x < this.boardSize.width; x++) {
			var waterTile = this.getTile(1);
			board[x][bottomRow] = waterTile;
		}
		return board;
	}

	this.getTile = function(id) {
		var tile = JSON.parse(JSON.stringify(this.tiles[id])); // create copy of object so we're not changing original
		return tile;
	}

	this.getRandomTile = function(tiles) {
		var randomProperty = function (obj) {
		    var keys = Object.keys(obj);
		    var randomKey = keys[ keys.length * Math.random() << 0];
		    return self.getTile(randomKey);
		};

		var theseTiles = JSON.parse(JSON.stringify(tiles));
		// remove unwanted tiles
		for (var i in theseTiles) {
			if (theseTiles[i].hasOwnProperty('dontAdd')) {
		    	delete theseTiles[i];
		    }
		}
		return randomProperty(theseTiles);
	}

	this.getTileImagePath = function(tile) {
		return this.imagesFolder + tile.img;
	}

	this.loadTilePalette = function() {
		for (var i in this.tiles) {
			var thisTile = this.tiles[i];
			var tileImage = document.createElement("img");
			tileImage.setAttribute('src', this.getTileImagePath(thisTile));
			tileImage.setAttribute('width', 64);
			tileImage.setAttribute('height', 64);
			this.tileImages[thisTile.id] = tileImage;
		}
	}

	this.createPlayers = function() {
		var x = parseInt(Math.random() * this.boardSize.width) - 1;
		var y = parseInt(Math.random() * this.boardSize.height) - 2;
		if (x<0) x = 0;
		if (y<0) y = 0;
		var player = this.createNewPlayer(this.playerTypes['egg'],x,y);
		this.players=[player];
	}

	// create player and load their sprite
	this.createNewPlayer = function(playerType, startX, startY) {
		var player = JSON.parse(JSON.stringify(playerType));
		player.currentFrame = 0;
		player.x = startX; // x in tiles
		player.y = startY; // y in tiles
		player.direction = 1;
		player.oldDirection = 0;
		player.falling = false; // can't move when falling
		player.offsetX = 0;
		player.offsetY = 0;
		player.image = document.createElement("img");
		player.image.setAttribute('src', this.getTileImagePath(player));
		return player;
	}

	this.getBlankBoard = function() {
		var newBoard=[];
		for (var x =0; x < this.boardSize.width; x++) {
			newBoard[x]=[];
			for (var y = 0; y < this.boardSize.height; y++) {
				newBoard[x][y] = [];
			}
		}
		return newBoard;
	}

	// make this actually fucking rotate, and choose direction, and do the visual effect thing
	this.rotateBoard = function(clockwise) {
		
		self.pauseRender();

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
		
		for (var i in this.players) {
			this.rotatePlayer(this.players[i], clockwise);
		}

		this.drawRotatingBoard(clockwise);

		return newBoard;
	}

	this.translateRotation = function(x,y,clockwise) {
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

	this.rotatePlayer = function(player, clockwise) {
		
		var coords = this.translateRotation(player.x, player.y, clockwise);
		
		player.x = coords.x;
		player.y = coords.y;
		player.offsetX = 0; //offsetX;
		player.offsetY = 0; //offsetY;
	}

	this.drawRotatingBoard = function(clockwise) {

		console.log('drawRotatingBoard');

	    var cw=this.canvas.width;
	    var ch=this.canvas.height;
	    /*
		// create backing canvas
		var backCanvas = document.createElement('canvas');
		backCanvas.width = this.canvas.width;
		backCanvas.height = this.canvas.height;
		var backCtx = backCanvas.getContext('2d');
		*/

		var savedData = new Image();
	    savedData.src = this.canvas.toDataURL("image/png");

		if (clockwise) {
			this.drawRotated(savedData, 1, 0, 90);
		} else {
			this.drawRotated(savedData, -1, 0,-90);
		}
		
	}

	this.drawRotated = function(savedData, direction, angle, targetAngle) {
		if (direction>0) {
			if (angle >= targetAngle) {
				self.startRender();	
				console.log('startRender');
				return false;
			}
		} else {
			if (angle <= targetAngle) {
				self.startRender();	
				console.log('startRender');
				return false;
			}
		}

		console.log(savedData, angle, targetAngle, direction);

		var angleInRad = angle * (Math.PI/180);
			
		var offset = this.canvas.width / 2;

		var left = offset;
	    var top = offset;

	    self.wipeCanvas('rgba(0,0,0,1)');

	    this.ctx.translate( left, top );
	  	this.ctx.rotate( angleInRad );

	  	console.log(angleInRad);

	    this.ctx.drawImage(savedData, -offset, -offset);

	    this.ctx.rotate( -angleInRad );
	    this.ctx.translate( -left, -top );

	    angle+= (direction * this.moveSpeed);

	    this.animationHandle = window.requestAnimationFrame(function() {
	    	self.drawRotated(savedData, direction,angle,targetAngle)
	    });
	}	
}