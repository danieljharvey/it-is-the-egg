import { fromJS, List } from 'immutable'
import * as _ from 'ramda'
import { Maybe } from 'tsmonad'

import * as AudioTriggers  from "../AudioTriggers";
import { Board } from "../Board"
import { GameState } from "../GameState"
import { Player } from "../Player"
import { Tile } from "../Tile"

test("No change, no sounds", () => {
  const array = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

  const board = new Board(array);

  const actualValue = AudioTriggers.findEatenThings(board)(board)
  
  expect(actualValue).toEqual([])
});

test("Notices a coin disappear", () => {
  const tile = new Tile({
    collectable: 10
  })

  const newTile = new Tile({

  })

  const change = AudioTriggers.gotCoins(1)({old: tile, new: newTile})

  change.caseOf({
    just: val => {
      expect(true).toEqual(true)
    },
    nothing: () => {
      expect(true).toEqual(false)
    }
  })
})

test("Got a coin", () => {
  const array = [[4, 5, new Tile({collectable: 10})], [7, 8, 9], [7, 8, 9]];

  const board = new Board(array);

  const gameState = new GameState({
    board
  })

  const changedArray = [[4, 5, new Tile({collectable: 0})], [7, 8, 9], [7, 8, 9]];

  const changedBoard = new Board(changedArray)

  const changedGameState = new GameState({
    board: changedBoard
  })

  const actual = AudioTriggers.triggerSounds(gameState)(changedGameState)
  
  const expectedArray = [
    Maybe.just({
      name: "pop",
      pan: -1 // left
    })
  ]

 expect(actual).toEqual(expectedArray)
  
});


test("Got a coin, but rotating", () => {
  
  const array = [[4, 5, new Tile({collectable: 10})], [7, 8, new Tile({collectable: 10})]];

  const board = new Board(array);
  const oldGameState = new GameState({
    board,
    rotateAngle: 0
  })

  const changedArray = [[4, 5, new Tile({collectable: 0})], [7, 8, new Tile({collectable: 0})]];

  const changedBoard = new Board(changedArray)

  const newGameState = new GameState({
    board: changedBoard,
    rotateAngle: 90
  })

  const actual = AudioTriggers.triggerSounds(oldGameState)(newGameState)
  
  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('warp')
        expect(val.pan).toEqual(0)
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
  
});


test("Player hits floor", () => {
  const player = new Player({
    falling: true
  })

  const newPlayer = player.modify({
    falling: false
  })

  const change = AudioTriggers.playerHitsFloor(1)({old: player, new: newPlayer})
  change.caseOf({
    just: val => {
      expect(true).toEqual(true)
    },
    nothing: () => {
      expect(true).toEqual(false)
    }
  })
})

test("Player hits floor full function", () => {
  
  const array = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  
  const board = new Board(array);

  const player = new Player({
    falling: true
  })

  const gameState = new GameState({
    players: [player],
    board
  })

  const newPlayer = new Player({
    falling: false
  })

  const newGameState = new GameState({
    players: [newPlayer],
    board
  })

  const actual = AudioTriggers.triggerSounds(gameState)(newGameState)

  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('thud')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
})

test("Player teleports", () => {
  
  const array = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  
  const board = new Board(array);

  const player = new Player({
    lastAction: ""
  })

  const gameState = new GameState({
    players: [player],
    board
  })

  const newPlayer = new Player({
    lastAction: "teleport"
  })

  const newGameState = new GameState({
    players: [newPlayer],
    board
  })

  const actual = AudioTriggers.triggerSounds(gameState)(newGameState)

  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('soft-bell')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
})


test("Smash a crate", () => {
  
  const array = [[new Tile({breakable: true})]];

  const board = new Board(array);
  const oldGameState = new GameState({
    board
  })

  const newArray = [[new Tile({breakable: false})]];

  const changedBoard = new Board(newArray)

  const newGameState = new GameState({
    board: changedBoard
  })

  const actual = AudioTriggers.triggerSounds(oldGameState)(newGameState)
  
  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('crate-smash')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
  
});

test("Switch is hit (only one sound please)", () => {
  
  const array = [[
    new Tile({
      background: true,
      frontLayer: true,
    }),
    new Tile({
      background: true,
      frontLayer: true,
    })
  ]];

  const board = new Board(array);
  const oldGameState = new GameState({
    board
  })

  const newArray = [[
    new Tile({
      background: false,
    }),
    new Tile({
      background: false,
    })
  ]];

  const changedBoard = new Board(newArray)

  const newGameState = new GameState({
    board: changedBoard
  })

  const actual = AudioTriggers.triggerSounds(oldGameState)(newGameState)
  
  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('switch')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })

  const actualReverse = AudioTriggers.triggerSounds(newGameState)(oldGameState)
  
  expect(actualReverse.length).toEqual(1)

  actualReverse.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('switch')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
  
});

test("Players have combined", () => {
  
  const array = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  
  const board = new Board(array);

  const players = [
    new Player({
      value: 1
    }),
    new Player({
      value: 2
    })
  ];

  const oldGameState = new GameState({
    board,
    players
  })

  const newPlayers = [
    new Player({
      value: 3
    })
  ];

  const newGameState = new GameState({
    board,
    players: newPlayers
  })

  const actual = AudioTriggers.triggerSounds(oldGameState)(newGameState)
  
  expect(actual.length).toEqual(1)

  actual.map(item => {
    item.caseOf({
      just: val => {
        expect(val.name).toEqual('power-up')
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
  
});