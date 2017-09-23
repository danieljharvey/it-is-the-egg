import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";
import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Editor } from "./Editor";
import { Levels } from "./Levels";
import { Loader } from "./Loader";
import { Map } from "./Map";
import { Movement } from "./Movement";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";
import { Renderer } from "./Renderer";
import { RenderMap } from "./RenderMap";
import { SavedLevel } from "./SavedLevel";
import { TileChooser } from "./TileChooser";
import { TileSet } from "./TileSet";
import { TitleScreen } from "./TitleScreen";
import { Utils } from "./Utils";

export class Jetpack {
  public animationHandle: number;
  public moveSpeed: number = 10;
  public players: Player[];

  protected paused: boolean = true;
  protected editMode: boolean = false;

  protected levelID: number = 1;
  protected levelList: number[] = [];

  protected map: Map; // Map object
  protected renderer: Renderer; // Renderer object
  protected collisions: Collisions; // Collisions object
  protected levels: Levels; // Levels object
  protected tileSet: TileSet; // TileSet object
  protected boardSize: BoardSize; // BoardSize object
  protected canvas: Canvas; // Canvas object
  protected tileChooser: TileChooser;

  protected nextPlayerID: number = 1;
  protected score: number = 0;
  protected rotationsUsed: number = 0;
  protected collectable: number = 0; // total points on screen

  protected playerTypes: object = {};

  protected defaultBoardSize: number = 20;
  protected checkResize: boolean = false;

  protected isCalculating = false;
  protected nextAction: string = "";

  public go(levelID) {
    // this.bootstrap();
    this.bindSizeHandler();
    this.bindKeyboardHandler();

    this.pauseRender();
    this.getTitleScreen(() => {
      this.loadLevel(levelID, () => {
        this.createPlayers();
        this.resetScore(0);
        this.rotationsUsed = 0;
        this.startRender();
      });
    });
  }

  public getEditor() {
    return new Editor();
  }
  
  // go function but for edit mode
  public edit() {
    // this.bootstrap();
    this.levels.populateLevelsList(this.levelList);

    this.editMode = true;
    this.bindSizeHandler();
    this.bindClickHandler();
    this.bindMouseMoveHandler();
    this.createRenderer();
    this.tileChooser = new TileChooser(this.tileSet, this.renderer);
    this.tileChooser.render();

    const s = setTimeout(() => {
      this.startRender();
    }, 1000);
  }

  // load static stuff - map/renderer etc will be worked out later
  public bootstrap(callback) {
    this.tileSet = new TileSet();

    const boardSize = new BoardSize(this.defaultBoardSize);

    this.canvas = new Canvas(boardSize);

    const playerTypes = new PlayerTypes();
    this.playerTypes = playerTypes.getPlayerTypes();

    this.collisions = new Collisions(this, this.playerTypes); // pass the data, not the object

    const apiLocation = "http://" + window.location.hostname + "/levels/";

    const loader: Loader = new Loader(apiLocation);

    this.levels = new Levels(this, loader);

    this.getLevelList(levelList => {
      const levelID = this.chooseLevelID(levelList);
      this.levelID = levelID;
      callback(levelID);
    });
  }

