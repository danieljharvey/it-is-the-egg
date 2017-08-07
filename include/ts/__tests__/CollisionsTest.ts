import { Player } from "../Player.ts";
import { Collisions } from "../Collisions.ts";

test("Ignores same player collision test", () => {
    const player1 = new Player();
    const jetpack = jest.fn(); // create mock that does nothing

    const collisions = new Collisions(jetpack);

    const result = collisions.checkCollision(player1,player1);
    expect(result).toEqual(false);
});

test("Vertical collision works", () => {
    const player1 = new Player({
        x: 1,
        y: 1,
        offsetX: 0,
        offsetY: 0,
        falling: true,
        type: "Horse",
        id: 1
    });
    const player2 = new Player({
        x: 1,
        y: 1,
        offsetX: 0,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 2
    });
    const jetpack = jest.fn(); // create mock that does nothing
    jetpack.deletePlayer = jest.fn();

    const collisions = new Collisions(jetpack);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);

    expect(jetpack.deletePlayer.mock.calls.length).toBe(2);
});
