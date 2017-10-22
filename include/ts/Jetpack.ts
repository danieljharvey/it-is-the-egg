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
import { Tile } from "./Tile";
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
        this.setNextAction("");
        this.startRender();
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

  // create player
  public createNewPlayer(
    playerTypes,
    type: string,
    coords: Coords,
    direction: number
  ): Player {
    const playerType = playerTypes[type];
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
  protected createRenderer(
    tileSet: TileSet,
    boardSize: BoardSize,
    completedCallback: () => any
  ) {
    this.canvas = new Canvas(boardSize);
    this.tileSet = tileSet;
    this.boardSize = boardSize;

    const tiles = this.tileSet.getTiles();

    return new Renderer(
      this,
      tiles,
      this.playerTypes,
      this.boardSize,
      this.canvas,
      () => completedCallback()
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
    const action = this.action;
    // this.action = "";
    return action;
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
    const oldGameState = this.getCurrentGameState();

    if (action === "rotateLeft") {
      const rotatedLeftState = this.getNewGameState(
        oldGameState,
        "rotateLeft",
        timePassed
      );
      this.doBoardRotation(false, rotatedLeftState);
      this.setNextAction("rotatingLeft");
      return false;
    } else if (action === "rotateRight") {
      const rotatedRightState = this.getNewGameState(
        oldGameState,
        "rotateRight",
        timePassed
      );
      this.doBoardRotation(true, rotatedRightState);
      this.setNextAction("rotatingRight");
      return false;
    } else if (action.length > 0) {
      return false;
    }

    if (oldGameState.outcome.length > 0) {
      const continueGame = this.checkOutcome(oldGameState);
      if (continueGame === false) {
        this.setNextAction("stop");
      }
    }

    const newGameState = this.getNewGameState(oldGameState, action, timePassed);

    if (oldGameState.score !== newGameState.score) {
      this.displayScore(newGameState.score);
    }

    this.renderChanges(oldGameState, newGameState);
  }

  // return true for continue play, false for stop
  protected checkOutcome(gameState: GameState): boolean {
    if (gameState.outcome === "completeLevel") {
      // egg is over cup - check whether we've completed
      const completed = this.completeLevel(gameState.board, gameState.players);
      if (completed) {
        this.nextLevel(gameState.score, gameState.rotations);
        return false;
      }
    }

    return true;
  }

  // or at least try
  protected completeLevel(board: Board, players: Player[]): boolean {
    const collectable = this.getCollectable(board);
    const playerCount: number = this.countPlayers(players);

    if (collectable < 1 && playerCount < 2) {
      return true;
    }
    return false;
  }

  protected getBoardFromArray(boardArray): Board {
    const map = new Map(this.tileSet);
    return map.makeBoardFromArray(boardArray);
  }

  // create first "frame" of gameState from board
  // create players etc
  protected getBlankGameState(board: Board): GameState {
    const players = this.createPlayers(this.playerTypes, board);
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
    const map = new Map(this.tileSet);
    const theEgg = new TheEgg(map, this.playerTypes);
    const newGameState = theEgg.doAction(gameState, action, timePassed);
    this.gameStates.push(newGameState); // add to history
    return newGameState;
  }

  protected renderEverything(gameState: GameState) {
    const boardSize = new BoardSize(gameState.board.getLength());
    const blankMap = RenderMap.createRenderMap(boardSize.width, true);
    this.renderer.render(
      gameState.board,
      blankMap,
      gameState.players,
      gameState.rotateAngle
    );
  }

  protected renderChanges(oldGameState: GameState, newGameState: GameState) {
    const boardSize = new BoardSize(newGameState.board.getLength());

    // if rotated everything changes anyway
    if (oldGameState.rotateAngle !== newGameState.rotateAngle) {
      return this.renderEverything(newGameState);
    }

    // player map is covering old shit up
    const playerRenderMap = this.createRenderMapFromPlayers(
      oldGameState.players,
      boardSize
    );

    // render changes
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
      newGameState.players,
      newGameState.rotateAngle
    );
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

  protected nextLevel(score: number, rotations: number) {
    this.pauseRender();
    this.levels.saveData(this.levelID, rotations, score, data => {
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
    return players.reduce((total, player) => {
      if (player && player.value > 0) {
        return total + 1;
      } else {
        return total;
      }
    }, 0);
  }

  protected filterCreateTiles = (tiles) => {
    return tiles.filter(tile => {
      return (tile.createPlayer !== "");
    })
  }

  // cycle through all map tiles, find egg cups etc and create players
  protected createPlayers(playerTypes, board: Board) {
    const tiles = board.getAllTiles();

    const filtered = this.filterCreateTiles(tiles);

    const players = filtered.map((tile: Tile) => {
        const type = tile.createPlayer;
        const coords = new Coords({
          offsetX: 0,
          offsetY: 0,
          x: tile.x,
          y: tile.y
        });
        return this.createNewPlayer(playerTypes, type, coords, 1);
      })
    return players;
  }

  // get total outstanding points left to grab on board
  protected getCollectable(board: Board): number {
    const tiles = board.getAllTiles();
    return tiles.reduce((collectable, tile) => {
      const score = tile.get("collectable");
      if (score > 0) {
        return collectable + score;
      } else {
        return collectable;
      }
    }, 0);
  }

  protected doBoardRotation(clockwise: boolean, gameState: GameState) {
    this.renderer.drawRotatingBoard(clockwise, this.moveSpeed, () => {
      this.renderEverything(gameState);
      this.setNextAction(""); // continue playing the game
    });
  }

  protected loadLevel(levelID, callback) {
    this.levels.loadLevel(
      levelID,
      (savedLevel: SavedLevel) => {
        this.renderer = this.createRenderer(
          this.tileSet,
          savedLevel.boardSize,
          () => {
            const board = this.getBoardFromArray(savedLevel.board);
            this.resetGameState(board);
            const gameState = this.getCurrentGameState();
            this.renderEverything(gameState);
            callback();
          }
        );
      },
      () => {
        this.renderer = this.createRenderer(
          this.tileSet,
          this.boardSize,
          () => {
            const map = new Map(this.tileSet);
            const board = map.generateRandomBoard(this.boardSize, this.tileSet);
            this.resetGameState(board);
            const gameState = this.getCurrentGameState();
            this.renderEverything(gameState);
            callback();
          }
        );
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
      fps.style.display = "none";
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