  public addScore(amount) {
    this.score += amount;
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.innerHTML = this.score.toString();
    }
  }

  // or at least try
  public completeLevel() {
    this.collectable = this.getCollectable();
    const playerCount: number = this.countPlayers(this.players);
    if (this.collectable < 1 && playerCount < 2) {
      this.nextLevel();
    }
  }

  // create player
  public createNewPlayer(
    type: string,
    coords: Coords,
    direction: number
  ): Player {
    const playerType = this.playerTypes[type];
    const params = JSON.parse(JSON.stringify(playerType));
    params.id = this.nextPlayerID++;
    params.coords = coords;
    params.direction = direction;
    if (!Object.hasOwnProperty.call(params, "moveSpeed")) {
      params.moveSpeed = this.moveSpeed;
      params.fallSpeed = this.moveSpeed * 1.2;
    }
    const player = new Player(params);
    this.players[player.id] = player;
    return player;
  }

  // make this actually fucking rotate, and choose direction, and do the visual effect thing
  public rotateBoard(clockwise) {
    if (clockwise) {
      this.setNextAction('rotateRight');
    } else {
      this.setNextAction('rotateLeft');
    }
  }

  public saveLevel() {
    this.levels.saveLevel(
      this.map.getBoard(),
      this.map.boardSize,
      this.levels.levelID,
      levelID => {
        const text = "Level " + levelID + " saved";
        this.showEditMessage(text);
      }
    );
  }

  public loadLevelFromList() {
    const select = document.getElementById("levelList") as HTMLSelectElement;
    const index = select.selectedIndex;
    const levelID = select.options[index].value;
    this.loadLevel(levelID, () => {
      // console.log("loaded!");
    });
  }

  public growBoard() {
    if (!this.editMode) {
      return false;
    }
    this.boardSize = this.map.growBoard();
    this.checkResize = true;
  }

  public shrinkBoard() {
    if (!this.editMode) {
      return false;
    }
    this.boardSize = this.map.shrinkBoard();
    this.checkResize = true;
  }

  protected getTitleScreen(callback) {
    const imageSize = { width: 1024, height: 1024 };
    const imagePath = "large/the-egg.png";
    const titleScreen = new TitleScreen(
      this,
      this.canvas,
      imagePath,
      imageSize.width,
      imageSize.height
    );
    titleScreen.render(callback);
  }

  protected getLevelList(callback) {
    this.levels.getLevelList(levelList => {
      this.levelList = levelList;
      callback(levelList);
    });
  }

  // select a random level that has not been completed yet
  // a return of false means none available (generate a random one)
  protected chooseLevelID(levelList) {
    const availableLevels = levelList.filter(level => {
      return level.completed === false;
    });
    const chosenKey = Utils.getRandomArrayKey(availableLevels);
    if (!chosenKey) {
      return false;
    }
    const levelID = availableLevels[chosenKey].levelID;
    return levelID;
  }

  protected setNextAction(action: string) {
    this.nextAction = action;
  }

  // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
  protected createRenderer(boardArray = [], size: number = 12) {
    this.boardSize = new BoardSize(size);
    this.canvas = new Canvas(this.boardSize);

    this.map = new Map(this.tileSet, this.boardSize, boardArray);
    const board = this.map.getBoard();
    this.map.updateBoard(
      this.map.correctBoardSizeChange(board, this.boardSize),
      this.boardSize
    );
    const tiles = this.tileSet.getTiles();
    this.renderer = new Renderer(
      this,
      this.map,
      tiles,
      this.playerTypes,
      this.boardSize,
      this.canvas
    );
  }

  protected startRender() {
    if (!this.paused) {
      return false;
    }
    window.cancelAnimationFrame(this.animationHandle);
    this.paused = false;
    this.showControls();
    this.animationHandle = window.requestAnimationFrame(time =>
      this.eventLoop(time, 0)
    );
  }

  protected getNextAction() {
    if (this.nextAction.length === 0) {
      return false;
    }
    const nextAction = this.nextAction;
    this.nextAction = "";
    return nextAction;
  }

  protected doNextAction(action: string) {
    if (action === 'rotateLeft') {
      this.doBoardRotation(false);
    } else if (action === 'rotateRight') {
      this.doBoardRotation(true);
    } else {
      return false;
    }
  }

  protected eventLoop(time: number, lastTime: number) {
    if (this.paused) {
      return false;
    }
    const nextAction = this.getNextAction();
    if (nextAction) {
      // nextActions take control of event loop
      // so don't requestAnimationFrame etc
      return this.doNextAction(nextAction);
    }

    this.animationHandle = window.requestAnimationFrame(newTime =>
      this.eventLoop(newTime, time)
    );
    const timePassed = this.calcTimePassed(time, lastTime);
    this.displayFrameRate(timePassed);

    this.gameCycle(timePassed);
  }

  // this does one step of the game
  protected gameCycle(timePassed: number) {
    if (this.isCalculating) { // stop slow frames tripping over one another
      return false;
    }
    this.isCalculating = true;
    const playerRenderMap = this.createRenderMapFromPlayers(this.players, this.boardSize);
    const oldBoard = this.map.getBoard();
    this.doPlayerCalcs(timePassed);
    this.sizeCanvas();
    const newBoard = this.map.getBoard();
    const boardRenderMap = this.createRenderMapFromBoards(oldBoard, newBoard);
    const finalRenderMap = RenderMap.combineRenderMaps(playerRenderMap, boardRenderMap);
    this.renderer.render(finalRenderMap);
    this.isCalculating = false;
  }

  protected renderEverything(boardSize: BoardSize) {
    const blankMap = RenderMap.createRenderMap(boardSize.width, true);
    this.renderer.render(blankMap);
  }

  protected createRenderMapFromBoards(oldBoard: Board, newBoard: Board) : boolean[][] {
    return RenderMap.createRenderMapFromBoards(oldBoard,newBoard);
  }

  // create empty renderMap based on boardSize, and then apply each player's position to it
  protected createRenderMapFromPlayers(players: Player[], boardSize: BoardSize) : boolean[][] {
    const blankMap = RenderMap.createRenderMap(boardSize.width, false);
    return players.reduce((map, player) => {
      return RenderMap.addPlayerToRenderMap(player, map);
    },blankMap);
  }

  protected calcTimePassed(time: number, lastTime: number): number {
    const difference = Math.min(time - lastTime, 20);
    return difference;
  }

  protected displayFrameRate(timePassed: number) {
    const frameRate = Math.floor(1000 / timePassed);
    const fps = document.getElementById("fps");
    if (fps) {
      fps.innerHTML = frameRate.toFixed(3) + "fps";
    }
  }

  protected sizeCanvas() {
    if (!this.checkResize) {
      return false;
    }

    this.canvas.sizeCanvas(this.boardSize);
    this.renderer.resize();
    this.checkResize = false;
  }

  protected resetScore(score) {
    this.score = 0;
    this.addScore(0);
  }

  protected nextLevel() {
    this.pauseRender();
    this.levels.saveData(this.levelID, this.rotationsUsed, this.score, data => {
      this.levelList = this.markLevelAsCompleted(this.levelList, this.levelID);
      this.levelID = this.chooseLevelID(this.levelList);
      this.go(this.levelID);
    });
  }

  protected markLevelAsCompleted(levelList, levelID) {
    levelList[levelID].completed = true;
    return levelList;
  }

  protected pauseRender() {
    this.paused = true;
    this.hideControls();
    window.cancelAnimationFrame(this.animationHandle);
  }

  protected showControls() {
    const controlHeader = document.getElementById("controlHeader");
    if (controlHeader && controlHeader.classList.contains("hidden")) {
      controlHeader.classList.remove("hidden");
    }
  }

  protected hideControls() {
    const controlHeader = document.getElementById("controlHeader");
    if (controlHeader && !controlHeader.classList.contains("hidden")) {
      controlHeader.classList.add("hidden");
    }
  }

  protected doPlayerCalcs(timePassed: number) {
    const movement = new Movement(this.map, this);
    const newPlayers = movement.doCalcs(this.players, timePassed);

    const collisions = new Collisions(this, this.playerTypes);
    const sortedPlayers = collisions.checkAllCollisions(newPlayers);

    this.players = sortedPlayers; // replace with new objects
  }

  protected countPlayers(players: Player[]): number {
    const validPlayers = players.filter(player => {
      return player && player.value > 0;
    });
    return validPlayers.length;
  }

  // cycle through all map tiles, find egg cups etc and create players
  protected createPlayers() {
    this.destroyPlayers();
    const tiles = this.map.getAllTiles();
    const players = tiles.map(tile => {
      const type = tile.createPlayer;
      if (type) {
        const coords = new Coords({
          x: tile.x,
          y: tile.y,
          offsetX: 0,
          offsetY: 0
        });
        const player = this.createNewPlayer(type, coords, 1);
        this.players[player.id] = player;
      }
    });
  }

  protected destroyPlayers() {
    this.players = [];
  }

  // cycle through all map tiles, find egg cups etc and create players
  protected getCollectable() {
    let collectable = 0;
    const tiles = this.map.getAllTiles();
    tiles.map(tile => {
      const score = tile.collectable;
      if (score > 0) {
        collectable += score;
      }
    });
    return collectable;
  }

  protected deletePlayer(player: Player) {
    delete this.players[player.id];
  }

  protected doBoardRotation(clockwise) {
    if (this.paused || this.editMode) {
      return false;
    }
    this.pauseRender();

    this.rotationsUsed++;

    this.map.rotateCurrentBoard(clockwise);

    const rotatedPlayers = this.players.map(player => {
      return this.map.rotatePlayer(player, clockwise);
    });

    this.players = [];
    rotatedPlayers.map(player => {
      this.players[player.id] = player;
    });

    this.renderer.drawRotatingBoard(clockwise, () => {
      this.renderEverything(this.boardSize);
      this.startRender();
    });

    return true;
  }


  protected revertEditMessage() {
    const s = setTimeout(() => {
      const message = document.getElementById("message");
      message.innerHTML = "EDIT MODE";
    }, 3000);
  }

  protected showEditMessage(text) {
    if (!this.editMode) {
      return false;
    }
    const message = document.getElementById("message");
    message.innerHTML = text;
    this.revertEditMessage();
  }

  protected loadLevel(levelID, callback) {
    this.levels.loadLevel(
      levelID,
      (savedLevel: SavedLevel) => {
        const text = "Level " + savedLevel.levelID.toString() + " loaded!";
        this.showEditMessage(text);
        this.createRenderer(savedLevel.board, savedLevel.boardSize.width);
        callback();
      },
      () => {
        this.createRenderer();
        this.map.updateBoardWithRandom(this.boardSize);
        callback();
      }
    );
  }

  protected bindSizeHandler() {
    window.addEventListener("resize", () => {
      this.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
    });
  }

  protected bindKeyboardHandler() {
    window.addEventListener("keydown", event => {
      if (event.keyCode === 37) {
        // left arrow
        this.rotateBoard(false);
      }
      if (event.keyCode === 39) {
        // right arrow
        this.rotateBoard(true);
      }
      if (event.keyCode === 80) {
        // 'p'
        this.togglePaused();
      }
      if (event.keyCode === 83) {
        // 's'
        this.doStep();
      }
      if (event.keyCode === 70) {
        // 'f'
        this.showFPS();
      }
    });
  }

  protected showFPS() {
    const fps = document.getElementById("fps");
    if (fps) {
      fps.style.display = "block";
    }
  }

  protected togglePaused() {
    if (this.paused) {
      this.startRender();
    } else {
      this.pauseRender();
    }
  }

  protected doStep() {
    if (!this.paused) {
      return false;
    }
    this.gameCycle(16); // movement based on 60 fps
  }

  protected bindClickHandler() {
    const canvas = document.getElementById("canvas");
    canvas.addEventListener("click", event => {
      this.handleDrawEvent(event);
    });
  }

  protected bindMouseMoveHandler() {
    const canvas = document.getElementById("canvas");
    canvas.addEventListener("mousemove", event => {
      if (event.button > 0 || event.buttons > 0) {
        this.handleDrawEvent(event);
      }
    });
  }

  protected handleDrawEvent(event) {
    const tileSize = this.canvas.calcTileSize(this.boardSize);
    const coords = new Coords({
      offsetX: event.offsetX % tileSize - tileSize / 2,
      offsetY: event.offsetY % tileSize - tileSize / 2,
      x: (event.offsetX / tileSize) as number,
      y: (event.offsetY / tileSize) as number
    });
    this.drawCurrentTile(coords);
  }

  // coords is always x,y,offsetX, offsetY
  protected drawCurrentTile(coords: Coords) {
    const tileID = this.tileChooser.chosenTileID;
    if (tileID < 1) {
      return false;
    }
    const tile = this.map.cloneTile(tileID);
    this.map.changeTile(coords, tile);
  }
}
