import { Coords } from "./Coords";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";

export class Collisions {
  protected playerTypes: object;

  protected players: Player[];

  constructor(playerTypes: object) {
    this.playerTypes = playerTypes;
  }

  public checkAllCollisions(players: Player[]) {
    
    const combinations = this.getAllPlayerCombinations(players);

    // only one egg, do nothing
    if (combinations.length === 0 ) {
      return players;
    }

    const newPlayers = [];

    combinations.reduce((currentPlayers, comb) => {
      console.log(comb);
      const player1 = this.fetchPlayerByID(players, comb[0]);
      const player2 = this.fetchPlayerByID(players, comb[1]);
      const checkedPlayers = this.handleCollision(player1, player2);
      //const newPlayer1 = checkedPlayers[0];
      //const newPlayer2 = checkedPlayers[1];
    }, players);

    return players;
  }

  protected fetchPlayerByID(players: Player[], id: number) {
    const matching = players.filter(player => {
      return (player.id === id);
    });

    if (matching.length === 0 ) {
      return false;
    }
    
    // found one!
    return matching.first();
  }

  protected getAllPlayerCombinations(players: Player[]) {
    const keys = this.getAllPlayerIDs(players);
    
    console.log(keys);

    const combinations = [];

    for (const i = 0; i<keys.length; i++) {
      for (const j = i+1; j<keys.length; j++) {
        combinations.push([i,j]);
      }
    }
    return combinations;
  }

  protected getAllPlayerIDs(players: Player[]) {
    return players.map(player => {
      return player.id;
    });
  }

  // this does the action so checkCollision can remain pure at heart
  protected handleCollision(player1: Player, player2: Player) {
    if (this.checkCollision(player1, player2)) {
      return this.combinePlayers(player1, player2);
    }
    return [player1, player2];
  }

  // only deal with horizontal collisions for now
  protected checkCollision(player1: Player, player2: Player) {
    console.log('checkCollision', player1, player2);
    
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

  protected combinePlayers(player1: Player, player2: Player) {
    console.log("COMBINE!");
    const newValue = player1.value + player2.value;
    const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);

    const newPlayerType = this.getPlayerByValue(this.playerTypes, newValue);

    if (!newPlayerType) {
      return [
        player1,
        player2
      ];
    }

    /*
    const newPlayer = this.jetpack.createNewPlayer(
      newPlayerType.type,
      higherPlayer.coords,
      higherPlayer.direction
    );
*/
    const newPlayerParams = Object.assign({}, newPlayerType, {coords: higherPlayer.coords, direction: higherPlayer.direction});
    
    return [
      player1.modify(newPlayerParams),
      player2.modify({
        type: ""
      })
    ];
  }
}
