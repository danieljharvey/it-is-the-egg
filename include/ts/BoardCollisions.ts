import { fromJS, List } from "immutable";
import { Board } from "./Board"
import { Coords } from "./Coords";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";
import { Tile } from "./Tile"
import { Utils } from "./Utils";

import * as _ from "ramda";

// Board Collide
// deals with egg splitting tiles

export const checkBoardCollisions = (board: Board, players: Player[]): Player[] => {
    return players.reduce((newPlayers, player) => {
        const checkedPlayers = checkPlayerBoardCollision(board)(player)
        return [...newPlayers, ...checkedPlayers]
    }, [])
}

const checkPlayerBoardCollision = (board: Board) => (player: Player): Player[] => {
    
    if (player.coords.offsetX !== 0 || player.coords.offsetY !== 0) {
        return [player]
    }

    const tiles = getSplitterTiles(board)
    if (tiles.size === 0) {
        return [player]
    }

    const isPlayerOnTileFunc = isPlayerOnTile(player)
    const collidedTiles = tiles.filter(isPlayerOnTileFunc)

    if (collidedTiles.size === 0) {
        return [player]
    }

    if (player.value < 2) {
        return [player]
    }

    // damn, we've collided, better split the egg
    
    // const tiles = 
    // console.log(tiles)
    // return [player]
}

const isSplitterTile = (tile: Tile) => (tile.get("action") === "split-eggs")

export const getSplitterTiles = (board: Board) => {
    return board.getAllTiles()
                .filter(isSplitterTile)
}

export const isPlayerOnTile = (player: Player) => (tile: Tile) : boolean => {
    return (player.coords.x === tile.x && player.coords.y === tile.y)
}

