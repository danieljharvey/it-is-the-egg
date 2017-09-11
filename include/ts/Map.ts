import { BoardSize } from "./BoardSize";
import { Coords } from "./Coords";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { TileSet } from "./TileSet";
import { Utils } from "./Utils";

export class Map {
  tileSet: TileSet;
  renderAngle: number = 0;

  boardSize: BoardSize;

  protected board = [];

  constructor(tileSet: TileSet, boardSize: BoardSize, board = []) {
    this.tileSet = tileSet;
    this.boardSize = boardSize;
    this.board = board;
    this.markAllForRedraw();
  }

  // return array with all tiles in (with x and y added)
  public getAllTiles() {
    const allTiles = this.board.map((column, mapX) => {
      return column.map((item, mapY) => {
        return new Tile({
          ...item,
          x: mapX,
          y: mapY
        });
      });
    });
    const reducedTiles = allTiles.reduce((total, item) => {
      return total.concat(item);
    }, []);

    return reducedTiles;
  }

  public shrinkBoard() {
    this.boardSize.shrink();
    this.board = this.correctBoardSizeChange(this.board, this.boardSize);
    return this.boardSize;
  }

  public growBoard() {
    this.boardSize.grow();
    this.board = this.correctBoardSizeChange(this.board, this.boardSize);
    return this.boardSize;
  }

  public correctBoardSizeChange(board, boardSize: BoardSize) {
    const newBoard = [];

    const currentWidth: number = board.length;
    let currentHeight: number;
    if (currentWidth > 0) {
      currentHeight = board[0].length;
    } else {
      currentHeight = 0;
    }

    for (let x = 0; x < boardSize.width; x++) {
      newBoard[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        if (x < currentWidth && y < currentHeight) {
          // using current board
          const tile = board[x][y];
          newBoard[x][y] = tile;
        } else {
          // adding blank tiles
          const tile = this.cloneTile(1);
          newBoard[x][y] = tile;
        }
      }
    }
    return newBoard;
  }

  public getBoard() {
    return this.board;
  }

  public updateBoard(board, boardSize: BoardSize) {
    this.board = board;
    this.boardSize = boardSize;
  }

  public updateBoardWithRandom(boardSize: BoardSize) {
    this.boardSize = boardSize;
    this.board = this.generateRandomBoard(boardSize);
  }

  public correctForOverflow(
    coords: Coords
  ): Coords {
    let newX;
    let newY;
    if (coords.x < 0) {
      newX = this.boardSize.width - 1;
    } else if (coords.x >= this.boardSize.width) {
      newX = 0;
    } else {
      newX = coords.x;
    }

    if (coords.y < 0) {
      newY = this.boardSize.height - 1;
    } else if (coords.y >= this.boardSize.height) {
      newY = 0;
    } else {
      newY = coords.y;
    }
    return coords.modify({ x: newX, y: newY});
  }

  // is intended next tile empty / a wall?
  public checkTileIsEmpty(x, y) {
    const tile = this.getTile(x, y);
    return tile.background;
  }

  public markAllForRedraw() {
    const tiles = this.getAllTiles();
    tiles.map(tile => {
      const coords = new Coords({
        x: tile.x,
        y: tile.y
      });
      const newTile = tile.modify({
        needsDraw: true
      });
      this.changeTile(coords, newTile);
    });
    return;
  }

  public getTilesSurrounding(coords: Coords) {
    const startX = coords.offsetX < 0 ? coords.x - 1 : coords.x;
    const endX = coords.offsetX > 0 ? coords.x + 1 : coords.x;

    const startY = coords.offsetY < 0 ? coords.y - 1 : coords.y;
    const endY = coords.offsetY > 0 ? coords.y + 1 : coords.y;

    const allTiles = this.getAllTiles();

    return allTiles.filter(tile => {
      if (
        tile.x >= startX &&
        tile.x <= endX &&
        tile.y >= startY &&
        tile.y <= endY
      ) {
        return true;
      }
      return false;
    });
  }

  public getTileWithCoords(coords: Coords) {
    const fixedCoords = this.correctForOverflow(coords);
    const { x, y } = fixedCoords;
    const tile = this.board[x][y];
    tile.x = x;
    tile.y = y;
    return tile;
  }

  public changeTile(coords: Coords, tile: Tile) {
    const { x, y } = coords;
    this.board[x][y] = tile;
  }

