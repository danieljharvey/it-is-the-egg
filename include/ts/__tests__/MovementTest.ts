import { Movement } from "../Movement";
import { Player } from "../Player";

const movement = new Movement();

test("Stay still when not moving", () => {
  const player = new Player();
  const response = movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(player.currentFrame);
});

test("Wipe old direction when stopped", () => {
  const player = new Player({
    oldDirection: 1
  });
  const response = movement.incrementPlayerFrame(player);
  expect(response.oldDirection).toEqual(0);
});

test("change frame left", () => {
  const player = new Player({
    currentFrame: 3,
    direction: -1
  });
  const response = movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(2);
});

test("change frame right", () => {
  const player = new Player({
    currentFrame: 10,
    frames: 11,
    oldDirection: 1
  });
  const response = movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(0);
});

test("Calculate move amount", () => {
  const player = new Player();
  expect(movement.calcMoveAmount(10, 64, 2)).toEqual(10);
  expect(movement.calcMoveAmount(10, 32, 2)).toEqual(5);
  expect(movement.calcMoveAmount(10, 32, 4)).toEqual(10);
});

test("Egg with no speed stays still", () => {
  const player = new Player({
    moveSpeed: 0
  });
  const movedPlayer = movement.incrementPlayerDirection(1, player);

  const oldCoords = player.coords;
  const newCoords = movedPlayer.coords;

  expect(oldCoords.equals(newCoords)).toEqual(true);
});

test("Stop broken tilesize ruining everything", () => {
  expect(movement.calcMoveAmount(5,undefined,3)).toEqual(0);
})