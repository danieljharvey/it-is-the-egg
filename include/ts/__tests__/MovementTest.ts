import { Movement } from "../Movement.ts";
import { Player } from "../Player.ts";

const movement = new Movement;

test("Stay still when not moving", () => {
	var player = new Player();
	const response = movement.incrementPlayerFrame(player);
	expect(response.currentFrame).toEqual(player.currentFrame);
}

test("Wipe old direction when stopped", () => {
	var player = new Player();
	player.oldDirection = 1;
	const response = movement.incrementPlayerFrame(player);
	expect(response.oldDirection).toEqual(0);
}

test("change frame left", () => {
	var player = new Player();
	player.currentFrame = 3;
	player.direction = -1;
	const response = movement.incrementPlayerFrame(player);
	expect(response.currentFrame).toEqual(2);
}

test("change frame right", () => {
	var player = new Player();
	player.currentFrame = 10;
	player.frames = 11;
	player.oldDirection = 1;
	const response = movement.incrementPlayerFrame(player);
	expect(response.currentFrame).toEqual(0);
}

test("Calculate move amount", () => {
	var player = new Player();
	expect(movement.calcMoveAmount(10,64,2)).toEqual(10);
	expect(movement.calcMoveAmount(10,32,2)).toEqual(5);
	expect(movement.calcMoveAmount(10,32,4)).toEqual(10);
}