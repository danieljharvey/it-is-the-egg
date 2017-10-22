import { Board } from "../Board"
import { Coords } from "../Coords"
import { Jetpack } from "../Jetpack"
import { Player } from "../Player"
import { Tile } from "../Tile"

// create a board with 4 tiles, one of which will create a player
const createPlayerBoard = () => {
	const topLeftTile = new Tile({
    collectable: 0,
    x: 0,
    y: 0
  });

  const topRightTile = topLeftTile.modify({
  	x: 1
  })

  const bottomLeftTile = topLeftTile.modify({
  	y:1
  })

  const createPlayerTile = new Tile({
  	createPlayer: "dog",
  	x: 1,
  	y: 1
  })

  const array = [[topLeftTile, bottomLeftTile], [topRightTile, createPlayerTile]];

  return new Board(array);
}

const getPlayerTypes = () => {
	return {
		"dog": {
      		type: "dog",
      		value: 2
		}
	}
}

test("Create new player", () => {
  	
  	const playerTypes = getPlayerTypes();

  	const coords = new Coords({x:1, y:1})
  	
  	const type = "dog"

  	const direction = 1

  	const jetpack = new Jetpack()

  	const player = jetpack.createNewPlayer(playerTypes, type, coords, direction);

  	expect(typeof player).toEqual("object");
  	expect(player.coords).toEqual(coords);
  	expect(player.direction).toEqual(direction);
});

test('Filter create tiles', () => {

	const board = createPlayerBoard();

	const tiles = board.getAllTiles();

	const jetpack = new Jetpack()

	const filtered = jetpack.filterCreateTiles(tiles);

	expect(filtered.size).toEqual(1);
})


test("Create multiple new players", () => {
  	
  	const playerTypes = getPlayerTypes();

  	const board = createPlayerBoard()

  	const jetpack = new Jetpack()
  	jetpack.nextPlayerID = 3;
  	jetpack.moveSpeed = 10;

  	const expected = new Player({
  		coords: new Coords({x:1,y:1}),
  		direction: 1,
  		id: 3,
  		type: "dog",
  		value: 2,
  		moveSpeed: 10,
  		fallSpeed: 12
  	})

  	const players = jetpack.createPlayers(playerTypes, board);

  	expect(typeof players).toEqual('object');
  	expect(players[0]).toEqual(expected);
});
