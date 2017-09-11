import { Coords } from "../Coords";
import { Player } from "../Player";
import { Collisions } from "../Collisions";

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
        coords: new Coords(1,1,0,0),
        falling: true,
        id: 1,
        type: "Horse"
    });
    const player2 = new Player({
        coords: new Coords(1, 1,0,0),
        falling: false,
        id: 2,
        type: "Horse",
    });
    
    const jetpack = configureJetpackMock();

    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);
});


test("Too far for horizontal collision", () => {
    const player1 = new Player({
        coords: new Coords(5,5,1,0),
        falling: false,
        id: 1,
        type: "Horse",
        
    });
    const player2 = new Player({
        coords: new Coords(6,5,-1,0),
        falling: false,
        id: 2,
        type: "Horse",
    });
    // 320 , 384

    const jetpack = configureJetpackMock();
    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(false);
});

test("Close enough for RHS horizontal collision", () => {
    const player1 = new Player({
        coords: new Coords(5, 5, 32, 0),
        falling: false,
        id: 1,
        type: "Horse",
       
    });
    const player2 = new Player({
        coords: new Coords(6,5,-32,0),
        falling: false,
        id: 2,
        type: "Horse",
        
    });
    
    const jetpack = configureJetpackMock();
    
    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);
});

test("Close enough for LHS horizontal collision", () => {
    const player1 = new Player({
        coords: new Coords(6,5,-25,0),
        falling: false,
        id: 1,
        type: "Horse",
        
    });
    const player2 = new Player({
        coords: new Coords(5,5,0,0),
        falling: false,
        
        id: 2,
        type: "Horse",
        
    });
    
    const jetpack = configureJetpackMock();

    const collisions = new Collisions(jetpack, playerTypes);

    const result = collisions.checkCollision(player1,player2);
    expect(result).toEqual(true);
});