import { List } from 'immutable'
import * as _ from 'ramda'
import { Maybe } from 'tsmonad'

import { Board } from "./Board"
import { GameState } from "./GameState"
import { Player } from './Player';
import { Tile } from "./Tile"

// AudioTriggers
// check old and new game state and trigger sounds from it

interface IAudioTrigger {
    name: string
    pan?: number
}


interface ICompare {
    old: any
    new: any
}

interface ICompareTiles {
    old: Tile
    new: Tile
}

interface IComparePlayers {
    old: Player
    new: Player
}

export const triggerSounds = (oldState: GameState) => (newState: GameState) => {
    const eatenSounds = getEatenSounds(oldState)(newState)
    const playerSounds = getPlayerSounds(oldState)(newState)
    return [...eatenSounds, ...playerSounds]
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

    const tiles: ICompareTiles[] = getListDiff(oldTiles)(newTiles)
    const coinSounds = tiles.filter(filterUnchanged).map(gotCoins(boardSize))
    return [...coinSounds]
}

const filterUnchanged = (tiles: ICompare) => _.not(megaEquals(tiles.new, tiles.old))

const megaEquals = (x, y) : boolean => {
    if (typeof x.equals !== 'undefined') {
        return x.equals(y)
    }
    return x === y
}

const getListDiff = (oldList: List<any>) => (newList: List<any>) : any[] => oldList.zipWith((oldItem: any, newItem: any) => {
    return {
        'old':oldItem,
        'new':newItem
    }
}, newList).toJS()

const filterGotCoins = (tiles: ICompareTiles) : boolean => {
    return (tiles.old.collectable > tiles.new.collectable)
}

export const gotCoins = (boardSize: number) => (tiles: ICompareTiles) : Maybe<IAudioTrigger> => {
    return (filterGotCoins(tiles)) ? Maybe.just({
        name: "pop",
        pan: calcPan(boardSize)(tiles.new.x)
    }) : Maybe.nothing();
}

export const getPlayerSounds = (oldState: GameState) => (newState: GameState) => {
    const boardSize = newState.board.getLength();
    const players: IComparePlayers[] = getListDiff(oldState.players)(newState.players)
    const thuds = players.filter(filterUnchanged).map(playerHitsFloor(boardSize))
    return [...thuds];
}

const filterPlayerHitsFloor = (players: IComparePlayers): boolean => {
    return (players.old.falling === true && players.new.falling === false)
}

export const playerHitsFloor = (boardSize: number) => (players: IComparePlayers): Maybe<IAudioTrigger> => {
    return (filterPlayerHitsFloor(players)) ? Maybe.just({
        name: "thud",
        pan: calcPan(boardSize)(players.new.coords.x)
    }) : Maybe.nothing();
}

// super basic for now
const calcPan = (boardSize: number) => (x : number) : number => {
    if (boardSize < 2) {
        return 0
    }
    const ratio = x / (boardSize - 1);
    const ans = (ratio * 2) - 1
    return ans
}