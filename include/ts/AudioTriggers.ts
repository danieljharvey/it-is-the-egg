import { List } from 'immutable'
import * as _ from 'ramda'
import { Maybe } from 'tsmonad'

import { Board } from "./Board"
import { GameState } from "./GameState"
import { Tile } from "./Tile"

// AudioTriggers
// check old and new game state and trigger sounds from it

interface IAudioTrigger {
    name: string
    pan?: number
}

interface ICompareTiles {
    old: Tile
    new: Tile
}

export const triggerSounds = (oldState: GameState) => (newState: GameState) => {
    const eatenSounds = getEatenSounds(oldState)(newState)
    
    return [...eatenSounds]
}

const hasRotated = (oldGame: GameState, newGame: GameState) : boolean => (oldGame.rotateAngle === newGame.rotateAngle)

const getEatenSounds = (oldState: GameState) => (newState: GameState) : Array<Maybe<IAudioTrigger>>  => {
    if (hasRotated(oldState, newState)) {
        return findEatenThings(oldState.board)(newState.board)
    } else {
        return [rotateSound()]
    }
}

const rotateSound = () : Maybe<IAudioTrigger> => {
    return Maybe.just({
        name: "warp",
        pan: 0
    })
}

// diffs board changes and outputs list of sounds to play
export const findEatenThings = (oldBoard: Board) => (board: Board): Array<Maybe<IAudioTrigger>> => {
    
    const boardSize = board.getLength();

    const oldTiles = oldBoard.getAllTiles()
    const newTiles = board.getAllTiles()

    const tiles: ICompareTiles[] = getDiffTiles(oldTiles)(newTiles)
    const coins = tiles.filter(filterUnchanged).map(gotCoins(boardSize))
    return [...coins]
}

const filterUnchanged = (tiles: ICompareTiles) => _.not(megaEquals(tiles.new, tiles.old))

const megaEquals = (x, y) : boolean => {
    if (typeof x.equals !== 'undefined') {
        return x.equals(y)
    }
    return x === y
}

const getDiffTiles = (oldTiles: List<Tile>) => (newTiles: List<Tile>) => oldTiles.zipWith((oldTile: Tile, tile: Tile) => {
    return {
        'old':oldTile,
        'new':tile
    }
}, newTiles).toJS()

const filterGotCoins = (tiles: ICompareTiles) : boolean => {
    return (tiles.old.collectable > tiles.new.collectable)
}

export const gotCoins = (boardSize: number) => (tiles: ICompareTiles) : Maybe<IAudioTrigger> => {
    return (filterGotCoins(tiles)) ? Maybe.just({
        name: "pop",
        pan: calcPan(boardSize)(tiles.new.x)
    }) : Maybe.nothing();
}

// super basic for now
const calcPan = (boardSize: number) => (x : number) : number => {
    const ratio = x / (boardSize - 1);
    return (ratio * 2) - 1
}