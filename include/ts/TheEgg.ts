// this is the egg
// it accepts a GameState and an Action
// and returns a new GameState
// totally fucking stateless and burnable in itself

import { Board } from "./Board";
import { BoardSize } from "./BoardSize";
import { GameState } from "./GameState";
import { Map } from "./Map";
import { Movement } from "./Movement";
import { Player } from "./Player";

export class TheEgg {
  public doAction(
    gameState: GameState,
    action: string,
    timePassed: number
  ): GameState {
    if (action === "rotateLeft") {
      return this.doRotate(gameState, false);
    } else if (action === "rotateRight") {
      return this.doRotate(gameState, true);
    } else if (action === "play") {
      return this.doGameMove(gameState);
    }
    return gameState;
  }

  // this is where we have to do a shitload of things
  protected doGameMove(gameState: GameState, timePassed: number): GameState {
    const movement = new Movement(this.map, this);
    const newPlayers = movement.doCalcs(gameState.players, timePassed);

    const collisions = new Collisions(this, this.playerTypes);
    const sortedPlayers = collisions.checkAllCollisions(newPlayers);

    this.players = sortedPlayers; // replace with new objects

    return gameState;
  }

  // this rotates board and players
  // it DOES NOT do animation - not our problem
  protected doRotate(gameState: GameState, clockwise: boolean): GameState {
    const rotations = gameState.rotations + 1;

    const boardSize = new BoardSize(gameState.board.getLength());

    const map = new Map(null, boardSize);

    const newBoard = map.rotateBoard(gameState.board, clockwise);

    const rotatedPlayers = gameState.players.map(player => {
      return map.rotatePlayer(player, clockwise);
    });

    const rotateAngle: number = map.changeRenderAngle(
      gameState.rotateAngle,
      clockwise
    );

    return gameState.modify({
      board: newBoard,
      players: rotatedPlayers,
      rotateAngle,
      rotations
    });
  }

  // check leftovers on board and whether player is over finish tile
  protected checkLevelIsCompleted(gameState: GameState): GameState {
    const collectable = this.getCollectable(gameState.board);
    const playerCount: number = this.countPlayers(gameState.players);
    if (collectable < 1 && playerCount < 2) {
      // change gameState.outcome to "nextLevel" or something, I don't know
    }
    return gameState;
  }

  protected countPlayers(players: Player[]): number {
    const validPlayers = players.filter(player => {
      return player && player.value > 0;
    });
    return validPlayers.length;
  }

  // get total outstanding points left to grab on board
  protected getCollectable(board: Board): number {
    const tiles = board.getAllTiles();
    return tiles.reduce((collectable, tile) => {
      const score = tile.collectable;
      if (score > 0) {
        return collectable + score;
      }
    }, 0);
  }
}
