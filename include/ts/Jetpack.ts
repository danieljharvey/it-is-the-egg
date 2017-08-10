import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Levels } from "./Levels";
import { Loader } from "./Loader";
import { Map } from "./Map";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";
import { Renderer } from "./Renderer";
import { TileSet } from "./TileSet";
import { BoardSize } from "./BoardSize";

export class Jetpack {

	paused: boolean = true;
	editMode: boolean = false;

	moveSpeed: number = 15;

	levelID: number = 1;

	map: Map; // Map object
	renderer: Renderer; // Renderer object
	collisions: Collisions; // Collisions object
	levels: Levels; // Levels object
	tileSet: TileSet; // TileSet object
	boardSize: BoardSize; // BoardSize object

	nextPlayerID: number = 1;
	score: number = 0;
	collectable: number = 0; // total points on screen

	playerTypes: object = {};

	players: Player[];

	defaultBoardSize: number = 20;

	go() {
		this.bootstrap();
		this.bindSizeHandler();
		this.bindClickHandler();
		this.bindKeyboardHandler();

		this.pauseRender();
		this.renderer.renderTitleScreen(() => {
			this.loadLevel(this.levelID, () => {
				this.createPlayers();
				this.resetScore(0);
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
		const s = setTimeout(() => {
			this.startRender();
		}, 1000);
	}

	// load static stuff - map/renderer etc will be worked out later
	bootstrap() {
		this.tileSet = new TileSet();
	
		const playerTypes = new PlayerTypes();
		this.playerTypes = playerTypes.getPlayerTypes();

		this.collisions = new Collisions(this, this.playerTypes); // pass the data, not the object

		const apiLocation = "http://" + window.location.hostname + "/levels/";

		const loader: Loader = new Loader(apiLocation);

		this.levels = new Levels(this, loader);
	}

	// with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
	createRenderer(board = [], size: number = 12) {
		this.boardSize = new BoardSize(size);
		this.map = new Map(this.tileSet, this.boardSize, board);

		const tiles = this.tileSet.getTiles();
		this.renderer = new Renderer(this, this.map, tiles, this.playerTypes, this.boardSize);
	}	

	startRender() {
		if (!this.paused) return false;
		window.cancelAnimationFrame(this.animationHandle);
		this.map.markAllForRedraw();
		this.paused = false;
		this.showControls();
		this.animationHandle = window.requestAnimationFrame(() => this.renderer.render());
	}

	resetScore(score) {
		this.score = 0;
		this.addScore(0);
	}

	addScore(amount) {
		this.score += amount;
		const scoreElement = document.getElementById("score");
		if (scoreElement) {
			scoreElement.innerHTML = this.score.toString();
		}
	}

	// or at least try
	completeLevel() {
		this.collectable = this.getCollectable();
		const playerCount: number = this.countPlayers();
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
		this.hideControls();
		window.cancelAnimationFrame(this.animationHandle);
	}

	showControls() {
		const controlHeader = document.getElementById('controlHeader');
		if (controlHeader.classList.contains('hidden')) {
			controlHeader.classList.remove('hidden');
		}
	}

	hideControls() {
		const controlHeader = document.getElementById('controlHeader');
		if (!controlHeader.classList.contains('hidden')) {
			controlHeader.classList.add('hidden');
		}
	}

	doPlayerCalcs() {
		for (const i in this.players) {
			const player: Player = this.players[i];
			player.doCalcs();
		}
	}

	countPlayers(): number {
		let count: number = 0;
		for (const i in this.players) {
			if (this.players[i]) count++;
		}
		return count;
	}

	// cycle through all map tiles, find egg cups etc and create players
	createPlayers() {
		this.destroyPlayers();
		const tiles = this.map.getAllTiles();
		tiles.map((tile) => {
			const type = tile.createPlayer;
			if (type) {
				const coords = new Coords(tile.x, tile.y);
				this.createNewPlayer(type, coords, 1);
			}
		});
	}

	destroyPlayers() {
		this.players = [];
	}

	// cycle through all map tiles, find egg cups etc and create players
	getCollectable() {
		let collectable = 0;
		const tiles = this.map.getAllTiles();
		tiles.map((tile) => {
			const score = tile.collectable;
			if (score > 0) {
				collectable += score;
			}
		});
		return collectable;
	}

	deletePlayer(player: Player) {
		delete this.players[player.id];
	}

	// create player and load their sprite
	createNewPlayer(type: string, coords: Coords, direction: number): Player {
		const playerType = this.playerTypes[type];
		const params = JSON.parse(JSON.stringify(playerType));
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
		const player = new Player(params, this.map, this.renderer, this, this.collisions);
		this.players[player.id] = player;
		return player;
	}

	// make this actually fucking rotate, and choose direction, and do the visual effect thing
	rotateBoard(clockwise) {
		if (this.paused || this.editMode) return false;
		this.pauseRender();

		this.map.rotateBoard(clockwise);

		for (const i in this.players) {
			this.map.rotatePlayer(this.players[i], clockwise);
		}

		this.renderer.drawRotatingBoard(clockwise, () => {
			this.startRender();
		});

		return true;
	}

	revertEditMessage() {
		const s = setTimeout(function() {
			const message = document.getElementById("message");
			message.innerHTML = "EDIT MODE";
		}, 3000);
	}

	showEditMessage(text) {
		if (!this.editMode) return false;
		const message = document.getElementById("message");
		message.innerHTML = text;
		this.revertEditMessage();
	}

	saveLevel() {
		this.levels.saveLevel(this.map.board, this.map.boardSize, this.levels.levelID, (levelID) => {
			const text = "Level " + levelID + " saved";
			this.showEditMessage(text);
		});
	}

	loadLevelFromList() {
		const select = document.getElementById("levelList");
  		const index = select.selectedIndex;
  		const levelID = select.options[index].value;
  		this.loadLevel(levelID, function() {
    		console.log("loaded!");
    	});
	}

	loadLevel(levelID, callback) {
		this.levels.loadLevel(levelID, (data) => {
			const text = "Level " + data.levelID + " loaded!";
			this.showEditMessage(text);
			this.createRenderer(data.board, data.boardSize.width);
			callback();
		}, () => {
			this.createRenderer();
			this.map.board = this.generateRandomBoard();
			callback();
		});
	}

	generateRandomBoard() {
		this.map.board = this.map.generateRandomBoard();
		return this.map.board;
	}

	growBoard() {
		if (!this.editMode) return false;
		this.map.growBoard();
	}

	shrinkBoard() {
		if (!this.editMode) return false;
		this.map.shrinkBoard();
	}

	bindSizeHandler() {
		window.addEventListener("resize", () => {
			this.renderer.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
		});
	}

	bindClickHandler() {
		const canvas = document.getElementById("canvas");
		canvas.addEventListener("click", (event) => {
		    const tileSize = this.renderer.tileSize;
		    const coords = new Coords(
		    	(event.offsetX / tileSize) as number,
	        	(event.offsetY / tileSize) as number,
	        	(event.offsetX % tileSize) - (tileSize / 2),
	        	(event.offsetY % tileSize) - (tileSize / 2),
	        );
	     this.handleClick(coords);
	    });
	}

	bindKeyboardHandler() {
		window.addEventListener("keydown", (event) => {
			if (event.keyCode == "37") {
				this.rotateBoard(false);
			}

			if (event.keyCode == "39") {
				this.rotateBoard(true);
			}
		});
	}

	// coords is always x,y,offsetX, offsetY
	handleClick(coords: Coords) {
		if (this.editMode) {
			this.map.cycleTile(coords.x, coords.y);
		} else {
			// destroy tile or something
		}
	}

}
