import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";
import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Editor } from "./Editor";
import { GameState } from "./GameState";
import { Levels } from "./Levels";
import { Loader } from "./Loader";
import { Map } from "./Map";
import { Movement } from "./Movement";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";
import { Renderer } from "./Renderer";
import { RenderMap } from "./RenderMap";
import { SavedLevel } from "./SavedLevel";
import { TheEgg } from "./TheEgg";
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

  protected renderer: Renderer; // Renderer object
  protected collisions: Collisions; // Collisions object
  protected levels: Levels; // Levels object
  protected tileSet: TileSet; // TileSet object
  protected boardSize: BoardSize; // BoardSize object
  protected canvas: Canvas; // Canvas object
  protected tileChooser: TileChooser;

  // big pile of moves
  protected gameStates: GameState[];

  protected nextPlayerID: number = 1;
  protected score: number = 0;
  protected rotationsUsed: number = 0;
  protected collectable: number = 0; // total points on screen

  protected playerTypes: object = {};

  protected defaultBoardSize: number = 20;
  protected checkResize: boolean = false;

  protected isCalculating = false;
  protected action: string = "";

  public go(levelID) {
    // this.bootstrap();
    this.bindSizeHandler();
    this.bindKeyboardHandler();

    this.pauseRender();
    this.getTitleScreen(() => {
      this.loadLevel(levelID, () => {
        this.setNextAction("play");
        //this.startRender();
      });
    });
  }

  public getEditor() {
    return new Editor();
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

    this.levels = new Levels(loader);

    this.getLevelList(levelList => {
      const levelID = this.chooseLevelID(levelList);
      this.levelID = levelID;
      callback(levelID);
    });
  }

  public displayScore(score) {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.innerHTML = score.toString();
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
    return player;
  }

  // make this actually fucking rotate, and choose direction, and do the visual effect thing
  public rotateBoard(clockwise) {
    if (clockwise) {
      this.setNextAction("rotateRight");
    } else {
      this.setNextAction("rotateLeft");
    }
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
    this.action = action;
  }

  // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
  protected createRenderer(tileSet: TileSet, boardSize: BoardSize) {
    console.log("createRenderer->", tileSet, boardSize);

    this.canvas = new Canvas(boardSize);
    this.tileSet = tileSet;
    this.boardSize = boardSize;

    const tiles = this.tileSet.getTiles();

    return new Renderer(
      this,
      tiles,
      this.playerTypes,
      this.boardSize,
      this.canvas
    );
  }

  protected startRender() {
    window.cancelAnimationFrame(this.animationHandle);
    this.showControls();
    this.animationHandle = window.requestAnimationFrame(time =>
      this.eventLoop(time, 0)
    );
  }

  protected getNextAction(): string {
    return this.action;
  }

  // change of heart - this runs all the time and requests various things do stuff
  // if we are paused, it is nothing, but the loop runs all the same
  // we are separating one frame ==== one turn
  // as this does not work for things like rotation
  // which is one 'turn' but many frames

  protected eventLoop(time: number, lastTime: number) {
    this.animationHandle = window.requestAnimationFrame(newTime =>
      this.eventLoop(newTime, time)
    );
    const timePassed = this.calcTimePassed(time, lastTime);
    this.displayFrameRate(timePassed);

    const action = this.getNextAction();

    this.gameCycle(timePassed, action);
  }

  // this does one step of the game
  protected gameCycle(timePassed: number, action: string) {
    console.log("gameCycle", timePassed, action);

    const oldGameState = this.getCurrentGameState();

    const playerRenderMap = this.createRenderMapFromPlayers(
      oldGameState.players,
      this.boardSize
    );

    const newGameState = this.getNewGameState(oldGameState, action, timePassed);

    console.log("gameCycle states", oldGameState, newGameState);

    const boardRenderMap = RenderMap.createRenderMapFromBoards(
      oldGameState.board,
      newGameState.board
    );
    const finalRenderMap = RenderMap.combineRenderMaps(
      playerRenderMap,
      boardRenderMap
    );

    this.renderer.render(
      newGameState.board,
      finalRenderMap,
      newGameState.rotateAngle
    );
  }

  protected getBoardFromArray(boardArray): Board {
    const map = new Map(this.tileSet, this.boardSize);
    return map.makeBoardFromArray(boardArray);
  }

  // create first "frame" of gameState from board
  // create players etc
  protected getBlankGameState(board: Board): GameState {
    const players = this.createPlayers(board);
    return new GameState({
      board,
      players
    });
  }

  // current game state from array
  protected getCurrentGameState() {
    return this.gameStates.slice(-1)[0]; // set to new last item
  }

  protected resetGameState(board: Board) {
    const gameState = this.getBlankGameState(board);
    this.gameStates = [gameState];
  }

  // do next move, plop new state on pile, return new state
  protected getNewGameState(
    gameState: GameState,
    action: string,
    timePassed: number
  ): GameState {
    const theEgg = new TheEgg();
    const newGameState = theEgg.doAction(gameState, action, timePassed);
    this.gameStates.push(newGameState); // add to history
    return newGameState;
  }

  protected renderEverything(board: Board) {
    const boardSize = new BoardSize(board.getLength());
    const blankMap = RenderMap.createRenderMap(boardSize.width, true);
    this.renderer.render(board, blankMap, 0);
  }

  protected renderSelected(board: Board, renderMap: boolean[][]) {
    this.renderer.render(board, renderMap, 0);
  }

  protected renderFromBoards(oldBoard: Board, newBoard: Board) {
    const renderMap = RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
    this.renderSelected(newBoard, renderMap);
  }

  protected sizeCanvas(boardSize: BoardSize) {
    if (!this.checkResize) {
      return false;
    }
    this.renderer.resize(boardSize);
    this.checkResize = false;
  }

  // create empty renderMap based on boardSize, and then apply each player's position to it
  protected createRenderMapFromPlayers(
    players: Player[],
    boardSize: BoardSize
  ): boolean[][] {
    const blankMap = RenderMap.createRenderMap(boardSize.width, false);
    return players.reduce((map, player) => {
      return RenderMap.addPlayerToRenderMap(player, map);
    }, blankMap);
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

  protected countPlayers(players: Player[]): number {
    const validPlayers = players.filter(player => {
      return player && player.value > 0;
    });
    return validPlayers.length;
  }

  // cycle through all map tiles, find egg cups etc and create players
  protected createPlayers(board: Board): Player[] {
    const tiles = board.getAllTiles();
    const playerTiles = tiles.map(tile => {
      const type = tile.createPlayer;
      if (type) {
        const coords = new Coords({
          offsetX: 0,
          offsetY: 0,
          x: tile.x,
          y: tile.y
        });
        return this.createNewPlayer(type, coords, 1);
      } else {
        return false;
      }
    });
    return playerTiles.filter(player => {
      return player !== false;
    });
  }

  // get total outstanding points left to grab on board
  protected getCollectable(board: Board): number {
    const tiles = board.getAllTiles();
    return tiles.reduce((collectable, tile) => {
      const score = tile.collectable;
      if (score > 0) {
        return collectable + score;
      }
    }, 0);
  }

  protected doBoardRotation(clockwise) {
    this.pauseRender();

    this.renderer.drawRotatingBoard(clockwise, () => {
      this.renderEverything(this.boardSize);
      this.startRender();
    });

    return true;
  }

  protected loadLevel(levelID, callback) {
    this.levels.loadLevel(
      levelID,
      (savedLevel: SavedLevel) => {
        this.renderer = this.createRenderer(this.tileSet, savedLevel.boardSize);
        this.resetGameState(this.getBoardFromArray(savedLevel.board));
        callback();
      },
      () => {
        this.renderer = this.createRenderer(this.tileSet, this.boardSize);
        const map = new Map(this.tileSet, this.boardSize);
        this.resetGameState(map.generateRandomBoard(this.boardSize));
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
        this.toggleFPS();
      }
    });
  }

  protected toggleFPS() {
    const fps = document.getElementById("fps");
    if (!fps) {
      return false;
    }
    if (fps.style.display !== "block") {
      fps.style.display = "block";
    } else {
      fps.style;
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
    this.gameCycle(16, this.getNextAction()); // movement based on 60 fps
  }
}
