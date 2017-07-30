class Jetpack {

	paused: boolean = true;
	editMode: boolean = false;

	moveSpeed: number = 7;

	levelID: number = 1;

	map: Map; // Map object
	renderer: Renderer; // Renderer object
	collisions: Collisions; // Collisions object
	levels: Levels; // Levels object

	nextPlayerID: number = 1;
	score: number = 0;
	collectable: number = 0; // total points on screen

	playerTypes: object ={
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

	players: Player[];

	go() {
		this.bootstrap();
		this.bindSizeHandler();
		this.bindClickHandler();
		
		this.pauseRender();
		this.renderer.renderTitleScreen(() => {
			this.loadLevel(this.levelID, () => {
				this.createPlayers();
				this.resetScore();
				this.startRender();	
			});	
		});
	}

	// go function but for edit mode
	edit() {
		this.bootstrap();
		this.levels.getLevelList();
		this.editMode = true;
		this.bindSizeHandler();
		this.bindClickHandler();
		var s = setTimeout(() => {
			this.startRender();
		},1000);
	}

	bootstrap() {
		var tileSet = new TileSet();
		var tiles = tileSet.getTiles();

		this.map = new Map(tiles);

		this.renderer = new Renderer(this, this.map, tiles, this.playerTypes);

		this.collisions = new Collisions(this);
		
		var apiLocation = 'http://' + window.location.hostname + '/levels/';
		
		var loader: Loader = new Loader(apiLocation);
		
		this.levels = new Levels(this, loader);
	}

	startRender() {
		if (!this.paused) return false;
		window.cancelAnimationFrame(this.animationHandle);
		this.map.markAllForRedraw();
		this.paused = false;
		this.animationHandle = window.requestAnimationFrame(() => this.renderer.render());
	}

	resetScore(score) {
		this.score = 0;
		this.addScore(0);
	}

	addScore(amount) {
		this.score += amount;
		var scoreElement = document.getElementById('score');
		if (scoreElement) {
			scoreElement.innerHTML = this.score;
		}
	}

	// or at least try
	completeLevel() {
		this.collectable = this.getCollectable();
		var playerCount: number = this.countPlayers();
		if (this.collectable < 1 && playerCount < 2) {
			this.nextLevel();
		}
	}

	nextLevel() {
		this.levelID ++;
		this.go();
	}

	pauseRender() {
		this.paused = true;
		window.cancelAnimationFrame(this.animationHandle);
	}

	doPlayerCalcs() {
		for (var i in this.players) {
			var player: Player = this.players[i]
			player.doCalcs();
		}
	}

	countPlayers() : number {
		var count: number = 0;
		for (var i in this.players) {
			if (this.players[i]) count++;
		}
		return count;
	}

	// cycle through all map tiles, find egg cups etc and create players
	createPlayers() {
		this.destroyPlayers();
		var tiles = this.map.getAllTiles();
		tiles.map((tile) => {
			var type = this.map.getTileProperty(tile,'createPlayer');
			if (type) {
				var coords = new Coords(tile.x, tile.y);
				this.createNewPlayer(type, coords, 1);
			}
		});
	}

	destroyPlayers() {
		this.players = [];
	}

	// cycle through all map tiles, find egg cups etc and create players
	getCollectable() {
		var collectable = 0;
		var tiles = this.map.getAllTiles();
		tiles.map((tile) => {
			var score = this.map.getTileProperty(tile,'collectable');
			if (score > 0) {
				collectable += score;
			}
		});
		return collectable;
	}

	deletePlayer(player:Player) {
		delete this.players[player.id];
	}

	// create player and load their sprite
	createNewPlayer(type: string, coords: Coords, direction:number) : Player {
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
		params.moveSpeed = this.moveSpeed;
		var player = new Player(params, this.map, this.renderer, this, this.collisions);
		this.players[player.id] = player;
		return player;
	}

	// make this actually fucking rotate, and choose direction, and do the visual effect thing
	rotateBoard(clockwise) {
		
		this.pauseRender();

		this.map.rotateBoard(clockwise);

		for (var i in this.players) {
			this.map.rotatePlayer(this.players[i], clockwise);
		}

		this.renderer.drawRotatingBoard(clockwise, () => {
			this.startRender();
		});

		return true;
	}

	revertEditMessage() {
		var s = setTimeout(function() {
			var message = document.getElementById('message');
			message.innerHTML="EDIT MODE";
		},3000);
	}

	showEditMessage(text) {
		if (!this.editMode) return false;
		var message = document.getElementById('message');
		message.innerHTML = text;
		this.revertEditMessage();
	}

	saveLevel() {
		this.levels.saveLevel(this.map.board, this.map.boardSize, this.levels.levelID, (levelID) => {
			var text = "Level " + levelID + " saved";
			this.showEditMessage(text);
		});
	}

	loadLevelFromList() {
		var select = document.getElementById('levelList');
        var index = select.selectedIndex;
        var levelID = select.options[index].value;
    	this.loadLevel(levelID, function() {
    		console.log('loaded!');
    	});        
	}

	loadLevel(levelID, callback) {
		this.levels.loadLevel(levelID, (data) => {
			var text = "Level " + data.levelID + " loaded!";
			this.showEditMessage(text);
			this.map.updateBoard(data.board, data.boardSize);
			callback();
		},() => {
			this.map.board = this.map.generateRandomBoard();
			callback();
		})
	}

	bindSizeHandler() {
		window.addEventListener('resize', () => {
			this.renderer.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
		});
	}

	bindClickHandler() {
		var canvas = document.getElementById('canvas');
		canvas.addEventListener('click', (event) => {
		    var tileSize = this.renderer.tileSize;
		    var coords = {
		    	x: parseInt(event.offsetX / tileSize),
	        	y: parseInt(event.offsetY / tileSize),
	        	offsetX: (event.offsetX % tileSize) - (tileSize / 2),
	        	offsetY: (event.offsetY % tileSize) - (tileSize / 2)
	        }
	        this.handleClick(coords);
	    });
	}

	// coords is always x,y,offsetX, offsetY
	handleClick(coords) {
		if (this.editMode) {
			this.map.cycleTile(coords.x,coords.y);	
		} else {
			// destroy tile or something
		}
	}

	
}