  public rotatePlayer(player: Player, clockwise) {
    const newCoords = this.translateRotation(player.coords, clockwise);

    let direction = player.direction;
    // if player is still, nudge them in rotation direction
    if (direction === 0) {
      if (clockwise) {
        direction = 1;
      } else {
        direction = -1;
      }
    }

    return player.modify({
      coords: newCoords.modify({
        offsetX: 0,
        offsetY: 0
      }),
      direction
    });
  }

  public cloneTile(id): Tile {
    const prototypeTile = this.getPrototypeTile(id);
    const tile = new Tile(prototypeTile); // create new Tile object with these
    return tile;
  }

  public getRandomTile(tiles) {
    const randomProperty = obj => {
      const randomKey = Utils.getRandomObjectKey(obj);
      return this.cloneTile(randomKey);
    };

    const theseTiles = this.tileSet.getTiles();
    (Object as any).entries(theseTiles).filter(([key, tile]) => {
      if (tile.dontAdd) {
        delete theseTiles[key];
      }
      return true;
    });
    return randomProperty(theseTiles);
  }

  // swap two tiles on map
  public switchTiles(id1, id2) {
    const tiles = this.getAllTiles();
    const count = tiles.map(tile => {
      if (tile.id === id1) {
        const coords = new Coords({ x: tile.x, y: tile.y });
        this.changeTile(coords, this.cloneTile(id2));
        return 1;
      } else if (tile.id === id2) {
        const coords = new Coords({ x: tile.x, y: tile.y });
        this.changeTile(coords, this.cloneTile(id1));
        return 1;
      }
      return 0;
    });
    return count.reduce((a, b) => a + b, 0);
  }

  // find random tile of type that is NOT at currentCoords
  public findTile(currentCoords: Coords, id) {
    const tiles = this.getAllTiles();
    const teleporters = tiles.filter(tile => {
      if (tile.x === currentCoords.x && tile.y === currentCoords.y) {
        return false;
      }
      return tile.id === id;
    });
    if (teleporters.length === 0) {
      return false; // no options
    }
    const newTile = teleporters[Math.floor(Math.random() * teleporters.length)];
    return newTile;
  }

  public rotateBoard(clockwise) {
    const newBoard = this.getBlankBoard();

    const width = this.boardSize.width - 1;
    const height = this.boardSize.height - 1;

    const tiles = this.getAllTiles();

    tiles.map(tile => {
      const coords = new Coords({ x: tile.x, y: tile.y });
      const newCoords = this.translateRotation(coords, clockwise);
      const newTile = tile.modify({
        needsDraw: true,
        x: newCoords.x,
        y: newCoords.y
      });
      newBoard[newCoords.x][newCoords.y] = newTile;
    });

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

    return true;
  }

  protected getTile(x: number, y: number) {
    const coords = new Coords({ x, y });
    return this.getTileWithCoords(coords);
  }

  protected generateBlankBoard() {
    const board = [];

    for (let x = 0; x < this.boardSize.width; x++) {
      board[x] = [];
      for (let y = 0; y < this.boardSize.height; y++) {
        const blankTile = this.cloneTile(1);
        board[x][y] = blankTile;
      }
    }
    return board;
  }

  protected generateRandomBoard(boardSize: BoardSize) {
    const board = [];

    for (let x = 0; x < boardSize.width; x++) {
      board[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        const blankTile = this.getRandomTile(this.tileSet.getTiles());
        board[x][y] = blankTile;
      }
    }
    return board;
  }

  protected getPrototypeTile(id) {
    return this.tileSet.getTile(id);
  }

  protected translateRotation(coords: Coords, clockwise: boolean): Coords {
    const width = this.boardSize.width - 1;
    const height = this.boardSize.height - 1;

    if (clockwise) {
      // 0,0 -> 9,0
      // 9,0 -> 9,9
      // 9,9 -> 0,9
      // 0,9 -> 0,0
      return coords.modify({
        x: width - coords.y,
        y: coords.x
      });
    } else {
      // 0,0 -> 0,9
      // 0,9 -> 9,9
      // 9,9 -> 9,0
      // 9,0 -> 0,0
      return coords.modify({
        x: coords.y,
        y: height - coords.x
      });
    }
  }

  // get empty grid without tiles in
  protected getBlankBoard() {
    const newBoard = [];
    for (let x = 0; x < this.boardSize.width; x++) {
      newBoard[x] = [];
      for (let y = 0; y < this.boardSize.height; y++) {
        newBoard[x][y] = [];
      }
    }
    return newBoard;
  }
}
