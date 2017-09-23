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
define("Board", ["require", "exports", "immutable"], function (require, exports, immutable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // new board is built from JS array
    // all changes reuse the re-generated List object
    var Board = (function () {
        function Board(values, list) {
            if (list === void 0) { list = null; }
            if (values) {
                this.list = immutable_1.fromJS(values); // create new
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
define("BoardSize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BoardSize = (function () {
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
define("Coords", ["require", "exports", "immutable"], function (require, exports, immutable_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OFFSET_DIVIDE = 100;
    var Coords = (function (_super) {
        __extends(Coords, _super);
        function Coords(params) {
            var _this = this;
            params ? _this = _super.call(this, params) || this : _this = _super.call(this) || this;
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
    }(immutable_2.Record({ x: 0, y: 0, offsetX: 0, offsetY: 0 })));
    exports.Coords = Coords;
});
define("Utils", ["require", "exports", "ramda"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // wee lad full of reusable functions
    var Utils = (function () {
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
        return Utils;
    }());
    exports.Utils = Utils;
});
// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc
define("Canvas", ["require", "exports", "Utils"], function (require, exports, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = (function () {
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
            var wrapMargin = Utils_1.Utils.getControlStyle("wrapper", "margin");
            var controlSpacing = Utils_1.Utils.getControlStyle("controlHeader", "marginTop");
            var editSpacing = Utils_1.Utils.getControlStyle("editHeader", "marginTop");
            var offsetHeight = Utils_1.Utils.getControlProperty("controlHeader", "offsetHeight");
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
define("Loader", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Loader = (function () {
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
    var SavedLevel = (function () {
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
                levelID: this.levelID,
                boardSize: this.boardSize.getData(),
                board: this.board
            };
        };
        return SavedLevel;
    }());
    exports.SavedLevel = SavedLevel;
});
define("Levels", ["require", "exports", "BoardSize", "SavedLevel"], function (require, exports, BoardSize_1, SavedLevel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Levels = (function () {
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
                    var levelID = parseInt(i);
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
                console.log("gotLevelList");
            });
            var params = {
                levelID: levelID
            };
            this.loader.callServer("getLevel", params, function (data) {
                _this.levelID = levelID;
                var boardSize = new BoardSize_1.BoardSize(data.boardSize.width);
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
define("Player", ["require", "exports", "immutable", "Coords"], function (require, exports, immutable_3, Coords_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(params) {
            var _this = this;
            params ? _this = _super.call(this, params) || this : _this = _super.call(this) || this;
            return _this;
        }
        Player.prototype.modify = function (values) {
            return this.merge(values);
        };
        return Player;
    }(immutable_3.Record({
        coords: new Coords_1.Coords(),
        direction: 0,
        oldDirection: 0,
        currentFrame: 0,
        id: 0,
        frames: 1,
        multiplier: 1,
        falling: false,
        type: "egg",
        moveSpeed: 1,
        fallSpeed: 1,
        lastAction: "",
        value: 1,
        img: "",
        stop: false
    })));
    exports.Player = Player;
});
define("Tile", ["require", "exports", "immutable"], function (require, exports, immutable_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tile = (function (_super) {
        __extends(Tile, _super);
        function Tile(params) {
            var _this = this;
            params ? _this = _super.call(this, params) || this : _this = _super.call(this) || this;
            return _this;
        }
        Tile.prototype.modify = function (values) {
            return this.merge(values);
        };
        return Tile;
    }(immutable_4.Record({
        id: 0,
        title: "Title",
        background: false,
        frontLayer: false,
        collectable: 0,
        breakable: false,
        action: "",
        dontAdd: false,
        createPlayer: "",
        x: 0,
        y: 0
    })));
    exports.Tile = Tile;
});
define("TileSet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TileSet = (function () {
        function TileSet() {
            this.tiles = {};
        }
        TileSet.prototype.getTiles = function () {
            this.tiles = {
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
                    title: "Fabric",
                    needsDraw: true
                },
                3: {
                    id: 3,
                    title: "Cacti",
                    img: "cacti.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 1
                },
                4: {
                    id: 4,
                    title: "Plant",
                    img: "plant.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 10
                },
                5: {
                    id: 5,
                    title: "Crate",
                    img: "crate.png",
                    background: false,
                    needsDraw: true,
                    breakable: true
                },
                8: {
                    id: 8,
                    title: "Work surface 2",
                    img: "work-surface-2.png",
                    background: false,
                    needsDraw: true
                },
                9: {
                    id: 9,
                    title: "Work surface 3",
                    img: "work-surface-3.png",
                    background: false,
                    needsDraw: true
                },
                10: {
                    id: 10,
                    title: "Work surface 4",
                    img: "work-surface-4.png",
                    background: false,
                    needsDraw: true
                },
                11: {
                    id: 11,
                    title: "Tiles",
                    img: "tile.png",
                    background: false,
                    needsDraw: true
                },
                12: {
                    id: 12,
                    title: "Egg Cup",
                    img: "egg-cup.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    createPlayer: "egg",
                    action: "completeLevel"
                },
                13: {
                    id: 13,
                    title: "Toast",
                    img: "toast.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 100,
                    dontAdd: true
                },
                14: {
                    id: 14,
                    title: "Door",
                    img: "door.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "teleport"
                },
                15: {
                    id: 15,
                    title: "Pink door open",
                    img: "pink-door-open.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true
                },
                16: {
                    id: 16,
                    title: "Pink door closed",
                    img: "pink-door.png",
                    background: false,
                    needsDraw: true
                },
                17: {
                    id: 17,
                    title: "Pink door switch",
                    img: "pink-switch.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "pink-switch"
                },
                18: {
                    id: 18,
                    title: "Green door open",
                    img: "green-door-open.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true
                },
                19: {
                    id: 19,
                    title: "Green door closed",
                    img: "green-door.png",
                    background: false,
                    needsDraw: true
                },
                20: {
                    id: 20,
                    title: "Green door switch",
                    img: "green-switch.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "green-switch"
                },
                21: {
                    id: 21,
                    title: "Silver Egg Cup",
                    img: "silver-egg-cup.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    createPlayer: "silver-egg"
                }
            };
            // return a copy rather than letting this get messed with
            return JSON.parse(JSON.stringify(this.tiles));
        };
        TileSet.prototype.getTile = function (id) {
            var tiles = this.getTiles();
            if (tiles.hasOwnProperty(id))
                return tiles[id];
            return false;
        };
        return TileSet;
    }());
    exports.TileSet = TileSet;
});
define("Map", ["require", "exports", "Board", "Coords", "Tile", "Utils"], function (require, exports, Board_1, Coords_2, Tile_1, Utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // map is just a class full of functions that is created for manipulating the board
    // does not contain any state of it's own
    var Map = (function () {
        function Map(tileSet, boardSize) {
            this.tileSet = tileSet;
            this.boardSize = boardSize;
        }
        Map.prototype.shrinkBoard = function (board) {
            this.boardSize = this.boardSize.shrink();
            return this.correctBoardSizeChange(board, this.boardSize);
        };
        Map.prototype.growBoard = function (board) {
            this.boardSize = this.boardSize.grow();
            return this.correctBoardSizeChange(board, this.boardSize);
        };
        // board is current board
        // boardSize is intended board size
        // returns new Board
        Map.prototype.correctBoardSizeChange = function (board, boardSize) {
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
                        var tile = this.cloneTile(1);
                        newBoard[x][y] = tile;
                    }
                }
            }
            return new Board_1.Board(newBoard);
        };
        Map.prototype.generateBlankBoard = function () {
            var board = [];
            for (var x = 0; x < this.boardSize.width; x++) {
                board[x] = [];
                for (var y = 0; y < this.boardSize.height; y++) {
                    var blankTile = this.cloneTile(1);
                    var positionedTile = blankTile.modify({
                        x: x,
                        y: y
                    });
                    board[x][y] = positionedTile;
                }
            }
            return new Board_1.Board(board);
        };
        Map.prototype.correctForOverflow = function (coords) {
            return Utils_2.Utils.correctForOverflow(coords, this.boardSize);
        };
        // is intended next tile empty / a wall?
        Map.prototype.checkTileIsEmpty = function (board, x, y) {
            var tile = this.getTile(board, x, y);
            return tile.background;
        };
        Map.prototype.getTileWithCoords = function (board, coords) {
            var fixedCoords = this.correctForOverflow(coords);
            var x = fixedCoords.x, y = fixedCoords.y;
            return board.getTile(x, y);
        };
        Map.prototype.changeTile = function (board, coords, tile) {
            return board.modify(coords.x, coords.y, tile);
        };
        Map.prototype.rotatePlayer = function (player, clockwise) {
            var newCoords = this.translateRotation(player.coords, clockwise);
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
        Map.prototype.cloneTile = function (id) {
            var prototypeTile = this.getPrototypeTile(id);
            return new Tile_1.Tile(prototypeTile); // create new Tile object with these
        };
        Map.prototype.getRandomTile = function (tiles) {
            var _this = this;
            var randomProperty = function (obj) {
                var randomKey = Utils_2.Utils.getRandomObjectKey(obj);
                return _this.cloneTile(randomKey);
            };
            var theseTiles = this.tileSet.getTiles();
            Object.entries(theseTiles).filter(function (_a) {
                var key = _a[0], tile = _a[1];
                if (tile.dontAdd) {
                    delete theseTiles[key];
                }
                return true;
            });
            return randomProperty(theseTiles);
        };
        // swap two types of tiles on map (used by pink/green switching door things)
        Map.prototype.switchTiles = function (board, id1, id2) {
            var _this = this;
            var tiles = board.getAllTiles();
            return tiles.reduce(function (currentBoard, tile) {
                if (tile.id === id1) {
                    var newTile = _this.cloneTile(id2);
                    return currentBoard.modify(tile.x, tile.y, newTile);
                }
                else if (tile.id === id2) {
                    var newTile = _this.cloneTile(id1);
                    return currentBoard.modify(tile.x, tile.y, newTile);
                }
                return currentBoard;
            }, board);
        };
        // find random tile of type that is NOT at currentCoords
        Map.prototype.findTile = function (board, currentCoords, id) {
            var tiles = board.getAllTiles();
            var teleporters = tiles.filter(function (tile) {
                if (tile.x === currentCoords.x && tile.y === currentCoords.y) {
                    return false;
                }
                return tile.id === id;
            });
            if (teleporters.length === 0) {
                return false; // no options
            }
            var newTile = teleporters[Math.floor(Math.random() * teleporters.length)];
            return newTile;
        };
        // rotates board, returns new board and new renderAngle
        // really should be two functions
        Map.prototype.rotateBoard = function (board, clockwise) {
            var _this = this;
            var tiles = board.getAllTiles();
            var width = board.getLength() - 1;
            var height = board.getLength() - 1;
            var rotatedBoard = tiles.reduce(function (currentBoard, tile) {
                var coords = new Coords_2.Coords({ x: tile.x, y: tile.y });
                var newCoords = _this.translateRotation(coords, clockwise);
                var newTile = tile.modify({
                    x: newCoords.x,
                    y: newCoords.y
                });
                return currentBoard.modify(newCoords.x, newCoords.y, newTile);
            }, board);
            return rotatedBoard;
        };
        Map.prototype.changeRenderAngle = function (renderAngle, clockwise) {
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
        Map.prototype.makeBoardFromArray = function (boardArray) {
            var _this = this;
            if (boardArray === void 0) { boardArray = []; }
            var newBoard = boardArray.map(function (column, mapX) {
                return column.map(function (item, mapY) {
                    var newTile = _this.cloneTile(item.id);
                    return newTile.modify({
                        x: mapX,
                        y: mapY
                    });
                });
            });
            return new Board_1.Board(newBoard);
        };
        Map.prototype.getTile = function (board, x, y) {
            var coords = new Coords_2.Coords({ x: x, y: y });
            return this.getTileWithCoords(board, coords);
        };
        Map.prototype.generateRandomBoard = function (boardSize) {
            var boardArray = [];
            for (var x = 0; x < boardSize.width; x++) {
                boardArray[x] = [];
                for (var y = 0; y < boardSize.height; y++) {
                    var blankTile = this.getRandomTile(this.tileSet.getTiles());
                    var positionedTile = blankTile.modify({
                        x: x,
                        y: y
                    });
                    boardArray[x][y] = blankTile;
                }
            }
            return new Board_1.Board(boardArray);
        };
        Map.prototype.getPrototypeTile = function (id) {
            return this.tileSet.getTile(id);
        };
        Map.prototype.translateRotation = function (coords, clockwise) {
            var width = this.boardSize.width - 1;
            var height = this.boardSize.height - 1;
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
        return Map;
    }());
    exports.Map = Map;
});
define("Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var OFFSET_DIVIDE = 100;
    var Renderer = (function () {
        function Renderer(jetpack, tiles, playerTypes, boardSize, canvas) {
            this.lampMode = false; // lamp mode only draws around the eggs
            this.checkResize = true;
            this.tileImages = {}; // image elements of tiles
            this.playerImages = {}; // image element of players
            this.renderTile = function (x, y, tile, renderAngle) {
                var ctx = this.canvas.getDrawingContext();
                var tileSize = this.tileSize;
                var img = this.getTileImage(tile);
                if (!img) {
                    console.log("Could not find tile image for id " + tile.id);
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
            this.loadTilePalette(tiles);
            this.loadPlayerPalette();
        }
        Renderer.prototype.render = function (board, renderMap, renderAngle) {
            //console.log("Renderer->render",board, renderMap, renderAngle);
            this.tileSize = this.canvas.calcTileSize(this.boardSize);
            this.renderBoard(board, renderMap, renderAngle);
            this.renderPlayers();
            this.renderFrontLayerBoard(board, renderMap, renderAngle);
        };
        Renderer.prototype.resize = function (boardSize) {
            console.log("Renderer->resize", boardSize);
            this.boardSize = boardSize;
            this.tileSize = this.canvas.sizeCanvas(boardSize);
        };
        Renderer.prototype.drawRotatingBoard = function (clockwise, completed) {
            var canvas = this.canvas.getCanvas();
            var cw = canvas.width;
            var ch = canvas.height;
            var savedData = new Image();
            savedData.src = canvas.toDataURL("image/png");
            if (clockwise) {
                this.drawRotated(savedData, 1, 0, 90, completed);
            }
            else {
                this.drawRotated(savedData, -1, 0, -90, completed);
            }
        };
        Renderer.prototype.getTileImagePath = function (tile) {
            return this.canvas.imagesFolder + tile.img;
        };
        Renderer.prototype.loadTilePalette = function (tiles) {
            var _this = this;
            var _loop_1 = function (i) {
                if (tiles[i] !== undefined) {
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
            // console.log('renderer->markTileImageAsLoaded->', id);
            this.tileImages[id].ready = true;
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
        Renderer.prototype.renderPlayers = function () {
            for (var i in this.jetpack.players) {
                if (this.jetpack.players[i]) {
                    var player = this.jetpack.players[i];
                    this.renderPlayer(player);
                }
            }
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
                //console.log('player image not loaded', player.img);
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
        Renderer.prototype.drawRotated = function (savedData, direction, angle, targetAngle, completed) {
            var _this = this;
            var canvas = this.canvas.getCanvas();
            if (direction > 0) {
                if (angle >= targetAngle) {
                    completed();
                    return false;
                }
            }
            else {
                if (angle <= targetAngle) {
                    completed();
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
            angle += direction * (this.jetpack.moveSpeed / 2);
            this.jetpack.animationHandle = window.requestAnimationFrame(function () {
                _this.drawRotated(savedData, direction, angle, targetAngle, completed);
            });
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Movement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OFFSET_DIVIDE = 100;
    // movement takes the current map, the current players, and returns new player objects
    // it is then trashed and a new one made for next move to reduce any real held state
    var Movement = (function () {
        function Movement(map, jetpack) {
            this.players = [];
            this.map = map;
            this.jetpack = jetpack;
        }
        // loop through passed players[] array, do changes, return new one
        Movement.prototype.doCalcs = function (players, timePassed) {
            var _this = this;
            if (!players) {
                return [];
            }
            this.players = players; // store so we can compare
            var newPlayers = players.map(function (player) {
                return _this.doPlayerCalcs(player, timePassed);
            });
            return newPlayers;
        };
        Movement.prototype.correctTileOverflow = function (coords) {
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
        Movement.prototype.doPlayerCalcs = function (player, timePassed) {
            var startCoords = player.coords;
            var newPlayer = this.incrementPlayerFrame(player);
            var newerPlayer = this.checkFloorBelowPlayer(timePassed, newPlayer);
            var checkedPlayer = this.checkPlayerDirection(newerPlayer);
            var evenNewerPlayer = this.incrementPlayerDirection(timePassed, checkedPlayer);
            var newestPlayer = this.correctPlayerOverflow(evenNewerPlayer);
            var absolutelyNewestPlayer = this.checkTileAction(startCoords, newestPlayer);
            return absolutelyNewestPlayer;
        };
        Movement.prototype.checkTileAction = function (startCoords, player) {
            if (!startCoords.equals(player.coords)) {
                return this.checkPlayerTileAction(player);
            }
            return player;
        };
        Movement.prototype.incrementPlayerFrame = function (player) {
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
        Movement.prototype.checkPlayerTileAction = function (player) {
            var currentCoords = player.coords;
            if (currentCoords.offsetX !== 0 || currentCoords.offsetY !== 0) {
                return player;
            }
            var coords = this.map.correctForOverflow(currentCoords);
            var tile = this.map.getTileWithCoords(coords);
            if (tile.collectable > 0) {
                var score = tile.collectable * player.multiplier;
                var blankTile = this.map.cloneTile(1);
                this.map.changeTile(coords, blankTile);
                this.jetpack.addScore(score);
                return player;
            }
            if (tile.action === "completeLevel") {
                this.jetpack.completeLevel();
            }
            else if (tile.action === "teleport") {
                return this.teleport(player); // only action that changes player state
            }
            else if (tile.action === "pink-switch") {
                var changedCoords = this.map.switchTiles(15, 16);
            }
            else if (tile.action === "green-switch") {
                var changedCoords = this.map.switchTiles(18, 19);
            }
            return player; // player returned unchanged
        };
        // find another teleport and go to it
        // if no others, do nothing
        Movement.prototype.teleport = function (player) {
            // if (player.lastAction === "teleport") return false;
            var newTile = this.map.findTile(player.coords, 14);
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
        // this checks whether the next place we intend to go is a goddamn trap, and changes direction if so
        Movement.prototype.checkPlayerDirection = function (player) {
            var coords = player.coords;
            if (player.direction !== 0 && player.falling === false) {
                if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y) &&
                    !this.map.checkTileIsEmpty(coords.x + 1, coords.y)) {
                    return player.modify({
                        stop: true // don't go on this turn
                    });
                }
            }
            if (player.direction < 0 && player.falling === false) {
                if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y)) {
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
                if (!this.map.checkTileIsEmpty(coords.x + 1, coords.y)) {
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
        };
        // this does the left/right moving, but does not care if walls are there as that is the responsibility of checkPlayerDirection
        Movement.prototype.incrementPlayerDirection = function (timePassed, player) {
            // falling is priority - do this if a thing
            if (player.falling) {
                var fallAmount = this.calcMoveAmount(player.fallSpeed, timePassed);
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
            var moveAmount = this.calcMoveAmount(player.moveSpeed, timePassed);
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
        };
        Movement.prototype.calcMoveAmount = function (moveSpeed, timePassed) {
            var moveAmount = 1 / OFFSET_DIVIDE * moveSpeed * 5;
            var frameRateAdjusted = moveAmount * timePassed;
            if (isNaN(frameRateAdjusted)) {
                return 0;
            }
            return frameRateAdjusted;
        };
        Movement.prototype.correctPlayerOverflow = function (player) {
            var newCoords = this.correctTileOverflow(player.coords);
            var loopedCoords = this.map.correctForOverflow(newCoords);
            return player.modify({
                coords: loopedCoords,
                lastAction: ""
            });
        };
        Movement.prototype.checkFloorBelowPlayer = function (timePassed, player) {
            if (player.coords.offsetX !== 0) {
                return player;
            }
            var coords = player.coords;
            var belowCoords = this.map.correctForOverflow(coords.modify({ y: coords.y + 1 }));
            var tile = this.map.getTileWithCoords(belowCoords);
            if (tile.background) {
                // gap below, start falling down it
                return player.modify({
                    falling: true
                });
            }
            else if (player.falling && tile.breakable) {
                // if tile below is breakable (and we are already falling and thus have momentum, smash it)
                this.map.changeTile(belowCoords, this.map.cloneTile(1)); // smash block, replace with empty
                return player; // already falling
            }
            // solid ground, stop falling
            return player.modify({
                falling: false
            });
        };
        return Movement;
    }());
    exports.Movement = Movement;
});
define("PlayerTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PlayerTypes = (function () {
        function PlayerTypes() {
            this.playerTypes = {
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
                "blue-egg": {
                    frames: 18,
                    img: "egg-sprite-blue.png",
                    multiplier: 5,
                    title: "It is of course the blue egg",
                    type: "blue-egg",
                    value: 3
                },
                "yellow-egg": {
                    frames: 18,
                    img: "egg-sprite-yellow.png",
                    multiplier: 10,
                    title: "It is of course the yellow egg",
                    type: "yellow-egg",
                    value: 4
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
define("RenderMap", ["require", "exports", "BoardSize", "Coords", "Utils"], function (require, exports, BoardSize_2, Coords_3, Utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this is not a render map object, but a class for making them
    var RenderMap = (function () {
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
            var boardSize = new BoardSize_2.BoardSize(renderMap.length);
            for (var x = startX; x <= endX; x++) {
                for (var y = startY; y <= endY; y++) {
                    var newCoords = new Coords_3.Coords({ x: x, y: y });
                    var fixedCoords = Utils_3.Utils.correctForOverflow(newCoords, boardSize);
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
                    return (entry || newRenderMap[x][y]);
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
define("TileChooser", ["require", "exports", "ramda"], function (require, exports, _) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // used in editor, draws a bunch of 32x32 tiles for selecting
    var TileChooser = (function () {
        function TileChooser(tileSet, renderer) {
            this.chosenTileID = 0;
            this.tileSet = tileSet;
            this.renderer = renderer;
        }
        TileChooser.prototype.chooseTile = function (id) {
            this.chosenTileID = id;
            this.highlightChosenTile(id);
        };
        TileChooser.prototype.highlightChosenTile = function (id) {
            var tileChooser = document.getElementById("tileChooser");
            var children = tileChooser.children;
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                var className = child.getAttribute("class");
                if (className == "tile" + id) {
                    child.setAttribute("style", "border: 1px red solid;");
                }
                else {
                    child.setAttribute("style", "border: 1px white solid;");
                }
            }
        };
        TileChooser.prototype.makeTileImages = function (tiles) {
            var _this = this;
            return _.map(function (tile) {
                var tileImage = document.createElement("img");
                tileImage.setAttribute("src", _this.renderer.getTileImagePath(tile));
                tileImage.setAttribute("width", "32");
                tileImage.setAttribute("height", "32");
                tileImage.setAttribute("padding", "2px");
                tileImage.setAttribute("style", "border: 1px white solid;");
                tileImage.setAttribute("class", "tile" + tile.id);
                tileImage.onclick = function () {
                    _this.chooseTile(tile.id);
                };
                return tileImage;
            }, tiles);
        };
        TileChooser.prototype.render = function () {
            var tiles = this.tileSet.getTiles();
            var images = this.makeTileImages(tiles);
            var tileChooser = document.getElementById("tileChooser");
            for (var i in images) {
                tileChooser.appendChild(images[i]);
            }
        };
        return TileChooser;
    }());
    exports.TileChooser = TileChooser;
});
define("TitleScreen", ["require", "exports", "BoardSize"], function (require, exports, BoardSize_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TitleScreen = (function () {
        function TitleScreen(jetpack, canvas, imagePath, width, height) {
            this.jetpack = jetpack;
            this.canvas = canvas;
            this.imagePath = this.canvas.getImagesFolder() + imagePath;
            this.width = width;
            this.height = height;
        }
        TitleScreen.prototype.render = function (callback) {
            var _this = this;
            var boardSize = new BoardSize_3.BoardSize(10);
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
define("Editor", ["require", "exports", "BoardSize", "Canvas", "Coords", "Levels", "Loader", "Map", "Renderer", "RenderMap", "TileChooser", "TileSet", "Utils"], function (require, exports, BoardSize_4, Canvas_1, Coords_4, Levels_1, Loader_1, Map_1, Renderer_1, RenderMap_1, TileChooser_1, TileSet_1, Utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Editor = (function () {
        function Editor() {
            this.levelID = 1;
            this.levelList = [];
            this.boardHistory = [];
            this.defaultBoardSize = 20;
            /*
            protected outputBoard(board: Board) {
              const tiles = board.getAllTiles();
              const idArray: array = tiles.map(tile => {
                return tile.id;
              });
              console.log('board IDs', idArray);
            }*/
        }
        // go function but for edit mode
        Editor.prototype.edit = function () {
            var _this = this;
            this.levels.populateLevelsList(this.levelList);
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindMouseMoveHandler();
            this.board = this.getBlankBoard(this.tileSet, this.boardSize);
            // reset undo
            this.clearBoardHistory(this.board);
            this.renderer = this.createRenderer(this.tileSet, this.boardSize);
            window.setTimeout(function () {
                _this.renderEverything(_this.board);
            }, 1000);
            this.tileChooser = new TileChooser_1.TileChooser(this.tileSet, this.renderer);
            this.tileChooser.render();
        };
        // load static stuff - map/renderer etc will be worked out later
        Editor.prototype.bootstrap = function (callback) {
            var _this = this;
            this.tileSet = new TileSet_1.TileSet();
            this.boardSize = new BoardSize_4.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_1.Canvas(this.boardSize);
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(loader);
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
            var map = new Map_1.Map(this.tileSet, this.boardSize);
            var newBoard = map.growBoard(this.board);
            this.boardSize = new BoardSize_4.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        };
        Editor.prototype.shrinkBoard = function () {
            var map = new Map_1.Map(this.tileSet, this.boardSize);
            var newBoard = map.shrinkBoard(this.board);
            this.boardSize = new BoardSize_4.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        };
        Editor.prototype.undo = function () {
            console.log("Undo! current steps...", this.boardHistory.length);
            if (this.boardHistory.length === 1) {
                console.log("No steps to undo!");
                return false;
            }
            this.boardHistory.pop(); // get rid of most recent
            this.board = this.boardHistory.slice(-1)[0]; // set to new last item
            this.boardSize = new BoardSize_4.BoardSize(this.board.getLength());
            this.renderEverything(this.board);
            console.log("Undo! Steps left", this.boardHistory.length);
        };
        // replaces this.board with board
        // places old this.board in history
        Editor.prototype.updateBoard = function (board) {
            this.boardHistory.push(board); // current state is always at top
            this.board = board;
        };
        Editor.prototype.getBlankBoard = function (tileSet, boardSize) {
            var map = new Map_1.Map(tileSet, boardSize);
            return map.generateBlankBoard();
        };
        Editor.prototype.getLevelBoard = function (boardArray, tileSet, boardSize) {
            var map = new Map_1.Map(tileSet, boardSize);
            return map.makeBoardFromArray(boardArray);
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
            var chosenKey = Utils_4.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            var levelID = availableLevels[chosenKey].levelID;
            return levelID;
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Editor.prototype.createRenderer = function (tileSet, boardSize) {
            console.log("createRenderer->", tileSet, boardSize);
            this.canvas = new Canvas_1.Canvas(boardSize);
            this.tileSet = tileSet;
            this.boardSize = boardSize;
            var tiles = this.tileSet.getTiles();
            return new Renderer_1.Renderer(this, tiles, [], // no players in edit mode
            this.boardSize, this.canvas);
        };
        Editor.prototype.renderEverything = function (board) {
            var boardSize = new BoardSize_4.BoardSize(board.getLength());
            var blankMap = RenderMap_1.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(board, blankMap, 0);
        };
        Editor.prototype.renderSelected = function (board, renderMap) {
            this.renderer.render(board, renderMap, 0);
        };
        Editor.prototype.renderFromBoards = function (oldBoard, newBoard) {
            var renderMap = RenderMap_1.RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
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
                _this.board = _this.getLevelBoard(savedLevel.board, _this.tileSet, savedLevel.boardSize);
                _this.renderer = _this.createRenderer(_this.tileSet, savedLevel.boardSize);
                callback();
            }, function () {
                _this.board = _this.getBlankBoard(_this.tileSet, _this.boardSize);
                _this.renderer = _this.createRenderer(_this.tileSet, _this.boardSize);
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
            var coords = new Coords_4.Coords({
                offsetX: event.offsetX % tileSize - tileSize / 2,
                offsetY: event.offsetY % tileSize - tileSize / 2,
                x: Math.floor((event.offsetX / tileSize)),
                y: Math.floor((event.offsetY / tileSize))
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
            var map = new Map_1.Map(this.tileSet, this.boardSize);
            var tile = map.cloneTile(tileID);
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
define("Jetpack", ["require", "exports", "BoardSize", "Canvas", "Collisions", "Coords", "Editor", "Levels", "Loader", "Map", "Movement", "Player", "PlayerTypes", "Renderer", "RenderMap", "TileChooser", "TileSet", "TitleScreen", "Utils"], function (require, exports, BoardSize_5, Canvas_2, Collisions_1, Coords_5, Editor_1, Levels_2, Loader_2, Map_2, Movement_1, Player_1, PlayerTypes_1, Renderer_2, RenderMap_2, TileChooser_2, TileSet_2, TitleScreen_1, Utils_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Jetpack = (function () {
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
            this.nextAction = "";
        }
        Jetpack.prototype.go = function (levelID) {
            var _this = this;
            // this.bootstrap();
            this.bindSizeHandler();
            this.bindKeyboardHandler();
            this.pauseRender();
            this.getTitleScreen(function () {
                _this.loadLevel(levelID, function () {
                    _this.createPlayers();
                    _this.resetScore(0);
                    _this.rotationsUsed = 0;
                    _this.startRender();
                });
            });
        };
        Jetpack.prototype.getEditor = function () {
            return new Editor_1.Editor();
        };
        // go function but for edit mode
        Jetpack.prototype.edit = function () {
            var _this = this;
            // this.bootstrap();
            this.levels.populateLevelsList(this.levelList);
            this.editMode = true;
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindMouseMoveHandler();
            this.createRenderer();
            this.tileChooser = new TileChooser_2.TileChooser(this.tileSet, this.renderer);
            this.tileChooser.render();
            var s = setTimeout(function () {
                _this.startRender();
            }, 1000);
        };
        // load static stuff - map/renderer etc will be worked out later
        Jetpack.prototype.bootstrap = function (callback) {
            var _this = this;
            this.tileSet = new TileSet_2.TileSet();
            var boardSize = new BoardSize_5.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_2.Canvas(boardSize);
            var playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            this.collisions = new Collisions_1.Collisions(this, this.playerTypes); // pass the data, not the object
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_2.Loader(apiLocation);
            this.levels = new Levels_2.Levels(this, loader);
            this.getLevelList(function (levelList) {
                var levelID = _this.chooseLevelID(levelList);
                _this.levelID = levelID;
                callback(levelID);
            });
        };
        Jetpack.prototype.addScore = function (amount) {
            this.score += amount;
            var scoreElement = document.getElementById("score");
            if (scoreElement) {
                scoreElement.innerHTML = this.score.toString();
            }
        };
        // or at least try
        Jetpack.prototype.completeLevel = function () {
            this.collectable = this.getCollectable();
            var playerCount = this.countPlayers(this.players);
            if (this.collectable < 1 && playerCount < 2) {
                this.nextLevel();
            }
        };
        // create player
        Jetpack.prototype.createNewPlayer = function (type, coords, direction) {
            var playerType = this.playerTypes[type];
            var params = JSON.parse(JSON.stringify(playerType));
            params.id = this.nextPlayerID++;
            params.coords = coords;
            params.direction = direction;
            if (!Object.hasOwnProperty.call(params, "moveSpeed")) {
                params.moveSpeed = this.moveSpeed;
                params.fallSpeed = this.moveSpeed * 1.2;
            }
            var player = new Player_1.Player(params);
            this.players[player.id] = player;
            return player;
        };
        // make this actually fucking rotate, and choose direction, and do the visual effect thing
        Jetpack.prototype.rotateBoard = function (clockwise) {
            if (clockwise) {
                this.setNextAction('rotateRight');
            }
            else {
                this.setNextAction('rotateLeft');
            }
        };
        Jetpack.prototype.saveLevel = function () {
            var _this = this;
            this.levels.saveLevel(this.map.getBoard(), this.map.boardSize, this.levels.levelID, function (levelID) {
                var text = "Level " + levelID + " saved";
                _this.showEditMessage(text);
            });
        };
        Jetpack.prototype.loadLevelFromList = function () {
            var select = document.getElementById("levelList");
            var index = select.selectedIndex;
            var levelID = select.options[index].value;
            this.loadLevel(levelID, function () {
                // console.log("loaded!");
            });
        };
        Jetpack.prototype.growBoard = function () {
            if (!this.editMode) {
                return false;
            }
            this.boardSize = this.map.growBoard();
            this.checkResize = true;
        };
        Jetpack.prototype.shrinkBoard = function () {
            if (!this.editMode) {
                return false;
            }
            this.boardSize = this.map.shrinkBoard();
            this.checkResize = true;
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
            this.nextAction = action;
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Jetpack.prototype.createRenderer = function (boardArray, size) {
            if (boardArray === void 0) { boardArray = []; }
            if (size === void 0) { size = 12; }
            this.boardSize = new BoardSize_5.BoardSize(size);
            this.canvas = new Canvas_2.Canvas(this.boardSize);
            this.map = new Map_2.Map(this.tileSet, this.boardSize, boardArray);
            var board = this.map.getBoard();
            this.map.updateBoard(this.map.correctBoardSizeChange(board, this.boardSize), this.boardSize);
            var tiles = this.tileSet.getTiles();
            this.renderer = new Renderer_2.Renderer(this, this.map, tiles, this.playerTypes, this.boardSize, this.canvas);
        };
        Jetpack.prototype.startRender = function () {
            var _this = this;
            if (!this.paused) {
                return false;
            }
            window.cancelAnimationFrame(this.animationHandle);
            this.paused = false;
            this.showControls();
            this.animationHandle = window.requestAnimationFrame(function (time) {
                return _this.eventLoop(time, 0);
            });
        };
        Jetpack.prototype.getNextAction = function () {
            if (this.nextAction.length === 0) {
                return false;
            }
            var nextAction = this.nextAction;
            this.nextAction = "";
            return nextAction;
        };
        Jetpack.prototype.doNextAction = function (action) {
            if (action === 'rotateLeft') {
                this.doBoardRotation(false);
            }
            else if (action === 'rotateRight') {
                this.doBoardRotation(true);
            }
            else {
                return false;
            }
        };
        Jetpack.prototype.eventLoop = function (time, lastTime) {
            var _this = this;
            if (this.paused) {
                return false;
            }
            var nextAction = this.getNextAction();
            if (nextAction) {
                // nextActions take control of event loop
                // so don't requestAnimationFrame etc
                return this.doNextAction(nextAction);
            }
            this.animationHandle = window.requestAnimationFrame(function (newTime) {
                return _this.eventLoop(newTime, time);
            });
            var timePassed = this.calcTimePassed(time, lastTime);
            this.displayFrameRate(timePassed);
            this.gameCycle(timePassed);
        };
        // this does one step of the game
        Jetpack.prototype.gameCycle = function (timePassed) {
            if (this.isCalculating) {
                return false;
            }
            this.isCalculating = true;
            var playerRenderMap = this.createRenderMapFromPlayers(this.players, this.boardSize);
            var oldBoard = this.map.getBoard();
            this.doPlayerCalcs(timePassed);
            this.sizeCanvas();
            var newBoard = this.map.getBoard();
            var boardRenderMap = this.createRenderMapFromBoards(oldBoard, newBoard);
            var finalRenderMap = RenderMap_2.RenderMap.combineRenderMaps(playerRenderMap, boardRenderMap);
            this.renderer.render(finalRenderMap);
            this.isCalculating = false;
        };
        Jetpack.prototype.renderEverything = function (boardSize) {
            var blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(blankMap);
        };
        Jetpack.prototype.createRenderMapFromBoards = function (oldBoard, newBoard) {
            return RenderMap_2.RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
        };
        // create empty renderMap based on boardSize, and then apply each player's position to it
        Jetpack.prototype.createRenderMapFromPlayers = function (players, boardSize) {
            var blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, false);
            return players.reduce(function (map, player) {
                return RenderMap_2.RenderMap.addPlayerToRenderMap(player, map);
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
        Jetpack.prototype.sizeCanvas = function () {
            if (!this.checkResize) {
                return false;
            }
            this.canvas.sizeCanvas(this.boardSize);
            this.renderer.resize();
            this.checkResize = false;
        };
        Jetpack.prototype.resetScore = function (score) {
            this.score = 0;
            this.addScore(0);
        };
        Jetpack.prototype.nextLevel = function () {
            var _this = this;
            this.pauseRender();
            this.levels.saveData(this.levelID, this.rotationsUsed, this.score, function (data) {
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
        Jetpack.prototype.doPlayerCalcs = function (timePassed) {
            var movement = new Movement_1.Movement(this.map, this);
            var newPlayers = movement.doCalcs(this.players, timePassed);
            var collisions = new Collisions_1.Collisions(this, this.playerTypes);
            var sortedPlayers = collisions.checkAllCollisions(newPlayers);
            this.players = sortedPlayers; // replace with new objects
        };
        Jetpack.prototype.countPlayers = function (players) {
            var validPlayers = players.filter(function (player) {
                return player && player.value > 0;
            });
            return validPlayers.length;
        };
        // cycle through all map tiles, find egg cups etc and create players
        Jetpack.prototype.createPlayers = function () {
            var _this = this;
            this.destroyPlayers();
            var tiles = this.map.getAllTiles();
            var players = tiles.map(function (tile) {
                var type = tile.createPlayer;
                if (type) {
                    var coords = new Coords_5.Coords({
                        x: tile.x,
                        y: tile.y,
                        offsetX: 0,
                        offsetY: 0
                    });
                    var player = _this.createNewPlayer(type, coords, 1);
                    _this.players[player.id] = player;
                }
            });
        };
        Jetpack.prototype.destroyPlayers = function () {
            this.players = [];
        };
        // cycle through all map tiles, find egg cups etc and create players
        Jetpack.prototype.getCollectable = function () {
            var collectable = 0;
            var tiles = this.map.getAllTiles();
            tiles.map(function (tile) {
                var score = tile.collectable;
                if (score > 0) {
                    collectable += score;
                }
            });
            return collectable;
        };
        Jetpack.prototype.deletePlayer = function (player) {
            delete this.players[player.id];
        };
        Jetpack.prototype.doBoardRotation = function (clockwise) {
            var _this = this;
            if (this.paused || this.editMode) {
                return false;
            }
            this.pauseRender();
            this.rotationsUsed++;
            this.map.rotateCurrentBoard(clockwise);
            var rotatedPlayers = this.players.map(function (player) {
                return _this.map.rotatePlayer(player, clockwise);
            });
            this.players = [];
            rotatedPlayers.map(function (player) {
                _this.players[player.id] = player;
            });
            this.renderer.drawRotatingBoard(clockwise, function () {
                _this.renderEverything(_this.boardSize);
                _this.startRender();
            });
            return true;
        };
        Jetpack.prototype.revertEditMessage = function () {
            var s = setTimeout(function () {
                var message = document.getElementById("message");
                message.innerHTML = "EDIT MODE";
            }, 3000);
        };
        Jetpack.prototype.showEditMessage = function (text) {
            if (!this.editMode) {
                return false;
            }
            var message = document.getElementById("message");
            message.innerHTML = text;
            this.revertEditMessage();
        };
        Jetpack.prototype.loadLevel = function (levelID, callback) {
            var _this = this;
            this.levels.loadLevel(levelID, function (savedLevel) {
                var text = "Level " + savedLevel.levelID.toString() + " loaded!";
                _this.showEditMessage(text);
                _this.createRenderer(savedLevel.board, savedLevel.boardSize.width);
                callback();
            }, function () {
                _this.createRenderer();
                _this.map.updateBoardWithRandom(_this.boardSize);
                callback();
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
                    _this.showFPS();
                }
            });
        };
        Jetpack.prototype.showFPS = function () {
            var fps = document.getElementById("fps");
            if (fps) {
                fps.style.display = "block";
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
            if (!this.paused) {
                return false;
            }
            this.gameCycle(16); // movement based on 60 fps
        };
        Jetpack.prototype.bindClickHandler = function () {
            var _this = this;
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                _this.handleDrawEvent(event);
            });
        };
        Jetpack.prototype.bindMouseMoveHandler = function () {
            var _this = this;
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("mousemove", function (event) {
                if (event.button > 0 || event.buttons > 0) {
                    _this.handleDrawEvent(event);
                }
            });
        };
        Jetpack.prototype.handleDrawEvent = function (event) {
            var tileSize = this.canvas.calcTileSize(this.boardSize);
            var coords = new Coords_5.Coords({
                offsetX: event.offsetX % tileSize - tileSize / 2,
                offsetY: event.offsetY % tileSize - tileSize / 2,
                x: (event.offsetX / tileSize),
                y: (event.offsetY / tileSize)
            });
            this.drawCurrentTile(coords);
        };
        // coords is always x,y,offsetX, offsetY
        Jetpack.prototype.drawCurrentTile = function (coords) {
            var tileID = this.tileChooser.chosenTileID;
            if (tileID < 1) {
                return false;
            }
            var tile = this.map.cloneTile(tileID);
            this.map.changeTile(coords, tile);
        };
        return Jetpack;
    }());
    exports.Jetpack = Jetpack;
});
define("Collisions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Collisions = (function () {
        function Collisions(jetpack, playerTypes) {
            this.jetpack = jetpack;
            this.playerTypes = playerTypes;
        }
        Collisions.prototype.checkAllCollisions = function (players) {
            var _this = this;
            this.players = players;
            players.map(function (player) {
                _this.checkPlayerCollisions(player, players);
            });
            return players;
        };
        // cycles through all players and check
        Collisions.prototype.checkPlayerCollisions = function (player, otherPlayers) {
            var _this = this;
            otherPlayers.map(function (otherPlayer) {
                _this.handleCollision(player, otherPlayer);
            });
        };
        // this does the action so checkCollision can remain pure at heart
        Collisions.prototype.handleCollision = function (player1, player2) {
            if (this.checkCollision(player1, player2)) {
                this.combinePlayers(player1, player2);
                return true;
            }
            return false;
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
        Collisions.prototype.deletePlayer = function (player) {
            delete this.players[player.id];
        };
        Collisions.prototype.addPlayer = function (player) {
            this.players[player.id] = player;
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
            for (var i in this.playerTypes) {
                if (playerTypes[i].value === value) {
                    return playerTypes[i];
                }
            }
            return false;
        };
        Collisions.prototype.combinePlayers = function (player1, player2) {
            // console.log('combinePlayers', player1, player2);
            var newValue = player1.value + player2.value;
            var higherPlayer = this.chooseHigherLevelPlayer(player1, player2);
            var newPlayerType = this.getPlayerByValue(this.playerTypes, newValue);
            if (!newPlayerType) {
                return {
                    player1: player1,
                    player2: player2
                };
            }
            var newPlayer = this.jetpack.createNewPlayer(newPlayerType.type, higherPlayer.coords, higherPlayer.direction);
            this.addPlayer(newPlayer);
            this.deletePlayer(player1);
            this.deletePlayer(player2);
            return true;
        };
        return Collisions;
    }());
    exports.Collisions = Collisions;
});
//# sourceMappingURL=Jetpack.js.map