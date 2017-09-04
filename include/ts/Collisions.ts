import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";

export class Collisions {
  jetpack: Jetpack;
  playerTypes: object;

  players: Player[];

  constructor(jetpack: Jetpack, playerTypes: object) {
    this.jetpack = jetpack;
    this.playerTypes = playerTypes;
  }

  checkAllCollisions(players: Player[]) {
    this.players = players;

    players.map(player => {
      this.checkPlayerCollisions(player, players);
    });
    return players;
  }

  // cycles through all players and check
  checkPlayerCollisions(player: Player, otherPlayers: Player[]) {
    otherPlayers.map(otherPlayer => {
      this.checkCollision(player, otherPlayer);
    });
  }

  // only deal with horizontal collisions for now
  checkCollision(player1: Player, player2: Player) {
    if (!player1 || !player2) return false;

    if (player1.id == player2.id) return false;

    const coords1 = player1.coords;
    const coords2 = player2.coords;

    if (coords1.y != coords2.y) return false;

    let distance =
      coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
    if (distance < 0) distance = distance * -1;

    if (distance < 40) {
      return this.combinePlayers(player1, player2);
    }

    // nothing changes
    return {
      player1,
      player2
    };
  }

  deletePlayer(player: Player) {
    delete this.players[player.id];
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
  }

  chooseHigherLevelPlayer(player1: Player, player2: Player) {
    if (player1.value > player2.value) return player1;
    if (player2.value > player1.value) return player2;
    if (player1.value == player2.value) return player1;
  }

  combinePlayers(player1: Player, player2: Player) {
    //console.log('combinePlayers', player1, player2);
    const newValue = player1.value + player2.value;
    const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);

    for (const type in this.playerTypes) {
      if (this.playerTypes[type].value == newValue) {
        const newPlayer = this.jetpack.createNewPlayer(
          type,
          higherPlayer.coords,
          higherPlayer.direction
        );
        this.addPlayer(newPlayer);
        this.deletePlayer(player1);
        this.deletePlayer(player2);
        return true;
      }
    }

    // nothing changes
    return {
      player1,
      player2
    };
  }
}
