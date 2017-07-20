function Renderer(jetpack, map, tiles, playerTypes) {

	var self = this;

	this.construct = function(jetpack:Jetpack, map:Map, tiles: object, playerTypes: object) {
		this.jetpack = jetpack;
		this.map = map;
		this.tiles = tiles;
		this.playerTypes = playerTypes;
		this.loadTilePalette();
		this.loadPlayerPalette();
		this.loadCanvas();
	}

	this.tileSize = 48;

	this.renderAngle = 0;
	this.checkResize = true;
	this.imagesFolder = 'img/';

	this.animationHandle;

	this.canvas; // canvas object
	this.ctx; // canvas context for drawing
	this.tileImages = {}; // image elements of tiles
	this.playerImages = {}; // image element of players

	this.render = function() {
		if (this.jetpack.paused) return false;
		self.sizeCanvas();
		//self.wipeCanvas('rgba(0,0,0,0.02)');
		self.renderBoard();
		self.renderPlayers();	
		self.renderFrontLayerBoard();
		self.jetpack.doPlayerCalcs();
		//self.wipeCanvas('rgba(255,255,0,0.04)');	
		self.animationHandle = window.requestAnimationFrame(self.render);
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

	this.loadPlayerPalette = function() {
		for (var i in this.playerTypes) {
			var playerType = this.playerTypes[i];
			var playerImage = document.createElement('img');
			playerImage.setAttribute('src', this.getTileImagePath(playerType));
			this.playerImages[playerType.img] = playerImage;
		}
	}

	this.getTileImagePath = function(tile:object) {
		return this.imagesFolder + tile.img;
	}

	this.sizeCanvas = function() {
		if (!this.checkResize) return false;
		var maxBoardSize = this.getMaxBoardSize();

		this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + 'px';

		this.tileSize = maxBoardSize / this.map.boardSize.width;
		this.loadCanvas();
		this.map.markAllForRedraw();

		this.checkResize = false; // all done
	}

	this.getMaxBoardSize = function() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		
		var controlHeader = document.getElementById('controlHeader');

		height = height - (controlHeader.offsetHeight * 2);
		width = width - (controlHeader.offsetHeight * 2);

		if (width > height) {
			var difference = (height % this.map.boardSize.width);
			height = height - difference;
			return height;
		} else {
			var difference = (width % this.map.boardSize.width);
			width = width - difference;
			return width;
		}
	}

	this.wipeCanvas = function(fillStyle: string) {
		this.ctx.fillStyle = fillStyle;
		this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
	}

	this.loadCanvas = function() {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = this.map.boardSize.width * this.tileSize;
		this.canvas.height = this.map.boardSize.height * this.tileSize;
	    this.ctx = this.canvas.getContext("2d");
	}

	this.renderBoard = function() {
	    for (var x =0; x < this.map.boardSize.width; x++) {
	    	for (var y =0; y < this.map.boardSize.height; y++) {
	    		var tile = this.map.board[x][y];
	    		
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
	    			this.drawSkyTile(tile,x,y);
	    		}
	    	}
	    }
	}

	this.tileIsFrontLayer = function(tile:object) {
		return this.map.getTileProperty(tile,'frontLayer');
	}

	this.drawSkyTile = function(tile:object, x:number, y:number) {
		var skyTile = this.map.getTile(1);
		var skyTileImage = this.tileImages[skyTile.id];
		this.renderTile(x, y, tile, skyTileImage);
	}

	// just go over and draw the over-the-top stuff
	this.renderFrontLayerBoard = function() {
	    for (var x =0; x < this.map.boardSize.width; x++) {
	    	for (var y =0; y < this.map.boardSize.height; y++) {
	    		var tile = this.map.board[x][y];
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
	this.showUnrenderedTile = function(x:number, y:number) {
		return false;
		this.ctx.fillStyle = '#f00';
		this.ctx.fillRect(x * this.tileSize,y * this.tileSize,this.tileSize,this.tileSize);
	}

	this.renderPlayers = function() {
		for (var i in this.jetpack.players) {
			var player = this.jetpack.players[i];
			this.renderPlayer(player);
		}
	}

	this.renderTile = function(x:number, y:number, tile: object, overwriteImage: object|boolean) {

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
	    
		if (this.renderAngle == 0 || this.getTileProperty(tile,'dontRotate')) {
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

	this.renderPlayer = function(player: Player) {
	 	var left = (player.x * this.tileSize) + player.offsetX;
	    var top = (player.y * this.tileSize) + player.offsetY;

	    var clipLeft = player.currentFrame * 64;
	    var clipTop = 0;

	    this.ctx.globalAlpha = 1;

	    var image = this.playerImages[player.img];

	    this.ctx.drawImage(image, clipLeft, 0, 64, 64, left,top,this.tileSize,this.tileSize);

	    if (left < 0) {
	    	// also draw on right
	    	var secondLeft = (this.tileSize * this.map.boardSize.width) + player.offsetX;
	    	this.ctx.drawImage(image, clipLeft, 0, 64, 64, secondLeft,top,this.tileSize,this.tileSize);
	    }

	    if ((left + this.tileSize) > (this.tileSize * this.map.boardSize.width)) {
	    	// also draw on left
	    	var secondLeft = left - (this.tileSize * this.map.boardSize.width);
	    	this.ctx.drawImage(image, clipLeft, 0, 64, 64, secondLeft,top,this.tileSize,this.tileSize);
	    }
	}


	this.drawRotatingBoard = function(clockwise: boolean, completed: () => void) {

	    var cw=this.canvas.width;
	    var ch=this.canvas.height;

		var savedData = new Image();
	    savedData.src = this.canvas.toDataURL("image/png");

		if (clockwise) {
			this.drawRotated(savedData, 1, 0, 90, completed);
		} else {
			this.drawRotated(savedData, -1, 0,-90, completed);
		}
	}

	this.drawRotated = function(savedData: Image, direction: number, angle: number, targetAngle: number, completed: () => void) {
		if (direction>0) {
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

		var angleInRad = angle * (Math.PI/180);
			
		var offset = this.canvas.width / 2;

		var left = offset;
	    var top = offset;

	    self.wipeCanvas('rgba(0,0,0,0.1)');

	    this.ctx.translate( left, top );
	  	this.ctx.rotate( angleInRad );

	    this.ctx.drawImage(savedData, -offset, -offset);

	    this.ctx.rotate( -angleInRad );
	    this.ctx.translate( -left, -top );

	    angle+= (direction * this.jetpack.moveSpeed);

	    this.animationHandle = window.requestAnimationFrame(function() {
	    	self.drawRotated(savedData, direction,angle,targetAngle, completed)
	    });
	}

	this.construct(jetpack, map, tiles, playerTypes);
}