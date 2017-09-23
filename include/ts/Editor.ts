import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";
import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
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

export class Editor {

  protected levelID: number = 1;
  protected levelList: number[] = [];

  protected map: Map; // Map object
  protected renderer: Renderer; // Renderer object
  protected levels: Levels; // Levels object
  protected tileSet: TileSet; // TileSet object
  protected boardSize: BoardSize; // BoardSize object
  protected canvas: Canvas; // Canvas object
  protected tileChooser: TileChooser;
  protected board: Board;

  protected defaultBoardSize: number = 20;

  // go function but for edit mode
  public edit() {
    this.levels.populateLevelsList(this.levelList);

    this.bindSizeHandler();
    this.bindClickHandler();
    this.bindMouseMoveHandler();

    this.board = this.getBlankBoard(this.tileSet, this.boardSize);
    this.renderer = this.createRenderer(this.tileSet, this.boardSize);
    window.setTimeout(() => {
      this.renderEverything(this.board);  
    }, 1000);
    
    this.tileChooser = new TileChooser(this.tileSet, this.renderer);
    this.tileChooser.render();

  }

  // load static stuff - map/renderer etc will be worked out later
  public bootstrap(callback) {
    this.tileSet = new TileSet();

    this.boardSize = new BoardSize(this.defaultBoardSize);

    this.canvas = new Canvas(this.boardSize);

    const apiLocation = "http://" + window.location.hostname + "/levels/";

    const loader: Loader = new Loader(apiLocation);

    this.levels = new Levels(loader);

    this.getLevelList(levelList => {
      const levelID = this.chooseLevelID(levelList);
      this.levelID = levelID;
      callback(levelID);
    });
  }

  public saveLevel() {
    this.levels.saveLevel(
      this.board.toJS(),
      this.boardSize,
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
      window.setTimeout(() => {
        this.renderEverything(this.board);  
      }, 1000);
    });
  }

  public growBoard() {
    const map = new Map(this.tileSet, this.boardSize);

    const newBoard = map.growBoard(this.board);
    this.boardSize = new BoardSize(newBoard.getLength());

    this.sizeCanvas(this.boardSize);
    this.board = newBoard;

    this.renderEverything(newBoard);
  }

  public shrinkBoard() {
    const map = new Map(this.tileSet, this.boardSize);

    const newBoard = map.shrinkBoard(this.board);
    this.boardSize = new BoardSize(newBoard.getLength());

    this.sizeCanvas(this.boardSize);
    this.board = newBoard;
    
    this.renderEverything(newBoard);
  }

  protected getBlankBoard(tileSet: TileSet, boardSize: BoardSize) : Board {
    const map = new Map(tileSet, boardSize);
    return map.generateBlankBoard();
  }

  protected getLevelBoard(boardArray, tileSet: TileSet, boardSize: BoardSize) : Board {
    const map = new Map(tileSet, boardSize);
    return map.makeBoardFromArray(boardArray);
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
      [], // no players in edit mode
      this.boardSize,
      this.canvas
    );
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
    this.renderer.resize(boardSize);
    this.renderEverything(this.board);
  }

  protected revertEditMessage() {
    const s = setTimeout(() => {
      const message = document.getElementById("message");
      message.innerHTML = "EDIT MODE";
    }, 3000);
  }

  protected showEditMessage(text) {
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
        this.board = this.getLevelBoard(savedLevel.board, this.tileSet, savedLevel.boardSize);
        this.renderer = this.createRenderer(this.tileSet, savedLevel.boardSize);
        callback();
      },
      () => {
        this.board = this.getBlankBoard(this.tileSet, this.boardSize);
        this.renderer = this.createRenderer(this.tileSet, this.boardSize);
        callback();
      }
    );
  }

  protected bindSizeHandler() {
    window.addEventListener("resize", () => {
      this.sizeCanvas(this.boardSize);
    });
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
      x: Math.floor((event.offsetX / tileSize)),
      y: Math.floor((event.offsetY / tileSize))
    });
    this.drawCurrentTile(coords);
  }

  // coords is always x,y,offsetX, offsetY
  protected drawCurrentTile(coords: Coords) {
    const tileID = this.tileChooser.chosenTileID;
    if (tileID < 1) {
      return false;
    }
    
    const map = new Map(this.tileSet, this.boardSize);
    const tile = map.cloneTile(tileID);

    const placedTile = tile.modify({
      x: coords.x,
      y: coords.y
    });
    const oldBoard = this.board;
    const newBoard = oldBoard.modify(coords.x, coords.y, placedTile);

    this.renderFromBoards(oldBoard, newBoard);
    
    this.board = newBoard;
  }

  /*
  protected outputBoard(board: Board) {
    const tiles = board.getAllTiles();
    const idArray: array = tiles.map(tile => {
      return tile.id;
    });
    console.log('board IDs', idArray);
  }*/
}
