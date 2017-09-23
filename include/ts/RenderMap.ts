import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { Coords } from "./Coords";
import { Player } from "./Player";
import { Utils } from "./Utils";

// this is not a render map object, but a class for making them

export class RenderMap {
  // render map

  public static copyRenderMap(renderMap: boolean[][]): boolean[][] {
    return renderMap.slice(0);
  }

  // add player to renderMap, returning new renderMap
  public static addPlayerToRenderMap(
    player: Player,
    renderMap: boolean[][]
  ): boolean[][] {
    console.log("RenderMap->addPlayerToRenderMap", player);

    const coords = player.coords;

    const startX = coords.x - 1;
    const endX = coords.x + 1;

    const startY = coords.y - 1;
    const endY = coords.y + 1;

    const newRenderMap = this.copyRenderMap(renderMap);

    const boardSize = new BoardSize(renderMap.length);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const newCoords = new Coords({ x, y });
        const fixedCoords = Utils.correctForOverflow(newCoords, boardSize);
        newRenderMap[fixedCoords.x][fixedCoords.y] = true;
      }
    }
    return newRenderMap;
  }

  // takes oldBoard and newBoard and creates a map of changes between them
  public static createRenderMapFromBoards(
    oldBoard: Board,
    newBoard: Board
  ): boolean[][] {
    const boardArray = this.createRenderMap(oldBoard.getLength(), false);

    return boardArray.map((column, x) => {
      return column.map((tile, y) => {
        const oldTile = oldBoard.getTile(x, y);
        const newTile = newBoard.getTile(x, y);
        if (oldTile.equals(newTile)) {
          return false;
        } else {
          return true;
        }
      });
    });
  }

  // combines any two renderMaps (using OR)
  // assumes they are same size
  public static combineRenderMaps(
    renderMap: boolean[][],
    newRenderMap: boolean[][]
  ) {
    return renderMap.map((column, x) => {
      return column.map((entry, y) => {
        return entry || newRenderMap[x][y];
      });
    });
  }

  // create an empty render map
  public static createRenderMap(size: number, value: boolean) {
    const boardArray = [];
    for (let x = 0; x < size; x++) {
      boardArray[x] = [];
      for (let y = 0; y < size; y++) {
        boardArray[x][y] = value;
      }
    }
    return boardArray;
  }

  // end of render map
}
