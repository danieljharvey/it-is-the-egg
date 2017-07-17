function Jetpack() {
	
	var self = this;

	this.paused = true;
	
	this.map; // Map object
	this.renderer; // Renderer object

	this.nextPlayerID = 1;
	this.score = 0;	

	this.playerTypes={
		'egg': {
			'type':'egg',
			'title':"It is of course the egg",
			'img':'egg-sprite.png',
			'frames':18,
			'multiplier':1
		},
		'red-egg': {
			'type':'red-egg',
			'title':"It is of course the red egg",
			'img':'egg-sprite-red.png',
			'frames':18,
			'multiplier':2
		},
		'blue-egg': {
			'type':'blue-egg',
			'title':"It is of course the blue egg",
			'img':'egg-sprite-blue.png',
			'frames':18,
			'multiplier':5
		},
		'yellow-egg': {
			'type':'yellow-egg',
			'title':"It is of course the yellow egg",
			'img':'egg-sprite-yellow.png',
			'frames':18,
			'multiplier':10
		}
	}
	
	

	this.players = [];

	this.go = function() {
		var tileSet = new TileSet();
		var tiles = tileSet.getTiles();

		this.map = new Map(tiles);

		this.renderer = new Renderer(this, this.map, tiles);

		this.bindSizeHandler();
		this.bindClickHandler();
		
		this.createPlayers();
		
		this.resetScore();
		var s = setTimeout(function() {
			self.startRender();
		},1000);
	}

	this.startRender = function() {
		if (!this.paused) return false;
		window.cancelAnimationFrame(this.animationHandle);
		this.map.markAllForRedraw();
		this.paused = false;
		this.animationHandle = window.requestAnimationFrame(self.renderer.render);
	}

	this.resetScore = function(score) {
		this.score = 0;
		this.addScore(0);
	}

	this.addScore = function(amount) {
		this.score += amount;
		var scoreElement = document.getElementById('score');
		scoreElement.innerHTML = this.score;
	}



	this.pauseRender = function() {
		this.paused = true;
		window.cancelAnimationFrame(this.animationHandle);
	}

	

	this.doPlayerCalcs = function() {
		for (var i in this.players) {
			var player = this.players[i]
			player.doCalcs();
		}
	}

	this.combinePlayers = function(player1, player2) {
		delete this.players[player1.id];
		delete this.players[player2.id];
		
		if (player1.type=='egg' && player2.type=='egg') {
			var type='red-egg';
			var coords={
				'x':player2.x,
				'y':player2.y,
				'offsetX':player2.offsetX,
				'offsetY':player2.offsetY
			}
			var newPlayer = this.createNewPlayer(type, coords, player2.direction);	
			this.players[newPlayer.id] = newPlayer;
		} else if (player1.type=='egg' && player2.type=='red-egg') {
			var type='blue-egg';
			var coords={
				'x':player2.x,
				'y':player2.y,
				'offsetX':player2.offsetX,
				'offsetY':player2.offsetY
			}
			var newPlayer = this.createNewPlayer(type, coords, player2.direction);	
			this.players[newPlayer.id] = newPlayer;
		} else if (player1.type=='red-egg' && player2.type=='egg') {
			var type='blue-egg';
			var coords={
				'x':player1.x,
				'y':player1.y,
				'offsetX':player1.offsetX,
				'offsetY':player1.offsetY
			}
			var newPlayer = this.createNewPlayer(type, coords, player1.direction);	
			this.players[newPlayer.id] = newPlayer;
		}
	}

	// only deal with horizontal collisions for now
	this.checkCollision = function(player1, player2) {
		
		if (!player1 || !player2) return false;

		if (player1.x == player2.x && player1.y == player2.y) {
			if (player1.offsetX==0 && player1.offsetY == 0 && player2.offsetX ==0 && player2.offsetY == 0) {
				if (player1.falling || player2.falling) {
					this.combinePlayers(player1, player2);
					return false;
				}
			}
		}

		if (player1.y != player2.y) return false;

		// horizontal collisions

		if (player1.x == player2.x) {
			if (player1.offsetX == 0 && player2.offsetX == 0) {
				this.combinePlayers(player1,player2);
				return false;
			}
		}

		if (player1.offsetX > 0) { // heading right
			if (player1.x + 1 == player2.x && player2.offsetX < 0) {
				this.combinePlayers(player1,player2);
				return false;
				//player1.direction = -1; // flip direction
				//player2.direction = 1; // flip direction
			}
		} else if (player1.offsetX < 0) { // heading left
			if (player1.x - 1 == player2.x && player2.offsetX > 0) {
				this.combinePlayers(player1,player2);
				return false;
				//player1.direction = 1; // flip direction
				//player2.direction = -1; // flip direction
			}
		}
	}



	this.createPlayers = function() {
		for (var i = 0; i < 3; i++) {
			var x = parseInt(Math.random() * this.map.boardSize.width) - 1;
			var y = parseInt(Math.random() * this.map.boardSize.height) - 2;
			if (x<0) x = 0;
			if (y<0) y = 0;
			var type = 'egg';
			var coords = {
				'x':x,
				'y':y,
				'offsetX':0,
				'offsetY':0
			}
			var player = this.createNewPlayer(type, coords, 1);	
			this.players[player.id] = player;
		}
	}

	// create player and load their sprite
	this.createNewPlayer = function(type, coords, direction) {
		var playerType = this.playerTypes[type];
		var params = JSON.parse(JSON.stringify(playerType));
		params.id = this.nextPlayerID++;
		params.currentFrame = 0;
		params.x = coords.x; // x in tiles
		params.y = coords.y; // y in tiles
		params.direction = direction;
		params.oldDirection = 0;
		params.falling = false; // can't move when falling
		params.offsetX = coords.offsetX;
		params.offsetY = coords.offsetY;
		params.image = document.createElement("img");
		params.image.setAttribute('src', this.renderer.getTileImagePath(params));
		var player = new Player(params, this.map);
		console.log(player);
		return player;
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

	this.rotatePlayer = function(player, clockwise) {
		
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

	this.drawRotatingBoard = function(clockwise) {

	    var cw=this.canvas.width;
	    var ch=this.canvas.height;

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
				return false;
			}
		} else {
			if (angle <= targetAngle) {
				self.startRender();	
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

	    angle+= (direction * this.moveSpeed);

	    this.animationHandle = window.requestAnimationFrame(function() {
	    	self.drawRotated(savedData, direction,angle,targetAngle)
	    });
	}

	this.bindSizeHandler = function() {
		window.addEventListener('resize', function() {
			self.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
		});
	}

	this.bindClickHandler = function() {
		var canvas = document.getElementById('canvas');
		canvas.addEventListener('click', function(event) {
		    var coords = {
		    	x: parseInt(event.offsetX / self.tileSize),
	        	y: parseInt(event.offsetY / self.tileSize),
	        	offsetX: (event.offsetX % self.tileSize) - (self.tileSize / 2),
	        	offsetY: (event.offsetY % self.tileSize) - (self.tileSize / 2)
	        }
	        self.handleClick(coords);
	    });
	}

	// coords is always x,y,offsetX, offsetY
	this.handleClick = function(coords) {
		this.cycleTile(coords.x,coords.y);
	}

	this.cycleTile = function(x,y) {
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