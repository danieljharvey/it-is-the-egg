import * as _ from "ramda";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Player } from "./Player";
import { Renderer } from "./Renderer";

const OFFSET_DIVIDE: number = 100;

// movement takes the current map, the current players, and returns new player objects
// it is then trashed and a new one made for next move to reduce any real held state
export class Movement {
  protected map: Map;
  protected jetpack: Jetpack;

  protected players: Player[] = [];

  constructor(map: Map, jetpack: Jetpack) {
    this.map = map;
    this.jetpack = jetpack;
  }

  // loop through passed players[] array, do changes, return new one
  public doCalcs(players: Player[], timePassed: number) {
    if (!players) {
      return [];
    }
    this.players = players; // store so we can compare
    const newPlayers = players.map(player => {
      return this.doPlayerCalcs(player, timePassed);
    });
    return newPlayers;
  }

  public correctTileOverflow(coords: Coords): Coords {
    if (coords.offsetX >= OFFSET_DIVIDE) {
      // move one tile to right
      return coords.modify({
        offsetX: 0,
        x: coords.x + 1
      });
    }

    if (coords.offsetX <= -1 * OFFSET_DIVIDE) {
      // move one tile to left
      return coords.modify({
        offsetX: 0,
        x: coords.x - 1
      });
    }

    if (coords.offsetY >= OFFSET_DIVIDE) {
      // move one tile down
      return coords.modify({
        offsetY: 0,
        y: coords.y + 1
      });
    }

    if (coords.offsetY <= -1 * OFFSET_DIVIDE) {
      // move one tile up
      return coords.modify({
        offsetY: 0,
        y: coords.y - 1
      });
    }

    return coords;
  }

  protected doPlayerCalcs(player: Player, timePassed: number): Player {
    const startCoords = player.coords;

    const newPlayer = this.incrementPlayerFrame(player);

    const newerPlayer = this.checkFloorBelowPlayer(timePassed, newPlayer);

    const checkedPlayer = this.checkPlayerDirection(newerPlayer);

    const evenNewerPlayer = this.incrementPlayerDirection(
      timePassed,
      checkedPlayer
    );

    const newestPlayer = this.correctPlayerOverflow(evenNewerPlayer);

    const absolutelyNewestPlayer = this.checkTileAction(
      startCoords,
      newestPlayer
    );

    return absolutelyNewestPlayer;
  }

  protected checkTileAction(startCoords: Coords, player: Player): Player {
    if (!startCoords.equals(player.coords)) {
      return this.checkPlayerTileAction(player);
    }
    return player;
  }

  protected incrementPlayerFrame(player: Player): Player {
    if (
      player.direction === 0 &&
      player.oldDirection === 0 &&
      player.currentFrame === 0
    ) {
      // we are still, as it should be
      return player;
    }

    if (player.direction === 0 && player.currentFrame === 0) {
      // if we're still, and have returned to main frame, disregard old movement
      return player.modify({
        oldDirection: 0
      });
    }

    let newFrame = player.currentFrame;

    // if going left, reduce frame
    if (player.direction < 0 || player.oldDirection < 0) {
      newFrame = player.currentFrame - 1;
      if (newFrame < 0) {
        newFrame = player.frames - 1;
      }
    }

    // if going right, increase frame
    if (player.direction > 0 || player.oldDirection > 0) {
      newFrame = player.currentFrame + 1;
      if (newFrame >= player.frames) {
        newFrame = 0;
      }
    }

    return player.modify({
      currentFrame: newFrame
    });
  }

  protected checkPlayerTileAction(player: Player): Player {
    const currentCoords = player.coords;

    if (currentCoords.offsetX !== 0 || currentCoords.offsetY !== 0) {
      return player;
    }

    const coords = this.map.correctForOverflow(currentCoords);

    const tile = this.map.getTileWithCoords(coords);

    if (tile.collectable > 0) {
      const score = tile.collectable * player.multiplier;
      const blankTile = this.map.cloneTile(1);

      this.map.changeTile(coords, blankTile);
      this.jetpack.addScore(score);
      return player;
    }

    if (tile.action === "completeLevel") {
      this.jetpack.completeLevel();
    } else if (tile.action === "teleport") {
      return this.teleport(player); // only action that changes player state
    } else if (tile.action === "pink-switch") {
      const changedCoords = this.map.switchTiles(15, 16);
    } else if (tile.action === "green-switch") {
      const changedCoords = this.map.switchTiles(18, 19);
    }
    return player; // player returned unchanged
  }



