import { Coords } from "../Coords";
import { Player } from '../Player';

test("Create a player and check defaults", () => {
	
	const player = new Player({});
	expect(player.direction).toEqual(0);
	expect(player.oldDirection).toEqual(0);
	expect(player.currentFrame).toEqual(0);
}

test("Modify no coords", () => {

	const player = new Player({
		direction: 1
	});

	const expectedPlayer = new Player({
		direction: -1
	});

	const newPlayer = player.modify({direction: -1});

	expect(newPlayer).toEqual(expectedPlayer);

});