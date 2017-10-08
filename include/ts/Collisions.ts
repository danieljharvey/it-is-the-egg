import { Coords } from "./Coords";
import { List, toJS } from "immutable";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";
import { Utils } from "./Utils";

export class Collisions {
  protected playerTypes: object;

  protected players: Player[];

  constructor(playerTypes: object) {
    this.playerTypes = playerTypes;
  }

  public checkAllCollisions(players: Player[]) : Player[] {

    const combinations = this.getAllPlayerCombinations(players);

    // only one egg, do nothing
    if (combinations.length === 0 ) {
      return players;
    }

    const collided = this.findCollisions(combinations, players);

    const oldPlayers = this.removeCollidedPlayers(collided, players);

    const newPlayers = this.createNewPlayers(collided, players);

    return oldPlayers.concat(newPlayers);
  }

  // send an array of pairs of player ids, returns all that collide
  protected findCollisions(combinations: number[][], players: Player[]): number[][] {
    return combinations.filter((comb) => {
      const player1 = this.fetchPlayerByID(players, comb[0]);
      const player2 = this.fetchPlayerByID(players, comb[1]);
      return this.checkCollision(player1, player2);
    });
  }

  // returns all non-collided players
  // collided is any number of pairs of IDs, ie [[1,3], [3,5]] 
  protected removeCollidedPlayers(collided: number[][], players: Player[]): Player[] {
    const collidedIDs = Utils.flattenArray(collided);
    const uniqueIDs = Utils.removeDuplicates(collidedIDs);

    return players.filter(player => {
      if (uniqueIDs.indexOf(player.id) === -1) {
        return true;
      }
      return false;
    })
  }

  // go through each collided pair and combine the players to create new ones
  protected createNewPlayers(collided, players: Player[]): Player[] {
    return collided.reduce((newPlayers, collidedIDs) => {
      const player1 = this.fetchPlayerByID(players, collidedIDs[0]);
      const player2 = this.fetchPlayerByID(players, collidedIDs[1]);
      if (player1 === false || !player2 === false) {
        return newPlayers;
      }
      return newPlayers.concat(this.combinePlayers(player1, player2));
    }, []);
  }

  protected fetchPlayerByID(players: Player[], id: number) : Player | boolean {
    const matching = players.filter(player => {
      return (player.id === id);
    });

    if (matching.length === 0 ) {
      return false;
    }

    // found one!
    return matching.slice(0,1)[0];
  }

  protected getAllPlayerCombinations(players: Player[]): number[][] {

    return players.reduce((total, player) => {
      const otherPlayers = players.filter(otherPlayer => {
        return (player.id < otherPlayer.id);
      });
      const combos = otherPlayers.map(otherPlayer => {
        return [player.id, otherPlayer.id];
      });
      return total.concat(this.cleanCombos(combos));
    }, []);
  }

  // un-immutables values for sanity's sake
  protected cleanCombos(combo: any): number[] {
    if (List.isList(combo)) {
      return combo.toJS();
    }
    return combo
  }

  protected getAllPlayerIDs(players: Player[]) {
    return players.map(player => {
      return player.id;
    });
  }

  // only deal with horizontal collisions for now
  protected checkCollision(player1: Player, player2: Player) {
    
    if (!player1 || !player2) {
      return false;
    }

    if (player1.id === player2.id) {
      return false;
    }

    if (player1.value === 0 || player2.value === 0) {
      return false;
    }

    const coords1 = player1.coords;
    const coords2 = player2.coords;

    if (coords1.y !== coords2.y) {
      return false;
    }

    let distance =
      coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
    if (distance < 0) {
      distance = distance * -1;
    }

    if (distance <= 20) {
      return true;
    }

    // nothing changes
    return false;
  }

  protected chooseHigherLevelPlayer(player1: Player, player2: Player) {
    if (player1.value > player2.value) {
      return player1;
    }
    if (player2.value > player1.value) {
      return player2;
    }
    if (player1.value === player2.value) {
      return player1;
    }
  }

  protected getPlayerByValue(playerTypes, value: number) {
    for (const i in this.playerTypes) {
      if (playerTypes[i].value === value) {
        return playerTypes[i];
      }
    }
    return false;
  }

  protected combinePlayers(player1: Player, player2: Player): Player[] {
    const newValue = player1.value + player2.value;
    const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);

    const newPlayerType = this.getPlayerByValue(this.playerTypes, newValue);

    if (!newPlayerType) {
      return [
        player1,
        player2
      ];
    }

    const newPlayerParams = Object.assign({}, newPlayerType, {coords: higherPlayer.coords, direction: higherPlayer.direction});

    return [
      player1.modify(newPlayerParams)
    ];
  }
}
