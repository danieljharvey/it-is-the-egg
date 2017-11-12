import { Board } from "../Board"
import * as BoardCollisions from "../BoardCollisions";
import { Coords } from "../Coords";
import { Player } from "../Player";
import { Tile } from "../Tile"

const playerTypes = {
  "egg": {
    value: 1
  },
  "big-egg": {
      value: 2
  },
  "enemy": {
    value: 0,
    flying: true
  }
};

const blankTile = new Tile({
    background: true
})

const splitterTile = new Tile({
    background: true,
    action: "split-eggs",
    x: 1,
    y: 1
})

const blankBoardArray = [
    [blankTile, blankTile],
    [blankTile, blankTile]
]

const blankBoard = new Board(blankBoardArray)

const boardArray = [
    [blankTile, blankTile, blankTile],
    [blankTile, splitterTile, blankTile],
    [blankTile, blankTile, blankTile]
]

const board = new Board(boardArray)

test("Ignores when not on whole tile", () => {
    const player1 = new Player({
        coords: new Coords({
            offsetX: 10
        })
    });

    const actual = BoardCollisions.checkBoardCollisions(board, [player1])

    expect(actual).toEqual([player1]);
});

test("Get splitter tiles", () => {

    const tiles = BoardCollisions.getSplitterTiles(board)

    expect(tiles.size).toEqual(1)
})

test("Do nothing when no splitter tiles", () => {
    
    const player1 = new Player({
        coords: new Coords({
            offsetX: 10
        })
    });

    const actual = BoardCollisions.checkBoardCollisions(blankBoard, [player1])

    expect(actual).toEqual([player1]);
})

test("Do nothing when player is not on tile", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 2,
            y: 2
        })
    });

    const actual = BoardCollisions.checkBoardCollisions(board, [player1])

    expect(actual).toEqual([player1]);
})

test("Recognse if player is on a tile", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 1,
            y: 1
        })
    });

    const tile = new Tile({
        action: "split-eggs",
        x: 1,
        y: 1
    })
    
    const actual = BoardCollisions.isPlayerOnTile(player1)(tile)

    expect(actual).toEqual(true)
})

test("Recognse if player isn't on a tile", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 1,
            y: 1
        })
    });

    const tile = new Tile({
        action: "split-eggs",
        x: 1,
        y: 2
    })
    
    const actual = BoardCollisions.isPlayerOnTile(player1)(tile)

    expect(actual).toEqual(false)
})

test("Do nothing when player is of minimum value", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 1,
            y: 1
        }),
        value: 1
    });

    const actual = BoardCollisions.checkBoardCollisions(board, [player1])

    expect(actual).toEqual([player1]);
})