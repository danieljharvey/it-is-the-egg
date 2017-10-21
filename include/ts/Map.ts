import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Coords } from "./Coords";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { TileSet } from "./TileSet";
import { Utils } from "./Utils";

// map is just a class full of functions that is created for manipulating the board
// should not contain any meaningful state of it's own (currently does, but reducing this)

export class Map {
  protected tileSet: TileSet;

  constructor(tileSet: TileSet) {
    this.tileSet = tileSet;
  }

  public shrinkBoard(board: Board): Board {
    const boardSize = new BoardSize(board.getLength());
    const shrunkBoardSize = boardSize.shrink();
    return this.correctBoardSizeChange(board, shrunkBoardSize);
  }

  public growBoard(board: Board): Board {
    const boardSize = new BoardSize(board.getLength());
    const grownBoardSize = boardSize.grow();
    return this.correctBoardSizeChange(board, grownBoardSize);
  }

  // board is current board
  // boardSize is intended board size
  // returns new Board
  public correctBoardSizeChange(board: Board, boardSize: BoardSize): Board {
    const newBoard = [];

    const currentWidth = board.getLength();

    const currentHeight = currentWidth;

    for (let x = 0; x < boardSize.width; x++) {
      newBoard[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        if (x < currentWidth && y < currentHeight) {
          // using current board
          const tile = board.getTile(x, y);
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

  public generateBlankBoard(boardSize: BoardSize): Board {
    const board = [];

    for (let x = 0; x < boardSize.width; x++) {
      board[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
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

  public calcBoardSize(board: Board): number {
    return board.getLength()
  }

  public correctForOverflow(board: Board, coords: Coords): Coords {
    const boardSize = this.calcBoardSize(board);
    return Utils.correctForOverflow(coords, new BoardSize(boardSize));
  }

  // is intended next tile empty / a wall?
  public checkTileIsEmpty(board: Board, x, y): boolean {
    const tile = this.getTile(board, x, y);
    return tile.background;
  }

  public getTileWithCoords(board: Board, coords: Coords): Tile {
    const fixedCoords = this.correctForOverflow(board, coords);
    const { x, y } = fixedCoords;
    return board.getTile(x, y);
  }

  public changeTile(board: Board, coords: Coords, tile: Tile): Board {
    return board.modify(coords.x, coords.y, tile);
  }

  public rotatePlayer(boardSize: BoardSize, player: Player, clockwise): Player {
    const newCoords = this.translateRotation(boardSize, player.coords, clockwise);

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

  public getRandomTile(tiles): Tile {
    const randomProperty = obj => {
      const randomKey = Utils.getRandomObjectKey(obj);
      return this.cloneTile(randomKey);
    };

    (Object as any).entries(tiles).filter(([key, tile]) => {
      if (tile.dontAdd) {
        delete tiles[key];
      }
      return true;
    });
    return randomProperty(tiles);
  }

  // swap two types of tiles on map (used by pink/green switching door things)
  public switchTiles(board: Board, id1, id2): Board {
    const tiles = board.getAllTiles();
    return tiles.reduce((currentBoard, tile) => {
      if (tile.id === id1) {
        const newTile = this.cloneTile(id2);
        const positionTile = newTile.modify({
          x: tile.x,
          y: tile.y
        });
        return currentBoard.modify(tile.x, tile.y, positionTile);
      } else if (tile.id === id2) {
        const newTile = this.cloneTile(id1);
        const positionTile = newTile.modify({
          x: tile.x,
          y: tile.y
        });
        return currentBoard.modify(tile.x, tile.y, positionTile);
      }
      return currentBoard;
    }, board);
  }

  // find random tile of type that is NOT at currentCoords
  public findTile(board: Board, currentCoords: Coords, id): Tile {
    const tiles = board.getAllTiles();
    const teleporters = tiles.filter(tile => {
      if (tile.x === currentCoords.x && tile.y === currentCoords.y) {
        return false;
      }
      return tile.id === id;
    });
    if (teleporters.size === 0) {
      return null;
    }
    const chosenID = Math.floor(Math.random() * teleporters.size);

    const newTile = teleporters.get(chosenID); // this is an Immutable list so needs to use their functions
    return newTile;
  }

  // rotates board, returns new board and new renderAngle
  // really should be two functions
  public rotateBoard(board: Board, clockwise: boolean): Board {
    const tiles = board.getAllTiles();

    const width = board.getLength() - 1;
    const height = board.getLength() - 1;

    const boardSize = new BoardSize(this.calcBoardSize(board))

    const rotatedBoard = tiles.reduce((currentBoard, tile) => {
      const coords = new Coords({ x: tile.x, y: tile.y });
      const newCoords = this.translateRotation(boardSize, coords, clockwise);
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
      return newRenderAngle;
    }

    newRenderAngle = renderAngle - 90;
    if (newRenderAngle < 0) {
      newRenderAngle = 360 + newRenderAngle;
    }
    return newRenderAngle;
  }

  public makeBoardFromArray(boardArray: Tile[][] = []): Board {
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

  public generateRandomBoard(boardSize: BoardSize, tileSet: TileSet): Board {
    const boardArray = [];

    for (let x = 0; x < boardSize.width; x++) {
      boardArray[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        const blankTile = this.getRandomTile(tileSet.getTiles());
        const positionedTile = blankTile.modify({
          x,
          y
        });
        boardArray[x][y] = blankTile;
      }
    }
    return new Board(boardArray);
  }

  protected getTile(board: Board, x: number, y: number) {
    const coords = new Coords({ x, y });
    return this.getTileWithCoords(board, coords);
  }

  protected getPrototypeTile(id): object {
    return this.tileSet.getTile(id);
  }

  protected translateRotation(boardSize: BoardSize, coords: Coords, clockwise: boolean): Coords {
    const width = boardSize.width - 1;
    const height = boardSize.height - 1;

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
