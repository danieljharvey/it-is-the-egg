import { Board } from "../Board";
import { Coords } from "../Coords";
import * as Map from "../Map";
import * as Movement from "../Movement";
import { Player } from "../Player";

test("Stay still when not moving", () => {
  const player = new Player();
  const response = Movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(player.currentFrame);
});

test("Wipe old direction when stopped", () => {
  const player = new Player({
    oldDirection: 1
  });
  const response = Movement.incrementPlayerFrame(player);
  expect(response.oldDirection).toEqual(0);
});

test("change frame left", () => {
  const player = new Player({
    currentFrame: 3,
    direction: -1
  });
  const response = Movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(2);
});

test("change frame right", () => {
  const player = new Player({
    currentFrame: 10,
    frames: 11,
    oldDirection: 1
  });
  const response = Movement.incrementPlayerFrame(player);
  expect(response.currentFrame).toEqual(0);
});

test("Calculate move amount", () => {
  const player = new Player();
  expect(Movement.calcMoveAmount(10, 10)).toEqual(5);
  expect(Movement.calcMoveAmount(10, 20)).toEqual(10);
});

test("Egg with no speed stays still", () => {
  const player = new Player({
    moveSpeed: 0
  });
  const movedPlayer = Movement.incrementPlayerDirection(1)(player);

  const oldCoords = player.coords;
  const newCoords = movedPlayer.coords;

  expect(oldCoords.equals(newCoords)).toEqual(true);
});

test("Overflow remains the same", () => {
  const coords = new Coords({ x: 1, y: 0, offsetX: 75, offsetY: 0 });

  const fixedCoords = Movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(1);
  expect(fixedCoords.offsetX).toEqual(75);
});

test("No overflow to right", () => {
  const coords = new Coords({ x: 0, y: 0, offsetX: 100, offsetY: 0 });

  const fixedCoords = Movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(1);
  expect(fixedCoords.offsetX).toEqual(0);
});

test("No overflow to left", () => {
  const coords = new Coords({ x: 3, y: 0, offsetX: -100, offsetY: 0 });

  const fixedCoords = Movement.correctTileOverflow(coords);

  expect(fixedCoords.x).toEqual(2);
  expect(fixedCoords.offsetX).toEqual(0);
});

test("No overflow above", () => {
  const coords = new Coords({ x: 0, y: 4, offsetX: 0, offsetY: -100 });

  const fixedCoords = Movement.correctTileOverflow(coords);

  expect(fixedCoords.y).toEqual(3);
  expect(fixedCoords.offsetY).toEqual(0);
});

test("No overflow below", () => {
  const coords = new Coords({ x: 0, y: 4, offsetX: 0, offsetY: 100 });

  const fixedCoords = Movement.correctTileOverflow(coords);

  expect(fixedCoords.y).toEqual(5);
  expect(fixedCoords.offsetY).toEqual(0);
});

test("Fall through breakable block", () => {
  const boardArray = [
    [
      { background: true, breakable: false },
      { background: false, breakable: true }
    ]
  ];

  const board = new Board(boardArray);

  const player = new Player({
    coords: new Coords({
      x: 0,
      y: 0
    }),
    falling: true
  });

  const result = Movement.checkFloorBelowPlayer(board, 10)(player);

  expect(result.equals(player)).toEqual(true);
  expect(result.falling).toEqual(true);
});

test("Don't fall through floor", () => {
  const boardArray = [
    [
      { background: true, breakable: false },
      { background: false, breakable: false }
    ]
  ];

  const board = new Board(boardArray);

  const player = new Player({
    coords: new Coords({
      x: 0,
      y: 0
    }),
    falling: true
  });

  const expected = player.modify({
    falling: false
  });

  const result = Movement.checkFloorBelowPlayer(board, 10)(player);

  expect(result.equals(expected)).toEqual(true);
  expect(result.falling).toEqual(false);
});

test("Check player has not moved", () => {
  const oldPlayer = new Player({
    coords: new Coords({ x: 0, y: 0 })
  });

  const newPlayer = oldPlayer.modify({ id: 3 });

  const moved = Movement.playerHasMoved(oldPlayer, newPlayer);

  expect(moved).toEqual(false);
});

test("Check player has moved", () => {
  const oldPlayer = new Player({
    coords: new Coords({ x: 0, y: 0, offsetX: 3 })
  });

  const newPlayer = oldPlayer.modify({
    coords: oldPlayer.coords.modify({ offsetX: 0 })
  });

  const moved = Movement.playerHasMoved(oldPlayer, newPlayer);

  expect(moved).toEqual(true);
});
