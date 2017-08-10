import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Player } from "./Player";
import { PlayerTypes } from "./PlayerTypes";

export class Collisions {

	jetpack: Jetpack;
	playerTypes: object;

	constructor(jetpack: Jetpack, playerTypes: object) {
		this.jetpack = jetpack;
		this.playerTypes = playerTypes;
	}

	// only deal with horizontal collisions for now
	checkCollision(player1: Player, player2: Player) {

		if (!player1 || !player2) return false;

		if (player1.id == player2.id) return false;

		if (player1.y != player2.y) return false;

		const coords1 = player1.getCoords();
		const coords2 = player2.getCoords();

		let distance = coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
		if (distance < 0) distance = distance * -1;

		if (distance < 40) {
			return this.combinePlayers(player1, player2);
		}

		return false;
	}

	chooseHigherLevelPlayer(player1: Player, player2: Player) {
		if (player1.level > player2.level) return player1;
		if (player2.level > player1.level) return player2;
		if (player1.level == player2.level) return player1;
	}

	combinePlayers(player1: Player, player2: Player) {
		//console.log('combinePlayers', player1, player2);
		const newValue = player1.value + player2.value;
		const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);

		for (const type in this.playerTypes) {
			if (this.playerTypes[type].value == newValue) {
				this.jetpack.createNewPlayer(type, higherPlayer, higherPlayer.direction);
				this.jetpack.deletePlayer(player1);
				this.jetpack.deletePlayer(player2);
				return true;
			}
		}
		return false;
	}

}