  // find another teleport and go to it
  // if no others, do nothing
  protected teleport(player: Player): Player {
    // if (player.lastAction === "teleport") return false;
    const newTile = this.map.findTile(player.coords, 14);
    if (newTile) {
      return player.modify({
        coords: player.coords.modify({
          x: newTile.x,
          y: newTile.y
        }),
        lastAction: "teleport"
      });
    }
    return player;
  }

  // this checks whether the next place we intend to go is a goddamn trap, and changes direction if so
  protected checkPlayerDirection(player: Player): Player {
    const coords = player.coords;

    if (player.direction !== 0 && player.falling === false) {
      if (
        !this.map.checkTileIsEmpty(coords.x - 1, coords.y) &&
        !this.map.checkTileIsEmpty(coords.x + 1, coords.y)
      ) {
        return player.modify({
          stop: true // don't go on this turn
        });
      }
    }

    if (player.direction < 0 && player.falling === false) {
      if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y)) {
        // turn around
        return player.modify({
          coords: coords.modify({
            offsetX: 0
          }),
          direction: 1,
          stop: false
        });
      }
    }

    if (player.direction > 0 && player.falling === false) {
      if (!this.map.checkTileIsEmpty(coords.x + 1, coords.y)) {
        // turn around
        return player.modify({
          coords: coords.modify({
            offsetX: 0
          }),
          direction: -1,
          stop: false
        });
      }
    }

    return player.modify({
      stop: false
    });
  }

  // this does the left/right moving, but does not care if walls are there as that is the responsibility of checkPlayerDirection
  protected incrementPlayerDirection(
    timePassed: number,
    player: Player
  ): Player {
    // falling is priority - do this if a thing
    if (player.falling) {
      const fallAmount: number = this.calcMoveAmount(
        player.fallSpeed,
        timePassed
      );
      const newOffsetY = player.coords.offsetX + fallAmount;
      const newCoords = player.coords.modify({
        offsetY: player.coords.offsetY + fallAmount
      });
      return player.modify({
        coords: newCoords
      });
    }

    if (player.moveSpeed === 0 || player.stop !== false) {
      // we are still, no need for movement
      return player;
    }

    const moveAmount = this.calcMoveAmount(player.moveSpeed, timePassed);

    const coords = player.coords;

    if (player.direction < 0) {
      // move left
      const newOffsetX = coords.offsetX - moveAmount;
      return player.modify({
        coords: coords.modify({
          offsetX: newOffsetX
        })
      });
    } else if (player.direction > 0) {
      // move right
      const newOffsetX = coords.offsetX + moveAmount;

      return player.modify({
        coords: coords.modify({
          offsetX: newOffsetX
        })
      });
    }

    // if we've stopped and ended up not quite squared up, correct this
    if (player.direction === 0) {
      if (coords.offsetX > 0) {
        // shuffle left
        const newOffsetX = coords.offsetX - moveAmount;

        return player.modify({
          coords: coords.modify({
            offsetX: newOffsetX
          })
        });
      } else if (coords.offsetX < 0) {
        // shuffle right
        const newOffsetX = coords.offsetX + moveAmount;

        return player.modify({
          coords: coords.modify({
            offsetX: newOffsetX
          })
        });
      }
    }

    // do nothing, return same object
    return player;
  }

  protected calcMoveAmount(moveSpeed: number, timePassed: number): number {
    const moveAmount: number = 1 / OFFSET_DIVIDE * moveSpeed * 5;
    const frameRateAdjusted: number = moveAmount * timePassed;
    if (isNaN(frameRateAdjusted)) {
      return 0;
    }
    return frameRateAdjusted;
  }

  protected correctPlayerOverflow(player: Player): Player {
    const newCoords = this.correctTileOverflow(player.coords);
    const loopedCoords = this.map.correctForOverflow(newCoords);

    return player.modify({
      coords: loopedCoords,
      lastAction: ""
    });
  }

  protected checkFloorBelowPlayer(timePassed: number, player: Player) {
    if (player.coords.offsetX !== 0) {
      return player;
    }

    const coords = player.coords;

    const belowCoords = this.map.correctForOverflow(
      coords.modify({ y: coords.y + 1 })
    );

    const tile = this.map.getTileWithCoords(belowCoords);

    if (tile.background) {
      // gap below, start falling down it
      return player.modify({
        falling: true
      });
    } else if (player.falling && tile.breakable) {
      // if tile below is breakable (and we are already falling and thus have momentum, smash it)
      this.map.changeTile(belowCoords, this.map.cloneTile(1)); // smash block, replace with empty
      return player; // already falling
    }

    // solid ground, stop falling
    return player.modify({
      falling: false
    });
  }
}
