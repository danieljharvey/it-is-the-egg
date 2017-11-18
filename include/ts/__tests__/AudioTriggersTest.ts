import { fromJS, List } from 'immutable'
import * as _ from 'ramda'
import { Maybe } from 'tsmonad'

import * as AudioTriggers  from "../AudioTriggers";
import { Board } from "../Board"
import { GameState } from "../GameState"
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

  const change = AudioTriggers.gotCoins({old: tile, new: newTile})

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
  const array = [[4, 5, new Tile({collectable: 10})], [7, 8, 9]];

  const board = new Board(array);

  const changedArray = [[4, 5, new Tile({collectable: 0})], [7, 8, 9]];

  const changedBoard = new Board(changedArray)

  const actual = AudioTriggers.findEatenThings(board)(changedBoard)
  
  const expectedArray = [
    Maybe.just({
      name: "pop",
      pan: 0
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
      },
      nothing: () => {
        expect(false).toEqual(true)
      }
    })
  })
  
  
});