import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Coords } from "./Coords";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { TileSet } from "./TileSet";
import { Utils } from "./Utils";

// map is just a class full of functions that is created for manipulating the board
// does not contain any state of it's own

export class Map {
  public boardSize: BoardSize;

  protected tileSet: TileSet;

  protected board: Board;

  constructor(tileSet: TileSet, boardSize: BoardSize) {
    this.tileSet = tileSet;
    this.boardSize = boardSize;
  }

  public shrinkBoard(board: Board) : Board {
    this.boardSize = this.boardSize.shrink();
    return this.correctBoardSizeChange(board, this.boardSize);
  }

  public growBoard(board: Board) : Board {
    this.boardSize = this.boardSize.grow();
    return this.correctBoardSizeChange(board, this.boardSize);
  }

  // board is current board
  // boardSize is intended board size
  // returns new Board
  public correctBoardSizeChange(board: Board, boardSize: BoardSize) : Board {
    const newBoard = [];

    const currentWidth = board.getLength();

    const currentHeight = currentWidth;

    for (let x = 0; x < boardSize.width; x++) {
      newBoard[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        if (x < currentWidth && y < currentHeight) {
          // using current board
          const tile = board.getTile(x,y);
          newBoard[x][y] = tile;
        } else {
          // adding blank tiles
          const tile = this.cloneTile(1);
          newBoard[x][y] = tile;
        }
      }
    }
    return new Board(newBoard);
  }

  public generateBlankBoard() : Board {
    const board = [];

    for (let x = 0; x < this.boardSize.width; x++) {
      board[x] = [];
      for (let y = 0; y < this.boardSize.height; y++) {
        const blankTile = this.cloneTile(1);
        const positionedTile = blankTile.modify({
          x,
          y
        });
        board[x][y] = positionedTile;
      }
    }
    return new Board(board);
  }

  public correctForOverflow(coords: Coords): Coords {
    return Utils.correctForOverflow(coords, this.boardSize);
  }

  // is intended next tile empty / a wall?
  public checkTileIsEmpty(board: Board, x, y) : boolean {
    const tile = this.getTile(board, x, y);
    return tile.background;
  }

  public getTileWithCoords(board: Board, coords: Coords): Tile {
    const fixedCoords = this.correctForOverflow(coords);
    const { x, y } = fixedCoords;
    return board.getTile(x,y);
  }

  public changeTile(board: Board, coords: Coords, tile: Tile) : Board {
    return board.modify(coords.x, coords.y, tile);
  }

  public rotatePlayer(player: Player, clockwise) : Player {
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
    return new Tile(prototypeTile); // create new Tile object with these
  }

  public getRandomTile(tiles) : Tile {
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

  // swap two types of tiles on map (used by pink/green switching door things)
  public switchTiles(board: Board, id1, id2) : Board {
    const tiles = board.getAllTiles();
    return tiles.reduce((currentBoard, tile) => {
      if (tile.id === id1) {
        const newTile = this.cloneTile(id2); 
        return currentBoard.modify(tile.x, tile.y, newTile);
      } else if (tile.id === id2) {
        const newTile = this.cloneTile(id1); 
        return currentBoard.modify(tile.x, tile.y, newTile);
      }
      return currentBoard;
    }, board);
  }

  // find random tile of type that is NOT at currentCoords
  public findTile(board: Board, currentCoords: Coords, id) : Tile | boolean {
    const tiles = board.getAllTiles();
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

  // rotates board, returns new board and new renderAngle
  // really should be two functions
  public rotateBoard(board: Board, clockwise: boolean) {
    const tiles = board.getAllTiles();

    const width = board.getLength() - 1;
    const height = board.getLength() - 1;

    const rotatedBoard = tiles.reduce((currentBoard, tile) => {
      const coords = new Coords({ x: tile.x, y: tile.y });
      const newCoords = this.translateRotation(coords, clockwise);
      const newTile = tile.modify({
        x: newCoords.x,
        y: newCoords.y
      });
      return currentBoard.modify(newCoords.x, newCoords.y, newTile);
    }, board);

    return rotatedBoard;
  }

  public changeRenderAngle(renderAngle: number, clockwise: boolean) {
    let newRenderAngle;
    if (clockwise) {
      newRenderAngle = renderAngle + 90;
      if (newRenderAngle > 360) {
        newRenderAngle = newRenderAngle - 360;
      }
      return newRenderAngle
    }

    newRenderAngle = renderAngle - 90;
    if (newRenderAngle < 0) {
      newRenderAngle = 360 + newRenderAngle;
    }
    return newRenderAngle;
  }


  public makeBoardFromArray(boardArray: Tile[][] = []) : Board {
    const newBoard = boardArray.map((column, mapX) => {
      return column.map((item, mapY) => {
        const newTile = this.cloneTile(item.id);
        return newTile.modify({
          x: mapX,
          y: mapY
        });
      });
    });
    return new Board(newBoard);
  }

  protected getTile(board: Board, x: number, y: number) {
    const coords = new Coords({ x, y });
    return this.getTileWithCoords(board, coords);
  }

  protected generateRandomBoard(boardSize: BoardSize) : Board {
    const boardArray = [];

    for (let x = 0; x < boardSize.width; x++) {
      boardArray[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        const blankTile = this.getRandomTile(this.tileSet.getTiles());
        const positionedTile = blankTile.modify({
          x,
          y
        });
        boardArray[x][y] = blankTile;
      }
    }
    return new Board(boardArray);
  }

  protected getPrototypeTile(id) : object {
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
}
