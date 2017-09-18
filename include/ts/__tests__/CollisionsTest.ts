import { Coords } from "../Coords";
import { Player } from "../Player";
import { Collisions } from "../Collisions";

const playerTypes = {
  horse: {
    value: 1
  },
  ultimateHorse: {
    value: 2
  }
};

function configureJetpackMock() {
  const jetpack = jest.fn(); // create mock that does nothing
  jetpack.deletePlayer = jest.fn();
  jetpack.createNewPlayer = jest.fn();
  return jetpack;
}

test("Ignores same player collision test", () => {
  const player1 = new Player();
  const jetpack = configureJetpackMock();

  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, player1);
  expect(result).toEqual(false);
});

test("Vertical collision works", () => {
  const player1 = new Player({
    coords: new Coords({ x: 1, y: 1, offsetX: 0, offsetY: 0 }),
    falling: true,
    id: 1,
    type: "Horse"
  });

  const player2 = new Player({
    coords: new Coords({ x: 1, y: 1, offsetX: 0, offsetY: 0 }),
    falling: false,
    id: 2,
    type: "Horse"
  });

  const jetpack = configureJetpackMock();

  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, player2);
  expect(result).toEqual(true);
});

test("Too far for horizontal collision", () => {
  const player1 = new Player({
    coords: new Coords({ x: 5, y: 5, offsetX: 1, offsetY: 0 }),
    falling: false,
    id: 1,
    type: "Horse"
  });
  const player2 = new Player({
    coords: new Coords({ x: 6, y: 5, offsetX: -70, offsetY: 0 }),
    falling: false,
    id: 2,
    type: "Horse"
  });

  // difference of 30

  const jetpack = configureJetpackMock();
  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, player2);
  expect(result).toEqual(false);
});

test("Close enough for RHS horizontal collision", () => {
  const player1 = new Player({
    coords: new Coords({ x: 5, y: 5, offsetX: 41, offsetY: 0 }),
    falling: false,
    id: 1,
    type: "Horse"
  });
  const player2 = new Player({
    coords: new Coords({ x: 6, y: 5, offsetX: -41, offsetY: 0 }),
    falling: false,
    id: 2,
    type: "Horse"
  });

  // difference of 18

  const jetpack = configureJetpackMock();

  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, player2);
  expect(result).toEqual(true);
});

test("Close enough for LHS horizontal collision", () => {
  const player1 = new Player({
    coords: new Coords({ x: 6, y: 5, offsetX: -80, offsetY: 0 }),
    falling: false,
    id: 1,
    type: "Horse"
  });
  const player2 = new Player({
    coords: new Coords({ x: 5, y: 5, offsetX: 0, offsetY: 0 }),
    falling: false,

    id: 2,
    type: "Horse"
  });

  // difference of 19

  const jetpack = configureJetpackMock();

  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, player2);
  expect(result).toEqual(true);
});

test("Ignores collision with zero-value player", () => {
  const player1 = new Player({
    coords: new Coords({ x: 1, y: 1 })
  });

  const zeroValuePlayer = player1.modify({ value: 0, id: 100 });

  const jetpack = configureJetpackMock();

  const collisions = new Collisions(jetpack, playerTypes);

  const result = collisions.checkCollision(player1, zeroValuePlayer);
  expect(result).toEqual(false);
});
