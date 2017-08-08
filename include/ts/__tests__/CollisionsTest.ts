import { Player } from "../Player.ts";
import { Collisions } from "../Collisions.ts";

const playerTypes={
    horse:{
        value:1
    },
    ultimateHorse: {
        value: 2
    }
}

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
    const jetpack = configureJetpackMock();

    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);

    expect(jetpack.deletePlayer.mock.calls.length).toBe(2);
});


test("Too far for horizontal collision", () => {
    const player1 = new Player({
        x: 5,
        y: 5,
        offsetX: 1,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 1
    });
    const player2 = new Player({
        x: 6,
        y: 5,
        offsetX: -1,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 2
    });
    // 320 , 384

    const jetpack = configureJetpackMock();
    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(false);
});

test("Close enough for RHS horizontal collision", () => {
    const player1 = new Player({
        x: 5,
        y: 5,
        offsetX: 32,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 1
    });
    const player2 = new Player({
        x: 6,
        y: 5,
        offsetX: -32,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 2
    });
    
    const jetpack = configureJetpackMock();
    
    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);
    expect(jetpack.deletePlayer.mock.calls.length).toBe(2);
});

test("Close enough for LHS horizontal collision", () => {
    const player1 = new Player({
        x: 6,
        y: 5,
        offsetX: -25,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 1
    });
    const player2 = new Player({
        x: 5,
        y: 5,
        offsetX: 0,
        offsetY: 0,
        falling: false,
        type: "Horse",
        id: 2
    });
    
    const jetpack = configureJetpackMock();

    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);
    expect(jetpack.deletePlayer.mock.calls.length).toBe(2);
});