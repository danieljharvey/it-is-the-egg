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

    const actual = BoardCollisions.checkBoardCollisions(board, playerTypes, [player1])

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

    const actual = BoardCollisions.checkBoardCollisions(blankBoard, playerTypes, [player1])

    expect(actual).toEqual([player1]);
})

test("Do nothing when player is not on tile", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 2,
            y: 2
        })
    });

    const actual = BoardCollisions.checkBoardCollisions(board, playerTypes, [player1])

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

    const actual = BoardCollisions.checkBoardCollisions(board, playerTypes, [player1])

    expect(actual).toEqual([player1]);
})

test("Split a 2-value egg", () => {
    const actual = BoardCollisions.newValues(2)

    expect(actual).toEqual([1,1])
})

test("Split a 3-value egg", () => {
    const actual = BoardCollisions.newValues(3)

    expect(actual).toEqual([2,1])
})

test("Split a 4-value egg", () => {
    const actual = BoardCollisions.newValues(4)

    expect(actual).toEqual([2,2])
})

test("Split a 2-value egg", () => {
    const player = new Player({
        value: 2
    })

    const expected = [
        player.modify({
            direction: new Coords({
                x: -1
            }),
            value: 1
        }),
        player.modify({
            direction: new Coords({
                x: 1
            }),
            value: 1
        }),
    ]

    const actual = BoardCollisions.splitPlayer(playerTypes)(player)

    expect(actual).toEqual(expected)
})

test("Get values and directions", () => {
    const value = 2

    const expected = [
        {value:1, direction: -1},
        {value:1, direction: 1}
    ]

    const actual = BoardCollisions.getValuesAndDirections(value)

    expect(actual).toEqual(expected)
})


test("Split a 3-value egg when the time is right", () => {
    
    const player1 = new Player({
        coords: new Coords({
            x: 1,
            y: 1
        }),
        value: 3
    });

    const expected = [
        player1.modify({
            direction: new Coords({
                x: -1
            }),
            value: 2
        }),
        player1.modify({
            direction: new Coords({
                x: 1
            }),
            value: 1
        }),
    ]

    const actual = BoardCollisions.checkBoardCollisions(board, playerTypes, [player1])

    expect(actual).toEqual(expected);
})