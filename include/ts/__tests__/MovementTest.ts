import { Coords } from "../Coords";
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
  expect(movement.calcMoveAmount(10, 10)).toEqual(5);
  expect(movement.calcMoveAmount(10, 20)).toEqual(10);
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
  expect(movement.calcMoveAmount(5, undefined, 3)).toEqual(0);
});

test("Overflow remains the same", () => {
  const coords = new Coords({ x: 1, y: 0, offsetX: 75, offsetY: 0 });

  const fixedCoords = movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(1);
  expect(fixedCoords.offsetX).toEqual(75);
});

test("No overflow to right", () => {
  const coords = new Coords({ x: 0, y: 0, offsetX: 100, offsetY: 0 });

  const fixedCoords = movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(1);
  expect(fixedCoords.offsetX).toEqual(0);
});

test("No overflow to left", () => {
  const coords = new Coords({ x: 3, y: 0, offsetX: -100, offsetY: 0 });

  const fixedCoords = movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(2);
  expect(fixedCoords.offsetX).toEqual(0);
});

test("No overflow above", () => {
  const coords = new Coords({ x: 0, y: 4, offsetX: 0, offsetY: -100 });

  const fixedCoords = movement.correctTileOverflow(coords);

  expect(fixedCoords.y).toEqual(3);
  expect(fixedCoords.offsetY).toEqual(0);
});

test("No overflow below", () => {
  const coords = new Coords({ x: 0, y: 4, offsetX: 0, offsetY: 100 });

  const fixedCoords = movement.correctTileOverflow(coords);

  expect(fixedCoords.y).toEqual(5);
  expect(fixedCoords.offsetY).toEqual(0);
});