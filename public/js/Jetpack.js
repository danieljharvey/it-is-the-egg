define("Tile", ["require", "exports", "immutable"], function (require, exports, immutable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Tile extends immutable_1.Record({
        action: "",
        background: false,
        breakable: false,
        collectable: 0,
        createPlayer: "",
        dontAdd: false,
        frontLayer: false,
        id: 0,
        title: "Title",
        x: 0,
        y: 0
    }) {
        constructor(params) {
            const superParams = params ? params : undefined;
            super(superParams);
        }
        modify(values) {
            return this.merge(values);
        }
    }
    exports.Tile = Tile;
});
define("Board", ["require", "exports", "immutable"], function (require, exports, immutable_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // new board is built from JS array
    // all changes reuse the re-generated List object
    class Board {
        constructor(values, list = null) {
            if (values) {
                this.list = immutable_2.fromJS(values); // create new
            }
            else {
                this.list = list; // re-use old
            }
        }
        toJS() {
            return this.list.toJS();
        }
        getTile(x, y) {
            return this.list.getIn([x, y]);
        }
        modify(x, y, tile) {
            const updatedList = this.list.setIn([x, y], tile);
            return new Board(undefined, updatedList);
        }
        getLength() {
            return this.list.count();
        }
        getAllTiles() {
            const flat = this.list.flatten(1);
            return flat;
        }
    }
    exports.Board = Board;
});
define("Coords", ["require", "exports", "immutable"], function (require, exports, immutable_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import { Utils } from "./Utils";
    const OFFSET_DIVIDE = 100;
    class Coords extends immutable_3.Record({ x: 0, y: 0, offsetX: 0, offsetY: 0 }) {
        constructor(params) {
            const superParams = params ? params : undefined;
            super(superParams);
        }
        modify(values) {
            return this.merge(values);
        }
        getActualPosition() {
            const fullX = this.x * OFFSET_DIVIDE + this.offsetX;
            const fullY = this.y * OFFSET_DIVIDE + this.offsetY;
            return {
                fullX,
                fullY
            };
        }
    }
    exports.Coords = Coords;
});
define("BoardSize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BoardSize {
        constructor(size) {
            this.minSize = 5;
            this.maxSize = 40;
            if (size < this.minSize) {
                size = this.minSize;
            }
            if (size > this.maxSize) {
                size = this.maxSize;
            }
            this.width = this.height = size;
        }
        grow() {
            if (this.width < this.maxSize) {
                this.width++;
            }
            if (this.height < this.maxSize) {
                this.height++;
            }
            return new BoardSize(this.width);
        }
        shrink() {
            if (this.width > this.minSize) {
                this.width--;
            }
            if (this.height > this.minSize) {
                this.height--;
            }
            return new BoardSize(this.width);
        }
        getData() {
            return {
                height: this.height,
                width: this.width
            };
        }
    }
    exports.BoardSize = BoardSize;
});
define("Utils", ["require", "exports", "ramda"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // wee lad full of reusable functions
    class Utils {
        static getRandomObjectKey(object) {
            const keys = Object.keys(object);
            return this.returnRandomKey(keys);
        }
        static getRandomArrayKey(array) {
            const keys = _.keys(array);
            return this.returnRandomKey(keys);
        }
        static returnRandomKey(keys) {
            if (keys.length === 0) {
                return false;
            }
            return keys[(keys.length * Math.random()) << 0];
        }
        static getControlStyle(id, property) {
            const controlHeader = document.getElementById(id);
            if (!controlHeader) {
                return 0;
            }
            const style = window.getComputedStyle(controlHeader);
            const value = style[property];
            if (isNaN(value)) {
                return parseInt(value, 10);
            }
            return value;
        }
        static getControlProperty(id, property) {
            const controlHeader = document.getElementById(id);
            if (!controlHeader) {
                return 0;
            }
            const value = controlHeader[property];
            if (isNaN(value)) {
                return parseInt(value, 10);
            }
            return value;
        }
        static removeParams(params, removeList) {
            const goodParams = {};
            for (const i in params) {
                if (removeList.indexOf(i) === -1) {
                    goodParams[i] = params[i];
                }
            }
            return goodParams;
        }
        static correctForOverflow(coords, boardSize) {
            let newX;
            let newY;
            if (coords.x < 0) {
                newX = boardSize.width - 1;
            }
            else if (coords.x >= boardSize.width) {
                newX = 0;
            }
            else {
                newX = coords.x;
            }
            if (coords.y < 0) {
                newY = boardSize.height - 1;
            }
            else if (coords.y >= boardSize.height) {
                newY = 0;
            }
            else {
                newY = coords.y;
            }
            return coords.modify({ x: newX, y: newY });
        }
        static flattenArray(arr) {
            return [].concat.apply([], arr);
        }
        static removeDuplicates(arr) {
            return arr.filter((value, index, self) => {
                return self.indexOf(value) === index;
            });
        }
        // todo : a Maybe?
        static getPlayerByValue(playerTypes, value) {
            for (const i in playerTypes) {
                if (playerTypes[i].value === value) {
                    return playerTypes[i];
                }
            }
            return false;
        }
        static getPlayerByType(playerTypes, type) {
            for (const i in playerTypes) {
                if (playerTypes[i].type === type) {
                    return playerTypes[i];
                }
            }
            return false;
        }
        // check leftovers on board and whether player is over finish tile
        static checkLevelIsCompleted(gameState) {
            const collectable = Utils.countCollectable(gameState.board);
            const playerCount = Utils.countPlayers(gameState.players);
            return collectable < 1 && playerCount < 2;
        }
        static countPlayers(players) {
            const validPlayers = players.filter(player => {
                return player && player.value > 0;
            });
            return validPlayers.length;
        }
        // get total outstanding points left to grab on board
        static countCollectable(board) {
            const tiles = board.getAllTiles();
            return tiles.reduce((collectable, tile) => {
                const score = tile.collectable;
                if (score > 0) {
                    return collectable + score;
                }
                return collectable;
            }, 0);
        }
    }
    exports.Utils = Utils;
});
define("Player", ["require", "exports", "immutable", "Coords"], function (require, exports, immutable_4, Coords_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SPRITE_SIZE = 64;
    class Player extends immutable_4.Record({
        coords: new Coords_1.Coords(),
        currentFrame: 0,
        direction: new Coords_1.Coords(),
        fallSpeed: 1,
        falling: false,
        frames: 1,
        id: 0,
        img: "",
        lastAction: "",
        moveSpeed: 1,
        moved: false,
        multiplier: 1,
        oldDirection: new Coords_1.Coords(),
        stop: false,
        title: "",
        type: "egg",
        value: 1,
        flying: false,
        movePattern: ""
    }) {
        constructor(params) {
            const superParams = params ? params : undefined;
            super(superParams);
        }
        modify(values) {
            return this.merge(values);
        }
        first() {
            return this.first();
        }
    }
    exports.Player = Player;
});
define("GameState", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GameState {
        constructor(params = {}) {
            this.players = [];
            this.board = null;
            this.score = 0;
            this.rotations = 0;
            this.rotateAngle = 0;
            this.outcome = "";
            Object.entries(params).map(pair => {
                const [key, value] = pair;
                this[key] = value;
            });
        }
        modify(values = {}) {
            return new GameState(Object.assign({}, this, values));
        }
    }
    exports.GameState = GameState;
});
define("TileSet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TileSet {
        static getTiles() {
            const tiles = {
                1: {
                    background: true,
                    id: 1,
                    img: "sky.png",
                    needsDraw: true,
                    title: "Sky"
                },
                2: {
                    background: false,
                    id: 2,
                    img: "fabric.png",
                    needsDraw: true,
                    title: "Fabric"
                },
                3: {
                    background: true,
                    collectable: 1,
                    frontLayer: true,
                    id: 3,
                    img: "cacti.png",
                    needsDraw: true,
                    title: "Cacti"
                },
                4: {
                    background: true,
                    collectable: 10,
                    frontLayer: true,
                    id: 4,
                    img: "plant.png",
                    needsDraw: true,
                    title: "Plant"
                },
                5: {
                    background: false,
                    breakable: true,
                    id: 5,
                    img: "crate.png",
                    needsDraw: true,
                    title: "Crate"
                },
                8: {
                    background: false,
                    id: 8,
                    img: "work-surface-2.png",
                    needsDraw: true,
                    title: "Work surface 2"
                },
                9: {
                    background: false,
                    id: 9,
                    img: "work-surface-3.png",
                    needsDraw: true,
                    title: "Work surface 3"
                },
                10: {
                    background: false,
                    id: 10,
                    img: "work-surface-4.png",
                    needsDraw: true,
                    title: "Work surface 4"
                },
                11: {
                    background: false,
                    id: 11,
                    img: "tile.png",
                    needsDraw: true,
                    title: "Tiles"
                },
                12: {
                    action: "completeLevel",
                    background: true,
                    createPlayer: "egg",
                    frontLayer: true,
                    id: 12,
                    img: "egg-cup.png",
                    needsDraw: true,
                    title: "Egg Cup"
                },
                13: {
                    background: true,
                    collectable: 100,
                    dontAdd: true,
                    frontLayer: true,
                    id: 13,
                    img: "toast.png",
                    needsDraw: true,
                    title: "Toast"
                },
                14: {
                    action: "teleport",
                    background: true,
                    frontLayer: true,
                    id: 14,
                    img: "door.png",
                    needsDraw: true,
                    title: "Door"
                },
                15: {
                    background: true,
                    frontLayer: true,
                    id: 15,
                    img: "pink-door-open.png",
                    needsDraw: true,
                    title: "Pink door open"
                },
                16: {
                    background: false,
                    id: 16,
                    img: "pink-door.png",
                    needsDraw: true,
                    title: "Pink door closed"
                },
                17: {
                    action: "pink-switch",
                    background: true,
                    frontLayer: true,
                    id: 17,
                    img: "pink-switch.png",
                    needsDraw: true,
                    title: "Pink door switch"
                },
                18: {
                    background: true,
                    frontLayer: true,
                    id: 18,
                    img: "green-door-open.png",
                    needsDraw: true,
                    title: "Green door open"
                },
                19: {
                    background: false,
                    id: 19,
                    img: "green-door.png",
                    needsDraw: true,
                    title: "Green door closed"
                },
                20: {
                    action: "green-switch",
                    background: true,
                    frontLayer: true,
                    id: 20,
                    img: "green-switch.png",
                    needsDraw: true,
                    title: "Green door switch"
                },
                21: {
                    background: true,
                    createPlayer: "silver-egg",
                    frontLayer: true,
                    id: 21,
                    img: "silver-egg-cup.png",
                    needsDraw: true,
                    title: "Silver Egg Cup"
                },
                22: {
                    background: true,
                    createPlayer: "blade",
                    frontLayer: true,
                    id: 22,
                    img: "blade-egg-cup.png",
                    needsDraw: true,
                    title: "Blade egg cup"
                },
                23: {
                    background: true,
                    createPlayer: "find-blade",
                    frontLayer: true,
                    id: 23,
                    img: "find-blade-egg-cup.png",
                    needsDraw: true,
                    title: "Find-blade egg cup"
                },
                24: {
                    background: true,
                    id: 24,
                    action: "split-eggs",
                    needsDraw: true,
                    frontLayer: true,
                    img: "egg-splitter.png",
                    title: "It is the egg splitter"
                }
            };
            // return a copy rather than letting this get messed with
            return JSON.parse(JSON.stringify(tiles));
        }
        static getTile(id) {
            const tiles = TileSet.getTiles();
            if (tiles.hasOwnProperty(id)) {
                return tiles[id];
            }
            return false;
        }
    }
    exports.TileSet = TileSet;
});
define("Map", ["require", "exports", "Board", "BoardSize", "Coords", "Tile", "TileSet", "Utils"], function (require, exports, Board_1, BoardSize_1, Coords_2, Tile_1, TileSet_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // map is just a class full of functions that is created for manipulating the board
    // should not contain any meaningful state of it's own (currently does, but reducing this)
    exports.calcBoardSize = (board) => {
        return board.getLength();
    };
    exports.correctForOverflow = (board, coords) => {
        const boardSize = exports.calcBoardSize(board);
        return Utils_1.Utils.correctForOverflow(coords, new BoardSize_1.BoardSize(boardSize));
    };
    // is intended next tile empty / a wall?
    // need to make this wrap around the board
    exports.checkTileIsEmpty = (board, x, y) => {
        const tile = exports.getTile(board, x, y);
        return tile.background;
    };
    // find random tile of type that is NOT at currentCoords
    exports.findTile = (board, currentCoords, id) => {
        const tiles = board.getAllTiles();
        const teleporters = tiles.filter(tile => {
            if (tile.x === currentCoords.x && tile.y === currentCoords.y) {
                return false;
            }
            return tile.id === id;
        });
        if (teleporters.size === 0) {
            return null;
        }
        const chosenID = Math.floor(Math.random() * teleporters.size);
        const newTile = teleporters.get(chosenID); // this is an Immutable list so needs to use their functions
        return newTile;
    };
    exports.shrinkBoard = (board) => {
        const boardSize = new BoardSize_1.BoardSize(board.getLength());
        const shrunkBoardSize = boardSize.shrink();
        return exports.correctBoardSizeChange(board, shrunkBoardSize);
    };
    exports.growBoard = (board) => {
        const boardSize = new BoardSize_1.BoardSize(board.getLength());
        const grownBoardSize = boardSize.grow();
        return exports.correctBoardSizeChange(board, grownBoardSize);
    };
    // board is current board
    // boardSize is intended board size
    // returns new Board
    exports.correctBoardSizeChange = (board, boardSize) => {
        const newBoard = [];
        const currentWidth = board.getLength();
        const currentHeight = currentWidth;
        for (let x = 0; x < boardSize.width; x++) {
            newBoard[x] = [];
            for (let y = 0; y < boardSize.height; y++) {
                if (x < currentWidth && y < currentHeight) {
                    // using current board
                    const tile = board.getTile(x, y);
                    newBoard[x][y] = tile;
                }
                else {
                    // adding blank tiles
                    const tile = exports.cloneTile(1);
                    newBoard[x][y] = tile;
                }
            }
        }
        return new Board_1.Board(newBoard);
    };
    exports.generateBlankBoard = (boardSize) => {
        const board = [];
        for (let x = 0; x < boardSize.width; x++) {
            board[x] = [];
            for (let y = 0; y < boardSize.height; y++) {
                const blankTile = exports.cloneTile(1);
                const positionedTile = blankTile.modify({
                    x,
                    y
                });
                board[x][y] = positionedTile;
            }
        }
        return new Board_1.Board(board);
    };
    exports.getTileWithCoords = (board, coords) => {
        const fixedCoords = exports.correctForOverflow(board, coords);
        const { x, y } = fixedCoords;
        return board.getTile(x, y);
    };
    exports.changeTile = (board, coords, tile) => {
        return board.modify(coords.x, coords.y, tile);
    };
    exports.getNewPlayerDirection = (direction, clockwise) => {
        if (direction.x !== 0 || direction.y !== 0) {
            return direction;
        }
        return clockwise ? new Coords_2.Coords({ x: 1 }) : new Coords_2.Coords({ x: -1 });
    };
    exports.rotatePlayer = (boardSize, player, clockwise) => {
        const newCoords = exports.translateRotation(boardSize, player.coords, clockwise);
        return player.modify({
            coords: newCoords.modify({
                offsetX: 0,
                offsetY: 0
            }),
            direction: exports.getNewPlayerDirection(player.direction, clockwise)
        });
    };
    exports.cloneTile = (id) => {
        const prototypeTile = exports.getPrototypeTile(id);
        return new Tile_1.Tile(prototypeTile); // create new Tile object with these
    };
    exports.getRandomTile = (tiles) => {
        const randomProperty = obj => {
            const randomKey = Utils_1.Utils.getRandomObjectKey(obj);
            return exports.cloneTile(randomKey);
        };
        Object.entries(tiles).filter(([key, tile]) => {
            if (tile.dontAdd) {
                delete tiles[key];
            }
            return true;
        });
        return randomProperty(tiles);
    };
    // swap two types of tiles on map (used by pink/green switching door things)
    exports.switchTiles = (board, id1, id2) => {
        const tiles = board.getAllTiles();
        return tiles.reduce((currentBoard, tile) => {
            if (tile.id === id1) {
                const newTile = exports.cloneTile(id2);
                const positionTile = newTile.modify({
                    x: tile.x,
                    y: tile.y
                });
                return currentBoard.modify(tile.x, tile.y, positionTile);
            }
            else if (tile.id === id2) {
                const newTile = exports.cloneTile(id1);
                const positionTile = newTile.modify({
                    x: tile.x,
                    y: tile.y
                });
                return currentBoard.modify(tile.x, tile.y, positionTile);
            }
            return currentBoard;
        }, board);
    };
    // rotates board, returns new board and new renderAngle
    // really should be two functions
    exports.rotateBoard = (board, clockwise) => {
        const tiles = board.getAllTiles();
        const width = board.getLength() - 1;
        const height = board.getLength() - 1;
        const boardSize = new BoardSize_1.BoardSize(exports.calcBoardSize(board));
        const rotatedBoard = tiles.reduce((currentBoard, tile) => {
            const coords = new Coords_2.Coords({ x: tile.x, y: tile.y });
            const newCoords = exports.translateRotation(boardSize, coords, clockwise);
            const newTile = tile.modify({
                x: newCoords.x,
                y: newCoords.y
            });
            return currentBoard.modify(newCoords.x, newCoords.y, newTile);
        }, board);
        return rotatedBoard;
    };
    exports.changeRenderAngle = (renderAngle, clockwise) => {
        let newRenderAngle;
        if (clockwise) {
            newRenderAngle = renderAngle + 90;
            if (newRenderAngle > 360) {
                newRenderAngle = newRenderAngle - 360;
            }
            return newRenderAngle;
        }
        newRenderAngle = renderAngle - 90;
        if (newRenderAngle < 0) {
            newRenderAngle = 360 + newRenderAngle;
        }
        return newRenderAngle;
    };
    exports.makeBoardFromArray = (boardArray = []) => {
        const newBoard = boardArray.map((column, mapX) => {
            return column.map((item, mapY) => {
                const newTile = exports.cloneTile(item.id);
                return newTile.modify({
                    x: mapX,
                    y: mapY
                });
            });
        });
        return new Board_1.Board(newBoard);
    };
    exports.generateRandomBoard = (boardSize) => {
        const boardArray = [];
        for (let x = 0; x < boardSize.width; x++) {
            boardArray[x] = [];
            for (let y = 0; y < boardSize.height; y++) {
                const blankTile = exports.getRandomTile(TileSet_1.TileSet.getTiles());
                const positionedTile = blankTile.modify({
                    x,
                    y
                });
                boardArray[x][y] = blankTile;
            }
        }
        return new Board_1.Board(boardArray);
    };
    exports.getTile = (board, x, y) => {
        const coords = new Coords_2.Coords({ x, y });
        return exports.getTileWithCoords(board, coords);
    };
    exports.getPrototypeTile = (id) => {
        return TileSet_1.TileSet.getTile(id);
    };
    exports.translateRotation = (boardSize, coords, clockwise) => {
        const width = boardSize.width - 1;
        const height = boardSize.height - 1;
        if (clockwise) {
            // 0,0 -> 9,0
            // 9,0 -> 9,9
            // 9,9 -> 0,9
            // 0,9 -> 0,0
            return coords.modify({
                x: width - coords.y,
                y: coords.x
            });
        }
        else {
            // 0,0 -> 0,9
            // 0,9 -> 9,9
            // 9,9 -> 9,0
            // 9,0 -> 0,0
            return coords.modify({
                x: coords.y,
                y: height - coords.x
            });
        }
    };
});
define("Action", ["require", "exports", "Map"], function (require, exports, Map) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this concerns all the changes between player and board
    class Action {
        // go through each player, check it's effect on board, score and outcome, return new gameState obj
        checkAllPlayerTileActions(gameState) {
            return gameState.players.reduce((currentGameState, player) => {
                const updated = this.checkPlayerTileAction(player, currentGameState.board, currentGameState.score, currentGameState.outcome);
                const postCrateBoard = this.checkTileBelowPlayer(player, updated.board);
                return gameState.modify({
                    board: postCrateBoard,
                    outcome: updated.outcome,
                    score: updated.score
                });
            }, gameState);
        }
        checkPlayerTileAction(player, board, score, outcome) {
            const currentCoords = player.coords;
            if (currentCoords.offsetX !== 0 ||
                currentCoords.offsetY !== 0 ||
                player.moved === false) {
                return {
                    board,
                    outcome,
                    score
                };
            }
            const coords = Map.correctForOverflow(board, currentCoords);
            const tile = board.getTile(coords.x, coords.y);
            if (tile.collectable > 0) {
                const newScore = tile.collectable * player.multiplier;
                const blankTile = Map.cloneTile(1);
                const newTile = blankTile.modify({
                    x: coords.x,
                    y: coords.y
                });
                return {
                    board: board.modify(coords.x, coords.y, newTile),
                    outcome,
                    score: score + newScore
                };
            }
            if (tile.action === "completeLevel") {
                return {
                    board,
                    outcome: "completeLevel",
                    score
                };
            }
            else if (tile.action === "pink-switch") {
                return {
                    board: Map.switchTiles(board, 15, 16),
                    outcome,
                    score
                };
            }
            else if (tile.action === "green-switch") {
                return {
                    board: Map.switchTiles(board, 18, 19),
                    outcome,
                    score
                };
            }
            return {
                board,
                outcome,
                score
            };
        }
        // basically, do we need to smash the block below?
        checkTileBelowPlayer(player, board) {
            if (player.falling === false) {
                return board;
            }
            const coords = player.coords;
            const belowCoords = Map.correctForOverflow(board, coords.modify({ y: coords.y + 1 }));
            const tile = board.getTile(belowCoords.x, belowCoords.y);
            if (tile.get("breakable") === true) {
                // if tile below is breakable (and we are already falling and thus have momentum, smash it)
                const newTile = Map.cloneTile(1);
                const newTileWithCoords = newTile.modify({
                    x: belowCoords.x,
                    y: belowCoords.y
                });
                return board.modify(belowCoords.x, belowCoords.y, newTileWithCoords);
            }
            return board;
        }
    }
    exports.Action = Action;
});
define("AudioTriggers", ["require", "exports", "ramda", "tsmonad", "Utils"], function (require, exports, _, tsmonad_1, Utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.triggerSounds = (oldState) => (newState) => {
        const nearlyDoneSounds = [nearlyDone(oldState)(newState)];
        const eatenSounds = getEatenSounds(oldState)(newState);
        const playerSounds = exports.getPlayerSounds(oldState)(newState);
        return [...nearlyDoneSounds, ...eatenSounds, ...playerSounds].filter(isItNothing);
    };
    const isItNothing = (maybe) => {
        return maybe.caseOf({
            just: () => true,
            nothing: () => false
        });
    };
    const hasRotated = (oldGame, newGame) => oldGame.rotateAngle === newGame.rotateAngle;
    const getEatenSounds = (oldState) => (newState) => {
        if (hasRotated(oldState, newState)) {
            return exports.findEatenThings(oldState.board)(newState.board);
        }
        else {
            return [rotateSound()];
        }
    };
    const rotateSound = () => {
        return tsmonad_1.Maybe.just({
            name: "warp",
            pan: 0
        });
    };
    // diffs board changes and outputs list of sounds to play
    exports.findEatenThings = (oldBoard) => (board) => {
        const boardSize = board.getLength();
        const oldTiles = oldBoard.getAllTiles();
        const newTiles = board.getAllTiles();
        const tiles = getListDiff(oldTiles)(newTiles).filter(filterUnchanged);
        const coinSounds = tiles.map(exports.gotCoins(boardSize));
        const crateSounds = tiles.map(exports.crateSmash(boardSize));
        const doorSounds = justOne(tiles.map(exports.doorChange(boardSize)));
        return [...coinSounds, ...crateSounds, ...doorSounds];
    };
    const justOne = (arr) => {
        const first = _.find(item => item !== undefined, arr);
        if (first) {
            return [first];
        }
        return [];
    };
    const filterUnchanged = (tiles) => _.not(megaEquals(tiles.new, tiles.old));
    const megaEquals = (x, y) => {
        if (typeof x.equals !== "undefined") {
            return x.equals(y);
        }
        return x === y;
    };
    const getListDiff = (oldList) => (newList) => oldList
        .zipWith((oldItem, newItem) => {
        return {
            old: oldItem,
            new: newItem
        };
    }, newList)
        .toJS();
    const getArrayDiff = (oldArray) => (newArray) => _.zipWith((oldItem, newItem) => {
        return {
            old: oldItem,
            new: newItem
        };
    }, oldArray, newArray);
    const filterGotCoins = (tiles) => {
        return tiles.old.collectable > tiles.new.collectable;
    };
    exports.gotCoins = (boardSize) => (tiles) => {
        return filterGotCoins(tiles)
            ? tsmonad_1.Maybe.just({
                name: "pop",
                pan: calcPan(boardSize)(tiles.new.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    const filterCrateSmash = (tiles) => {
        return tiles.old.breakable === true && tiles.new.breakable === false;
    };
    exports.crateSmash = (boardSize) => (tiles) => {
        return filterCrateSmash(tiles)
            ? tsmonad_1.Maybe.just({
                name: "crate-smash",
                pan: calcPan(boardSize)(tiles.new.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    const filterDoorChange = (tiles) => {
        return ((tiles.old.background === true &&
            tiles.old.frontLayer === true &&
            tiles.new.background === false) ||
            (tiles.new.background === true &&
                tiles.new.frontLayer === true &&
                tiles.old.background === false));
    };
    exports.doorChange = (boardSize) => (tiles) => {
        return filterDoorChange(tiles)
            ? tsmonad_1.Maybe.just({
                name: "switch",
                pan: calcPan(boardSize)(tiles.new.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    exports.getPlayerSounds = (oldState) => (newState) => {
        const boardSize = newState.board.getLength();
        const combine = [playersCombine(oldState.players)(newState.players)];
        const players = getArrayDiff(oldState.players)(newState.players).filter(filterUnchanged);
        const thuds = players.map(exports.playerHitsFloor(boardSize));
        const teleports = players.map(exports.playerTeleported(boardSize));
        const bounces = players.map(exports.playerHitsWall(boardSize));
        return [...combine, ...thuds, ...teleports, ...bounces];
    };
    const filterPlayerHitsFloor = (players) => {
        return players.old.falling === true && players.new.falling === false;
    };
    exports.playerHitsFloor = (boardSize) => (players) => {
        return filterPlayerHitsFloor(players)
            ? tsmonad_1.Maybe.just({
                name: "thud",
                pan: calcPan(boardSize)(players.new.coords.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    const filterPlayerHitsWall = (players) => {
        return (players.new.flying === false &&
            players.old.direction.x !== players.new.direction.x);
    };
    exports.playerHitsWall = (boardSize) => (players) => {
        return filterPlayerHitsWall(players)
            ? tsmonad_1.Maybe.just({
                name: "bounce",
                pan: calcPan(boardSize)(players.new.coords.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    const filterTeleported = (players) => {
        return players.old.lastAction === "" && players.new.lastAction === "teleport";
    };
    exports.playerTeleported = (boardSize) => (players) => {
        return filterTeleported(players)
            ? tsmonad_1.Maybe.just({
                name: "soft-bell",
                pan: calcPan(boardSize)(players.new.coords.x)
            })
            : tsmonad_1.Maybe.nothing();
    };
    const filterPlayersCombine = (oldPlayers) => (newPlayers) => {
        return oldPlayers.length > newPlayers.length;
    };
    const playersCombine = (oldPlayers) => (newPlayers) => {
        return filterPlayersCombine(oldPlayers)(newPlayers)
            ? tsmonad_1.Maybe.just({
                name: "power-up",
                pan: 0
            })
            : tsmonad_1.Maybe.nothing();
    };
    // super basic for now
    const calcPan = (boardSize) => (x) => {
        if (boardSize < 2) {
            return 0;
        }
        const ratio = x / (boardSize - 1);
        const ans = ratio * 2 - 1;
        return ans;
    };
    const filterNearlyDone = (oldState) => (newState) => {
        return (Utils_2.Utils.checkLevelIsCompleted(oldState) === false &&
            Utils_2.Utils.checkLevelIsCompleted(newState) === true);
    };
    const nearlyDone = (oldState) => (newState) => {
        return filterNearlyDone(oldState)(newState)
            ? tsmonad_1.Maybe.just({
                name: "woo",
                pan: 0
            })
            : tsmonad_1.Maybe.nothing();
    };
});
define("PlayerTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PlayerTypes {
        getPlayerTypes() {
            return {
                "blue-egg": {
                    frames: 18,
                    img: "egg-sprite-blue.png",
                    multiplier: 5,
                    title: "It is of course the blue egg",
                    type: "blue-egg",
                    value: 3
                },
                egg: {
                    frames: 18,
                    img: "egg-sprite.png",
                    multiplier: 1,
                    title: "It is of course the egg",
                    type: "egg",
                    value: 1
                },
                "red-egg": {
                    frames: 18,
                    img: "egg-sprite-red.png",
                    multiplier: 2,
                    title: "It is of course the red egg",
                    type: "red-egg",
                    value: 2
                },
                "silver-egg": {
                    fallSpeed: 20,
                    frames: 1,
                    img: "silver-egg.png",
                    moveSpeed: 0,
                    multiplier: 10,
                    title: "It is of course the silver egg",
                    type: "silver-egg",
                    value: 0
                },
                "yellow-egg": {
                    frames: 18,
                    img: "egg-sprite-yellow.png",
                    multiplier: 10,
                    title: "It is of course the yellow egg",
                    type: "yellow-egg",
                    value: 4
                },
                "rainbow-egg": {
                    frames: 18,
                    img: "egg-rainbow.png",
                    multiplier: 1,
                    title: "It goes without saying that this is the rainbow egg",
                    type: "rainbow-egg",
                    value: 1
                },
                blade: {
                    frames: 18,
                    img: "blade-sprite.png",
                    title: "It is the mean spirited blade",
                    type: "blade",
                    value: 0,
                    flying: true
                },
                "find-blade": {
                    frames: 18,
                    img: "find-blade-sprite.png",
                    title: "It is the mean spirited blade",
                    type: "find-blade",
                    value: 0,
                    movePattern: "seek-egg",
                    flying: true
                }
            };
        }
    }
    exports.PlayerTypes = PlayerTypes;
});
define("BoardCollisions", ["require", "exports", "Coords", "Utils", "ramda"], function (require, exports, Coords_3, Utils_3, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Board Collide
    // deals with egg splitting tiles
    exports.checkBoardCollisions = (board, playerTypes, players) => {
        return addIDsToPlayers(players.reduce((newPlayers, player) => {
            const checkedPlayers = checkPlayerBoardCollision(board, playerTypes)(player);
            return [...newPlayers, ...checkedPlayers];
        }, []));
    };
    // players need different IDs to make sure they make sense
    const addIDsToPlayers = (players) => {
        return players.map((player, index) => {
            return player.modify({
                id: index
            });
        });
    };
    const checkPlayerBoardCollision = (board, playerTypes) => (player) => {
        return isCollision(board)(player)
            ? exports.splitPlayer(playerTypes)(player)
            : [player];
    };
    const isCollision = (board) => (player) => isPlayerInTile(player) &&
        isCollisionTile(board)(player) &&
        isPlayerValueHighEnough(player);
    const isPlayerInTile = (player) => player.coords.offsetX === 0 && player.coords.offsetY === 0;
    const isCollisionTile = (board) => (player) => {
        const collidedTiles = getCollidedTiles(board)(player);
        return collidedTiles.size > 0;
    };
    const isPlayerValueHighEnough = (player) => {
        return player.value > 1;
    };
    const isSplitterTile = (tile) => tile.get("action") === "split-eggs";
    exports.getSplitterTiles = (board) => {
        return board.getAllTiles().filter(isSplitterTile);
    };
    const getCollidedTiles = (board) => (player) => {
        const isPlayerOnTileFunc = exports.isPlayerOnTile(player);
        return exports.getSplitterTiles(board).filter(isPlayerOnTileFunc);
    };
    exports.isPlayerOnTile = (player) => (tile) => {
        return player.coords.x === tile.x && player.coords.y === tile.y;
    };
    // would be clevererer about this but we don't have many eggs
    exports.newValues = (value) => {
        if (value === 2) {
            return [1, 1];
        }
        if (value === 3) {
            return [2, 1];
        }
        if (value === 4) {
            return [2, 2];
        }
        return [];
    };
    const combineDirectionsAndValues = (x, y) => {
        return {
            value: x,
            direction: y
        };
    };
    exports.getValuesAndDirections = (value) => {
        const values = exports.newValues(value);
        const directions = [-1, 1];
        return _.zipWith(combineDirectionsAndValues, values, directions);
    };
    exports.splitPlayer = playerTypes => (player) => {
        const items = exports.getValuesAndDirections(player.value);
        const playerFromItemFunc = playerFromItem(playerTypes, player);
        return items.map(playerFromItemFunc);
    };
    const playerFromItem = (playerTypes, player) => (item) => {
        const newPlayerType = Utils_3.Utils.getPlayerByValue(playerTypes, item.value);
        const newPlayerParams = Object.assign({}, newPlayerType, {
            direction: new Coords_3.Coords({
                x: item.direction
            }),
            value: item.value,
            lastAction: "split"
        });
        return player.modify(newPlayerParams);
    };
});
// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc
define("Canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Canvas {
        constructor(boardSize) {
            this.imagesFolder = "img/";
            this.boardSize = boardSize;
            const tileSize = this.sizeCanvas(boardSize);
            this.loadCanvas(boardSize, tileSize);
        }
        getDrawingContext() {
            return this.ctx;
        }
        getCanvas() {
            return this.canvas;
        }
        getImagesFolder() {
            return this.imagesFolder;
        }
        wipeCanvas(fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        // takes BoardSize, returns size of each tile
        sizeCanvas(boardSize) {
            const maxBoardSize = this.getMaxBoardSize(boardSize);
            const tileSize = this.calcTileSize(boardSize);
            this.loadCanvas(boardSize, tileSize);
            this.positionCanvas(maxBoardSize);
            this.boardSize = boardSize;
            return tileSize;
        }
        positionCanvas(maxBoardSize) {
            const windowHeight = window.innerHeight;
            const canvasTop = this.getCanvasTop(windowHeight, maxBoardSize);
            const wrapper = document.getElementById("wrapper");
            if (wrapper) {
                wrapper.style.paddingTop = canvasTop.toString() + "px";
            }
        }
        getCanvasTop(windowHeight, boardHeight) {
            if (boardHeight < windowHeight) {
                return (windowHeight - boardHeight) / 2;
            }
            return 0;
        }
        calcTileSize(boardSize) {
            const maxBoardSize = this.getMaxBoardSize(this.boardSize);
            const tileSize = maxBoardSize / boardSize.width;
            return Math.floor(tileSize);
        }
        getMaxBoardSize(boardSize) {
            let width = window.innerWidth;
            let height = window.innerHeight;
            if (width > height) {
                const difference = height % boardSize.width;
                height = height - difference;
                return height;
            }
            else {
                const difference = width % boardSize.width;
                width = width - difference;
                return width;
            }
        }
        loadCanvas(boardSize, tileSize) {
            this.canvas = document.getElementById("canvas");
            if (!this.canvas) {
                return;
            }
            this.canvas.width = boardSize.width * tileSize;
            this.canvas.height = boardSize.height * tileSize;
            this.ctx = this.canvas.getContext("2d");
        }
    }
    exports.Canvas = Canvas;
});
define("Collisions", ["require", "exports", "immutable", "Utils", "ramda"], function (require, exports, immutable_5, Utils_4, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Collisions {
        constructor(playerTypes) {
            this.playerTypes = playerTypes;
        }
        checkAllCollisions(players) {
            const combinations = this.getAllPlayerCombinations(players);
            // only one egg, do nothing
            if (combinations.length === 0) {
                return players;
            }
            const collided = this.findCollisions(combinations, players);
            if (collided.length === 0) {
                return players;
            }
            const oldPlayers = this.removeCollidedPlayers(collided, players);
            const newPlayers = this.createNewPlayers(collided, players);
            const allPlayers = this.combinePlayerLists(oldPlayers, newPlayers);
            return allPlayers;
        }
        combinePlayerLists(oldPlayers, newPlayers) {
            const allPlayers = [];
            oldPlayers.map(player => {
                allPlayers.push(player);
            });
            newPlayers.map(player => {
                allPlayers.push(player);
            });
            return immutable_5.fromJS(allPlayers);
        }
        // send an array of pairs of player ids, returns all that collide
        findCollisions(combinations, players) {
            return combinations.filter(comb => {
                const player1 = this.fetchPlayerByID(players, comb[0]);
                const player2 = this.fetchPlayerByID(players, comb[1]);
                return this.checkCollision(player1, player2);
            });
        }
        // returns all non-collided players
        // collided is any number of pairs of IDs, ie [[1,3], [3,5]]
        removeCollidedPlayers(collided, players) {
            const collidedIDs = Utils_4.Utils.flattenArray(collided);
            const uniqueIDs = Utils_4.Utils.removeDuplicates(collidedIDs);
            return players.filter(player => {
                if (uniqueIDs.indexOf(player.id) === -1) {
                    return true;
                }
                return false;
            });
        }
        // go through each collided pair and combine the players to create new ones
        createNewPlayers(collided, players) {
            return collided.reduce((newPlayers, collidedIDs) => {
                const player1 = this.fetchPlayerByID(players, collidedIDs[0]);
                const player2 = this.fetchPlayerByID(players, collidedIDs[1]);
                if (player1 === null || player2 === null) {
                    return newPlayers;
                }
                const newOnes = this.combinePlayers(player1, player2);
                return newPlayers.concat(newOnes);
            }, []);
        }
        fetchPlayerByID(players, id) {
            const matching = players.filter(player => {
                return player.id === id;
            });
            if (matching.length === 0) {
                return null;
            }
            // we've found one then
            return _.find(item => {
                return item !== undefined;
            }, matching);
        }
        getAllPlayerCombinations(players) {
            return players.reduce((total, player) => {
                const otherPlayers = players.filter(otherPlayer => {
                    return player.id < otherPlayer.id;
                });
                const combos = otherPlayers.map(otherPlayer => {
                    return [player.id, otherPlayer.id];
                });
                return total.concat(this.cleanCombos(combos));
            }, []);
        }
        // un-immutables values for sanity's sake
        cleanCombos(combo) {
            if (immutable_5.List.isList(combo)) {
                return combo.toJS();
            }
            return combo;
        }
        getAllPlayerIDs(players) {
            return players.map(player => {
                return player.id;
            });
        }
        // only deal with horizontal collisions for now
        checkCollision(player1, player2) {
            if (!player1 || !player2) {
                return false;
            }
            if (player1.id === player2.id) {
                return false;
            }
            if (player1.value === 0 || player2.value === 0) {
                return false;
            }
            if (player1.lastAction === "split" || player2.lastAction === "split") {
                return false;
            }
            const coords1 = player1.coords;
            const coords2 = player2.coords;
            if (coords1.y !== coords2.y) {
                return false;
            }
            let distance = coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
            if (distance < 0) {
                distance = distance * -1;
            }
            if (distance <= 20) {
                return true;
            }
            // nothing changes
            return false;
        }
        chooseHigherLevelPlayer(player1, player2) {
            if (player1.value > player2.value) {
                return player1;
            }
            if (player2.value > player1.value) {
                return player2;
            }
            if (player1.value === player2.value) {
                return player1;
            }
        }
        combinePlayers(player1, player2) {
            const newValue = player1.value + player2.value;
            const higherPlayer = this.chooseHigherLevelPlayer(player1, player2);
            const newPlayerType = Utils_4.Utils.getPlayerByValue(this.playerTypes, newValue);
            if (!newPlayerType) {
                return [player1, player2];
            }
            const newPlayerParams = Object.assign({}, newPlayerType, {
                coords: higherPlayer.coords,
                direction: higherPlayer.direction
            });
            return [player1.modify(newPlayerParams)];
        }
    }
    exports.Collisions = Collisions;
});
define("Loader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Loader {
        constructor(apiLocation) {
            this.apiLocation = apiLocation;
        }
        callServer(action, params, callback, failCallback) {
            const xhr = new XMLHttpRequest();
            params.action = action;
            xhr.open("POST", this.apiLocation, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = () => {
                const DONE = 4; // readyState 4 means the request is done.
                const OK = 200; // status 200 is a successful return.
                if (xhr.readyState === DONE) {
                    if (xhr.status === OK) {
                        let object;
                        try {
                            object = JSON.parse(xhr.responseText);
                        }
                        catch (e) {
                            failCallback("Could not decode this JSON: " + xhr.responseText);
                            return;
                        }
                        if (object.rc > 0) {
                            failCallback(object.msg);
                            return false;
                        }
                        else {
                            callback(object.data);
                            return true;
                        }
                    }
                    else {
                        failCallback("Error: " + xhr.status);
                        return false;
                    }
                }
            };
            // var formData = this.paramsToFormData(params);
            const queryString = this.param(params);
            xhr.send(queryString);
        }
        paramsToFormData(params) {
            const formData = new FormData();
            for (const key in params) {
                if (params[key] !== undefined) {
                    formData.append(key, params[key]);
                }
            }
            return formData;
        }
        param(object) {
            let encodedString = "";
            for (const prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (encodedString.length > 0) {
                        encodedString += "&";
                    }
                    encodedString += encodeURI(prop + "=" + object[prop]);
                }
            }
            return encodedString;
        }
    }
    exports.Loader = Loader;
});
define("SavedLevel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SavedLevel {
        constructor(boardSize, board, levelID) {
            this.boardSize = boardSize;
            this.board = board;
            this.levelID = levelID;
        }
        toString() {
            const data = this.getData();
            return JSON.stringify(data);
        }
        getData() {
            return {
                board: this.board,
                boardSize: this.boardSize.getData(),
                levelID: this.levelID
            };
        }
    }
    exports.SavedLevel = SavedLevel;
});
define("Levels", ["require", "exports", "BoardSize", "SavedLevel"], function (require, exports, BoardSize_2, SavedLevel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Levels {
        constructor(loader) {
            this.levelID = 0;
            this.levels = {};
            this.loader = loader;
        }
        getLevelList(callback) {
            this.loader.callServer("getLevelsList", {}, data => {
                const levelList = this.cleanLevelList(data);
                callback(levelList);
            }, () => {
                const levelList = this.cleanLevelList([]);
                callback(levelList);
            });
        }
        populateLevelsList(levelList) {
            const select = document.getElementById("levelList");
            if (!select) {
                return;
            }
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            const nullEl = document.createElement("option");
            nullEl.textContent = "New";
            nullEl.value = "";
            if (!this.levelID) {
                nullEl.selected = true;
            }
            select.appendChild(nullEl);
            for (const i in levelList) {
                if (levelList[i] !== undefined) {
                    const levelID = parseInt(i, 10);
                    const el = document.createElement("option");
                    el.textContent = levelID.toString();
                    el.value = levelID.toString();
                    if (levelID === this.levelID) {
                        el.selected = true;
                    }
                    select.appendChild(el);
                }
            }
        }
        saveLevel(board, boardSize, levelID, callback) {
            const saveData = new SavedLevel_1.SavedLevel(boardSize, board, levelID);
            const saveString = saveData.toString();
            const params = {
                data: saveString,
                levelID: 0
            };
            if (levelID) {
                params.levelID = levelID;
            }
            this.loader.callServer("saveLevel", params, savedLevelID => {
                this.levelID = savedLevelID;
                callback(savedLevelID);
            }, (errorMsg) => {
                // console.log("ERROR: ", errorMsg);
            });
        }
        loadLevel(levelID, callback, failCallback) {
            this.getLevelList(() => {
                // console.log("gotLevelList");
            });
            const params = {
                levelID
            };
            this.loader.callServer("getLevel", params, data => {
                this.levelID = levelID;
                const boardSize = new BoardSize_2.BoardSize(data.boardSize.width);
                const savedLevel = new SavedLevel_1.SavedLevel(boardSize, data.board, levelID);
                callback(savedLevel);
            }, (errorMsg) => {
                // console.log("ERROR: ", errorMsg);
                failCallback();
            });
        }
        saveData(levelID, rotationsUsed, score, callback) {
            const params = {
                levelID,
                rotationsUsed,
                score
            };
            this.loader.callServer("saveScore", params, (data) => {
                callback(data);
            }, () => {
                callback({ msg: "call failed" });
            });
        }
        // turn array of numbers into list key'd by levelID with object of won/lost
        cleanLevelList(list) {
            const levelList = [];
            for (const i in list) {
                if (list[i] !== undefined) {
                    const levelID = parseInt(list[i], 10);
                    levelList[levelID] = {
                        completed: false,
                        levelID
                    };
                }
            }
            return levelList;
        }
    }
    exports.Levels = Levels;
});
define("RenderMap", ["require", "exports", "BoardSize", "Coords", "Map", "Utils"], function (require, exports, BoardSize_3, Coords_4, Map, Utils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this is not a render map object, but a class for making them
    class RenderMap {
        // render map
        static copyRenderMap(renderMap) {
            return renderMap.slice(0);
        }
        // add player to renderMap, returning new renderMap
        static addPlayerToRenderMap(player, renderMap) {
            const coords = player.coords;
            const startX = coords.x - 1;
            const endX = coords.x + 1;
            const startY = coords.y - 1;
            const endY = coords.y + 1;
            const newRenderMap = this.copyRenderMap(renderMap);
            const boardSize = new BoardSize_3.BoardSize(renderMap.length);
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const newCoords = new Coords_4.Coords({ x, y });
                    const fixedCoords = Utils_5.Utils.correctForOverflow(newCoords, boardSize);
                    newRenderMap[fixedCoords.x][fixedCoords.y] = true;
                }
            }
            return newRenderMap;
        }
        // takes oldBoard and newBoard and creates a map of changes between them
        static createRenderMapFromBoards(oldBoard, newBoard) {
            const renderFunc = RenderMap.renderMapMaker(newBoard);
            return RenderMap.createMap(oldBoard, renderFunc);
        }
        static renderMapMaker(newBoard) {
            return (board, x, y) => {
                const oldTile = board.getTile(x, y);
                const newTile = newBoard.getTile(x, y);
                return !oldTile.equals(newTile);
            };
        }
        // returns map of boolean values for background or not for pathfinding
        static createPathFindingMapFromBoard(board) {
            return RenderMap.createMap(board, (newBoard, x, y) => {
                return !Map.checkTileIsEmpty(newBoard, x, y);
            });
        }
        // combines any two renderMaps (using OR)
        // assumes they are same size
        static combineRenderMaps(renderMap, newRenderMap) {
            return renderMap.map((column, x) => {
                return column.map((entry, y) => {
                    return entry || newRenderMap[x][y];
                });
            });
        }
        // create an empty render map
        static createRenderMap(size, value) {
            const boardArray = [];
            for (let x = 0; x < size; x++) {
                boardArray[x] = [];
                for (let y = 0; y < size; y++) {
                    boardArray[x][y] = value;
                }
            }
            return boardArray;
        }
    }
    RenderMap.createMap = (board, func) => {
        const boardArray = RenderMap.createRenderMap(board.getLength(), false);
        return boardArray.map((column, x) => {
            return column.map((tile, y) => {
                return func(board, x, y);
            });
        });
    };
    exports.RenderMap = RenderMap;
});
define("PathFinder", ["require", "exports", "lodash", "tsmonad", "Coords"], function (require, exports, _, tsmonad_2, Coords_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMapSize = (map) => {
        return {
            width: map.length,
            height: map[0].length
        };
    };
    const overflow = (num, max) => {
        if (num < 0) {
            return max + num;
        }
        return num < max ? num : num % max;
    };
    exports.wrapValue = (map) => (x, y) => {
        const mapSize = exports.getMapSize(map);
        return new Coords_5.Coords({
            x: overflow(x, mapSize.width),
            y: overflow(y, mapSize.height)
        });
    };
    exports.findAdjacent = (map) => (point) => {
        const wrappedPoint = exports.wrapValue(map)(point.x, point.y);
        const { x, y } = wrappedPoint;
        return tsmonad_2.Maybe.just(map[x][y]);
    };
    exports.addToList = (list, point) => [
        point,
        ...list
    ];
    exports.squaresAround = (map) => (point) => {
        const partialWrapValue = exports.wrapValue(map);
        const { x, y } = point;
        return [
            partialWrapValue(x - 1, y),
            partialWrapValue(x + 1, y),
            partialWrapValue(x, y - 1),
            partialWrapValue(x, y + 1)
        ];
    };
    exports.checkAnswer = (list) => (point) => (tile) => {
        return tile ? [] : exports.addToList(list, point);
    };
    exports.addAdjacent = (map) => (list) => (point) => {
        return exports.findAdjacent(map)(point)
            .map(exports.checkAnswer(list)(point))
            .caseOf({
            just: tile => tile,
            nothing: () => []
        });
    };
    exports.filterDuplicates = (arr) => {
        const problems = arr.filter((item) => {
            const matching = arr.filter((checkItem) => {
                return exports.pointMatch(item)(checkItem);
            });
            return matching.length > 1;
        });
        return problems.length < 1;
    };
    exports.pointMatch = (matchPoint) => (point) => matchPoint.x === point.x && matchPoint.y === point.y;
    exports.isInList = (list, point) => {
        const partialPointMatch = exports.pointMatch(point);
        return list.filter(partialPointMatch).length > 0;
    };
    exports.getMoveOptions = (map) => (list) => {
        const startPoint = list[0];
        const partialAddAdjacent = exports.addAdjacent(map)(list);
        return exports.squaresAround(map)(startPoint)
            .map(partialAddAdjacent)
            .filter(entry => entry.length > 0)
            .filter(entry => entry.length < 25) // this is stop it timing out by trying too hard
            .filter(exports.filterDuplicates);
    };
    // try out all possible and return new list of options
    exports.getMultipleMoveOptions = (map) => (lists) => {
        return _.flatMap(lists, list => {
            return exports.getMoveOptions(map)(list);
        });
    };
    exports.findAnswer = (targetPoint) => (potentialAnswer) => exports.pointMatch(potentialAnswer[0])(targetPoint);
    exports.findAnswerInList = (targetPoint) => (list) => {
        const partialFindAnswer = exports.findAnswer(targetPoint);
        const found = _.find(list, partialFindAnswer);
        if (found) {
            return tsmonad_2.Maybe.just(found);
        }
        return tsmonad_2.Maybe.nothing();
    };
    exports.flipAnswer = (list) => _.reverse(list);
    exports.processMoveList = (map) => (lists) => (targetPoint) => {
        const moveOptions = exports.getMultipleMoveOptions(map)(lists);
        if (moveOptions.length === 0) {
            return tsmonad_2.Maybe.nothing();
        }
        const solution = exports.findAnswerInList(targetPoint)(moveOptions);
        return solution.caseOf({
            just: value => {
                return tsmonad_2.Maybe.just(exports.flipAnswer(value));
            },
            nothing: () => {
                return exports.processMoveList(map)(moveOptions)(targetPoint);
            }
        });
    };
    exports.findPath = (map) => (start) => (target) => {
        if (start.equals(target)) {
            return tsmonad_2.Maybe.nothing();
        }
        return exports.processMoveList(map)([[start]])(target);
    };
    const sortArray = (a, b) => {
        if (b.length < a.length) {
            return -1;
        }
        if (b.length > a.length) {
            return 1;
        }
        return 0;
    };
    // do findPath for each thing, return shortest
    exports.findClosestPath = (map) => (start) => (targets) => {
        return actualFindClosestPath(map, start, targets);
    };
    const actualFindClosestPath = (map, start, targets) => {
        const partialFindPath = exports.findPath(map)(start);
        const paths = targets
            .map(partialFindPath)
            .map(obj => obj.valueOr([]))
            .filter(arr => arr.length > 0)
            .sort(sortArray);
        return paths.count() > 0 ? tsmonad_2.Maybe.just(paths.first()) : tsmonad_2.Maybe.nothing();
    };
    // work out what first move is according to directions
    exports.findNextDirection = (pointList) => {
        const parts = _.slice(pointList, 0, 2);
        const start = parts[0];
        const end = parts[1];
        return new Coords_5.Coords({
            x: calcDifference(start.x, end.x),
            y: calcDifference(start.y, end.y)
        });
    };
    const calcDifference = (start, end) => {
        const diff = end - start;
        if (diff < -1) {
            return 1;
        }
        if (diff > 1) {
            return -1;
        }
        return diff;
    };
});
define("Movement", ["require", "exports", "ramda", "Coords", "Map", "PathFinder", "RenderMap", "immutable"], function (require, exports, _, Coords_6, Map, PathFinder, RenderMap_1, immutable_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const OFFSET_DIVIDE = 100;
    // doCalcs takes the current map, the current players, and returns new player objects
    // loop through passed players[] array, do changes, return new one
    exports.doCalcs = (gameState, timePassed) => {
        const playerCalcs = exports.doPlayerCalcs(gameState.board, timePassed, gameState.players);
        return gameState.modify({
            players: gameState.players.map(playerCalcs)
        });
    };
    exports.calcMoveAmount = (moveSpeed, timePassed) => {
        const moveAmount = 1 / OFFSET_DIVIDE * moveSpeed * 5;
        const frameRateAdjusted = moveAmount * timePassed;
        if (isNaN(frameRateAdjusted)) {
            return 0;
        }
        return frameRateAdjusted;
    };
    exports.correctTileOverflow = (coords) => {
        if (coords.offsetX >= OFFSET_DIVIDE) {
            // move one tile to right
            return coords.modify({
                offsetX: 0,
                x: coords.x + 1
            });
        }
        if (coords.offsetX <= -1 * OFFSET_DIVIDE) {
            // move one tile to left
            return coords.modify({
                offsetX: 0,
                x: coords.x - 1
            });
        }
        if (coords.offsetY >= OFFSET_DIVIDE) {
            // move one tile down
            return coords.modify({
                offsetY: 0,
                y: coords.y + 1
            });
        }
        if (coords.offsetY <= -1 * OFFSET_DIVIDE) {
            // move one tile up
            return coords.modify({
                offsetY: 0,
                y: coords.y - 1
            });
        }
        return coords;
    };
    // only public so it can be tested, please don't use outside of here
    exports.checkFloorBelowPlayer = (board, timePassed) => (player) => {
        if (player.coords.offsetX !== 0) {
            return player;
        }
        if (player.flying === true) {
            return player.modify({
                falling: false
            });
        }
        const coords = player.coords;
        const belowCoords = Map.correctForOverflow(board, coords.modify({ y: coords.y + 1 }));
        const tile = board.getTile(belowCoords.x, belowCoords.y);
        if (tile.background) {
            // gap below, start falling down it
            return player.modify({
                falling: true
            });
        }
        if (tile.get("breakable") === true && player.falling) {
            return player; // allow player to keep falling through breakable tile
        }
        // solid ground, stop falling
        return player.modify({
            falling: false
        });
    };
    // curry and compose together a nice pipeline function to transform old player state into new
    exports.getCalcFunction = (oldPlayer, board, timePassed, players) => {
        // separated as not all functions will be the same for enemies
        const playerSpecific = exports.getPlayerSpecificMoves(oldPlayer, board, timePassed, players);
        return _.compose(exports.markPlayerAsMoved(oldPlayer), exports.checkForMovementTiles(board), exports.correctPlayerOverflow(board), playerSpecific, exports.incrementPlayerFrame);
    };
    exports.getPlayerSpecificMoves = (player, board, timePassed, players) => {
        if (player.movePattern === "seek-egg") {
            return exports.getSeekEggMoves(player, board, timePassed, players);
        }
        return exports.getEggMoves(player, board, timePassed);
    };
    exports.getEggMoves = (oldPlayer, board, timePassed) => {
        return _.compose(exports.incrementPlayerDirection(timePassed), exports.checkPlayerDirection(board), exports.checkFloorBelowPlayer(board, timePassed));
    };
    exports.getSeekEggMoves = (oldPlayer, board, timePassed, players) => {
        return _.compose(exports.incrementPlayerDirection(timePassed), exports.checkPlayerDirection(board), exports.pathFinding(board, players));
    };
    // decide on next direction to follow based on closest egg to chase
    exports.pathFinding = (board, players) => (player) => {
        // only move when at actual place
        if (player.coords.offsetX !== 0 || player.coords.offsetY !== 0) {
            return player;
        }
        const pathMap = RenderMap_1.RenderMap.createPathFindingMapFromBoard(board);
        const maybe = PathFinder.findClosestPath(pathMap)(player.coords)(getAllCoords(players));
        return maybe.map(PathFinder.findNextDirection).caseOf({
            just: val => player.modify({
                direction: new Coords_6.Coords(val)
            }),
            nothing: () => player
        });
    };
    const getAllCoords = (players) => {
        return immutable_6.fromJS(players
            .filter(player => {
            return player.value > 0;
        })
            .map(player => {
            return player.coords;
        }));
    };
    exports.doPlayerCalcs = (board, timePassed, players) => (player) => exports.getCalcFunction(player, board, timePassed, players)(player);
    // work out whether player's location has moved since last go
    exports.markPlayerAsMoved = (oldPlayer) => (newPlayer) => {
        return newPlayer.modify({
            moved: exports.playerHasMoved(oldPlayer, newPlayer)
        });
    };
    // works out whether Player has actually moved since last go
    // used to decide whether to do an action to stop static players hitting switches infinitely etc
    exports.playerHasMoved = (oldPlayer, newPlayer) => {
        return !immutable_6.is(oldPlayer.coords, newPlayer.coords);
    };
    exports.checkForMovementTiles = (board) => (player) => {
        const currentCoords = player.coords;
        if (currentCoords.offsetX !== 0 || currentCoords.offsetY !== 0) {
            return player;
        }
        const coords = Map.correctForOverflow(board, currentCoords);
        const tile = board.getTile(coords.x, coords.y);
        if (tile.action === "teleport") {
            return exports.teleport(board)(player);
        }
        return player;
    };
    // find another teleport and go to it
    // if no others, do nothing
    exports.teleport = (board) => (player) => {
        if (player.lastAction === "teleport") {
            return player;
        }
        const newTile = Map.findTile(board, player.coords, 14);
        if (newTile) {
            return player.modify({
                coords: player.coords.modify({
                    x: newTile.x,
                    y: newTile.y
                }),
                lastAction: "teleport"
            });
        }
        return player;
    };
    exports.incrementPlayerFrame = (player) => {
        if (player.direction.x === 0 &&
            player.oldDirection.x === 0 &&
            player.direction.y === 0 &&
            player.oldDirection.y === 0 &&
            player.currentFrame === 0) {
            // we are still, as it should be
            return player;
        }
        if (player.direction.x === 0 &&
            player.direction.y === 0 &&
            player.currentFrame === 0) {
            // if we're still, and have returned to main frame, disregard old movement
            return player.modify({
                oldDirection: new Coords_6.Coords()
            });
        }
        let newFrame = player.currentFrame;
        // if going left, reduce frame
        if (player.direction.x < 0 ||
            player.oldDirection.x < 0 ||
            player.direction.y < 0 ||
            player.oldDirection.y < 0) {
            newFrame = player.currentFrame - 1;
            if (newFrame < 0) {
                newFrame = player.frames - 1;
            }
        }
        // if going right, increase frame
        if (player.direction.x > 0 ||
            player.oldDirection.x > 0 ||
            player.direction.y > 0 ||
            player.oldDirection.y > 0) {
            newFrame = player.currentFrame + 1;
            if (newFrame >= player.frames) {
                newFrame = 0;
            }
        }
        return player.modify({
            currentFrame: newFrame
        });
    };
    exports.checkPlayerDirection = (board) => (player) => {
        return player.flying === true
            ? exports.checkFlyingPlayerDirection(board)(player)
            : exports.checkStandardPlayerDirection(board)(player);
    };
    exports.checkFlyingPlayerDirection = (board) => (player) => {
        const coords = player.coords;
        if (player.direction.y < 0) {
            if (!Map.checkTileIsEmpty(board, coords.x, coords.y - 1)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetY: 0
                    }),
                    direction: player.direction.modify({
                        x: 1,
                        y: 0
                    }),
                    stop: false
                });
            }
        }
        if (player.direction.y > 0) {
            if (!Map.checkTileIsEmpty(board, coords.x, coords.y + 1)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetY: 0
                    }),
                    direction: player.direction.modify({
                        x: -1,
                        y: 0
                    }),
                    stop: false
                });
            }
        }
        if (player.direction.x < 0) {
            if (!Map.checkTileIsEmpty(board, coords.x - 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: player.direction.modify({
                        x: 0,
                        y: -1
                    }),
                    stop: false
                });
            }
        }
        if (player.direction.x > 0) {
            if (!Map.checkTileIsEmpty(board, coords.x + 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: player.direction.modify({
                        x: 0,
                        y: 1
                    }),
                    stop: false
                });
            }
        }
        return player.modify({
            stop: false
        });
    };
    // this checks whether the next place we intend to go is a goddamn trap, and changes direction if so
    exports.checkStandardPlayerDirection = (board) => (player) => {
        const coords = player.coords;
        if (player.direction.x !== 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x - 1, coords.y) &&
                !Map.checkTileIsEmpty(board, coords.x + 1, coords.y)) {
                return player.modify({
                    stop: true // don't go on this turn
                });
            }
        }
        if (player.direction.x < 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x - 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: player.direction.modify({
                        x: 1
                    }),
                    stop: false
                });
            }
        }
        if (player.direction.x > 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x + 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: player.direction.modify({
                        x: -1
                    }),
                    stop: false
                });
            }
        }
        return player.modify({
            stop: false
        });
    };
    // this does the left/right moving, but does not care if walls are there as that is the responsibility of checkPlayerDirection
    exports.incrementPlayerDirection = (timePassed) => (player) => {
        // falling is priority - do this if a thing
        if (player.falling) {
            const fallAmount = exports.calcMoveAmount(player.fallSpeed, timePassed);
            const newOffsetY = player.coords.offsetX + fallAmount;
            const newCoords = player.coords.modify({
                offsetY: player.coords.offsetY + fallAmount
            });
            return player.modify({
                coords: newCoords
            });
        }
        if (player.moveSpeed === 0 || player.stop !== false) {
            // we are still, no need for movement
            return player;
        }
        const moveAmount = exports.calcMoveAmount(player.moveSpeed, timePassed);
        const coords = player.coords;
        // X axis movement
        if (player.direction.x < 0) {
            // move left
            const newOffsetX = coords.offsetX - moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetX: newOffsetX
                })
            });
        }
        else if (player.direction.x > 0) {
            // move right
            const newOffsetX = coords.offsetX + moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetX: newOffsetX
                })
            });
        }
        // if we've stopped and ended up not quite squared up, correct this
        if (player.direction.x === 0) {
            if (coords.offsetX > 0) {
                // shuffle left
                const newOffsetX = coords.offsetX - moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetX: newOffsetX
                    })
                });
            }
            else if (coords.offsetX < 0) {
                // shuffle right
                const newOffsetX = coords.offsetX + moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetX: newOffsetX
                    })
                });
            }
        }
        // Y axis movement
        if (player.direction.y < 0) {
            // move up
            const newOffsetY = coords.offsetY - moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetY: newOffsetY
                })
            });
        }
        else if (player.direction.y > 0) {
            // move down
            const newOffsetY = coords.offsetY + moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetY: newOffsetY
                })
            });
        }
        // if we've stopped and ended up not quite squared up, correct this
        if (player.direction.y === 0) {
            if (coords.offsetY > 0) {
                // shuffle up
                const newOffsetY = coords.offsetY - moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetY: newOffsetY
                    })
                });
            }
            else if (coords.offsetY < 0) {
                // shuffle down
                const newOffsetY = coords.offsetY + moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetY: newOffsetY
                    })
                });
            }
        }
        // do nothing, return same object
        return player;
    };
    exports.correctPlayerOverflow = (board) => (player) => {
        const newCoords = this.correctTileOverflow(player.coords);
        const loopedCoords = Map.correctForOverflow(board, newCoords);
        if (loopedCoords.x !== player.coords.x ||
            loopedCoords.y !== player.coords.y) {
            // if we've actually moved, then
            return player.modify({
                coords: loopedCoords,
                lastAction: ""
            });
        }
        // else
        return player.modify({
            coords: loopedCoords
        });
    };
});
// this is the egg
// it accepts a GameState and an Action
// and returns a new GameState
// totally fucking stateless and burnable in itself
define("TheEgg", ["require", "exports", "Action", "BoardCollisions", "BoardSize", "Collisions", "Map", "Movement", "Utils"], function (require, exports, Action_1, BoardCollisions, BoardSize_4, Collisions_1, Map, Movement, Utils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TheEgg {
        constructor(playerTypes) {
            this.checkNearlyFinished = playerTypes => (gameState) => {
                if (Utils_6.Utils.checkLevelIsCompleted(gameState)) {
                    return gameState.players.map(player => {
                        if (player.value > 0) {
                            const newPlayer = Utils_6.Utils.getPlayerByType(playerTypes, "rainbow-egg");
                            return player.modify(Object.assign({}, newPlayer, { value: player.value }));
                        }
                        return player;
                    });
                }
                return gameState.players;
            };
            this.playerTypes = playerTypes;
        }
        doAction(gameState, action, timePassed) {
            if (action === "rotateLeft") {
                return this.doRotate(gameState, false);
            }
            else if (action === "rotateRight") {
                return this.doRotate(gameState, true);
            }
            else if (action === "") {
                return this.doGameMove(gameState, timePassed);
            }
            return gameState;
        }
        // this is where we have to do a shitload of things
        doGameMove(gameState, timePassed) {
            // first get rid of old outcome
            const startGameState = gameState.modify({
                outcome: ""
            });
            const newGameState = Movement.doCalcs(startGameState, timePassed);
            const action = new Action_1.Action();
            const newerGameState = action.checkAllPlayerTileActions(newGameState);
            const collisions = new Collisions_1.Collisions(this.playerTypes);
            const sortedPlayers = collisions.checkAllCollisions(newerGameState.players);
            const splitPlayers = BoardCollisions.checkBoardCollisions(newerGameState.board, this.playerTypes, sortedPlayers);
            const colouredPlayers = this.checkNearlyFinished(this.playerTypes)(newerGameState.modify({
                players: splitPlayers
            }));
            return newerGameState.modify({
                players: colouredPlayers
            });
        }
        // this rotates board and players
        // it DOES NOT do animation - not our problem
        doRotate(gameState, clockwise) {
            const rotations = gameState.rotations + 1;
            const boardSize = new BoardSize_4.BoardSize(gameState.board.getLength());
            const newBoard = Map.rotateBoard(gameState.board, clockwise);
            const rotatedPlayers = gameState.players.map(player => {
                return Map.rotatePlayer(boardSize, player, clockwise);
            });
            const rotateAngle = Map.changeRenderAngle(gameState.rotateAngle, clockwise);
            return gameState.modify({
                board: newBoard,
                players: rotatedPlayers,
                rotateAngle,
                rotations
            });
        }
    }
    exports.TheEgg = TheEgg;
});
define("TileChooser", ["require", "exports", "TileSet", "ramda"], function (require, exports, TileSet_2, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // used in editor, draws a bunch of 32x32 tiles for selecting
    class TileChooser {
        constructor(renderer) {
            this.chosenTileID = 0;
            this.renderer = renderer;
        }
        chooseTile(id) {
            this.chosenTileID = id;
            this.highlightChosenTile(id);
        }
        highlightChosenTile(id) {
            const tileChooser = document.getElementById("tileChooser");
            const children = tileChooser.children;
            const childrenArray = [].slice.call(children);
            childrenArray.forEach(child => {
                const className = child.getAttribute("class");
                if (className === "tile" + id) {
                    child.setAttribute("style", "border: 1px red solid;");
                }
                else {
                    child.setAttribute("style", "border: 1px white solid;");
                }
            });
        }
        makeTileImages(tiles) {
            return _.map(tile => {
                const tileImage = document.createElement("img");
                tileImage.setAttribute("src", this.renderer.getTileImagePath(tile));
                tileImage.setAttribute("width", "32");
                tileImage.setAttribute("height", "32");
                tileImage.setAttribute("padding", "2px");
                tileImage.setAttribute("alt", tile.title);
                tileImage.setAttribute("style", "border: 1px white solid;");
                tileImage.setAttribute("class", "tile" + tile.id);
                tileImage.onclick = () => {
                    this.chooseTile(tile.id);
                };
                return tileImage;
            }, tiles);
        }
        render() {
            const tiles = TileSet_2.TileSet.getTiles();
            const images = this.makeTileImages(tiles);
            const tileChooser = document.getElementById("tileChooser");
            Object.values(images).forEach(image => {
                tileChooser.appendChild(image);
            });
        }
    }
    exports.TileChooser = TileChooser;
});
define("TitleScreen", ["require", "exports", "BoardSize"], function (require, exports, BoardSize_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TitleScreen {
        constructor(jetpack, canvas, imagePath, width, height) {
            this.jetpack = jetpack;
            this.canvas = canvas;
            this.imagePath = this.canvas.getImagesFolder() + imagePath;
            this.width = width;
            this.height = height;
        }
        render(callback) {
            const boardSize = new BoardSize_5.BoardSize(10);
            this.canvas.sizeCanvas(boardSize);
            const titleImage = document.createElement("img");
            titleImage.addEventListener("load", () => {
                this.drawTheBigEgg(titleImage, 0.02, true, callback);
            }, false);
            titleImage.setAttribute("src", this.imagePath);
            titleImage.setAttribute("width", this.width.toString());
            titleImage.setAttribute("height", this.height.toString());
        }
        drawTheBigEgg(titleImage, opacity, show, callback) {
            const ctx = this.canvas.getDrawingContext();
            const canvas = this.canvas.getCanvas();
            ctx.globalAlpha = 1;
            this.canvas.wipeCanvas("rgb(0,0,0)");
            ctx.globalAlpha = opacity;
            ctx.drawImage(titleImage, 0, 0, titleImage.width, titleImage.height, 0, 0, canvas.width, canvas.height);
            if (show) {
                opacity += 0.01;
                if (opacity >= 1) {
                    // wait, fade the egg
                    const v = setTimeout(() => {
                        // and start fading!
                        this.drawTheBigEgg(titleImage, opacity, false, callback);
                    }, 1000);
                    return false;
                }
            }
            else {
                opacity = opacity - 0.03;
                if (opacity <= 0) {
                    callback();
                    titleImage = null;
                    return false;
                }
            }
            this.jetpack.animationHandle = window.requestAnimationFrame(() => {
                this.drawTheBigEgg(titleImage, opacity, show, callback);
            });
        }
    }
    exports.TitleScreen = TitleScreen;
});
// sets up Web Audio
define("WebAudio", ["require", "exports", "tsmonad"], function (require, exports, tsmonad_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WebAudio {
        constructor() {
            this.audioReady = false;
            this.audioBuffers = {}; // object containing a buffer for each game sound
            this.soundPaths = [
                "bright-bell",
                "pop",
                "soft-bell",
                "warp",
                "thud",
                "woo",
                "crate-smash",
                "switch",
                "power-up",
                "bounce"
            ];
        }
        init() {
            this.audioContext = this.createAudioContext(); // create audioContext
            this.output = this.createLimiter(this.audioContext); // create limiter and link up
            const promises = this.fetchSounds(this.soundPaths);
            Promise.all(promises).then(buffers => {
                this.audioReady = true;
            });
        }
        fetchSounds(soundPaths) {
            return soundPaths.map(soundName => {
                const path = this.getSoundPath(soundName);
                return this.loadBuffer(soundName, path);
            });
        }
        createAudioContext() {
            if (this.audioContext) {
                return this.audioContext;
            }
            return new (window.AudioContext ||
                window.webkitAudioContext)();
        }
        createLimiter(audioCtx) {
            // Create a compressor node
            const compressor = audioCtx.createDynamicsCompressor();
            compressor.threshold.value = -1;
            compressor.knee.value = 40;
            compressor.ratio.value = 12;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;
            compressor.connect(audioCtx.destination);
            return compressor;
        }
        playSound(soundName, pan) {
            // console.log(soundName)
            if (!this.audioReady) {
                return false;
            }
            this.getAudioNode(soundName, pan).caseOf({
                just: audioNode => audioNode.start(),
                nothing: () => {
                    // console.log("not found")
                }
            });
        }
        getAudioNode(soundName, pan) {
            const audioBuffer = Object
                .values(this.audioBuffers)
                .find(name => name.name === soundName);
            if (audioBuffer) {
                return tsmonad_3.Maybe.just(this.createOutput(audioBuffer, pan));
            }
            return tsmonad_3.Maybe.nothing();
        }
        getSoundPath(soundName) {
            return "/sounds/" + soundName + ".wav";
        }
        createOutput(buffer, pan) {
            const panner = this.audioContext.createStereoPanner();
            panner.connect(this.output);
            panner.pan.value = pan;
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer.buffer;
            source.connect(panner);
            return source;
        }
        storeBuffer(soundName, buffer) {
            const audioBuffer = {
                name: soundName,
                buffer
            };
            return (this.audioBuffers[soundName] = audioBuffer);
        }
        loadBuffer(soundName, url) {
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open("GET", url, true);
                request.responseType = "arraybuffer";
                request.onload = () => {
                    this.audioContext.decodeAudioData(request.response, buffer => {
                        if (!buffer) {
                            reject("Buffer could not be read!");
                        }
                        this.storeBuffer(soundName, buffer);
                        resolve(buffer);
                    }, error => {
                        reject(error);
                    });
                };
                request.onerror = () => {
                    reject("BufferLoader: XHR error");
                };
                request.send();
            });
        }
    }
    exports.WebAudio = WebAudio;
});
define("Jetpack", ["require", "exports", "hammerjs", "ramda", "AudioTriggers", "BoardSize", "Canvas", "Coords", "Editor", "GameState", "Levels", "Loader", "Map", "Player", "PlayerTypes", "Renderer", "RenderMap", "TheEgg", "TileSet", "TitleScreen", "Utils", "WebAudio"], function (require, exports, Hammer, _, AudioTriggers, BoardSize_6, Canvas_1, Coords_7, Editor_1, GameState_1, Levels_1, Loader_1, Map, Player_1, PlayerTypes_1, Renderer_1, RenderMap_2, TheEgg_1, TileSet_3, TitleScreen_1, Utils_7, WebAudio_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Jetpack {
        constructor() {
            this.moveSpeed = 10;
            this.paused = true;
            this.editMode = false;
            this.levelID = 1;
            this.levelList = [];
            this.nextPlayerID = 1;
            this.score = 0;
            this.rotationsUsed = 0;
            this.collectable = 0; // total points on screen
            this.playerTypes = {};
            this.defaultBoardSize = 20;
            this.checkResize = false;
            this.isCalculating = false;
            this.action = "";
            this.filterCreateTiles = tiles => {
                return tiles.filter(tile => {
                    return tile.createPlayer !== "";
                });
            };
        }
        go(levelID) {
            // this.bootstrap();
            this.bindSizeHandler();
            this.bindKeyboardHandler();
            this.bindSwipeHandler();
            this.pauseRender();
            this.getTitleScreen(() => {
                this.loadLevel(levelID, () => {
                    this.setNextAction("");
                    this.startRender();
                });
            });
        }
        getEditor() {
            return new Editor_1.Editor();
        }
        // load static stuff - map/renderer etc will be worked out later
        bootstrap(callback) {
            const boardSize = new BoardSize_6.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_1.Canvas(boardSize);
            const playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            this.webAudio = new WebAudio_1.WebAudio();
            this.webAudio.init(); // load web audio stuff
            const apiLocation = "http://" + window.location.hostname + "/levels/";
            const loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(loader);
            this.getLevelList(levelList => {
                const levelID = this.chooseLevelID(levelList);
                this.levelID = levelID;
                callback(levelID);
            });
        }
        displayScore(score) {
            const scoreElement = document.getElementById("score");
            if (scoreElement) {
                scoreElement.innerHTML = score.toString();
            }
        }
        // create player
        createNewPlayer(playerTypes, type, coords, direction) {
            const playerType = playerTypes[type];
            const params = JSON.parse(JSON.stringify(playerType));
            params.id = this.nextPlayerID++;
            params.coords = coords;
            params.direction = direction;
            if (!Object.hasOwnProperty.call(params, "moveSpeed")) {
                params.moveSpeed = this.moveSpeed;
                params.fallSpeed = this.moveSpeed * 1.2;
            }
            const player = new Player_1.Player(params);
            return player;
        }
        // make this actually fucking rotate, and choose direction, and do the visual effect thing
        rotateBoard(clockwise) {
            if (clockwise) {
                this.setNextAction("rotateRight");
            }
            else {
                this.setNextAction("rotateLeft");
            }
        }
        getTitleScreen(callback) {
            const imageSize = { width: 1024, height: 1024 };
            const imagePath = "large/the-egg.png";
            const titleScreen = new TitleScreen_1.TitleScreen(this, this.canvas, imagePath, imageSize.width, imageSize.height);
            titleScreen.render(callback);
        }
        getLevelList(callback) {
            this.levels.getLevelList(levelList => {
                this.levelList = levelList;
                callback(levelList);
            });
        }
        // select a random level that has not been completed yet
        // a return of false means none available (generate a random one)
        chooseLevelID(levelList) {
            const availableLevels = levelList.filter(level => {
                return level.completed === false;
            });
            const chosenKey = Utils_7.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            const levelID = availableLevels[chosenKey].levelID;
            return levelID;
        }
        setNextAction(action) {
            this.action = action;
        }
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        createRenderer(boardSize, completedCallback) {
            this.canvas = new Canvas_1.Canvas(boardSize);
            this.boardSize = boardSize;
            const tiles = TileSet_3.TileSet.getTiles();
            return new Renderer_1.Renderer(this, tiles, this.playerTypes, this.boardSize, this.canvas, () => completedCallback());
        }
        startRender() {
            window.cancelAnimationFrame(this.animationHandle);
            this.showControls();
            this.animationHandle = window.requestAnimationFrame(time => this.eventLoop(time, 0));
        }
        getNextAction() {
            const action = this.action;
            // this.action = "";
            return action;
        }
        // change of heart - this runs all the time and requests various things do stuff
        // if we are paused, it is nothing, but the loop runs all the same
        // we are separating one frame ==== one turn
        // as this does not work for things like rotation
        // which is one 'turn' but many frames
        eventLoop(time, lastTime) {
            this.animationHandle = window.requestAnimationFrame(newTime => this.eventLoop(newTime, time));
            const timePassed = this.calcTimePassed(time, lastTime);
            this.displayFrameRate(timePassed);
            const action = this.getNextAction();
            this.gameCycle(timePassed, action);
        }
        // this does one step of the game
        gameCycle(timePassed, action) {
            const oldGameState = this.getCurrentGameState();
            if (action === "rotateLeft") {
                const rotatedLeftState = this.getNewGameState(oldGameState, "rotateLeft", timePassed);
                this.doBoardRotation(false, rotatedLeftState);
                this.setNextAction("rotatingLeft");
                return false;
            }
            else if (action === "rotateRight") {
                const rotatedRightState = this.getNewGameState(oldGameState, "rotateRight", timePassed);
                this.doBoardRotation(true, rotatedRightState);
                this.setNextAction("rotatingRight");
                return false;
            }
            else if (action.length > 0) {
                return false;
            }
            if (oldGameState.outcome.length > 0) {
                const continueGame = this.checkOutcome(oldGameState);
                if (continueGame === false) {
                    this.setNextAction("stop");
                }
            }
            const newGameState = this.getNewGameState(oldGameState, action, timePassed);
            if (oldGameState.score !== newGameState.score) {
                this.displayScore(newGameState.score);
            }
            this.renderChanges(oldGameState, newGameState);
        }
        // return true for continue play, false for stop
        checkOutcome(gameState) {
            if (gameState.outcome === "completeLevel") {
                // egg is over cup - check whether we've completed
                const completed = this.completeLevel(gameState.board, gameState.players);
                if (completed) {
                    this.webAudio.playSound("bright-bell", 0);
                    this.nextLevel(gameState.score, gameState.rotations);
                    return false;
                }
            }
            return true;
        }
        // or at least try
        completeLevel(board, players) {
            const collectable = this.getCollectable(board);
            const playerCount = this.countPlayers(players);
            if (collectable < 1 && playerCount < 2) {
                return true;
            }
            return false;
        }
        getBoardFromArray(boardArray) {
            return Map.makeBoardFromArray(boardArray);
        }
        // create first "frame" of gameState from board
        // create players etc
        getBlankGameState(board) {
            const players = this.createPlayers(this.playerTypes, board);
            return new GameState_1.GameState({
                board,
                players
            });
        }
        // current game state from array
        getCurrentGameState() {
            return this.gameStates.slice(-1)[0]; // set to new last item
        }
        resetGameState(board) {
            const gameState = this.getBlankGameState(board);
            this.gameStates = [gameState];
        }
        updateGameState(oldGameState, gameState) {
            this.gameStates = [oldGameState, gameState];
        }
        // do next move, plop new state on pile, return new state
        getNewGameState(gameState, action, timePassed) {
            const theEgg = new TheEgg_1.TheEgg(this.playerTypes);
            const newGameState = theEgg.doAction(gameState, action, timePassed);
            this.updateGameState(gameState, newGameState);
            this.playSounds(gameState, newGameState);
            return newGameState;
        }
        // check changes in board, get sounds, trigger them
        playSounds(oldState, newState) {
            _.map(sound => sound.caseOf({
                just: audio => this.webAudio.playSound(audio.name, audio.pan),
                nothing: () => {
                    // don't play a sound
                }
            }), AudioTriggers.triggerSounds(oldState)(newState));
        }
        renderEverything(gameState) {
            const boardSize = new BoardSize_6.BoardSize(gameState.board.getLength());
            const blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(gameState.board, blankMap, gameState.players, gameState.rotateAngle);
        }
        renderChanges(oldGameState, newGameState) {
            const boardSize = new BoardSize_6.BoardSize(newGameState.board.getLength());
            // if rotated everything changes anyway
            if (oldGameState.rotateAngle !== newGameState.rotateAngle) {
                return this.renderEverything(newGameState);
            }
            // player map is covering old shit up
            const playerRenderMap = this.createRenderMapFromPlayers(oldGameState.players, boardSize);
            // render changes
            const boardRenderMap = RenderMap_2.RenderMap.createRenderMapFromBoards(oldGameState.board, newGameState.board);
            const finalRenderMap = RenderMap_2.RenderMap.combineRenderMaps(playerRenderMap, boardRenderMap);
            this.renderer.render(newGameState.board, finalRenderMap, newGameState.players, newGameState.rotateAngle);
        }
        sizeCanvas(boardSize) {
            if (!this.checkResize) {
                return false;
            }
            this.renderer.resize(boardSize);
            this.checkResize = false;
        }
        // create empty renderMap based on boardSize, and then apply each player's position to it
        createRenderMapFromPlayers(players, boardSize) {
            const blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, false);
            return players.reduce((map, player) => {
                return RenderMap_2.RenderMap.addPlayerToRenderMap(player, map);
            }, blankMap);
        }
        calcTimePassed(time, lastTime) {
            const difference = Math.min(time - lastTime, 20);
            return difference;
        }
        displayFrameRate(timePassed) {
            const frameRate = Math.floor(1000 / timePassed);
            const fps = document.getElementById("fps");
            if (fps) {
                fps.innerHTML = frameRate.toFixed(3) + "fps";
            }
        }
        nextLevel(score, rotations) {
            this.pauseRender();
            this.levels.saveData(this.levelID, rotations, score, data => {
                this.levelList = this.markLevelAsCompleted(this.levelList, this.levelID);
                this.levelID = this.chooseLevelID(this.levelList);
                this.go(this.levelID);
            });
        }
        markLevelAsCompleted(levelList, levelID) {
            levelList[levelID].completed = true;
            return levelList;
        }
        pauseRender() {
            this.paused = true;
            this.hideControls();
            window.cancelAnimationFrame(this.animationHandle);
        }
        showControls() {
            const controlHeader = document.getElementById("controlHeader");
            if (controlHeader && controlHeader.classList.contains("hidden")) {
                controlHeader.classList.remove("hidden");
            }
        }
        hideControls() {
            const controlHeader = document.getElementById("controlHeader");
            if (controlHeader && !controlHeader.classList.contains("hidden")) {
                controlHeader.classList.add("hidden");
            }
        }
        countPlayers(players) {
            return players.reduce((total, player) => {
                if (player && player.value > 0) {
                    return total + 1;
                }
                else {
                    return total;
                }
            }, 0);
        }
        // cycle through all map tiles, find egg cups etc and create players
        createPlayers(playerTypes, board) {
            const tiles = board.getAllTiles();
            const filtered = this.filterCreateTiles(tiles);
            const players = filtered.map((tile) => {
                const type = tile.createPlayer;
                const coords = new Coords_7.Coords({
                    offsetX: 0,
                    offsetY: 0,
                    x: tile.x,
                    y: tile.y
                });
                const direction = new Coords_7.Coords({ x: 1 });
                return this.createNewPlayer(playerTypes, type, coords, direction);
            });
            return players;
        }
        // get total outstanding points left to grab on board
        getCollectable(board) {
            const tiles = board.getAllTiles();
            return tiles.reduce((collectable, tile) => {
                const score = tile.get("collectable");
                if (score > 0) {
                    return collectable + score;
                }
                else {
                    return collectable;
                }
            }, 0);
        }
        doBoardRotation(clockwise, gameState) {
            this.renderer.drawRotatingBoard(clockwise, this.moveSpeed, () => {
                this.renderEverything(gameState);
                this.setNextAction(""); // continue playing the game
            });
        }
        loadLevel(levelID, callback) {
            this.levels.loadLevel(levelID, (savedLevel) => {
                this.renderer = this.createRenderer(savedLevel.boardSize, () => {
                    const board = this.getBoardFromArray(savedLevel.board);
                    this.resetGameState(board);
                    const gameState = this.getCurrentGameState();
                    this.renderEverything(gameState);
                    callback();
                });
            }, () => {
                this.renderer = this.createRenderer(this.boardSize, () => {
                    const board = Map.generateRandomBoard(this.boardSize);
                    this.resetGameState(board);
                    const gameState = this.getCurrentGameState();
                    this.renderEverything(gameState);
                    callback();
                });
            });
        }
        bindSizeHandler() {
            window.addEventListener("resize", () => {
                this.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
            });
        }
        bindKeyboardHandler() {
            window.addEventListener("keydown", event => {
                if (event.keyCode === 37) {
                    // left arrow
                    this.rotateBoard(false);
                }
                if (event.keyCode === 39) {
                    // right arrow
                    this.rotateBoard(true);
                }
                if (event.keyCode === 80) {
                    // 'p'
                    this.togglePaused();
                }
                if (event.keyCode === 83) {
                    // 's'
                    this.doStep();
                }
                if (event.keyCode === 70) {
                    // 'f'
                    this.toggleFPS();
                }
            });
        }
        bindSwipeHandler() {
            const element = document.getElementById("wrapper");
            const hammertime = new Hammer(element, {});
            hammertime.on("swipeleft", ev => {
                this.rotateBoard(false);
            });
            hammertime.on("swiperight", ev => {
                this.rotateBoard(true);
            });
        }
        toggleFPS() {
            const fps = document.getElementById("fps");
            if (!fps) {
                return false;
            }
            if (fps.style.display !== "block") {
                fps.style.display = "block";
            }
            else {
                fps.style.display = "none";
            }
        }
        togglePaused() {
            if (this.paused) {
                this.startRender();
            }
            else {
                this.pauseRender();
            }
        }
        doStep() {
            this.gameCycle(16, this.getNextAction()); // movement based on 60 fps
        }
    }
    exports.Jetpack = Jetpack;
});
define("Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const SPRITE_SIZE = 64;
    const OFFSET_DIVIDE = 100;
    class Renderer {
        constructor(jetpack, tiles, playerTypes, boardSize, canvas, loadCallback) {
            this.lampMode = false; // lamp mode only draws around the eggs
            this.checkResize = true;
            this.tileImages = {}; // image elements of tiles
            this.playerImages = {}; // image element of players
            this.totalTiles = 0;
            this.tilesLoaded = 0;
            this.renderTile = function (x, y, tile, renderAngle) {
                const ctx = this.canvas.getDrawingContext();
                const tileSize = this.tileSize;
                const img = this.getTileImage(tile);
                if (!img) {
                    // console.log("Could not find tile image for id " + tile.id);
                    return false;
                }
                let left = Math.floor(x * tileSize);
                let top = Math.floor(y * tileSize);
                if (renderAngle === 0) {
                    ctx.drawImage(img, left, top, tileSize, tileSize);
                }
                else {
                    const angleInRad = renderAngle * (Math.PI / 180);
                    const offset = Math.floor(tileSize / 2);
                    left = Math.floor(left + offset);
                    top = Math.floor(top + offset);
                    ctx.translate(left, top);
                    ctx.rotate(angleInRad);
                    ctx.drawImage(img, -offset, -offset, tileSize, tileSize);
                    ctx.rotate(-angleInRad);
                    ctx.translate(-left, -top);
                }
                return true;
            };
            this.jetpack = jetpack;
            this.tiles = tiles;
            this.playerTypes = playerTypes;
            this.boardSize = boardSize;
            this.canvas = canvas;
            this.loadCallback = loadCallback;
            this.loadTilePalette(tiles);
            this.loadPlayerPalette();
        }
        render(board, renderMap, players, renderAngle) {
            // console.log("Renderer->render",board, renderMap, renderAngle);
            this.tileSize = this.canvas.calcTileSize(this.boardSize);
            this.renderBoard(board, renderMap, renderAngle);
            this.renderPlayers(players);
            this.renderFrontLayerBoard(board, renderMap, renderAngle);
        }
        resize(boardSize) {
            this.boardSize = boardSize;
            this.tileSize = this.canvas.sizeCanvas(boardSize);
        }
        drawRotatingBoard(clockwise, moveSpeed, completed) {
            if (this.rotating === true) {
                // already
                return false;
            }
            const canvas = this.canvas.getCanvas();
            const savedData = this.getImageData(canvas);
            this.rotating = true;
            if (clockwise) {
                this.drawRotated(savedData, 1, 0, 90, moveSpeed, completed);
            }
            else {
                this.drawRotated(savedData, -1, 0, -90, moveSpeed, completed);
            }
        }
        getTileImagePath(tile) {
            return this.canvas.imagesFolder + tile.img;
        }
        getImageData(canvas) {
            const cw = canvas.width;
            const ch = canvas.height;
            const savedData = new Image();
            savedData.src = canvas.toDataURL("image/png");
            return savedData;
        }
        loadTilePalette(tiles) {
            this.totalTiles = this.tilesLoaded = 0;
            for (const i in tiles) {
                if (tiles[i] !== undefined) {
                    this.totalTiles++;
                    const thisTile = tiles[i];
                    const tileImage = document.createElement("img");
                    tileImage.setAttribute("src", this.getTileImagePath(thisTile));
                    tileImage.setAttribute("width", SPRITE_SIZE.toString());
                    tileImage.setAttribute("height", SPRITE_SIZE.toString());
                    tileImage.addEventListener("load", () => {
                        this.markTileImageAsLoaded(thisTile.id);
                    }, false);
                    this.tileImages[thisTile.id] = {
                        image: tileImage,
                        ready: false
                    };
                }
            }
        }
        loadPlayerPalette() {
            for (const i in this.playerTypes) {
                if (this.playerTypes[i] !== undefined) {
                    const playerType = this.playerTypes[i];
                    const playerImage = document.createElement("img");
                    playerImage.setAttribute("src", this.getTileImagePath(playerType));
                    playerImage.addEventListener("load", () => {
                        this.markPlayerImageAsLoaded(playerType.img);
                    }, false);
                    this.playerImages[playerType.img] = {
                        image: playerImage,
                        ready: false
                    };
                }
            }
        }
        markPlayerImageAsLoaded(img) {
            this.playerImages[img].ready = true;
        }
        markTileImageAsLoaded(id) {
            this.tilesLoaded++;
            this.tileImages[id].ready = true;
            if (this.tilesLoaded === this.totalTiles) {
                this.loadCallback(); // we are ready to fucking party
            }
        }
        renderBoard(board, renderMap, renderAngle) {
            const ctx = this.canvas.getDrawingContext();
            ctx.globalAlpha = 1;
            const tiles = board.getAllTiles();
            tiles.map(tile => {
                const needsDraw = renderMap[tile.x][tile.y];
                if (needsDraw === false) {
                    this.showUnrenderedTile(tile.x, tile.y);
                    return;
                }
                if (!tile.frontLayer) {
                    this.renderTile(tile.x, tile.y, tile, renderAngle);
                }
                else {
                    // render sky behind see through tiles
                    this.drawSkyTile(tile, tile.x, tile.y, renderAngle);
                }
            });
        }
        drawSkyTile(tile, x, y, renderAngle) {
            const skyTile = this.tiles[1];
            this.renderTile(x, y, skyTile, renderAngle);
        }
        // just go over and draw the over-the-top stuff
        renderFrontLayerBoard(board, renderMap, renderAngle) {
            const tiles = board.getAllTiles();
            tiles.map(tile => {
                const needsDraw = renderMap[tile.x][tile.y];
                if (needsDraw === false) {
                    return;
                }
                if (tile.frontLayer) {
                    this.renderTile(tile.x, tile.y, tile, renderAngle);
                }
            });
        }
        // debugging tools
        showUnrenderedTile(x, y) {
            if (!this.lampMode) {
                return false;
            }
            const tileSize = Math.floor(this.tileSize);
            const ctx = this.canvas.getDrawingContext();
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(Math.floor(x * tileSize), Math.floor(y * tileSize), tileSize, tileSize);
        }
        renderPlayers(players) {
            players.map(player => {
                return this.renderPlayer(player);
            });
        }
        getTileImage(tile) {
            if (tile.id < 1) {
                // console.log("invalid tile requested", tile.id, tile);
                return false;
            }
            const tileImage = this.tileImages[tile.id];
            if (tileImage.ready) {
                return tileImage.image;
            }
            return false;
        }
        getPlayerImage(img) {
            const playerImage = this.playerImages[img];
            if (playerImage.ready) {
                return playerImage.image;
            }
            return false;
        }
        renderPlayer(player) {
            const ctx = this.canvas.getDrawingContext();
            const tileSize = this.tileSize;
            const offsetRatio = tileSize / OFFSET_DIVIDE;
            const coords = player.coords;
            const left = Math.floor(coords.x * tileSize + coords.offsetX * offsetRatio);
            const top = Math.floor(coords.y * tileSize + coords.offsetY * offsetRatio);
            const clipLeft = Math.floor(player.currentFrame * SPRITE_SIZE);
            const clipTop = 0;
            const image = this.getPlayerImage(player.img);
            if (!image) {
                // console.log('player image not loaded', player.img);
                return false;
            }
            ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, tileSize, tileSize);
            if (left < 0) {
                // also draw on right
                const secondLeft = left + tileSize * this.boardSize.width;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
            if (left + tileSize > tileSize * this.boardSize.width) {
                // also draw on left
                const secondLeft = left - tileSize * this.boardSize.width;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
            if (top + tileSize > tileSize * this.boardSize.height) {
                // also draw on top
                const secondTop = top - tileSize * this.boardSize.height;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, secondTop, tileSize, tileSize);
            }
        }
        drawRotated(savedData, direction, angle, targetAngle, moveSpeed, completed) {
            const canvas = this.canvas.getCanvas();
            if (direction > 0) {
                if (angle >= targetAngle) {
                    completed();
                    this.rotating = false;
                    return false;
                }
            }
            else {
                if (angle <= targetAngle) {
                    completed();
                    this.rotating = false;
                    return false;
                }
            }
            const angleInRad = angle * (Math.PI / 180);
            const offset = canvas.width / 2;
            const ctx = this.canvas.getDrawingContext();
            const left = offset;
            const top = offset;
            this.canvas.wipeCanvas("rgba(0,0,0,0.1)");
            ctx.translate(left, top);
            ctx.rotate(angleInRad);
            ctx.drawImage(savedData, -offset, -offset);
            ctx.rotate(-angleInRad);
            ctx.translate(-left, -top);
            angle += direction * (moveSpeed / 2);
            this.animationHandle = window.requestAnimationFrame(() => {
                this.drawRotated(savedData, direction, angle, targetAngle, moveSpeed, completed);
            });
        }
    }
    exports.Renderer = Renderer;
});
define("Editor", ["require", "exports", "BoardSize", "Canvas", "Coords", "Levels", "Loader", "Map", "Renderer", "RenderMap", "TileChooser", "TileSet", "Utils"], function (require, exports, BoardSize_7, Canvas_2, Coords_8, Levels_2, Loader_2, Map, Renderer_2, RenderMap_3, TileChooser_1, TileSet_4, Utils_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Editor {
        constructor() {
            this.levelID = 1;
            this.levelList = [];
            this.boardHistory = [];
            this.defaultBoardSize = 20;
        }
        // go function but for edit mode
        edit() {
            this.levels.populateLevelsList(this.levelList);
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindMouseMoveHandler();
            this.board = this.getBlankBoard(this.boardSize);
            // reset undo
            this.clearBoardHistory(this.board);
            this.renderer = this.createRenderer(this.boardSize);
            window.setTimeout(() => {
                this.renderEverything(this.board);
            }, 1000);
            this.tileChooser = new TileChooser_1.TileChooser(this.renderer);
            this.tileChooser.render();
        }
        // load static stuff - map/renderer etc will be worked out later
        bootstrap(callback) {
            this.boardSize = new BoardSize_7.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_2.Canvas(this.boardSize);
            const apiLocation = "http://" + window.location.hostname + "/levels/";
            const loader = new Loader_2.Loader(apiLocation);
            this.levels = new Levels_2.Levels(loader);
            this.getLevelList(levelList => {
                const levelID = this.chooseLevelID(levelList);
                this.levelID = levelID;
                callback(levelID);
            });
        }
        saveLevel() {
            this.levels.saveLevel(this.board.toJS(), this.boardSize, this.levels.levelID, levelID => {
                const text = "Level " + levelID + " saved";
                this.showEditMessage(text);
            });
        }
        loadLevelFromList() {
            const select = document.getElementById("levelList");
            const index = select.selectedIndex;
            const levelID = select.options[index].value;
            this.loadLevel(levelID, () => {
                // reset undo
                this.clearBoardHistory(this.board);
                // render everything (give sprites a second to load)
                window.setTimeout(() => {
                    this.renderEverything(this.board);
                }, 1000);
            });
        }
        growBoard() {
            const newBoard = Map.growBoard(this.board);
            this.boardSize = new BoardSize_7.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        }
        shrinkBoard() {
            const newBoard = Map.shrinkBoard(this.board);
            this.boardSize = new BoardSize_7.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        }
        undo() {
            if (this.boardHistory.length === 1) {
                return false;
            }
            this.boardHistory.pop(); // get rid of most recent
            this.board = this.boardHistory.slice(-1)[0]; // set to new last item
            this.boardSize = new BoardSize_7.BoardSize(this.board.getLength());
            this.renderEverything(this.board);
        }
        // replaces this.board with board
        // places old this.board in history
        updateBoard(board) {
            this.boardHistory.push(board); // current state is always at top
            this.board = board;
        }
        getBlankBoard(boardSize) {
            return Map.generateBlankBoard(boardSize);
        }
        getLevelBoard(boardArray, boardSize) {
            return Map.makeBoardFromArray(boardArray);
        }
        clearBoardHistory(board) {
            this.boardHistory = [board]; // reset to single state
        }
        getLevelList(callback) {
            this.levels.getLevelList(levelList => {
                this.levelList = levelList;
                callback(levelList);
            });
        }
        // select a random level that has not been completed yet
        // a return of false means none available (generate a random one)
        chooseLevelID(levelList) {
            const availableLevels = levelList.filter(level => {
                return level.completed === false;
            });
            const chosenKey = Utils_8.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            const levelID = availableLevels[chosenKey].levelID;
            return levelID;
        }
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        createRenderer(boardSize) {
            this.canvas = new Canvas_2.Canvas(boardSize);
            this.boardSize = boardSize;
            const tiles = TileSet_4.TileSet.getTiles();
            return new Renderer_2.Renderer(this, tiles, [], // no players in edit mode
            this.boardSize, this.canvas, () => {
                // console.log("yes")
            });
        }
        renderEverything(board) {
            const boardSize = new BoardSize_7.BoardSize(board.getLength());
            const blankMap = RenderMap_3.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(board, blankMap, [], 0);
        }
        renderSelected(board, renderMap) {
            this.renderer.render(board, renderMap, [], 0);
        }
        renderFromBoards(oldBoard, newBoard) {
            const renderMap = RenderMap_3.RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
            this.renderSelected(newBoard, renderMap);
        }
        sizeCanvas(boardSize) {
            this.renderer.resize(boardSize);
            this.renderEverything(this.board);
        }
        revertEditMessage() {
            const s = setTimeout(() => {
                const message = document.getElementById("message");
                message.innerHTML = "EDIT MODE";
            }, 3000);
        }
        showEditMessage(text) {
            const message = document.getElementById("message");
            message.innerHTML = text;
            this.revertEditMessage();
        }
        loadLevel(levelID, callback) {
            this.levels.loadLevel(levelID, (savedLevel) => {
                const text = "Level " + savedLevel.levelID.toString() + " loaded!";
                this.showEditMessage(text);
                this.board = this.getLevelBoard(savedLevel.board, savedLevel.boardSize);
                this.renderer = this.createRenderer(savedLevel.boardSize);
                callback();
            }, () => {
                this.board = this.getBlankBoard(this.boardSize);
                this.renderer = this.createRenderer(this.boardSize);
                callback();
            });
        }
        bindSizeHandler() {
            window.addEventListener("resize", () => {
                this.sizeCanvas(this.boardSize);
            });
        }
        bindClickHandler() {
            const canvas = document.getElementById("canvas");
            canvas.addEventListener("click", event => {
                this.handleDrawEvent(event);
            });
        }
        bindMouseMoveHandler() {
            const canvas = document.getElementById("canvas");
            canvas.addEventListener("mousemove", event => {
                if (event.button > 0 || event.buttons > 0) {
                    this.handleDrawEvent(event);
                }
            });
        }
        handleDrawEvent(event) {
            const tileSize = this.canvas.calcTileSize(this.boardSize);
            const coords = new Coords_8.Coords({
                offsetX: event.offsetX % tileSize - tileSize / 2,
                offsetY: event.offsetY % tileSize - tileSize / 2,
                x: Math.floor(event.offsetX / tileSize),
                y: Math.floor(event.offsetY / tileSize)
            });
            this.drawCurrentTile(coords);
        }
        // coords is always x,y,offsetX, offsetY
        drawCurrentTile(coords) {
            const tileID = this.tileChooser.chosenTileID;
            if (tileID < 1) {
                return false;
            }
            const currentTile = this.board.getTile(coords.x, coords.y);
            const tile = Map.cloneTile(tileID);
            const placedTile = tile.modify({
                x: coords.x,
                y: coords.y
            });
            // if no change, don't bother
            if (currentTile.equals(placedTile)) {
                // don't fill the undo with crap
                return false;
            }
            const oldBoard = this.board;
            const newBoard = oldBoard.modify(coords.x, coords.y, placedTile);
            this.renderFromBoards(oldBoard, newBoard);
            this.updateBoard(newBoard);
        }
    }
    exports.Editor = Editor;
});
//# sourceMappingURL=Jetpack.js.map