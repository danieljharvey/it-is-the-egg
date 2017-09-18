import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";

export class Collisions {
  protected jetpack: Jetpack;
  protected playerTypes: object;

  protected players: Player[];

  constructor(jetpack: Jetpack, playerTypes: object) {
    this.jetpack = jetpack;
    this.playerTypes = playerTypes;
  }

  public checkAllCollisions(players: Player[]) {
    this.players = players;

    players.map(player => {
      this.checkPlayerCollisions(player, players);
    });
    return players;
  }

  // cycles through all players and check
  protected checkPlayerCollisions(player: Player, otherPlayers: Player[]) {
    otherPlayers.map(otherPlayer => {
      this.handleCollision(player, otherPlayer);
    });
  }

  // this does the action so checkCollision can remain pure at heart
  protected handleCollision(player1: Player, player2: Player) {
    if (this.checkCollision(player1, player2)) {
      this.combinePlayers(player1, player2);
      return true;
    }
    return false;
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

  protected deletePlayer(player: Player) {
    delete this.players[player.id];
  }

  protected addPlayer(player: Player) {
    this.players[player.id] = player;
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

  protected getPlayerByValue(playerTypes, value:number) {
    for (let i in this.playerTypes) {
      if (playerTypes[i].value === value) {
        return playerTypes[i];
      }
    }
    return false;
  }

  protected combinePlayers(player1: Player, player2: Player) {
    // console.log('combinePlayers', player1, player2);
    const newValue = player1.value + player2.value;
    const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);

    const newPlayerType = this.getPlayerByValue(this.playerTypes, newValue);

    if (!newPlayerType) {
      return {
        player1,
        player2
      };
    }
    
    const newPlayer = this.jetpack.createNewPlayer(
      newPlayerType.type,
      higherPlayer.coords,
      higherPlayer.direction
    );
    this.addPlayer(newPlayer);
    this.deletePlayer(player1);
    this.deletePlayer(player2);
    return true;
  }
}
