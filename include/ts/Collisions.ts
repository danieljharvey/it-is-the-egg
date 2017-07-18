function Collisions(jetpack: Jetpack) {
	var self = this;

	this.jetpack = jetpack;

	// only deal with horizontal collisions for now
	this.checkCollision = function(player1: Player, player2: Player) {
		
		if (!player1 || !player2) return false;

		if (player1.id == player2.id) return false;

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

	this.combinePlayers = function(player1: Player, player2: Player) {
		
		if (player1.type=='egg' && player2.type=='egg') {
			var type='red-egg';
			var coords={
				'x':player2.x,
				'y':player2.y,
				'offsetX':player2.offsetX,
				'offsetY':player2.offsetY
			}
			this.jetpack.createNewPlayer(type, coords, player2.direction);	
		} else if (player1.type=='egg' && player2.type=='red-egg') {
			var type='blue-egg';
			var coords={
				'x':player2.x,
				'y':player2.y,
				'offsetX':player2.offsetX,
				'offsetY':player2.offsetY
			}
			this.createNewPlayer(type, coords, player2.direction);	
		} else if (player1.type=='red-egg' && player2.type=='egg') {
			var type='blue-egg';
			var coords={
				'x':player1.x,
				'y':player1.y,
				'offsetX':player1.offsetX,
				'offsetY':player1.offsetY
			}
			this.createNewPlayer(type, coords, player1.direction);	
		}
		this.jetpack.deletePlayer(player1);
		this.jetpack.deletePlayer(player2);
	}

}