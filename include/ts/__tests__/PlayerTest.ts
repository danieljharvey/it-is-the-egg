
import { Player } from '../Player.ts';

test("Player Testing Time", () => {
	expect(2).toEqual(1 + 1);
});


test("Create a player and check defaults", () => {
	var player = new Player();
	expect(player.x).toEqual(0);
	expect(player.y).toEqual(0);
	expect(player.offsetX).toEqual(0);
	expect(player.offsetY).toEqual(0);
	expect(player.direction).toEqual(0);
	expect(player.oldDirection).toEqual(0);
	expect(player.currentFrame).toEqual(0);
}
