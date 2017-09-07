import * as _ from "ramda";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Player } from "./Player";
import { Renderer } from "./Renderer";

const SPRITE_SIZE: number = 64;

// movement takes the current map, the current players, and returns new player objects
// it is then trashed and a new one made for next move to reduce any real held state
export class Movement {
  map: Map;
  renderer: Renderer;
  jetpack: Jetpack;

  players: Player[] = [];

  constructor(map: Map, renderer: Renderer, jetpack: Jetpack) {
    this.map = map;
    this.renderer = renderer;
    this.jetpack = jetpack;
  }

  // loop through passed players[] array, do changes, return new one
  public doCalcs(players: Player[], timePassed: number) {
    if (!players) return [];
    this.players = players; // store so we can compare
    const newPlayers = players.map(player => {
      return this.doPlayerCalcs(player, timePassed);
    });
    return newPlayers;
  }

  protected doPlayerCalcs(player: Player, timePassed: number): Player {
    const startCoords = player.coords;

    this.setRedrawAroundPlayer(player);

    const newPlayer = this.incrementPlayerFrame(player);

    const newerPlayer = this.checkFloorBelowPlayer(timePassed, newPlayer);

    const evenNewerPlayer = this.incrementPlayerDirection(
      timePassed,
      newerPlayer
    );

    const newestPlayer = this.correctPlayerOverflow(evenNewerPlayer);

    const absolutelyNewestPlayer = this.checkTileAction(
      startCoords,
      newestPlayer
    );

    this.setRedrawAroundPlayer(absolutelyNewestPlayer);

    return absolutelyNewestPlayer;
  }

  protected checkTileAction(startCoords: Coords, player: Player): Player {
    if (!startCoords.equals(player.coords)) {
      return this.checkPlayerTileAction(player);
    }
    return player;
  }

  protected setRedrawAroundPlayer(player: Player): Player {
    const tiles = this.map.getTilesSurrounding(player.coords);
    tiles.map(tile => {
      const newTile = tile.modify({
        needsDraw: true
      });
      const coords = new Coords(tile.x, tile.y);
      this.map.changeTile(coords, newTile);
    });
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

    if (currentCoords.offsetX != 0 || currentCoords.offsetY != 0) {
      return player;
    }

    const coords = this.map.correctForOverflow(
      currentCoords.x,
      currentCoords.y
    );

    const tile = this.map.getTileWithCoords(coords);

    if (tile.collectable > 0) {
      const score = tile.collectable * player.multiplier;
      const blankTile = this.map.cloneTile(1);
      blankTile.needsDraw = true;
      this.map.changeTile(coords, blankTile);
      this.jetpack.addScore(score);
      return player;
    }

    if (tile.action === "completeLevel") {
      this.jetpack.completeLevel();
    } else if (tile.action == "teleport") {
      return this.teleport(player); // only action that changes player state
    } else if (tile.action == "pink-switch") {
      this.map.switchTiles(15, 16);
    } else if (tile.action == "green-switch") {
      this.map.switchTiles(18, 19);
    }
    return player; // player returned unchanged
  }

  // find another teleport and go to it
  // if no others, do nothing
  protected teleport(player: Player): Player {
    // if (player.lastAction == "teleport") return false;
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

  protected incrementPlayerDirection(timePassed: number, player: Player): Player {
    if (player.moveSpeed === 0) {
      return player;
    }

    const moveAmount = this.calcMoveAmount(
      player.moveSpeed,
      this.renderer.tileSize,
      timePassed
    );

    const coords = player.coords;

    if (player.direction !== 0 && player.falling === false) {
      if (
        !this.map.checkTileIsEmpty(coords.x - 1, coords.y) &&
        !this.map.checkTileIsEmpty(coords.x + 1, coords.y)
      ) {
        return player; // no change
      }
    }

    if (player.direction < 0 && player.falling === false) {
      if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y)) {
        // turn around
        return player.modify({
          coords: coords.modify({
            offsetX: 0
          }),
          direction: 1
        });
      } else {
        // move left
        const newOffsetX = coords.offsetX - moveAmount;
        return player.modify({
          coords: coords.modify({
            offsetX: newOffsetX
          })
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
          direction: -1
        });
      } else {
        // move right
        const newOffsetX = coords.offsetX + moveAmount;
        return player.modify({
          coords: coords.modify({
            offsetX: newOffsetX
          })
        });
      }
    }

    // if we've stopped and ended up not quite squared up, correct this
    if (player.direction === 0 && player.falling === false) {
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

  protected calcMoveAmount(
    moveSpeed: number,
    tileSize: number,
    timePassed: number
  ): number {
    const fullSize = SPRITE_SIZE; // size of image tiles
    const moveAmount: number = tileSize / fullSize * moveSpeed;
    const frameRateAdjusted: number = moveAmount * (timePassed / 2);
    return frameRateAdjusted;
  }

  protected correctPlayerOverflow(player: Player): Player {
    const newCoords = this.correctTileOverflow(player.coords);
    const loopedCoords = this.map.correctForOverflow(
      newCoords.x,
      newCoords.y,
      newCoords.offsetX,
      newCoords.offsetY
    );

    return player.modify({
      coords: loopedCoords,
      lastAction: ""
    });
  }

  protected correctTileOverflow(coords: Coords): Coords {
    if (coords.offsetX > SPRITE_SIZE) {
      // move one tile to right
      return coords.modify({
        x: coords.x + 1,
        offsetX: 0
      });
    }

    if (coords.offsetX < -1 * SPRITE_SIZE) {
      // move one tile to left
      return coords.modify({
        x: coords.x - 1,
        offsetX: 0
      });
    }

    if (coords.offsetY > SPRITE_SIZE) {
      // move one tile down
      return coords.modify({
        y: coords.y + 1,
        offsetY: 0
      });
    }

    if (coords.offsetY < -1 * SPRITE_SIZE) {
      // move one tile up
      return coords.modify({
        y: coords.y - 1,
        offsetY: 0
      });
    }

    return coords;
  }

  protected checkFloorBelowPlayer(timePassed: number, player: Player) {
    if (player.coords.offsetX !== 0) return player;

    const coords = player.coords;

    const belowCoords = this.map.correctForOverflow(
      coords.x,
      coords.y + 1,
      coords.offsetX,
      coords.offsetY
    );

    const tile = this.map.getTileWithCoords(belowCoords);

    if (tile.background) {
      const fallAmount: number = this.calcMoveAmount(
        player.fallSpeed,
        this.renderer.tileSize,
        timePassed
      );
      const coords = player.coords.modify({
        offsetY: player.coords.offsetY + fallAmount
      });
      return player.modify({
        coords,
        falling: true
      });
    } else if (player.falling && tile.breakable) {
      this.map.changeTile(belowCoords, this.map.cloneTile(1)); // smash block, replace with empty
    } else {
      return player.modify({
        falling: false
      });
    }
    return player; // no change
  }
}
