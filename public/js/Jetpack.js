var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("Tile", ["require", "exports", "immutable"], function (require, exports, immutable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tile = /** @class */ (function (_super) {
        __extends(Tile, _super);
        function Tile(params) {
            var _this = this;
            var superParams = params ? params : undefined;
            _this = _super.call(this, superParams) || this;
            return _this;
        }
        Tile.prototype.modify = function (values) {
            return this.merge(values);
        };
        return Tile;
    }(immutable_1.Record({
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
    })));
    exports.Tile = Tile;
});
define("Board", ["require", "exports", "immutable"], function (require, exports, immutable_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // new board is built from JS array
    // all changes reuse the re-generated List object
    var Board = /** @class */ (function () {
        function Board(values, list) {
            if (list === void 0) { list = null; }
            if (values) {
                this.list = immutable_2.fromJS(values); // create new
            }
            else {
                this.list = list; // re-use old
            }
        }
        Board.prototype.toJS = function () {
            return this.list.toJS();
        };
        Board.prototype.getTile = function (x, y) {
            return this.list.getIn([x, y]);
        };
        Board.prototype.modify = function (x, y, tile) {
            var updatedList = this.list.setIn([x, y], tile);
            return new Board(undefined, updatedList);
        };
        Board.prototype.getLength = function () {
            return this.list.count();
        };
        Board.prototype.getAllTiles = function () {
            return this.list.flatten(1);
        };
        return Board;
    }());
    exports.Board = Board;
});
define("Coords", ["require", "exports", "immutable"], function (require, exports, immutable_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // import { Utils } from "./Utils";
    var OFFSET_DIVIDE = 100;
    var Coords = /** @class */ (function (_super) {
        __extends(Coords, _super);
        function Coords(params) {
            var _this = this;
            var superParams = params ? params : undefined;
            _this = _super.call(this, superParams) || this;
            return _this;
        }
        Coords.prototype.modify = function (values) {
            return this.merge(values);
        };
        Coords.prototype.getActualPosition = function () {
            var fullX = this.x * OFFSET_DIVIDE + this.offsetX;
            var fullY = this.y * OFFSET_DIVIDE + this.offsetY;
            return {
                fullX: fullX,
                fullY: fullY
            };
        };
        return Coords;
    }(immutable_3.Record({ x: 0, y: 0, offsetX: 0, offsetY: 0 })));
    exports.Coords = Coords;
});
define("BoardSize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BoardSize = /** @class */ (function () {
        function BoardSize(size) {
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
        BoardSize.prototype.grow = function () {
            if (this.width < this.maxSize) {
                this.width++;
            }
            if (this.height < this.maxSize) {
                this.height++;
            }
            return new BoardSize(this.width);
        };
        BoardSize.prototype.shrink = function () {
            if (this.width > this.minSize) {
                this.width--;
            }
            if (this.height > this.minSize) {
                this.height--;
            }
            return new BoardSize(this.width);
        };
        BoardSize.prototype.getData = function () {
            return {
                height: this.height,
                width: this.width
            };
        };
        return BoardSize;
    }());
    exports.BoardSize = BoardSize;
});
define("Utils", ["require", "exports", "ramda"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // wee lad full of reusable functions
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.getRandomObjectKey = function (object) {
            var keys = Object.keys(object);
            return this.returnRandomKey(keys);
        };
        Utils.getRandomArrayKey = function (array) {
            var keys = _.keys(array);
            return this.returnRandomKey(keys);
        };
        Utils.returnRandomKey = function (keys) {
            if (keys.length === 0) {
                return false;
            }
            return keys[(keys.length * Math.random()) << 0];
        };
        Utils.getControlStyle = function (id, property) {
            var controlHeader = document.getElementById(id);
            if (!controlHeader) {
                return 0;
            }
            var style = window.getComputedStyle(controlHeader);
            var value = style[property];
            if (isNaN(value)) {
                return parseInt(value, 10);
            }
            return value;
        };
        Utils.getControlProperty = function (id, property) {
            var controlHeader = document.getElementById(id);
            if (!controlHeader) {
                return 0;
            }
            var value = controlHeader[property];
            if (isNaN(value)) {
                return parseInt(value, 10);
            }
            return value;
        };
        Utils.removeParams = function (params, removeList) {
            var goodParams = {};
            for (var i in params) {
                if (removeList.indexOf(i) === -1) {
                    goodParams[i] = params[i];
                }
            }
            return goodParams;
        };
        Utils.correctForOverflow = function (coords, boardSize) {
            var newX;
            var newY;
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
        };
        Utils.flattenArray = function (arr) {
            return [].concat.apply([], arr);
        };
        Utils.removeDuplicates = function (arr) {
            return arr.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        };
        return Utils;
    }());
    exports.Utils = Utils;
});
define("Player", ["require", "exports", "immutable", "Coords"], function (require, exports, immutable_4, Coords_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(params) {
            var _this = this;
            var superParams = params ? params : undefined;
            _this = _super.call(this, superParams) || this;
            return _this;
        }
        Player.prototype.modify = function (values) {
            return this.merge(values);
        };
        Player.prototype.first = function () {
            return this.first();
        };
        return Player;
    }(immutable_4.Record({
        coords: new Coords_1.Coords(),
        currentFrame: 0,
        direction: 0,
        fallSpeed: 1,
        falling: false,
        frames: 1,
        id: 0,
        img: "",
        lastAction: "",
        moveSpeed: 1,
        moved: false,
        multiplier: 1,
        oldDirection: 0,
        stop: false,
        title: "",
        type: "egg",
        value: 1
    })));
    exports.Player = Player;
});
define("GameState", ["require", "exports", "immutable"], function (require, exports, immutable_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GameState = /** @class */ (function (_super) {
        __extends(GameState, _super);
        function GameState(params) {
            var _this = this;
            var superParams = params ? params : undefined;
            _this = _super.call(this, superParams) || this;
            return _this;
        }
        GameState.prototype.modify = function (values) {
            return this.merge(values);
        };
        return GameState;
    }(immutable_5.Record({
        board: null,
        outcome: "",
        players: [],
        rotateAngle: 0,
        rotations: 0,
        score: 0
    })));
    exports.GameState = GameState;
});
define("TileSet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileSet = /** @class */ (function () {
        function TileSet() {
        }
        TileSet.getTiles = function () {
            var tiles = {
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
                }
            };
            // return a copy rather than letting this get messed with
            return (JSON.parse(JSON.stringify(tiles)));
        };
        TileSet.getTile = function (id) {
            var tiles = TileSet.getTiles();
            if (tiles.hasOwnProperty(id)) {
                return tiles[id];
            }
            return false;
        };
        return TileSet;
    }());
    exports.TileSet = TileSet;
});
define("Map", ["require", "exports", "Board", "BoardSize", "Coords", "Tile", "TileSet", "Utils"], function (require, exports, Board_1, BoardSize_1, Coords_2, Tile_1, TileSet_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // map is just a class full of functions that is created for manipulating the board
    // should not contain any meaningful state of it's own (currently does, but reducing this)
    exports.calcBoardSize = function (board) {
        return board.getLength();
    };
    exports.correctForOverflow = function (board, coords) {
        var boardSize = exports.calcBoardSize(board);
        return Utils_1.Utils.correctForOverflow(coords, new BoardSize_1.BoardSize(boardSize));
    };
    // is intended next tile empty / a wall?
    exports.checkTileIsEmpty = function (board, x, y) {
        var tile = exports.getTile(board, x, y);
        return tile.background;
    };
    // find random tile of type that is NOT at currentCoords
    exports.findTile = function (board, currentCoords, id) {
        var tiles = board.getAllTiles();
        var teleporters = tiles.filter(function (tile) {
            if (tile.x === currentCoords.x && tile.y === currentCoords.y) {
                return false;
            }
            return tile.id === id;
        });
        if (teleporters.size === 0) {
            return null;
        }
        var chosenID = Math.floor(Math.random() * teleporters.size);
        var newTile = teleporters.get(chosenID); // this is an Immutable list so needs to use their functions
        return newTile;
    };
    exports.shrinkBoard = function (board) {
        var boardSize = new BoardSize_1.BoardSize(board.getLength());
        var shrunkBoardSize = boardSize.shrink();
        return exports.correctBoardSizeChange(board, shrunkBoardSize);
    };
    exports.growBoard = function (board) {
        var boardSize = new BoardSize_1.BoardSize(board.getLength());
        var grownBoardSize = boardSize.grow();
        return exports.correctBoardSizeChange(board, grownBoardSize);
    };
    // board is current board
    // boardSize is intended board size
    // returns new Board
    exports.correctBoardSizeChange = function (board, boardSize) {
        var newBoard = [];
        var currentWidth = board.getLength();
        var currentHeight = currentWidth;
        for (var x = 0; x < boardSize.width; x++) {
            newBoard[x] = [];
            for (var y = 0; y < boardSize.height; y++) {
                if (x < currentWidth && y < currentHeight) {
                    // using current board
                    var tile = board.getTile(x, y);
                    newBoard[x][y] = tile;
                }
                else {
                    // adding blank tiles
                    var tile = exports.cloneTile(1);
                    newBoard[x][y] = tile;
                }
            }
        }
        return new Board_1.Board(newBoard);
    };
    exports.generateBlankBoard = function (boardSize) {
        var board = [];
        for (var x = 0; x < boardSize.width; x++) {
            board[x] = [];
            for (var y = 0; y < boardSize.height; y++) {
                var blankTile = exports.cloneTile(1);
                var positionedTile = blankTile.modify({
                    x: x,
                    y: y
                });
                board[x][y] = positionedTile;
            }
        }
        return new Board_1.Board(board);
    };
    exports.getTileWithCoords = function (board, coords) {
        var fixedCoords = exports.correctForOverflow(board, coords);
        var x = fixedCoords.x, y = fixedCoords.y;
        return board.getTile(x, y);
    };
    exports.changeTile = function (board, coords, tile) {
        return board.modify(coords.x, coords.y, tile);
    };
    exports.rotatePlayer = function (boardSize, player, clockwise) {
        var newCoords = exports.translateRotation(boardSize, player.coords, clockwise);
        var direction = player.direction;
        // if player is still, nudge them in rotation direction
        if (direction === 0) {
            if (clockwise) {
                direction = 1;
            }
            else {
                direction = -1;
            }
        }
        return player.modify({
            coords: newCoords.modify({
                offsetX: 0,
                offsetY: 0
            }),
            direction: direction
        });
    };
    exports.cloneTile = function (id) {
        var prototypeTile = exports.getPrototypeTile(id);
        return new Tile_1.Tile(prototypeTile); // create new Tile object with these
    };
    exports.getRandomTile = function (tiles) {
        var randomProperty = function (obj) {
            var randomKey = Utils_1.Utils.getRandomObjectKey(obj);
            return exports.cloneTile(randomKey);
        };
        Object.entries(tiles).filter(function (_a) {
            var key = _a[0], tile = _a[1];
            if (tile.dontAdd) {
                delete tiles[key];
            }
            return true;
        });
        return randomProperty(tiles);
    };
    // swap two types of tiles on map (used by pink/green switching door things)
    exports.switchTiles = function (board, id1, id2) {
        var tiles = board.getAllTiles();
        return tiles.reduce(function (currentBoard, tile) {
            if (tile.id === id1) {
                var newTile = exports.cloneTile(id2);
                var positionTile = newTile.modify({
                    x: tile.x,
                    y: tile.y
                });
                return currentBoard.modify(tile.x, tile.y, positionTile);
            }
            else if (tile.id === id2) {
                var newTile = exports.cloneTile(id1);
                var positionTile = newTile.modify({
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
    exports.rotateBoard = function (board, clockwise) {
        var tiles = board.getAllTiles();
        var width = board.getLength() - 1;
        var height = board.getLength() - 1;
        var boardSize = new BoardSize_1.BoardSize(exports.calcBoardSize(board));
        var rotatedBoard = tiles.reduce(function (currentBoard, tile) {
            var coords = new Coords_2.Coords({ x: tile.x, y: tile.y });
            var newCoords = exports.translateRotation(boardSize, coords, clockwise);
            var newTile = tile.modify({
                x: newCoords.x,
                y: newCoords.y
            });
            return currentBoard.modify(newCoords.x, newCoords.y, newTile);
        }, board);
        return rotatedBoard;
    };
    exports.changeRenderAngle = function (renderAngle, clockwise) {
        var newRenderAngle;
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
    exports.makeBoardFromArray = function (boardArray) {
        if (boardArray === void 0) { boardArray = []; }
        var newBoard = boardArray.map(function (column, mapX) {
            return column.map(function (item, mapY) {
                var newTile = exports.cloneTile(item.id);
                return newTile.modify({
                    x: mapX,
                    y: mapY
                });
            });
        });
        return new Board_1.Board(newBoard);
    };
    exports.generateRandomBoard = function (boardSize) {
        var boardArray = [];
        for (var x = 0; x < boardSize.width; x++) {
            boardArray[x] = [];
            for (var y = 0; y < boardSize.height; y++) {
                var blankTile = exports.getRandomTile(TileSet_1.TileSet.getTiles());
                var positionedTile = blankTile.modify({
                    x: x,
                    y: y
                });
                boardArray[x][y] = blankTile;
            }
        }
        return new Board_1.Board(boardArray);
    };
    exports.getTile = function (board, x, y) {
        var coords = new Coords_2.Coords({ x: x, y: y });
        return exports.getTileWithCoords(board, coords);
    };
    exports.getPrototypeTile = function (id) {
        return TileSet_1.TileSet.getTile(id);
    };
    exports.translateRotation = function (boardSize, coords, clockwise) {
        var width = boardSize.width - 1;
        var height = boardSize.height - 1;
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
    var Action = /** @class */ (function () {
        function Action() {
        }
        // go through each player, check it's effect on board, score and outcome, return new gameState obj
        Action.prototype.checkAllPlayerTileActions = function (gameState) {
            var _this = this;
            return gameState.players.reduce(function (currentGameState, player) {
                var updated = _this.checkPlayerTileAction(player, currentGameState.board, currentGameState.score, currentGameState.outcome);
                var postCrateBoard = _this.checkTileBelowPlayer(player, updated.board);
                return gameState.modify({
                    board: postCrateBoard,
                    outcome: updated.outcome,
                    score: updated.score
                });
            }, gameState);
        };
        Action.prototype.checkPlayerTileAction = function (player, board, score, outcome) {
            var currentCoords = player.coords;
            if (currentCoords.offsetX !== 0 ||
                currentCoords.offsetY !== 0 ||
                player.moved === false) {
                return {
                    board: board,
                    outcome: outcome,
                    score: score
                };
            }
            var coords = Map.correctForOverflow(board, currentCoords);
            var tile = board.getTile(coords.x, coords.y);
            if (tile.collectable > 0) {
                var newScore = tile.collectable * player.multiplier;
                var blankTile = Map.cloneTile(1);
                var newTile = blankTile.modify({
                    x: coords.x,
                    y: coords.y
                });
                return {
                    board: board.modify(coords.x, coords.y, newTile),
                    outcome: outcome,
                    score: score + newScore
                };
            }
            if (tile.action === "completeLevel") {
                return {
                    board: board,
                    outcome: "completeLevel",
                    score: score
                };
            }
            else if (tile.action === "pink-switch") {
                return {
                    board: Map.switchTiles(board, 15, 16),
                    outcome: outcome,
                    score: score
                };
            }
            else if (tile.action === "green-switch") {
                return {
                    board: Map.switchTiles(board, 18, 19),
                    outcome: outcome,
                    score: score
                };
            }
            return {
                board: board,
                outcome: outcome,
                score: score
            };
        };
        // basically, do we need to smash the block below?
        Action.prototype.checkTileBelowPlayer = function (player, board) {
            if (player.falling === false) {
                return board;
            }
            var coords = player.coords;
            var belowCoords = Map.correctForOverflow(board, coords.modify({ y: coords.y + 1 }));
            var tile = board.getTile(belowCoords.x, belowCoords.y);
            if (tile.get("breakable") === true) {
                // if tile below is breakable (and we are already falling and thus have momentum, smash it)
                var newTile = Map.cloneTile(1);
                var newTileWithCoords = newTile.modify({
                    x: belowCoords.x,
                    y: belowCoords.y
                });
                return board.modify(belowCoords.x, belowCoords.y, newTileWithCoords);
            }
            return board;
        };
        return Action;
    }());
    exports.Action = Action;
});
// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc
define("Canvas", ["require", "exports", "Utils"], function (require, exports, Utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = /** @class */ (function () {
        function Canvas(boardSize) {
            this.imagesFolder = "img/";
            this.boardSize = boardSize;
            var tileSize = this.sizeCanvas(boardSize);
            this.loadCanvas(boardSize, tileSize);
        }
        Canvas.prototype.getDrawingContext = function () {
            return this.ctx;
        };
        Canvas.prototype.getCanvas = function () {
            return this.canvas;
        };
        Canvas.prototype.getImagesFolder = function () {
            return this.imagesFolder;
        };
        Canvas.prototype.wipeCanvas = function (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        // takes BoardSize, returns size of each tile
        Canvas.prototype.sizeCanvas = function (boardSize) {
            var maxBoardSize = this.getMaxBoardSize(boardSize);
            this.sizeControls(maxBoardSize);
            var tileSize = this.calcTileSize(boardSize);
            this.loadCanvas(boardSize, tileSize);
            this.boardSize = boardSize;
            return tileSize;
        };
        Canvas.prototype.calcTileSize = function (boardSize) {
            var maxBoardSize = this.getMaxBoardSize(this.boardSize);
            var tileSize = maxBoardSize / boardSize.width;
            return Math.floor(tileSize);
        };
        Canvas.prototype.sizeControls = function (boardSize) {
            var controlHeader = document.getElementById("controlHeader");
            if (controlHeader) {
                controlHeader.style.width = boardSize.toString() + "px";
            }
        };
        Canvas.prototype.getMaxBoardSize = function (boardSize) {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var wrapMargin = Utils_2.Utils.getControlStyle("wrapper", "margin");
            var controlSpacing = Utils_2.Utils.getControlStyle("controlHeader", "marginTop");
            var editSpacing = Utils_2.Utils.getControlStyle("editHeader", "marginTop");
            var offsetHeight = Utils_2.Utils.getControlProperty("controlHeader", "offsetHeight");
            height =
                height - offsetHeight - 2 * wrapMargin - controlSpacing - editSpacing;
            width =
                width - offsetHeight - 2 * wrapMargin - controlSpacing - editSpacing;
            if (width > height) {
                var difference = height % boardSize.width;
                height = height - difference;
                return height;
            }
            else {
                var difference = width % boardSize.width;
                width = width - difference;
                return width;
            }
        };
        Canvas.prototype.loadCanvas = function (boardSize, tileSize) {
            this.canvas = document.getElementById("canvas");
            this.canvas.width = boardSize.width * tileSize;
            this.canvas.height = boardSize.height * tileSize;
            this.ctx = this.canvas.getContext("2d");
        };
        return Canvas;
    }());
    exports.Canvas = Canvas;
});
define("PlayerTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PlayerTypes = /** @class */ (function () {
        function PlayerTypes() {
            this.playerTypes = {
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
                "blade": {
                    frames: 18,
                    img: "blade-sprite.png",
                    title: "It is the mean spirited blade",
                    type: "blade",
                    value: 0,
                    movePattern: 'seek-egg'
                }
            };
        }
        PlayerTypes.prototype.getPlayerTypes = function () {
            return this.playerTypes;
        };
        return PlayerTypes;
    }());
    exports.PlayerTypes = PlayerTypes;
});
define("Collisions", ["require", "exports", "immutable", "Utils", "ramda"], function (require, exports, immutable_6, Utils_3, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Collisions = /** @class */ (function () {
        function Collisions(playerTypes) {
            this.playerTypes = playerTypes;
        }
        Collisions.prototype.checkAllCollisions = function (players) {
            var combinations = this.getAllPlayerCombinations(players);
            // only one egg, do nothing
            if (combinations.length === 0) {
                return players;
            }
            var collided = this.findCollisions(combinations, players);
            if (collided.length === 0) {
                return players;
            }
            var oldPlayers = this.removeCollidedPlayers(collided, players);
            var newPlayers = this.createNewPlayers(collided, players);
            var allPlayers = this.combinePlayerLists(oldPlayers, newPlayers);
            return allPlayers;
        };
        Collisions.prototype.combinePlayerLists = function (oldPlayers, newPlayers) {
            var allPlayers = [];
            oldPlayers.map(function (player) {
                allPlayers.push(player);
            });
            newPlayers.map(function (player) {
                allPlayers.push(player);
            });
            return immutable_6.fromJS(allPlayers);
        };
        // send an array of pairs of player ids, returns all that collide
        Collisions.prototype.findCollisions = function (combinations, players) {
            var _this = this;
            return combinations.filter(function (comb) {
                var player1 = _this.fetchPlayerByID(players, comb[0]);
                var player2 = _this.fetchPlayerByID(players, comb[1]);
                return _this.checkCollision(player1, player2);
            });
        };
        // returns all non-collided players
        // collided is any number of pairs of IDs, ie [[1,3], [3,5]]
        Collisions.prototype.removeCollidedPlayers = function (collided, players) {
            var collidedIDs = Utils_3.Utils.flattenArray(collided);
            var uniqueIDs = Utils_3.Utils.removeDuplicates(collidedIDs);
            return players.filter(function (player) {
                if (uniqueIDs.indexOf(player.id) === -1) {
                    return true;
                }
                return false;
            });
        };
        // go through each collided pair and combine the players to create new ones
        Collisions.prototype.createNewPlayers = function (collided, players) {
            var _this = this;
            return collided.reduce(function (newPlayers, collidedIDs) {
                var player1 = _this.fetchPlayerByID(players, collidedIDs[0]);
                var player2 = _this.fetchPlayerByID(players, collidedIDs[1]);
                if (player1 === null || player2 === null) {
                    return newPlayers;
                }
                var newOnes = _this.combinePlayers(player1, player2);
                return newPlayers.concat(newOnes);
            }, []);
        };
        Collisions.prototype.fetchPlayerByID = function (players, id) {
            var matching = players.filter(function (player) {
                return player.id === id;
            });
            if (matching.length === 0) {
                return null;
            }
            // we've found one then
            return _.find(function (item) {
                return item !== undefined;
            }, matching);
        };
        Collisions.prototype.getAllPlayerCombinations = function (players) {
            var _this = this;
            return players.reduce(function (total, player) {
                var otherPlayers = players.filter(function (otherPlayer) {
                    return player.id < otherPlayer.id;
                });
                var combos = otherPlayers.map(function (otherPlayer) {
                    return [player.id, otherPlayer.id];
                });
                return total.concat(_this.cleanCombos(combos));
            }, []);
        };
        // un-immutables values for sanity's sake
        Collisions.prototype.cleanCombos = function (combo) {
            if (immutable_6.List.isList(combo)) {
                return combo.toJS();
            }
            return combo;
        };
        Collisions.prototype.getAllPlayerIDs = function (players) {
            return players.map(function (player) {
                return player.id;
            });
        };
        // only deal with horizontal collisions for now
        Collisions.prototype.checkCollision = function (player1, player2) {
            if (!player1 || !player2) {
                return false;
            }
            if (player1.id === player2.id) {
                return false;
            }
            if (player1.value === 0 || player2.value === 0) {
                return false;
            }
            var coords1 = player1.coords;
            var coords2 = player2.coords;
            if (coords1.y !== coords2.y) {
                return false;
            }
            var distance = coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
            if (distance < 0) {
                distance = distance * -1;
            }
            if (distance <= 20) {
                return true;
            }
            // nothing changes
            return false;
        };
        Collisions.prototype.chooseHigherLevelPlayer = function (player1, player2) {
            if (player1.value > player2.value) {
                return player1;
            }
            if (player2.value > player1.value) {
                return player2;
            }
            if (player1.value === player2.value) {
                return player1;
            }
        };
        Collisions.prototype.getPlayerByValue = function (playerTypes, value) {
            for (var i in playerTypes) {
                if (playerTypes[i].value === value) {
                    return playerTypes[i];
                }
            }
            return false;
        };
        Collisions.prototype.combinePlayers = function (player1, player2) {
            var newValue = player1.value + player2.value;
            var higherPlayer = this.chooseHigherLevelPlayer(player1, player2);
            var newPlayerType = this.getPlayerByValue(this.playerTypes, newValue);
            if (!newPlayerType) {
                return [player1, player2];
            }
            var newPlayerParams = Object.assign({}, newPlayerType, {
                coords: higherPlayer.coords,
                direction: higherPlayer.direction
            });
            return [player1.modify(newPlayerParams)];
        };
        return Collisions;
    }());
    exports.Collisions = Collisions;
});
define("Loader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Loader = /** @class */ (function () {
        function Loader(apiLocation) {
            this.apiLocation = apiLocation;
        }
        Loader.prototype.callServer = function (action, params, callback, failCallback) {
            var xhr = new XMLHttpRequest();
            params.action = action;
            xhr.open("POST", this.apiLocation, true);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                var DONE = 4; // readyState 4 means the request is done.
                var OK = 200; // status 200 is a successful return.
                if (xhr.readyState === DONE) {
                    if (xhr.status === OK) {
                        var object = void 0;
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
            var queryString = this.param(params);
            xhr.send(queryString);
        };
        Loader.prototype.paramsToFormData = function (params) {
            var formData = new FormData();
            for (var key in params) {
                if (params[key] !== undefined) {
                    formData.append(key, params[key]);
                }
            }
            return formData;
        };
        Loader.prototype.param = function (object) {
            var encodedString = "";
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (encodedString.length > 0) {
                        encodedString += "&";
                    }
                    encodedString += encodeURI(prop + "=" + object[prop]);
                }
            }
            return encodedString;
        };
        return Loader;
    }());
    exports.Loader = Loader;
});
define("SavedLevel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SavedLevel = /** @class */ (function () {
        function SavedLevel(boardSize, board, levelID) {
            this.boardSize = boardSize;
            this.board = board;
            this.levelID = levelID;
        }
        SavedLevel.prototype.toString = function () {
            var data = this.getData();
            return JSON.stringify(data);
        };
        SavedLevel.prototype.getData = function () {
            return {
                board: this.board,
                boardSize: this.boardSize.getData(),
                levelID: this.levelID
            };
        };
        return SavedLevel;
    }());
    exports.SavedLevel = SavedLevel;
});
define("Levels", ["require", "exports", "BoardSize", "SavedLevel"], function (require, exports, BoardSize_2, SavedLevel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Levels = /** @class */ (function () {
        function Levels(loader) {
            this.levelID = 0;
            this.levels = {};
            this.loader = loader;
        }
        Levels.prototype.getLevelList = function (callback) {
            var _this = this;
            this.loader.callServer("getLevelsList", {}, function (data) {
                var levelList = _this.cleanLevelList(data);
                callback(levelList);
            }, function () {
                var levelList = _this.cleanLevelList([]);
                callback(levelList);
            });
        };
        Levels.prototype.populateLevelsList = function (levelList) {
            var select = document.getElementById("levelList");
            if (!select) {
                return;
            }
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            var nullEl = document.createElement("option");
            nullEl.textContent = "New";
            nullEl.value = "";
            if (!this.levelID) {
                nullEl.selected = true;
            }
            select.appendChild(nullEl);
            for (var i in levelList) {
                if (levelList[i] !== undefined) {
                    var levelID = parseInt(i, 10);
                    var el = document.createElement("option");
                    el.textContent = levelID.toString();
                    el.value = levelID.toString();
                    if (levelID === this.levelID) {
                        el.selected = true;
                    }
                    select.appendChild(el);
                }
            }
        };
        Levels.prototype.saveLevel = function (board, boardSize, levelID, callback) {
            var _this = this;
            var saveData = new SavedLevel_1.SavedLevel(boardSize, board, levelID);
            var saveString = saveData.toString();
            var params = {
                data: saveString,
                levelID: 0
            };
            if (levelID) {
                params.levelID = levelID;
            }
            this.loader.callServer("saveLevel", params, function (savedLevelID) {
                _this.levelID = savedLevelID;
                callback(savedLevelID);
            }, function (errorMsg) {
                // console.log("ERROR: ", errorMsg);
            });
        };
        Levels.prototype.loadLevel = function (levelID, callback, failCallback) {
            var _this = this;
            this.getLevelList(function () {
                // console.log("gotLevelList");
            });
            var params = {
                levelID: levelID
            };
            this.loader.callServer("getLevel", params, function (data) {
                _this.levelID = levelID;
                var boardSize = new BoardSize_2.BoardSize(data.boardSize.width);
                var savedLevel = new SavedLevel_1.SavedLevel(boardSize, data.board, levelID);
                callback(savedLevel);
            }, function (errorMsg) {
                // console.log("ERROR: ", errorMsg);
                failCallback();
            });
        };
        Levels.prototype.saveData = function (levelID, rotationsUsed, score, callback) {
            var params = {
                levelID: levelID,
                rotationsUsed: rotationsUsed,
                score: score
            };
            this.loader.callServer("saveScore", params, function (data) {
                callback(data);
            }, function () {
                callback({ msg: "call failed" });
            });
        };
        // turn array of numbers into list key'd by levelID with object of won/lost
        Levels.prototype.cleanLevelList = function (list) {
            var levelList = [];
            for (var i in list) {
                if (list[i] !== undefined) {
                    var levelID = parseInt(list[i], 10);
                    levelList[levelID] = {
                        completed: false,
                        levelID: levelID
                    };
                }
            }
            return levelList;
        };
        return Levels;
    }());
    exports.Levels = Levels;
});
define("RenderMap", ["require", "exports", "BoardSize", "Coords", "Utils"], function (require, exports, BoardSize_3, Coords_3, Utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this is not a render map object, but a class for making them
    var RenderMap = /** @class */ (function () {
        function RenderMap() {
        }
        // render map
        RenderMap.copyRenderMap = function (renderMap) {
            return renderMap.slice(0);
        };
        // add player to renderMap, returning new renderMap
        RenderMap.addPlayerToRenderMap = function (player, renderMap) {
            var coords = player.coords;
            var startX = coords.x - 1;
            var endX = coords.x + 1;
            var startY = coords.y - 1;
            var endY = coords.y + 1;
            var newRenderMap = this.copyRenderMap(renderMap);
            var boardSize = new BoardSize_3.BoardSize(renderMap.length);
            for (var x = startX; x <= endX; x++) {
                for (var y = startY; y <= endY; y++) {
                    var newCoords = new Coords_3.Coords({ x: x, y: y });
                    var fixedCoords = Utils_4.Utils.correctForOverflow(newCoords, boardSize);
                    newRenderMap[fixedCoords.x][fixedCoords.y] = true;
                }
            }
            return newRenderMap;
        };
        // takes oldBoard and newBoard and creates a map of changes between them
        RenderMap.createRenderMapFromBoards = function (oldBoard, newBoard) {
            var boardArray = this.createRenderMap(oldBoard.getLength(), false);
            return boardArray.map(function (column, x) {
                return column.map(function (tile, y) {
                    var oldTile = oldBoard.getTile(x, y);
                    var newTile = newBoard.getTile(x, y);
                    if (oldTile.equals(newTile)) {
                        return false;
                    }
                    else {
                        return true;
                    }
                });
            });
        };
        // combines any two renderMaps (using OR)
        // assumes they are same size
        RenderMap.combineRenderMaps = function (renderMap, newRenderMap) {
            return renderMap.map(function (column, x) {
                return column.map(function (entry, y) {
                    return entry || newRenderMap[x][y];
                });
            });
        };
        // create an empty render map
        RenderMap.createRenderMap = function (size, value) {
            var boardArray = [];
            for (var x = 0; x < size; x++) {
                boardArray[x] = [];
                for (var y = 0; y < size; y++) {
                    boardArray[x][y] = value;
                }
            }
            return boardArray;
        };
        return RenderMap;
    }());
    exports.RenderMap = RenderMap;
});
define("Movement", ["require", "exports", "ramda", "BoardSize", "Map", "immutable"], function (require, exports, _, BoardSize_4, Map, immutable_7) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    var OFFSET_DIVIDE = 100;
    // doCalcs takes the current map, the current players, and returns new player objects
    // loop through passed players[] array, do changes, return new one
    exports.doCalcs = function (gameState, timePassed) {
        var newPlayers = gameState.players.map(function (player) {
            return exports.doPlayerCalcs(gameState.board, timePassed)(player);
        });
        var newGameState = gameState.modify({
            players: newPlayers
        });
        return newGameState;
    };
    exports.calcMoveAmount = function (moveSpeed, timePassed) {
        var moveAmount = 1 / OFFSET_DIVIDE * moveSpeed * 5;
        var frameRateAdjusted = moveAmount * timePassed;
        if (isNaN(frameRateAdjusted)) {
            return 0;
        }
        return frameRateAdjusted;
    };
    exports.correctTileOverflow = function (coords) {
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
    exports.checkFloorBelowPlayer = function (board, timePassed) {
        return function (player) {
            if (player.coords.offsetX !== 0) {
                return player;
            }
            var coords = player.coords;
            // not needed yet, but...
            var boardSize = new BoardSize_4.BoardSize(board.getLength());
            var belowCoords = Map.correctForOverflow(board, coords.modify({ y: coords.y + 1 }));
            var tile = board.getTile(belowCoords.x, belowCoords.y);
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
    };
    // curry and compose together a nice pipeline function to transform old player state into new
    exports.getCalcFunction = function (oldPlayer, board, timePassed) {
        // separated as not all functions will be the same for enemies
        var eggMoves = _.compose(exports.incrementPlayerDirection(timePassed), exports.checkPlayerDirection(board), exports.checkFloorBelowPlayer(board, timePassed));
        return _.compose(exports.markPlayerAsMoved(oldPlayer), exports.checkForMovementTiles(board), exports.correctPlayerOverflow(board), eggMoves, exports.incrementPlayerFrame);
    };
    exports.doPlayerCalcs = function (board, timePassed) { return function (player) { return exports.getCalcFunction(player, board, timePassed)(player); }; };
    // work out whether player's location has moved since last go
    exports.markPlayerAsMoved = function (oldPlayer) { return function (newPlayer) {
        if (exports.playerHasMoved(oldPlayer, newPlayer)) {
            return newPlayer.modify({
                moved: true
            });
        }
        return newPlayer.modify({
            moved: false
        });
    }; };
    // works out whether Player has actually moved since last go
    // used to decide whether to do an action to stop static players hitting switches infinitely etc
    exports.playerHasMoved = function (oldPlayer, newPlayer) {
        return !immutable_7.is(oldPlayer.coords, newPlayer.coords);
    };
    exports.checkForMovementTiles = function (board) { return function (player) {
        var currentCoords = player.coords;
        if (currentCoords.offsetX !== 0 || currentCoords.offsetY !== 0) {
            return player;
        }
        var coords = Map.correctForOverflow(board, currentCoords);
        var tile = board.getTile(coords.x, coords.y);
        if (tile.action === "teleport") {
            return exports.teleport(board)(player);
        }
        return player;
    }; };
    // find another teleport and go to it
    // if no others, do nothing
    exports.teleport = function (board) { return function (player) {
        if (player.lastAction === "teleport") {
            return player;
        }
        var newTile = Map.findTile(board, player.coords, 14);
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
    }; };
    exports.incrementPlayerFrame = function (player) {
        if (player.direction === 0 &&
            player.oldDirection === 0 &&
            player.currentFrame === 0) {
            // we are still, as it should be
            return player;
        }
        if (player.direction === 0 && player.currentFrame === 0) {
            // if we're still, and have returned to main frame, disregard old movement
            return player.modify({
                oldDirection: 0
            });
        }
        var newFrame = player.currentFrame;
        // if going left, reduce frame
        if (player.direction < 0 || player.oldDirection < 0) {
            newFrame = player.currentFrame - 1;
            if (newFrame < 0) {
                newFrame = player.frames - 1;
            }
        }
        // if going right, increase frame
        if (player.direction > 0 || player.oldDirection > 0) {
            newFrame = player.currentFrame + 1;
            if (newFrame >= player.frames) {
                newFrame = 0;
            }
        }
        return player.modify({
            currentFrame: newFrame
        });
    };
    // this checks whether the next place we intend to go is a goddamn trap, and changes direction if so
    exports.checkPlayerDirection = function (board) { return function (player) {
        var coords = player.coords;
        if (player.direction !== 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x - 1, coords.y) &&
                !Map.checkTileIsEmpty(board, coords.x + 1, coords.y)) {
                return player.modify({
                    stop: true // don't go on this turn
                });
            }
        }
        if (player.direction < 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x - 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: 1,
                    stop: false
                });
            }
        }
        if (player.direction > 0 && player.falling === false) {
            if (!Map.checkTileIsEmpty(board, coords.x + 1, coords.y)) {
                // turn around
                return player.modify({
                    coords: coords.modify({
                        offsetX: 0
                    }),
                    direction: -1,
                    stop: false
                });
            }
        }
        return player.modify({
            stop: false
        });
    }; };
    // this does the left/right moving, but does not care if walls are there as that is the responsibility of checkPlayerDirection
    exports.incrementPlayerDirection = function (timePassed) { return function (player) {
        // falling is priority - do this if a thing
        if (player.falling) {
            var fallAmount = exports.calcMoveAmount(player.fallSpeed, timePassed);
            var newOffsetY = player.coords.offsetX + fallAmount;
            var newCoords = player.coords.modify({
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
        var moveAmount = exports.calcMoveAmount(player.moveSpeed, timePassed);
        var coords = player.coords;
        if (player.direction < 0) {
            // move left
            var newOffsetX = coords.offsetX - moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetX: newOffsetX
                })
            });
        }
        else if (player.direction > 0) {
            // move right
            var newOffsetX = coords.offsetX + moveAmount;
            return player.modify({
                coords: coords.modify({
                    offsetX: newOffsetX
                })
            });
        }
        // if we've stopped and ended up not quite squared up, correct this
        if (player.direction === 0) {
            if (coords.offsetX > 0) {
                // shuffle left
                var newOffsetX = coords.offsetX - moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetX: newOffsetX
                    })
                });
            }
            else if (coords.offsetX < 0) {
                // shuffle right
                var newOffsetX = coords.offsetX + moveAmount;
                return player.modify({
                    coords: coords.modify({
                        offsetX: newOffsetX
                    })
                });
            }
        }
        // do nothing, return same object
        return player;
    }; };
    exports.correctPlayerOverflow = function (board) { return function (player) {
        var newCoords = _this.correctTileOverflow(player.coords);
        var loopedCoords = Map.correctForOverflow(board, newCoords);
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
    }; };
});
// this is the egg
// it accepts a GameState and an Action
// and returns a new GameState
// totally fucking stateless and burnable in itself
define("TheEgg", ["require", "exports", "Action", "BoardSize", "Collisions", "Map", "Movement"], function (require, exports, Action_1, BoardSize_5, Collisions_1, Map, Movement) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TheEgg = /** @class */ (function () {
        function TheEgg(playerTypes) {
            this.playerTypes = playerTypes;
        }
        TheEgg.prototype.doAction = function (gameState, action, timePassed) {
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
        };
        // this is where we have to do a shitload of things
        TheEgg.prototype.doGameMove = function (gameState, timePassed) {
            // first get rid of old outcome
            var startGameState = gameState.modify({
                outcome: ""
            });
            var newGameState = Movement.doCalcs(startGameState, timePassed);
            var action = new Action_1.Action;
            var newerGameState = action.checkAllPlayerTileActions(newGameState);
            var collisions = new Collisions_1.Collisions(this.playerTypes);
            var sortedPlayers = collisions.checkAllCollisions(newerGameState.players);
            return newerGameState.modify({
                players: sortedPlayers
            });
        };
        // this rotates board and players
        // it DOES NOT do animation - not our problem
        TheEgg.prototype.doRotate = function (gameState, clockwise) {
            var rotations = gameState.rotations + 1;
            var boardSize = new BoardSize_5.BoardSize(gameState.board.getLength());
            var newBoard = Map.rotateBoard(gameState.board, clockwise);
            var rotatedPlayers = gameState.players.map(function (player) {
                return Map.rotatePlayer(boardSize, player, clockwise);
            });
            var rotateAngle = Map.changeRenderAngle(gameState.rotateAngle, clockwise);
            return gameState.modify({
                board: newBoard,
                players: rotatedPlayers,
                rotateAngle: rotateAngle,
                rotations: rotations
            });
        };
        // check leftovers on board and whether player is over finish tile
        TheEgg.prototype.checkLevelIsCompleted = function (gameState) {
            var collectable = this.getCollectable(gameState.board);
            var playerCount = this.countPlayers(gameState.players);
            if (collectable < 1 && playerCount < 2) {
                // change gameState.outcome to "nextLevel" or something, I don't know
            }
            return gameState;
        };
        TheEgg.prototype.countPlayers = function (players) {
            var validPlayers = players.filter(function (player) {
                return player && player.value > 0;
            });
            return validPlayers.length;
        };
        // get total outstanding points left to grab on board
        TheEgg.prototype.getCollectable = function (board) {
            var tiles = board.getAllTiles();
            return tiles.reduce(function (collectable, tile) {
                var score = tile.collectable;
                if (score > 0) {
                    return collectable + score;
                }
            }, 0);
        };
        return TheEgg;
    }());
    exports.TheEgg = TheEgg;
});
define("TileChooser", ["require", "exports", "TileSet", "ramda"], function (require, exports, TileSet_2, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // used in editor, draws a bunch of 32x32 tiles for selecting
    var TileChooser = /** @class */ (function () {
        function TileChooser(renderer) {
            this.chosenTileID = 0;
            this.renderer = renderer;
        }
        TileChooser.prototype.chooseTile = function (id) {
            this.chosenTileID = id;
            this.highlightChosenTile(id);
        };
        TileChooser.prototype.highlightChosenTile = function (id) {
            var tileChooser = document.getElementById("tileChooser");
            var children = tileChooser.children;
            var childrenArray = [].slice.call(children);
            childrenArray.forEach(function (child) {
                var className = child.getAttribute("class");
                if (className === "tile" + id) {
                    child.setAttribute("style", "border: 1px red solid;");
                }
                else {
                    child.setAttribute("style", "border: 1px white solid;");
                }
            });
        };
        TileChooser.prototype.makeTileImages = function (tiles) {
            var _this = this;
            return _.map(function (tile) {
                var tileImage = document.createElement("img");
                tileImage.setAttribute("src", _this.renderer.getTileImagePath(tile));
                tileImage.setAttribute("width", "32");
                tileImage.setAttribute("height", "32");
                tileImage.setAttribute("padding", "2px");
                tileImage.setAttribute("alt", tile.title);
                tileImage.setAttribute("style", "border: 1px white solid;");
                tileImage.setAttribute("class", "tile" + tile.id);
                tileImage.onclick = function () {
                    _this.chooseTile(tile.id);
                };
                return tileImage;
            }, tiles);
        };
        TileChooser.prototype.render = function () {
            var tiles = TileSet_2.TileSet.getTiles();
            var images = this.makeTileImages(tiles);
            var tileChooser = document.getElementById("tileChooser");
            Object.values(images).forEach(function (image) {
                tileChooser.appendChild(image);
            });
        };
        return TileChooser;
    }());
    exports.TileChooser = TileChooser;
});
define("TitleScreen", ["require", "exports", "BoardSize"], function (require, exports, BoardSize_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TitleScreen = /** @class */ (function () {
        function TitleScreen(jetpack, canvas, imagePath, width, height) {
            this.jetpack = jetpack;
            this.canvas = canvas;
            this.imagePath = this.canvas.getImagesFolder() + imagePath;
            this.width = width;
            this.height = height;
        }
        TitleScreen.prototype.render = function (callback) {
            var _this = this;
            var boardSize = new BoardSize_6.BoardSize(10);
            this.canvas.sizeCanvas(boardSize);
            var titleImage = document.createElement("img");
            titleImage.addEventListener("load", function () {
                _this.drawTheBigEgg(titleImage, 0.02, true, callback);
            }, false);
            titleImage.setAttribute("src", this.imagePath);
            titleImage.setAttribute("width", this.width.toString());
            titleImage.setAttribute("height", this.height.toString());
        };
        TitleScreen.prototype.drawTheBigEgg = function (titleImage, opacity, show, callback) {
            var _this = this;
            var ctx = this.canvas.getDrawingContext();
            var canvas = this.canvas.getCanvas();
            ctx.globalAlpha = 1;
            this.canvas.wipeCanvas("rgb(0,0,0)");
            ctx.globalAlpha = opacity;
            ctx.drawImage(titleImage, 0, 0, titleImage.width, titleImage.height, 0, 0, canvas.width, canvas.height);
            if (show) {
                opacity += 0.01;
                if (opacity >= 1) {
                    // wait, fade the egg
                    var v = setTimeout(function () {
                        // and start fading!
                        _this.drawTheBigEgg(titleImage, opacity, false, callback);
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
            this.jetpack.animationHandle = window.requestAnimationFrame(function () {
                _this.drawTheBigEgg(titleImage, opacity, show, callback);
            });
        };
        return TitleScreen;
    }());
    exports.TitleScreen = TitleScreen;
});
define("Jetpack", ["require", "exports", "BoardSize", "Canvas", "Coords", "Editor", "GameState", "Levels", "Loader", "Map", "Player", "PlayerTypes", "Renderer", "RenderMap", "TheEgg", "TileSet", "TitleScreen", "Utils"], function (require, exports, BoardSize_7, Canvas_1, Coords_4, Editor_1, GameState_1, Levels_1, Loader_1, Map, Player_1, PlayerTypes_1, Renderer_1, RenderMap_1, TheEgg_1, TileSet_3, TitleScreen_1, Utils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Jetpack = /** @class */ (function () {
        function Jetpack() {
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
            this.filterCreateTiles = function (tiles) {
                return tiles.filter(function (tile) {
                    return tile.createPlayer !== "";
                });
            };
        }
        Jetpack.prototype.go = function (levelID) {
            var _this = this;
            // this.bootstrap();
            this.bindSizeHandler();
            this.bindKeyboardHandler();
            this.pauseRender();
            this.getTitleScreen(function () {
                _this.loadLevel(levelID, function () {
                    _this.setNextAction("");
                    _this.startRender();
                });
            });
        };
        Jetpack.prototype.getEditor = function () {
            return new Editor_1.Editor();
        };
        // load static stuff - map/renderer etc will be worked out later
        Jetpack.prototype.bootstrap = function (callback) {
            var _this = this;
            var boardSize = new BoardSize_7.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_1.Canvas(boardSize);
            var playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(loader);
            this.getLevelList(function (levelList) {
                var levelID = _this.chooseLevelID(levelList);
                _this.levelID = levelID;
                callback(levelID);
            });
        };
        Jetpack.prototype.displayScore = function (score) {
            var scoreElement = document.getElementById("score");
            if (scoreElement) {
                scoreElement.innerHTML = score.toString();
            }
        };
        // create player
        Jetpack.prototype.createNewPlayer = function (playerTypes, type, coords, direction) {
            var playerType = playerTypes[type];
            var params = JSON.parse(JSON.stringify(playerType));
            params.id = this.nextPlayerID++;
            params.coords = coords;
            params.direction = direction;
            if (!Object.hasOwnProperty.call(params, "moveSpeed")) {
                params.moveSpeed = this.moveSpeed;
                params.fallSpeed = this.moveSpeed * 1.2;
            }
            var player = new Player_1.Player(params);
            return player;
        };
        // make this actually fucking rotate, and choose direction, and do the visual effect thing
        Jetpack.prototype.rotateBoard = function (clockwise) {
            if (clockwise) {
                this.setNextAction("rotateRight");
            }
            else {
                this.setNextAction("rotateLeft");
            }
        };
        Jetpack.prototype.getTitleScreen = function (callback) {
            var imageSize = { width: 1024, height: 1024 };
            var imagePath = "large/the-egg.png";
            var titleScreen = new TitleScreen_1.TitleScreen(this, this.canvas, imagePath, imageSize.width, imageSize.height);
            titleScreen.render(callback);
        };
        Jetpack.prototype.getLevelList = function (callback) {
            var _this = this;
            this.levels.getLevelList(function (levelList) {
                _this.levelList = levelList;
                callback(levelList);
            });
        };
        // select a random level that has not been completed yet
        // a return of false means none available (generate a random one)
        Jetpack.prototype.chooseLevelID = function (levelList) {
            var availableLevels = levelList.filter(function (level) {
                return level.completed === false;
            });
            var chosenKey = Utils_5.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            var levelID = availableLevels[chosenKey].levelID;
            return levelID;
        };
        Jetpack.prototype.setNextAction = function (action) {
            this.action = action;
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Jetpack.prototype.createRenderer = function (boardSize, completedCallback) {
            this.canvas = new Canvas_1.Canvas(boardSize);
            this.boardSize = boardSize;
            var tiles = TileSet_3.TileSet.getTiles();
            return new Renderer_1.Renderer(this, tiles, this.playerTypes, this.boardSize, this.canvas, function () { return completedCallback(); });
        };
        Jetpack.prototype.startRender = function () {
            var _this = this;
            window.cancelAnimationFrame(this.animationHandle);
            this.showControls();
            this.animationHandle = window.requestAnimationFrame(function (time) {
                return _this.eventLoop(time, 0);
            });
        };
        Jetpack.prototype.getNextAction = function () {
            var action = this.action;
            // this.action = "";
            return action;
        };
        // change of heart - this runs all the time and requests various things do stuff
        // if we are paused, it is nothing, but the loop runs all the same
        // we are separating one frame ==== one turn
        // as this does not work for things like rotation
        // which is one 'turn' but many frames
        Jetpack.prototype.eventLoop = function (time, lastTime) {
            var _this = this;
            this.animationHandle = window.requestAnimationFrame(function (newTime) {
                return _this.eventLoop(newTime, time);
            });
            var timePassed = this.calcTimePassed(time, lastTime);
            this.displayFrameRate(timePassed);
            var action = this.getNextAction();
            this.gameCycle(timePassed, action);
        };
        // this does one step of the game
        Jetpack.prototype.gameCycle = function (timePassed, action) {
            var oldGameState = this.getCurrentGameState();
            if (action === "rotateLeft") {
                var rotatedLeftState = this.getNewGameState(oldGameState, "rotateLeft", timePassed);
                this.doBoardRotation(false, rotatedLeftState);
                this.setNextAction("rotatingLeft");
                return false;
            }
            else if (action === "rotateRight") {
                var rotatedRightState = this.getNewGameState(oldGameState, "rotateRight", timePassed);
                this.doBoardRotation(true, rotatedRightState);
                this.setNextAction("rotatingRight");
                return false;
            }
            else if (action.length > 0) {
                return false;
            }
            if (oldGameState.outcome.length > 0) {
                var continueGame = this.checkOutcome(oldGameState);
                if (continueGame === false) {
                    this.setNextAction("stop");
                }
            }
            var newGameState = this.getNewGameState(oldGameState, action, timePassed);
            if (oldGameState.score !== newGameState.score) {
                this.displayScore(newGameState.score);
            }
            this.renderChanges(oldGameState, newGameState);
        };
        // return true for continue play, false for stop
        Jetpack.prototype.checkOutcome = function (gameState) {
            if (gameState.outcome === "completeLevel") {
                // egg is over cup - check whether we've completed
                var completed = this.completeLevel(gameState.board, gameState.players);
                if (completed) {
                    this.nextLevel(gameState.score, gameState.rotations);
                    return false;
                }
            }
            return true;
        };
        // or at least try
        Jetpack.prototype.completeLevel = function (board, players) {
            var collectable = this.getCollectable(board);
            var playerCount = this.countPlayers(players);
            if (collectable < 1 && playerCount < 2) {
                return true;
            }
            return false;
        };
        Jetpack.prototype.getBoardFromArray = function (boardArray) {
            return Map.makeBoardFromArray(boardArray);
        };
        // create first "frame" of gameState from board
        // create players etc
        Jetpack.prototype.getBlankGameState = function (board) {
            var players = this.createPlayers(this.playerTypes, board);
            return new GameState_1.GameState({
                board: board,
                players: players
            });
        };
        // current game state from array
        Jetpack.prototype.getCurrentGameState = function () {
            return this.gameStates.slice(-1)[0]; // set to new last item
        };
        Jetpack.prototype.resetGameState = function (board) {
            var gameState = this.getBlankGameState(board);
            this.gameStates = [gameState];
        };
        // do next move, plop new state on pile, return new state
        Jetpack.prototype.getNewGameState = function (gameState, action, timePassed) {
            var theEgg = new TheEgg_1.TheEgg(this.playerTypes);
            var newGameState = theEgg.doAction(gameState, action, timePassed);
            this.gameStates.push(newGameState); // add to history
            return newGameState;
        };
        Jetpack.prototype.renderEverything = function (gameState) {
            var boardSize = new BoardSize_7.BoardSize(gameState.board.getLength());
            var blankMap = RenderMap_1.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(gameState.board, blankMap, gameState.players, gameState.rotateAngle);
        };
        Jetpack.prototype.renderChanges = function (oldGameState, newGameState) {
            var boardSize = new BoardSize_7.BoardSize(newGameState.board.getLength());
            // if rotated everything changes anyway
            if (oldGameState.rotateAngle !== newGameState.rotateAngle) {
                return this.renderEverything(newGameState);
            }
            // player map is covering old shit up
            var playerRenderMap = this.createRenderMapFromPlayers(oldGameState.players, boardSize);
            // render changes
            var boardRenderMap = RenderMap_1.RenderMap.createRenderMapFromBoards(oldGameState.board, newGameState.board);
            var finalRenderMap = RenderMap_1.RenderMap.combineRenderMaps(playerRenderMap, boardRenderMap);
            this.renderer.render(newGameState.board, finalRenderMap, newGameState.players, newGameState.rotateAngle);
        };
        Jetpack.prototype.sizeCanvas = function (boardSize) {
            if (!this.checkResize) {
                return false;
            }
            this.renderer.resize(boardSize);
            this.checkResize = false;
        };
        // create empty renderMap based on boardSize, and then apply each player's position to it
        Jetpack.prototype.createRenderMapFromPlayers = function (players, boardSize) {
            var blankMap = RenderMap_1.RenderMap.createRenderMap(boardSize.width, false);
            return players.reduce(function (map, player) {
                return RenderMap_1.RenderMap.addPlayerToRenderMap(player, map);
            }, blankMap);
        };
        Jetpack.prototype.calcTimePassed = function (time, lastTime) {
            var difference = Math.min(time - lastTime, 20);
            return difference;
        };
        Jetpack.prototype.displayFrameRate = function (timePassed) {
            var frameRate = Math.floor(1000 / timePassed);
            var fps = document.getElementById("fps");
            if (fps) {
                fps.innerHTML = frameRate.toFixed(3) + "fps";
            }
        };
        Jetpack.prototype.nextLevel = function (score, rotations) {
            var _this = this;
            this.pauseRender();
            this.levels.saveData(this.levelID, rotations, score, function (data) {
                _this.levelList = _this.markLevelAsCompleted(_this.levelList, _this.levelID);
                _this.levelID = _this.chooseLevelID(_this.levelList);
                _this.go(_this.levelID);
            });
        };
        Jetpack.prototype.markLevelAsCompleted = function (levelList, levelID) {
            levelList[levelID].completed = true;
            return levelList;
        };
        Jetpack.prototype.pauseRender = function () {
            this.paused = true;
            this.hideControls();
            window.cancelAnimationFrame(this.animationHandle);
        };
        Jetpack.prototype.showControls = function () {
            var controlHeader = document.getElementById("controlHeader");
            if (controlHeader && controlHeader.classList.contains("hidden")) {
                controlHeader.classList.remove("hidden");
            }
        };
        Jetpack.prototype.hideControls = function () {
            var controlHeader = document.getElementById("controlHeader");
            if (controlHeader && !controlHeader.classList.contains("hidden")) {
                controlHeader.classList.add("hidden");
            }
        };
        Jetpack.prototype.countPlayers = function (players) {
            return players.reduce(function (total, player) {
                if (player && player.value > 0) {
                    return total + 1;
                }
                else {
                    return total;
                }
            }, 0);
        };
        // cycle through all map tiles, find egg cups etc and create players
        Jetpack.prototype.createPlayers = function (playerTypes, board) {
            var _this = this;
            var tiles = board.getAllTiles();
            var filtered = this.filterCreateTiles(tiles);
            var players = filtered.map(function (tile) {
                var type = tile.createPlayer;
                var coords = new Coords_4.Coords({
                    offsetX: 0,
                    offsetY: 0,
                    x: tile.x,
                    y: tile.y
                });
                return _this.createNewPlayer(playerTypes, type, coords, 1);
            });
            return players;
        };
        // get total outstanding points left to grab on board
        Jetpack.prototype.getCollectable = function (board) {
            var tiles = board.getAllTiles();
            return tiles.reduce(function (collectable, tile) {
                var score = tile.get("collectable");
                if (score > 0) {
                    return collectable + score;
                }
                else {
                    return collectable;
                }
            }, 0);
        };
        Jetpack.prototype.doBoardRotation = function (clockwise, gameState) {
            var _this = this;
            this.renderer.drawRotatingBoard(clockwise, this.moveSpeed, function () {
                _this.renderEverything(gameState);
                _this.setNextAction(""); // continue playing the game
            });
        };
        Jetpack.prototype.loadLevel = function (levelID, callback) {
            var _this = this;
            this.levels.loadLevel(levelID, function (savedLevel) {
                _this.renderer = _this.createRenderer(savedLevel.boardSize, function () {
                    var board = _this.getBoardFromArray(savedLevel.board);
                    _this.resetGameState(board);
                    var gameState = _this.getCurrentGameState();
                    _this.renderEverything(gameState);
                    callback();
                });
            }, function () {
                _this.renderer = _this.createRenderer(_this.boardSize, function () {
                    var board = Map.generateRandomBoard(_this.boardSize);
                    _this.resetGameState(board);
                    var gameState = _this.getCurrentGameState();
                    _this.renderEverything(gameState);
                    callback();
                });
            });
        };
        Jetpack.prototype.bindSizeHandler = function () {
            var _this = this;
            window.addEventListener("resize", function () {
                _this.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
            });
        };
        Jetpack.prototype.bindKeyboardHandler = function () {
            var _this = this;
            window.addEventListener("keydown", function (event) {
                if (event.keyCode === 37) {
                    // left arrow
                    _this.rotateBoard(false);
                }
                if (event.keyCode === 39) {
                    // right arrow
                    _this.rotateBoard(true);
                }
                if (event.keyCode === 80) {
                    // 'p'
                    _this.togglePaused();
                }
                if (event.keyCode === 83) {
                    // 's'
                    _this.doStep();
                }
                if (event.keyCode === 70) {
                    // 'f'
                    _this.toggleFPS();
                }
            });
        };
        Jetpack.prototype.toggleFPS = function () {
            var fps = document.getElementById("fps");
            if (!fps) {
                return false;
            }
            if (fps.style.display !== "block") {
                fps.style.display = "block";
            }
            else {
                fps.style.display = "none";
            }
        };
        Jetpack.prototype.togglePaused = function () {
            if (this.paused) {
                this.startRender();
            }
            else {
                this.pauseRender();
            }
        };
        Jetpack.prototype.doStep = function () {
            this.gameCycle(16, this.getNextAction()); // movement based on 60 fps
        };
        return Jetpack;
    }());
    exports.Jetpack = Jetpack;
});
define("Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var OFFSET_DIVIDE = 100;
    var Renderer = /** @class */ (function () {
        function Renderer(jetpack, tiles, playerTypes, boardSize, canvas, loadCallback) {
            this.lampMode = false; // lamp mode only draws around the eggs
            this.checkResize = true;
            this.tileImages = {}; // image elements of tiles
            this.playerImages = {}; // image element of players
            this.totalTiles = 0;
            this.tilesLoaded = 0;
            this.renderTile = function (x, y, tile, renderAngle) {
                var ctx = this.canvas.getDrawingContext();
                var tileSize = this.tileSize;
                var img = this.getTileImage(tile);
                if (!img) {
                    // console.log("Could not find tile image for id " + tile.id);
                    return false;
                }
                var left = Math.floor(x * tileSize);
                var top = Math.floor(y * tileSize);
                if (renderAngle === 0) {
                    ctx.drawImage(img, left, top, tileSize, tileSize);
                }
                else {
                    var angleInRad = renderAngle * (Math.PI / 180);
                    var offset = Math.floor(tileSize / 2);
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
        Renderer.prototype.render = function (board, renderMap, players, renderAngle) {
            // console.log("Renderer->render",board, renderMap, renderAngle);
            this.tileSize = this.canvas.calcTileSize(this.boardSize);
            this.renderBoard(board, renderMap, renderAngle);
            this.renderPlayers(players);
            this.renderFrontLayerBoard(board, renderMap, renderAngle);
        };
        Renderer.prototype.resize = function (boardSize) {
            this.boardSize = boardSize;
            this.tileSize = this.canvas.sizeCanvas(boardSize);
        };
        Renderer.prototype.drawRotatingBoard = function (clockwise, moveSpeed, completed) {
            if (this.rotating === true) {
                // already
                return false;
            }
            var canvas = this.canvas.getCanvas();
            var savedData = this.getImageData(canvas);
            this.rotating = true;
            if (clockwise) {
                this.drawRotated(savedData, 1, 0, 90, moveSpeed, completed);
            }
            else {
                this.drawRotated(savedData, -1, 0, -90, moveSpeed, completed);
            }
        };
        Renderer.prototype.getTileImagePath = function (tile) {
            return this.canvas.imagesFolder + tile.img;
        };
        Renderer.prototype.getImageData = function (canvas) {
            var cw = canvas.width;
            var ch = canvas.height;
            var savedData = new Image();
            savedData.src = canvas.toDataURL("image/png");
            return savedData;
        };
        Renderer.prototype.loadTilePalette = function (tiles) {
            var _this = this;
            this.totalTiles = this.tilesLoaded = 0;
            var _loop_1 = function (i) {
                if (tiles[i] !== undefined) {
                    this_1.totalTiles++;
                    var thisTile_1 = tiles[i];
                    var tileImage = document.createElement("img");
                    tileImage.setAttribute("src", this_1.getTileImagePath(thisTile_1));
                    tileImage.setAttribute("width", SPRITE_SIZE.toString());
                    tileImage.setAttribute("height", SPRITE_SIZE.toString());
                    tileImage.addEventListener("load", function () {
                        _this.markTileImageAsLoaded(thisTile_1.id);
                    }, false);
                    this_1.tileImages[thisTile_1.id] = {
                        image: tileImage,
                        ready: false
                    };
                }
            };
            var this_1 = this;
            for (var i in tiles) {
                _loop_1(i);
            }
        };
        Renderer.prototype.loadPlayerPalette = function () {
            var _this = this;
            var _loop_2 = function (i) {
                if (this_2.playerTypes[i] !== undefined) {
                    var playerType_1 = this_2.playerTypes[i];
                    var playerImage = document.createElement("img");
                    playerImage.setAttribute("src", this_2.getTileImagePath(playerType_1));
                    playerImage.addEventListener("load", function () {
                        _this.markPlayerImageAsLoaded(playerType_1.img);
                    }, false);
                    this_2.playerImages[playerType_1.img] = {
                        image: playerImage,
                        ready: false
                    };
                }
            };
            var this_2 = this;
            for (var i in this.playerTypes) {
                _loop_2(i);
            }
        };
        Renderer.prototype.markPlayerImageAsLoaded = function (img) {
            this.playerImages[img].ready = true;
        };
        Renderer.prototype.markTileImageAsLoaded = function (id) {
            this.tilesLoaded++;
            this.tileImages[id].ready = true;
            if (this.tilesLoaded === this.totalTiles) {
                this.loadCallback(); // we are ready to fucking party
            }
        };
        Renderer.prototype.renderBoard = function (board, renderMap, renderAngle) {
            var _this = this;
            var ctx = this.canvas.getDrawingContext();
            ctx.globalAlpha = 1;
            var tiles = board.getAllTiles();
            tiles.map(function (tile) {
                var needsDraw = renderMap[tile.x][tile.y];
                if (needsDraw === false) {
                    _this.showUnrenderedTile(tile.x, tile.y);
                    return;
                }
                if (!tile.frontLayer) {
                    _this.renderTile(tile.x, tile.y, tile, renderAngle);
                }
                else {
                    // render sky behind see through tiles
                    _this.drawSkyTile(tile, tile.x, tile.y, renderAngle);
                }
            });
        };
        Renderer.prototype.drawSkyTile = function (tile, x, y, renderAngle) {
            var skyTile = this.tiles[1];
            this.renderTile(x, y, skyTile, renderAngle);
        };
        // just go over and draw the over-the-top stuff
        Renderer.prototype.renderFrontLayerBoard = function (board, renderMap, renderAngle) {
            var _this = this;
            var tiles = board.getAllTiles();
            tiles.map(function (tile) {
                var needsDraw = renderMap[tile.x][tile.y];
                if (needsDraw === false) {
                    return;
                }
                if (tile.frontLayer) {
                    _this.renderTile(tile.x, tile.y, tile, renderAngle);
                }
            });
        };
        // debugging tools
        Renderer.prototype.showUnrenderedTile = function (x, y) {
            if (!this.lampMode) {
                return false;
            }
            var tileSize = Math.floor(this.tileSize);
            var ctx = this.canvas.getDrawingContext();
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.fillRect(Math.floor(x * tileSize), Math.floor(y * tileSize), tileSize, tileSize);
        };
        Renderer.prototype.renderPlayers = function (players) {
            var _this = this;
            players.map(function (player) {
                return _this.renderPlayer(player);
            });
        };
        Renderer.prototype.getTileImage = function (tile) {
            if (tile.id < 1) {
                // console.log("invalid tile requested", tile.id, tile);
                return false;
            }
            var tileImage = this.tileImages[tile.id];
            if (tileImage.ready) {
                return tileImage.image;
            }
            return false;
        };
        Renderer.prototype.getPlayerImage = function (img) {
            var playerImage = this.playerImages[img];
            if (playerImage.ready) {
                return playerImage.image;
            }
            return false;
        };
        Renderer.prototype.renderPlayer = function (player) {
            var ctx = this.canvas.getDrawingContext();
            var tileSize = this.tileSize;
            var offsetRatio = tileSize / OFFSET_DIVIDE;
            var coords = player.coords;
            var left = Math.floor(coords.x * tileSize + coords.offsetX * offsetRatio);
            var top = Math.floor(coords.y * tileSize + coords.offsetY * offsetRatio);
            var clipLeft = Math.floor(player.currentFrame * SPRITE_SIZE);
            var clipTop = 0;
            var image = this.getPlayerImage(player.img);
            if (!image) {
                // console.log('player image not loaded', player.img);
                return false;
            }
            ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, tileSize, tileSize);
            if (left < 0) {
                // also draw on right
                var secondLeft = left + tileSize * this.boardSize.width;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
            if (left + tileSize > tileSize * this.boardSize.width) {
                // also draw on left
                var secondLeft = left - tileSize * this.boardSize.width;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
            if (top + tileSize > tileSize * this.boardSize.height) {
                // also draw on top
                var secondTop = top - tileSize * this.boardSize.height;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, secondTop, tileSize, tileSize);
            }
        };
        Renderer.prototype.drawRotated = function (savedData, direction, angle, targetAngle, moveSpeed, completed) {
            var _this = this;
            var canvas = this.canvas.getCanvas();
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
            var angleInRad = angle * (Math.PI / 180);
            var offset = canvas.width / 2;
            var ctx = this.canvas.getDrawingContext();
            var left = offset;
            var top = offset;
            this.canvas.wipeCanvas("rgba(0,0,0,0.1)");
            ctx.translate(left, top);
            ctx.rotate(angleInRad);
            ctx.drawImage(savedData, -offset, -offset);
            ctx.rotate(-angleInRad);
            ctx.translate(-left, -top);
            angle += direction * (moveSpeed / 2);
            this.animationHandle = window.requestAnimationFrame(function () {
                _this.drawRotated(savedData, direction, angle, targetAngle, moveSpeed, completed);
            });
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Editor", ["require", "exports", "BoardSize", "Canvas", "Coords", "Levels", "Loader", "Map", "Renderer", "RenderMap", "TileChooser", "TileSet", "Utils"], function (require, exports, BoardSize_8, Canvas_2, Coords_5, Levels_2, Loader_2, Map, Renderer_2, RenderMap_2, TileChooser_1, TileSet_4, Utils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Editor = /** @class */ (function () {
        function Editor() {
            this.levelID = 1;
            this.levelList = [];
            this.boardHistory = [];
            this.defaultBoardSize = 20;
        }
        // go function but for edit mode
        Editor.prototype.edit = function () {
            var _this = this;
            this.levels.populateLevelsList(this.levelList);
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindMouseMoveHandler();
            this.board = this.getBlankBoard(this.boardSize);
            // reset undo
            this.clearBoardHistory(this.board);
            this.renderer = this.createRenderer(this.boardSize);
            window.setTimeout(function () {
                _this.renderEverything(_this.board);
            }, 1000);
            this.tileChooser = new TileChooser_1.TileChooser(this.renderer);
            this.tileChooser.render();
        };
        // load static stuff - map/renderer etc will be worked out later
        Editor.prototype.bootstrap = function (callback) {
            var _this = this;
            this.boardSize = new BoardSize_8.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_2.Canvas(this.boardSize);
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_2.Loader(apiLocation);
            this.levels = new Levels_2.Levels(loader);
            this.getLevelList(function (levelList) {
                var levelID = _this.chooseLevelID(levelList);
                _this.levelID = levelID;
                callback(levelID);
            });
        };
        Editor.prototype.saveLevel = function () {
            var _this = this;
            this.levels.saveLevel(this.board.toJS(), this.boardSize, this.levels.levelID, function (levelID) {
                var text = "Level " + levelID + " saved";
                _this.showEditMessage(text);
            });
        };
        Editor.prototype.loadLevelFromList = function () {
            var _this = this;
            var select = document.getElementById("levelList");
            var index = select.selectedIndex;
            var levelID = select.options[index].value;
            this.loadLevel(levelID, function () {
                // reset undo
                _this.clearBoardHistory(_this.board);
                // render everything (give sprites a second to load)
                window.setTimeout(function () {
                    _this.renderEverything(_this.board);
                }, 1000);
            });
        };
        Editor.prototype.growBoard = function () {
            var newBoard = Map.growBoard(this.board);
            this.boardSize = new BoardSize_8.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        };
        Editor.prototype.shrinkBoard = function () {
            var newBoard = Map.shrinkBoard(this.board);
            this.boardSize = new BoardSize_8.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        };
        Editor.prototype.undo = function () {
            if (this.boardHistory.length === 1) {
                return false;
            }
            this.boardHistory.pop(); // get rid of most recent
            this.board = this.boardHistory.slice(-1)[0]; // set to new last item
            this.boardSize = new BoardSize_8.BoardSize(this.board.getLength());
            this.renderEverything(this.board);
        };
        // replaces this.board with board
        // places old this.board in history
        Editor.prototype.updateBoard = function (board) {
            this.boardHistory.push(board); // current state is always at top
            this.board = board;
        };
        Editor.prototype.getBlankBoard = function (boardSize) {
            return Map.generateBlankBoard(boardSize);
        };
        Editor.prototype.getLevelBoard = function (boardArray, boardSize) {
            return Map.makeBoardFromArray(boardArray);
        };
        Editor.prototype.clearBoardHistory = function (board) {
            this.boardHistory = [board]; // reset to single state
        };
        Editor.prototype.getLevelList = function (callback) {
            var _this = this;
            this.levels.getLevelList(function (levelList) {
                _this.levelList = levelList;
                callback(levelList);
            });
        };
        // select a random level that has not been completed yet
        // a return of false means none available (generate a random one)
        Editor.prototype.chooseLevelID = function (levelList) {
            var availableLevels = levelList.filter(function (level) {
                return level.completed === false;
            });
            var chosenKey = Utils_6.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            var levelID = availableLevels[chosenKey].levelID;
            return levelID;
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Editor.prototype.createRenderer = function (boardSize) {
            this.canvas = new Canvas_2.Canvas(boardSize);
            this.boardSize = boardSize;
            var tiles = TileSet_4.TileSet.getTiles();
            return new Renderer_2.Renderer(this, tiles, [], // no players in edit mode
            this.boardSize, this.canvas, function () {
                // console.log("yes")
            });
        };
        Editor.prototype.renderEverything = function (board) {
            var boardSize = new BoardSize_8.BoardSize(board.getLength());
            var blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(board, blankMap, [], 0);
        };
        Editor.prototype.renderSelected = function (board, renderMap) {
            this.renderer.render(board, renderMap, [], 0);
        };
        Editor.prototype.renderFromBoards = function (oldBoard, newBoard) {
            var renderMap = RenderMap_2.RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
            this.renderSelected(newBoard, renderMap);
        };
        Editor.prototype.sizeCanvas = function (boardSize) {
            this.renderer.resize(boardSize);
            this.renderEverything(this.board);
        };
        Editor.prototype.revertEditMessage = function () {
            var s = setTimeout(function () {
                var message = document.getElementById("message");
                message.innerHTML = "EDIT MODE";
            }, 3000);
        };
        Editor.prototype.showEditMessage = function (text) {
            var message = document.getElementById("message");
            message.innerHTML = text;
            this.revertEditMessage();
        };
        Editor.prototype.loadLevel = function (levelID, callback) {
            var _this = this;
            this.levels.loadLevel(levelID, function (savedLevel) {
                var text = "Level " + savedLevel.levelID.toString() + " loaded!";
                _this.showEditMessage(text);
                _this.board = _this.getLevelBoard(savedLevel.board, savedLevel.boardSize);
                _this.renderer = _this.createRenderer(savedLevel.boardSize);
                callback();
            }, function () {
                _this.board = _this.getBlankBoard(_this.boardSize);
                _this.renderer = _this.createRenderer(_this.boardSize);
                callback();
            });
        };
        Editor.prototype.bindSizeHandler = function () {
            var _this = this;
            window.addEventListener("resize", function () {
                _this.sizeCanvas(_this.boardSize);
            });
        };
        Editor.prototype.bindClickHandler = function () {
            var _this = this;
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                _this.handleDrawEvent(event);
            });
        };
        Editor.prototype.bindMouseMoveHandler = function () {
            var _this = this;
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("mousemove", function (event) {
                if (event.button > 0 || event.buttons > 0) {
                    _this.handleDrawEvent(event);
                }
            });
        };
        Editor.prototype.handleDrawEvent = function (event) {
            var tileSize = this.canvas.calcTileSize(this.boardSize);
            var coords = new Coords_5.Coords({
                offsetX: event.offsetX % tileSize - tileSize / 2,
                offsetY: event.offsetY % tileSize - tileSize / 2,
                x: Math.floor(event.offsetX / tileSize),
                y: Math.floor(event.offsetY / tileSize)
            });
            this.drawCurrentTile(coords);
        };
        // coords is always x,y,offsetX, offsetY
        Editor.prototype.drawCurrentTile = function (coords) {
            var tileID = this.tileChooser.chosenTileID;
            if (tileID < 1) {
                return false;
            }
            var currentTile = this.board.getTile(coords.x, coords.y);
            var tile = Map.cloneTile(tileID);
            var placedTile = tile.modify({
                x: coords.x,
                y: coords.y
            });
            // if no change, don't bother
            if (currentTile.equals(placedTile)) {
                // don't fill the undo with crap
                return false;
            }
            var oldBoard = this.board;
            var newBoard = oldBoard.modify(coords.x, coords.y, placedTile);
            this.renderFromBoards(oldBoard, newBoard);
            this.updateBoard(newBoard);
        };
        return Editor;
    }());
    exports.Editor = Editor;
});
//# sourceMappingURL=Jetpack.js.map