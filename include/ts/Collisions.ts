import { Jetpack } from './Jetpack';
import { Player } from './Player';

export class Collisions {

	jetpack: Jetpack;

	constructor(jetpack: Jetpack) {
		this.jetpack = jetpack;	
	}

	// only deal with horizontal collisions for now
	checkCollision(player1: Player, player2: Player) {
		
		if (!player1 || !player2) return false;

		if (player1.id == player2.id) return false;

		// one player falling onto another

		if (player1.x == player2.x && player1.y == player2.y) {
			if (player1.offsetX==0 && player1.offsetY == 0 && player2.offsetX ==0 && player2.offsetY == 0) {
				if (player1.falling || player2.falling) {
					this.combinePlayers(player1, player2);
					return false;
				}
			}
		}

		if (player1.y != player2.y) return false;

		// horizontal collisions

		if (player1.x == player2.x) {
			if (player1.offsetX == 0 && player2.offsetX == 0) {
				this.combinePlayers(player1,player2);
				return false;
			}
		}

		if (player1.offsetX > 0) { // heading right
			if (player1.x + 1 == player2.x && player2.offsetX < 0) {
				this.combinePlayers(player1,player2);
				return false;
			}
		} else if (player1.offsetX < 0) { // heading left
			if (player1.x - 1 == player2.x && player2.offsetX > 0) {
				this.combinePlayers(player1,player2);
				return false;
			}
		}
	}

	combinePlayers(player1: Player, player2: Player) {
		//console.log('combinePlayers', player1, player2);

		if (player1.type=='egg' && player2.type=='egg') {
			var type='red-egg';
			this.jetpack.createNewPlayer(type, player2, player2.direction);	
		} else if (player1.type=='egg' && player2.type=='red-egg') {
			var type='blue-egg';
			this.jetpack.createNewPlayer(type, player2, player2.direction);	
		} else if (player1.type=='red-egg' && player2.type=='egg') {
			var type='blue-egg';
			this.jetpack.createNewPlayer(type, player1, player1.direction);	
		} else if (player1.type=='egg' && player2.type=='blue-egg') {
			var type='yellow-egg';
			this.jetpack.createNewPlayer(type, player2, player2.direction);	
		} else if (player1.type=='blue-egg' && player2.type=='egg') {
			var type='yellow-egg';
			this.jetpack.createNewPlayer(type, player1, player1.direction);	
		} else if (player1.type=='red-egg' && player2.type=='red-egg') {
			var type='yellow-egg';
			this.jetpack.createNewPlayer(type, player2, player2.direction);	
		} 
		this.jetpack.deletePlayer(player1);
		this.jetpack.deletePlayer(player2);
	}

}
