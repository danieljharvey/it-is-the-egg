define("BoardSize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BoardSize = (function () {
        function BoardSize(size) {
            this.minSize = 5;
            this.maxSize = 40;
            if (size < this.minSize)
                size = this.minSize;
            if (size > this.maxSize)
                size = this.maxSize;
            this.width = this.height = size;
        }
        BoardSize.prototype.grow = function () {
            if (this.width < this.maxSize)
                this.width++;
            if (this.height < this.maxSize)
                this.height++;
        };
        BoardSize.prototype.shrink = function () {
            if (this.width > this.minSize)
                this.width--;
            if (this.height > this.minSize)
                this.height--;
        };
        BoardSize.prototype.getData = function () {
            return {
                width: this.width,
                height: this.height
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
            if (keys.length === 0)
                return false;
            return keys[keys.length * Math.random() << 0];
        };
        Utils.getControlStyle = function (id, property) {
            var controlHeader = document.getElementById(id);
            if (!controlHeader)
                return 0;
            var style = window.getComputedStyle(controlHeader);
            var value = style[property];
            if (isNaN(value))
                return parseInt(value);
            return value;
        };
        Utils.getControlProperty = function (id, property) {
            var controlHeader = document.getElementById(id);
            if (!controlHeader)
                return 0;
            var value = controlHeader[property];
            if (isNaN(value))
                return parseInt(value);
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
        // takes BoardSize, returns size of each tile
        Canvas.prototype.sizeCanvas = function (boardSize) {
            var maxBoardSize = this.getMaxBoardSize(boardSize);
            this.sizeControls(maxBoardSize);
            var tileSize = this.calcTileSize(boardSize);
            this.loadCanvas(boardSize, tileSize);
            this.boardSize = boardSize;
            return tileSize;
        };
        Canvas.prototype.sizeControls = function (boardSize) {
            var controlHeader = document.getElementById("controlHeader");
            if (controlHeader) {
                controlHeader.style.width = boardSize.toString() + 'px';
            }
        };
        Canvas.prototype.calcTileSize = function (boardSize) {
            var maxBoardSize = this.getMaxBoardSize(this.boardSize);
            var tileSize = maxBoardSize / boardSize.width;
            return tileSize;
        };
        Canvas.prototype.getMaxBoardSize = function (boardSize) {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var wrapMargin = Utils_1.Utils.getControlStyle('wrapper', 'margin');
            var controlSpacing = Utils_1.Utils.getControlStyle('controlHeader', 'marginTop');
            var editSpacing = Utils_1.Utils.getControlStyle('editHeader', 'marginTop');
            var offsetHeight = Utils_1.Utils.getControlProperty('controlHeader', 'offsetHeight');
            height = height - (offsetHeight) - (2 * wrapMargin) - controlSpacing - editSpacing;
            width = width - (offsetHeight) - (2 * wrapMargin) - controlSpacing - editSpacing;
            if (width > height) {
                var difference = (height % boardSize.width);
                height = height - difference;
                return height;
            }
            else {
                var difference = (width % boardSize.width);
                width = width - difference;
                return width;
            }
        };
        Canvas.prototype.wipeCanvas = function (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        Canvas.prototype.loadCanvas = function (boardSize, tileSize) {
            this.canvas = document.getElementById("canvas");
            this.canvas.width = boardSize.width * tileSize;
            this.canvas.height = boardSize.height * tileSize;
            this.ctx = this.canvas.getContext("2d");
        };
        Canvas.prototype.getDrawingContext = function () {
            return this.ctx;
        };
        Canvas.prototype.getCanvas = function () {
            return this.canvas;
        };
        Canvas.prototype.getImagesFolder = function () {
            return this.imagesFolder;
        };
        return Canvas;
    }());
    exports.Canvas = Canvas;
});
define("Coords", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var Coords = (function () {
        function Coords(x, y, offsetX, offsetY) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            this.x = 0;
            this.y = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.x = Math.floor(x);
            this.y = Math.floor(y);
            this.offsetX = offsetX;
            this.offsetY = offsetY;
        }
        Coords.prototype.getActualPosition = function () {
            var fullX = (this.x * SPRITE_SIZE) + this.offsetX;
            var fullY = (this.y * SPRITE_SIZE) + this.offsetY;
            return {
                fullX: fullX,
                fullY: fullY,
            };
        };
        Coords.prototype.equals = function (otherCoords) {
            if (this.x !== otherCoords.x)
                return false;
            if (this.y !== otherCoords.y)
                return false;
            if (this.offsetX !== otherCoords.offsetX)
                return false;
            if (this.offsetY !== otherCoords.offsetY)
                return false;
            return true;
        };
        Coords.prototype.modify = function (params) {
            var newParams = Object.assign({}, this, params);
            return new Coords(newParams.x, newParams.y, newParams.offsetX, newParams.offsetY);
        };
        return Coords;
    }());
    exports.Coords = Coords;
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
                if (xhr.readyState == DONE) {
                    if (xhr.status == OK) {
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
            //var formData = this.paramsToFormData(params);
            var queryString = this.param(params);
            xhr.send(queryString);
        };
        Loader.prototype.paramsToFormData = function (params) {
            var formData = new FormData();
            for (var key in params) {
                formData.append(key, params[key]);
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
                board: this.board,
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
        function Levels(jetpack, loader) {
            this.levelID = 0;
            this.levels = {};
            this.jetpack = jetpack;
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
        // turn array of numbers into list key'd by levelID with object of won/lost
        Levels.prototype.cleanLevelList = function (list) {
            var levelList = [];
            for (var i in list) {
                var levelID = parseInt(list[i]);
                levelList[levelID] = {
                    levelID: levelID,
                    completed: false
                };
            }
            ;
            return levelList;
        };
        Levels.prototype.populateLevelsList = function (levelList) {
            var select = document.getElementById("levelList");
            if (!select)
                return;
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            var nullEl = document.createElement("option");
            nullEl.textContent = "New";
            nullEl.value = "";
            if (!this.levelID)
                nullEl.selected = true;
            select.appendChild(nullEl);
            for (var i in levelList) {
                var levelID = parseInt(i);
                var el = document.createElement("option");
                el.textContent = levelID.toString();
                el.value = levelID.toString();
                if (levelID == this.levelID) {
                    el.selected = true;
                }
                select.appendChild(el);
            }
        };
        Levels.prototype.saveLevel = function (board, boardSize, levelID, callback) {
            var _this = this;
            var saveData = new SavedLevel_1.SavedLevel(boardSize, board, levelID);
            var saveString = saveData.toString();
            var params = {
                data: saveString,
                levelID: 0,
            };
            if (levelID) {
                params.levelID = levelID;
            }
            this.loader.callServer("saveLevel", params, function (levelID) {
                _this.levelID = levelID;
                callback(levelID);
            }, function (errorMsg) {
                console.log("ERROR: ", errorMsg);
            });
        };
        Levels.prototype.loadLevel = function (levelID, callback, failCallback) {
            var _this = this;
            this.getLevelList(function () {
            });
            var params = {
                levelID: levelID,
            };
            this.loader.callServer("getLevel", params, function (data) {
                _this.levelID = levelID;
                var boardSize = new BoardSize_1.BoardSize(data.boardSize.width);
                var savedLevel = new SavedLevel_1.SavedLevel(boardSize, data.board, levelID);
                callback(savedLevel);
            }, function (errorMsg) {
                console.log("ERROR: ", errorMsg);
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
        return Levels;
    }());
    exports.Levels = Levels;
});
define("Tile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tile = (function () {
        function Tile(params) {
            var _this = this;
            this.background = false;
            this.needsDraw = true;
            this.frontLayer = false;
            this.collectable = 0;
            this.breakable = false;
            this.action = "";
            this.dontAdd = false;
            this.createPlayer = "";
            // fill this object with entries from params
            Object.entries(params).map(function (_a) {
                var key = _a[0], value = _a[1];
                _this[key] = value;
            });
        }
        return Tile;
    }());
    exports.Tile = Tile;
});
define("Renderer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var Renderer = (function () {
        function Renderer(jetpack, map, tiles, playerTypes, boardSize, canvas) {
            this.checkResize = true;
            this.tileImages = {}; // image elements of tiles
            this.playerImages = {}; // image element of players
            this.renderTile = function (x, y, tile) {
                var ctx = this.canvas.getDrawingContext();
                var tileSize = this.tileSize;
                var img = this.getTileImage(tile.id);
                if (!img) {
                    //console.log("Could not find tile image for id " + tile.id);
                    return false;
                }
                var left = x * tileSize;
                var top = y * tileSize;
                var opacity = 1;
                ctx.globalAlpha = opacity;
                if (this.map.renderAngle == 0) {
                    ctx.drawImage(img, left, top, tileSize, tileSize);
                }
                else {
                    var angleInRad = this.map.renderAngle * (Math.PI / 180);
                    var offset = tileSize / 2;
                    left = left + offset;
                    top = top + offset;
                    ctx.translate(left, top);
                    ctx.rotate(angleInRad);
                    ctx.drawImage(img, -offset, -offset, tileSize, tileSize);
                    ctx.rotate(-angleInRad);
                    ctx.translate(-left, -top);
                }
                return true;
            };
            this.jetpack = jetpack;
            this.map = map;
            this.tiles = tiles;
            this.playerTypes = playerTypes;
            this.boardSize = boardSize;
            this.canvas = canvas;
            this.loadTilePalette();
            this.loadPlayerPalette();
            this.tileSize = this.canvas.calcTileSize(boardSize);
        }
        Renderer.prototype.render = function () {
            this.renderBoard();
            this.renderPlayers();
            this.renderFrontLayerBoard();
        };
        Renderer.prototype.resize = function () {
            this.tileSize = this.canvas.sizeCanvas(this.boardSize);
            this.map.markAllForRedraw();
        };
        Renderer.prototype.loadTilePalette = function () {
            var _this = this;
            var _loop_1 = function (i) {
                var thisTile = this_1.tiles[i];
                var tileImage = document.createElement("img");
                tileImage.setAttribute("src", this_1.getTileImagePath(thisTile));
                tileImage.setAttribute("width", SPRITE_SIZE.toString());
                tileImage.setAttribute("height", SPRITE_SIZE.toString());
                tileImage.addEventListener("load", function () {
                    _this.markTileImageAsLoaded(thisTile.id);
                }, false);
                this_1.tileImages[thisTile.id] = {
                    image: tileImage,
                    ready: false
                };
            };
            var this_1 = this;
            for (var i in this.tiles) {
                _loop_1(i);
            }
        };
        Renderer.prototype.loadPlayerPalette = function () {
            var _this = this;
            var _loop_2 = function (i) {
                var playerType = this_2.playerTypes[i];
                var playerImage = document.createElement("img");
                playerImage.setAttribute("src", this_2.getTileImagePath(playerType));
                playerImage.addEventListener("load", function () {
                    _this.markPlayerImageAsLoaded(playerType.img);
                }, false);
                this_2.playerImages[playerType.img] = {
                    image: playerImage,
                    ready: false
                };
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
            this.tileImages[id].ready = true;
        };
        Renderer.prototype.getTileImagePath = function (tile) {
            return this.canvas.imagesFolder + tile.img;
        };
        Renderer.prototype.renderBoard = function () {
            var _this = this;
            var tiles = this.map.getAllTiles();
            tiles.map(function (tile) {
                if (tile.needsDraw === false) {
                    _this.showUnrenderedTile(tile.x, tile.y);
                    return;
                }
                if (!tile.frontLayer) {
                    if (_this.renderTile(tile.x, tile.y, tile)) {
                        tile.needsDraw = false;
                        tile.drawnBefore = true;
                    }
                }
                else {
                    // render sky behind see through tiles
                    _this.drawSkyTile(tile, tile.x, tile.y);
                }
            });
        };
        Renderer.prototype.drawSkyTile = function (tile, x, y) {
            var skyTile = this.map.cloneTile(1);
            this.renderTile(x, y, skyTile);
        };
        // just go over and draw the over-the-top stuff
        Renderer.prototype.renderFrontLayerBoard = function () {
            var _this = this;
            var tiles = this.map.getAllTiles();
            tiles.map(function (tile) {
                if (tile.needsDraw === false)
                    return;
                if (tile.frontLayer) {
                    if (_this.renderTile(tile.x, tile.y, tile)) {
                        tile.needsDraw = false;
                        tile.drawnBefore = true;
                    }
                }
            });
        };
        // debugging tools
        Renderer.prototype.showUnrenderedTile = function (x, y) {
            return false;
            var tileSize = this.tileSize;
            var ctx = this.canvas.getDrawingContext();
            ctx.fillStyle = "#f00";
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        };
        Renderer.prototype.renderPlayers = function () {
            for (var i in this.jetpack.players) {
                var player = this.jetpack.players[i];
                this.renderPlayer(player);
            }
        };
        Renderer.prototype.getTileImage = function (id) {
            var tileImage = this.tileImages[id];
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
            var offsetRatio = (tileSize / SPRITE_SIZE);
            var coords = player.coords;
            var left = Math.floor((coords.x * tileSize) + (coords.offsetX * offsetRatio));
            var top = Math.floor((coords.y * tileSize) + (coords.offsetY * offsetRatio));
            var clipLeft = player.currentFrame * SPRITE_SIZE;
            var clipTop = 0;
            ctx.globalAlpha = 1;
            var image = this.getPlayerImage(player.img);
            if (!image) {
                //console.log('player image not loaded', player.img);
                return false;
            }
            ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, tileSize, tileSize);
            if (left < 0) {
                // also draw on right
                var secondLeft = (tileSize * this.boardSize.width) + coords.offsetX;
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
            if ((left + tileSize) > (tileSize * this.boardSize.width)) {
                // also draw on left
                var secondLeft = left - (tileSize * this.boardSize.width);
                ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, tileSize, tileSize);
            }
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
            angle += (direction * this.jetpack.moveSpeed);
            this.jetpack.animationHandle = window.requestAnimationFrame(function () {
                _this.drawRotated(savedData, direction, angle, targetAngle, completed);
            });
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Player", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    // much more burnable player object
    // properties are protected so they can't be changed
    // only change is via constructor - destroy and make new if change required
    var Player = (function () {
        function Player(params) {
            this.direction = 0;
            this.oldDirection = 0;
            this.currentFrame = 0;
            this.id = 0;
            this.frames = 1;
            this.multiplier = 1;
            this.falling = false;
            this.type = "egg";
            this.moveSpeed = 1;
            this.fallSpeed = 1;
            this.lastAction = "string";
            this.value = 1;
            for (var i in params) {
                this[i] = params[i];
            }
        }
        Player.prototype.modify = function (params) {
            var newParams = Object.assign({}, this, params);
            return new Player(newParams);
        };
        return Player;
    }());
    exports.Player = Player;
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
                    id: 1,
                    title: "Sky",
                    img: "sky.png",
                    background: true,
                    needsDraw: true,
                },
                2: {
                    id: 2,
                    title: "Fabric",
                    img: "fabric.png",
                    background: false,
                    needsDraw: true,
                },
                3: {
                    id: 3,
                    title: "Cacti",
                    img: "cacti.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 1,
                },
                4: {
                    id: 4,
                    title: "Plant",
                    img: "plant.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 10,
                },
                5: {
                    id: 5,
                    title: "Crate",
                    img: "crate.png",
                    background: false,
                    needsDraw: true,
                    breakable: true,
                },
                8: {
                    id: 8,
                    title: "Work surface 2",
                    img: "work-surface-2.png",
                    background: false,
                    needsDraw: true,
                },
                9: {
                    id: 9,
                    title: "Work surface 3",
                    img: "work-surface-3.png",
                    background: false,
                    needsDraw: true,
                },
                10: {
                    id: 10,
                    title: "Work surface 4",
                    img: "work-surface-4.png",
                    background: false,
                    needsDraw: true,
                },
                11: {
                    id: 11,
                    title: "Tiles",
                    img: "tile.png",
                    background: false,
                    needsDraw: true,
                },
                12: {
                    id: 12,
                    title: "Egg Cup",
                    img: "egg-cup.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    createPlayer: "egg",
                    action: "completeLevel",
                },
                13: {
                    id: 13,
                    title: "Toast",
                    img: "toast.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    collectable: 100,
                    dontAdd: true,
                },
                14: {
                    id: 14,
                    title: "Door",
                    img: "door.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "teleport",
                },
                15: {
                    id: 15,
                    title: "Pink door open",
                    img: "pink-door-open.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                },
                16: {
                    id: 16,
                    title: "Pink door closed",
                    img: "pink-door.png",
                    background: false,
                    needsDraw: true,
                },
                17: {
                    id: 17,
                    title: "Pink door switch",
                    img: "pink-switch.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "pink-switch",
                },
                18: {
                    id: 18,
                    title: "Green door open",
                    img: "green-door-open.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                },
                19: {
                    id: 19,
                    title: "Green door closed",
                    img: "green-door.png",
                    background: false,
                    needsDraw: true,
                },
                20: {
                    id: 20,
                    title: "Green door switch",
                    img: "green-switch.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    action: "green-switch",
                },
                21: {
                    id: 21,
                    title: "Silver Egg Cup",
                    img: "silver-egg-cup.png",
                    background: true,
                    needsDraw: true,
                    frontLayer: true,
                    createPlayer: "silver-egg",
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
define("Map", ["require", "exports", "Coords", "Tile", "Utils"], function (require, exports, Coords_1, Tile_1, Utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map = (function () {
        function Map(tileSet, boardSize, board) {
            if (board === void 0) { board = []; }
            this.renderAngle = 0;
            this.board = [];
            this.tileSet = tileSet;
            this.boardSize = boardSize;
            this.board = board;
            this.markAllForRedraw();
        }
        Map.prototype.updateBoard = function (board, boardSize) {
            this.board = board;
            this.boardSize = boardSize;
        };
        Map.prototype.updateBoardWithRandom = function (boardSize) {
            this.boardSize = boardSize;
            this.board = this.generateRandomBoard(boardSize);
        };
        Map.prototype.correctForOverflow = function (x, y, offsetX, offsetY) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            var newX, newY;
            if (x < 0) {
                newX = this.boardSize.width - 1;
            }
            else if (x >= this.boardSize.width) {
                newX = 0;
            }
            else {
                newX = x;
            }
            if (y < 0) {
                newY = this.boardSize.height - 1;
            }
            else if (y >= this.boardSize.height) {
                newY = 0;
            }
            else {
                newY = y;
            }
            return new Coords_1.Coords(newX, newY, offsetX, offsetY);
        };
        // is intended next tile empty / a wall?
        Map.prototype.checkTileIsEmpty = function (x, y) {
            var tile = this.getTile(x, y);
            return tile.background;
        };
        Map.prototype.markAllForRedraw = function () {
            var tiles = this.getAllTiles();
            tiles.map(function (tile) {
                tile.needsDraw = true;
            });
            return;
        };
        Map.prototype.generateBlankBoard = function () {
            var board = [];
            for (var x = 0; x < this.boardSize.width; x++) {
                board[x] = [];
                for (var y = 0; y < this.boardSize.height; y++) {
                    var blankTile = this.cloneTile(1);
                    board[x][y] = blankTile;
                }
            }
            return board;
        };
        Map.prototype.generateRandomBoard = function (boardSize) {
            var board = [];
            for (var x = 0; x < boardSize.width; x++) {
                board[x] = [];
                for (var y = 0; y < boardSize.height; y++) {
                    var blankTile = this.getRandomTile(this.tileSet.getTiles());
                    board[x][y] = blankTile;
                }
            }
            return board;
        };
        Map.prototype.getTilesSurrounding = function (coords) {
            var tiles = [];
            // first just do the stuff around player
            for (var x = coords.x - 1; x < coords.x + 2; x++) {
                for (var y = coords.y - 1; y < coords.y + 2; y++) {
                    var fixedCoords = this.correctForOverflow(x, y);
                    var tile = this.getTileWithCoords(fixedCoords);
                    tiles.push(tile);
                }
            }
            return tiles;
        };
        Map.prototype.getTile = function (x, y) {
            var coords = new Coords_1.Coords(x, y);
            return this.getTileWithCoords(coords);
        };
        Map.prototype.getTileWithCoords = function (coords) {
            var fixedCoords = this.correctForOverflow(coords.x, coords.y);
            var x = fixedCoords.x, y = fixedCoords.y;
            var tile = this.board[x][y];
            tile.x = x;
            tile.y = y;
            return tile;
        };
        Map.prototype.changeTile = function (coords, tile) {
            var x = coords.x, y = coords.y;
            this.board[x][y] = tile;
        };
        Map.prototype.getPrototypeTile = function (id) {
            return this.tileSet.getTile(id);
        };
        Map.prototype.cloneTile = function (id) {
            var prototypeTile = this.getPrototypeTile(id);
            var tile = new Tile_1.Tile(prototypeTile); // create new Tile object with these 
            return tile;
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
                if (tile.dontAdd)
                    delete theseTiles[key];
                return true;
            });
            return randomProperty(theseTiles);
        };
        // get empty grid without tiles in
        Map.prototype.getBlankBoard = function () {
            var newBoard = [];
            for (var x = 0; x < this.boardSize.width; x++) {
                newBoard[x] = [];
                for (var y = 0; y < this.boardSize.height; y++) {
                    newBoard[x][y] = [];
                }
            }
            return newBoard;
        };
        // swap two tiles on map
        Map.prototype.switchTiles = function (id1, id2) {
            var _this = this;
            var tiles = this.getAllTiles();
            var count = tiles.map(function (tile) {
                if (tile.id === id1) {
                    var coords = new Coords_1.Coords(tile.x, tile.y);
                    _this.changeTile(coords, _this.cloneTile(id2));
                    return 1;
                }
                else if (tile.id === id2) {
                    var coords = new Coords_1.Coords(tile.x, tile.y);
                    _this.changeTile(coords, _this.cloneTile(id1));
                    return 1;
                }
                return 0;
            });
            return count.reduce(function (a, b) { return a + b; }, 0);
        };
        // find random tile of type that is NOT at currentCoords
        Map.prototype.findTile = function (currentCoords, id) {
            var tiles = this.getAllTiles();
            var teleporters = tiles.filter(function (tile) {
                if (tile.x == currentCoords.x && tile.y == currentCoords.y)
                    return false;
                return (tile.id == id);
            });
            if (teleporters.length == 0)
                return false; // no options
            var newTile = teleporters[Math.floor(Math.random() * teleporters.length)];
            return newTile;
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
        Map.prototype.rotateBoard = function (clockwise) {
            var _this = this;
            var newBoard = this.getBlankBoard();
            var width = this.boardSize.width - 1;
            var height = this.boardSize.height - 1;
            var tiles = this.getAllTiles();
            tiles.map(function (tile) {
                var coords = new Coords_1.Coords(tile.x, tile.y);
                var newCoords = _this.translateRotation(coords, clockwise);
                tile.x = newCoords.x;
                tile.y = newCoords.y;
                tile.needsDraw = true;
                newBoard[newCoords.x][newCoords.y] = tile;
            });
            if (clockwise) {
                this.renderAngle = this.renderAngle + 90;
                if (this.renderAngle > 360) {
                    this.renderAngle = this.renderAngle - 360;
                }
            }
            else {
                this.renderAngle = this.renderAngle - 90;
                if (this.renderAngle < 0) {
                    this.renderAngle = 360 + this.renderAngle;
                }
            }
            this.board = newBoard;
            return true;
        };
        Map.prototype.rotatePlayer = function (player, clockwise) {
            var newCoords = this.translateRotation(player.coords, clockwise);
            var direction = player.direction;
            // if player is still, nudge them in rotation direction
            if (direction == 0) {
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
        // return array with all tiles in (with x and y added)
        Map.prototype.getAllTiles = function () {
            var allTiles = [];
            for (var x in this.board) {
                for (var y in this.board[x]) {
                    var id = this.board[x][y].id;
                    var tile = this.board[x][y];
                    tile.x = x;
                    tile.y = y;
                    allTiles.push(tile);
                }
            }
            return allTiles;
        };
        Map.prototype.cycleTile = function (x, y) {
            var currentTile = this.board[x][y];
            var currentKey = currentTile.id;
            var keys = Object.keys(this.tileSet.getTiles());
            var newKey = "";
            var nextKey = false;
            for (var i in keys) {
                if (newKey === "" || nextKey) {
                    newKey = keys[i];
                }
                if (keys[i] == currentKey) {
                    nextKey = true;
                }
                else {
                    nextKey = false;
                }
            }
            var tile = this.cloneTile(newKey);
            this.board[x][y] = tile;
        };
        Map.prototype.shrinkBoard = function () {
            this.boardSize.shrink();
            this.board = this.correctBoardSizeChange(this.board, this.boardSize);
            return this.boardSize;
        };
        Map.prototype.growBoard = function () {
            this.boardSize.grow();
            this.board = this.correctBoardSizeChange(this.board, this.boardSize);
            return this.boardSize;
        };
        Map.prototype.correctBoardSizeChange = function (board, boardSize) {
            var newBoard = [];
            var currentWidth = board.length;
            var currentHeight;
            if (currentWidth > 0) {
                currentHeight = board[0].length;
            }
            else {
                currentHeight = 0;
            }
            for (var x = 0; x < boardSize.width; x++) {
                newBoard[x] = [];
                for (var y = 0; y < boardSize.height; y++) {
                    if (x < currentWidth && y < currentHeight) {
                        // using current board
                        var tile = board[x][y];
                        tile.needsDraw = true;
                        newBoard[x][y] = tile;
                    }
                    else {
                        // adding blank tiles
                        var tile = this.cloneTile(1);
                        tile.needsDraw = true;
                        newBoard[x][y] = tile;
                    }
                }
            }
            return newBoard;
        };
        Map.prototype.getBoard = function () {
            return this.board;
        };
        return Map;
    }());
    exports.Map = Map;
});
define("Movement", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    // movement takes the current map, the current players, and returns new player objects
    // it is then trashed and a new one made for next move to reduce any real held state
    var Movement = (function () {
        function Movement(map, renderer, jetpack) {
            this.players = [];
            this.map = map;
            this.renderer = renderer;
            this.jetpack = jetpack;
        }
        // loop through passed players[] array, do changes, return new one
        Movement.prototype.doCalcs = function (players, timePassed) {
            var _this = this;
            if (!players)
                return [];
            this.players = players; // store so we can compare
            var newPlayers = players.map(function (player) {
                return _this.doPlayerCalcs(player, timePassed);
            });
            return newPlayers;
        };
        Movement.prototype.doPlayerCalcs = function (player, timePassed) {
            var startCoords = player.coords;
            this.setRedrawAroundPlayer(player);
            var newPlayer = this.incrementPlayerFrame(player);
            var newerPlayer = this.checkFloorBelowPlayer(timePassed, newPlayer);
            var evenNewerPlayer = this.incrementPlayerDirection(timePassed, newerPlayer);
            var newestPlayer = this.correctPlayerOverflow(evenNewerPlayer);
            var absolutelyNewestPlayer = this.checkTileAction(startCoords, newestPlayer);
            this.setRedrawAroundPlayer(absolutelyNewestPlayer);
            return absolutelyNewestPlayer;
        };
        Movement.prototype.checkTileAction = function (startCoords, player) {
            if (!startCoords.equals(player.coords)) {
                return this.checkPlayerTileAction(player);
            }
            return player;
        };
        Movement.prototype.setRedrawAroundPlayer = function (player) {
            var tiles = this.map.getTilesSurrounding(player.coords);
            tiles.map(function (tile) {
                tile.needsDraw = true;
            });
            return player;
        };
        Movement.prototype.incrementPlayerFrame = function (player) {
            if (player.direction === 0 && player.oldDirection === 0 && player.currentFrame === 0) {
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
                if (newFrame < 0)
                    newFrame = (player.frames - 1);
            }
            // if going right, increase frame
            if (player.direction > 0 || player.oldDirection > 0) {
                newFrame = player.currentFrame + 1;
                if (newFrame >= player.frames)
                    newFrame = 0;
            }
            return player.modify({
                currentFrame: newFrame
            });
        };
        Movement.prototype.checkPlayerTileAction = function (player) {
            var currentCoords = player.coords;
            if (currentCoords.offsetX != 0 || currentCoords.offsetY != 0)
                return player;
            var coords = this.map.correctForOverflow(currentCoords.x, currentCoords.y);
            var tile = this.map.getTileWithCoords(coords);
            if (tile.collectable > 0) {
                var score = tile.collectable * player.multiplier;
                var blankTile = this.map.cloneTile(1);
                blankTile.needsDraw = true;
                this.map.changeTile(coords, blankTile);
                this.jetpack.addScore(score);
                return player;
            }
            if (tile.action == "completeLevel") {
                this.jetpack.completeLevel();
            }
            else if (tile.action == "teleport") {
                return this.teleport(player); // only action that changes player state
            }
            else if (tile.action == 'pink-switch') {
                this.map.switchTiles(15, 16);
            }
            else if (tile.action == 'green-switch') {
                this.map.switchTiles(18, 19);
            }
            return player; // player returned unchanged
        };
        // find another teleport and go to it
        // if no others, do nothing
        Movement.prototype.teleport = function (player) {
            //if (player.lastAction == "teleport") return false;
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
        Movement.prototype.incrementPlayerDirection = function (timePassed, player) {
            if (player.moveSpeed === 0) {
                return player;
            }
            var moveAmount = this.calcMoveAmount(player.moveSpeed, this.renderer.tileSize, timePassed);
            var coords = player.coords;
            if (player.direction !== 0 && player.falling === false) {
                if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y) && !this.map.checkTileIsEmpty(coords.x + 1, coords.y)) {
                    return player; // no change
                }
            }
            if (player.direction < 0 && player.falling === false) {
                if (!this.map.checkTileIsEmpty(coords.x - 1, coords.y)) {
                    // turn around
                    return player.modify({
                        coords: coords.modify({
                            offsetX: 0
                        }),
                        direction: 1
                    });
                }
                else {
                    // move left
                    var newOffsetX = coords.offsetX - moveAmount;
                    return player.modify({
                        coords: coords.modify({
                            offsetX: newOffsetX
                        })
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
                        direction: -1
                    });
                }
                else {
                    // move right
                    var newOffsetX = coords.offsetX + moveAmount;
                    return player.modify({
                        coords: coords.modify({
                            offsetX: newOffsetX
                        })
                    });
                }
            }
            // if we've stopped and ended up not quite squared up, correct this
            if (player.direction == 0 && player.falling === false) {
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
        Movement.prototype.calcMoveAmount = function (moveSpeed, tileSize, timePassed) {
            var fullSize = SPRITE_SIZE; // size of image tiles
            var moveAmount = (tileSize / fullSize) * moveSpeed;
            var frameRateAdjusted = moveAmount * (timePassed / 2);
            return frameRateAdjusted;
        };
        Movement.prototype.correctPlayerOverflow = function (player) {
            var newCoords = this.correctTileOverflow(player.coords);
            var loopedCoords = this.map.correctForOverflow(newCoords.x, newCoords.y, newCoords.offsetX, newCoords.offsetY);
            return player.modify({
                coords: loopedCoords,
                lastAction: ""
            });
        };
        Movement.prototype.correctTileOverflow = function (coords) {
            if (coords.offsetX > SPRITE_SIZE) {
                // move one tile to right
                return coords.modify({
                    x: coords.x + 1,
                    offsetX: 0
                });
            }
            if (coords.offsetX < (-1 * SPRITE_SIZE)) {
                // move one tile to left
                return coords.modify({
                    x: coords.x - 1,
                    offsetX: 0
                });
            }
            if (coords.offsetY > SPRITE_SIZE) {
                // move one tile down
                return coords.modify({
                    y: coords.y + 1,
                    offsetY: 0
                });
            }
            if (coords.offsetY < (-1 * SPRITE_SIZE)) {
                // move one tile up
                return coords.modify({
                    y: coords.y - 1,
                    offsetY: 0
                });
            }
            return coords;
        };
        Movement.prototype.checkFloorBelowPlayer = function (timePassed, player) {
            if (player.coords.offsetX !== 0)
                return player;
            var coords = player.coords;
            var belowCoords = this.map.correctForOverflow(coords.x, coords.y + 1, coords.offsetX, coords.offsetY);
            var tile = this.map.getTileWithCoords(belowCoords);
            if (tile.background) {
                var fallAmount = this.calcMoveAmount(player.fallSpeed, this.renderer.tileSize, timePassed);
                var coords_1 = player.coords.modify({
                    offsetY: player.coords.offsetY + fallAmount
                });
                return player.modify({
                    coords: coords_1,
                    falling: true
                });
            }
            else if (player.falling && tile.breakable) {
                this.map.changeTile(belowCoords, this.map.cloneTile(1)); // smash block, replace with empty
            }
            else {
                return player.modify({
                    falling: false
                });
            }
            return player; // no change
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
                "egg": {
                    type: "egg",
                    title: "It is of course the egg",
                    img: "egg-sprite.png",
                    frames: 18,
                    multiplier: 1,
                    value: 1,
                },
                "red-egg": {
                    type: "red-egg",
                    title: "It is of course the red egg",
                    img: "egg-sprite-red.png",
                    frames: 18,
                    multiplier: 2,
                    value: 2,
                },
                "blue-egg": {
                    type: "blue-egg",
                    title: "It is of course the blue egg",
                    img: "egg-sprite-blue.png",
                    frames: 18,
                    multiplier: 5,
                    value: 3,
                },
                "yellow-egg": {
                    type: "yellow-egg",
                    title: "It is of course the yellow egg",
                    img: "egg-sprite-yellow.png",
                    frames: 18,
                    multiplier: 10,
                    value: 4,
                },
                "silver-egg": {
                    type: "silver-egg",
                    title: "It is of course the silver egg",
                    img: "silver-egg.png",
                    frames: 1,
                    multiplier: 10,
                    value: 0,
                    moveSpeed: 0,
                    fallSpeed: 10
                },
            };
        }
        PlayerTypes.prototype.getPlayerTypes = function () {
            return this.playerTypes;
        };
        return PlayerTypes;
    }());
    exports.PlayerTypes = PlayerTypes;
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
define("TitleScreen", ["require", "exports", "BoardSize"], function (require, exports, BoardSize_2) {
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
            var boardSize = new BoardSize_2.BoardSize(10);
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
define("Jetpack", ["require", "exports", "Canvas", "Collisions", "Coords", "Levels", "Loader", "Map", "Movement", "Player", "PlayerTypes", "Renderer", "TileSet", "BoardSize", "TileChooser", "TitleScreen", "Utils"], function (require, exports, Canvas_1, Collisions_1, Coords_2, Levels_1, Loader_1, Map_1, Movement_1, Player_1, PlayerTypes_1, Renderer_1, TileSet_1, BoardSize_3, TileChooser_1, TitleScreen_1, Utils_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Jetpack = (function () {
        function Jetpack() {
            this.paused = true;
            this.editMode = false;
            this.moveSpeed = 5;
            this.levelID = 1;
            this.levelList = [];
            this.nextPlayerID = 1;
            this.score = 0;
            this.rotationsUsed = 0;
            this.collectable = 0; // total points on screen
            this.playerTypes = {};
            this.defaultBoardSize = 20;
            this.checkResize = false;
        }
        Jetpack.prototype.go = function (levelID) {
            var _this = this;
            //this.bootstrap();
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
        // go function but for edit mode
        Jetpack.prototype.edit = function () {
            var _this = this;
            //this.bootstrap();
            this.levels.populateLevelsList(this.levelList);
            this.editMode = true;
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindMouseMoveHandler();
            this.createRenderer();
            this.tileChooser = new TileChooser_1.TileChooser(this.tileSet, this.renderer);
            this.tileChooser.render();
            var s = setTimeout(function () {
                _this.startRender();
            }, 1000);
        };
        Jetpack.prototype.getTitleScreen = function (callback) {
            var imageSize = { width: 1024, height: 1024 };
            var imagePath = "large/the-egg.png";
            var titleScreen = new TitleScreen_1.TitleScreen(this, this.canvas, imagePath, imageSize.width, imageSize.height);
            titleScreen.render(callback);
        };
        // load static stuff - map/renderer etc will be worked out later
        Jetpack.prototype.bootstrap = function (callback) {
            var _this = this;
            this.tileSet = new TileSet_1.TileSet();
            var boardSize = new BoardSize_3.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_1.Canvas(boardSize);
            var playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            this.collisions = new Collisions_1.Collisions(this, this.playerTypes); // pass the data, not the object
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(this, loader);
            this.getLevelList(function (levelList) {
                var levelID = _this.chooseLevelID(levelList);
                _this.levelID = levelID;
                callback(levelID);
            });
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
                return (level.completed === false);
            });
            var chosenKey = Utils_3.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey)
                return false;
            var levelID = availableLevels[chosenKey].levelID;
            return levelID;
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Jetpack.prototype.createRenderer = function (board, size) {
            if (board === void 0) { board = []; }
            if (size === void 0) { size = 12; }
            this.boardSize = new BoardSize_3.BoardSize(size);
            this.map = new Map_1.Map(this.tileSet, this.boardSize, board);
            this.map.updateBoard(this.map.correctBoardSizeChange(board, this.boardSize), this.boardSize);
            var tiles = this.tileSet.getTiles();
            this.renderer = new Renderer_1.Renderer(this, this.map, tiles, this.playerTypes, this.boardSize, this.canvas);
        };
        Jetpack.prototype.startRender = function () {
            var _this = this;
            if (!this.paused)
                return false;
            window.cancelAnimationFrame(this.animationHandle);
            this.paused = false;
            this.showControls();
            this.animationHandle = window.requestAnimationFrame(function (time) { return _this.eventLoop(time, 0); });
        };
        Jetpack.prototype.eventLoop = function (time, lastTime) {
            var _this = this;
            if (this.paused)
                return false;
            var timePassed = this.calcTimePassed(time, lastTime);
            this.doPlayerCalcs(timePassed);
            this.sizeCanvas();
            this.renderer.render();
            this.animationHandle = window.requestAnimationFrame(function (newTime) { return _this.eventLoop(newTime, time); });
        };
        Jetpack.prototype.calcTimePassed = function (time, lastTime) {
            var difference = Math.min(time - lastTime, 20);
            var frameRate = 60 / difference;
            return frameRate;
        };
        Jetpack.prototype.sizeCanvas = function () {
            if (!this.checkResize)
                return false;
            this.canvas.sizeCanvas(this.boardSize);
            this.renderer.resize();
            this.checkResize = false;
        };
        Jetpack.prototype.resetScore = function (score) {
            this.score = 0;
            this.addScore(0);
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
            var controlHeader = document.getElementById('controlHeader');
            if (controlHeader && controlHeader.classList.contains('hidden')) {
                controlHeader.classList.remove('hidden');
            }
        };
        Jetpack.prototype.hideControls = function () {
            var controlHeader = document.getElementById('controlHeader');
            if (controlHeader && !controlHeader.classList.contains('hidden')) {
                controlHeader.classList.add('hidden');
            }
        };
        Jetpack.prototype.doPlayerCalcs = function (timePassed) {
            var movement = new Movement_1.Movement(this.map, this.renderer, this);
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
                    var coords = new Coords_2.Coords(tile.x, tile.y);
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
        // create player and load their sprite
        Jetpack.prototype.createNewPlayer = function (type, coords, direction) {
            var playerType = this.playerTypes[type];
            var params = JSON.parse(JSON.stringify(playerType));
            params.id = this.nextPlayerID++;
            params.coords = coords;
            params.direction = direction;
            params.oldDirection = 0;
            params.falling = false; // can't move when falling
            if (!Object.hasOwnProperty.call(params, 'moveSpeed')) {
                params.moveSpeed = this.moveSpeed;
                params.fallSpeed = this.moveSpeed * 1.2;
            }
            var player = new Player_1.Player(params);
            this.players[player.id] = player;
            return player;
        };
        // make this actually fucking rotate, and choose direction, and do the visual effect thing
        Jetpack.prototype.rotateBoard = function (clockwise) {
            var _this = this;
            if (this.paused || this.editMode)
                return false;
            this.pauseRender();
            this.rotationsUsed++;
            this.map.rotateBoard(clockwise);
            var rotatedPlayers = this.players.map(function (player) {
                return _this.map.rotatePlayer(player, clockwise);
            });
            this.players = [];
            rotatedPlayers.map(function (player) {
                _this.players[player.id] = player;
            });
            this.renderer.drawRotatingBoard(clockwise, function () {
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
            if (!this.editMode)
                return false;
            var message = document.getElementById("message");
            message.innerHTML = text;
            this.revertEditMessage();
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
                console.log("loaded!");
            });
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
        Jetpack.prototype.growBoard = function () {
            if (!this.editMode)
                return false;
            this.boardSize = this.map.growBoard();
            this.checkResize = true;
        };
        Jetpack.prototype.shrinkBoard = function () {
            if (!this.editMode)
                return false;
            this.boardSize = this.map.shrinkBoard();
            this.checkResize = true;
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
                    _this.rotateBoard(false);
                }
                if (event.keyCode === 39) {
                    _this.rotateBoard(true);
                }
            });
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
            var coords = new Coords_2.Coords((event.offsetX / tileSize), (event.offsetY / tileSize), (event.offsetX % tileSize) - (tileSize / 2), (event.offsetY % tileSize) - (tileSize / 2));
            this.drawCurrentTile(coords);
        };
        // coords is always x,y,offsetX, offsetY
        Jetpack.prototype.drawCurrentTile = function (coords) {
            var tileID = this.tileChooser.chosenTileID;
            if (tileID < 1)
                return false;
            var tile = this.map.getPrototypeTile(tileID);
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
                _this.checkCollision(player, otherPlayer);
            });
        };
        // only deal with horizontal collisions for now
        Collisions.prototype.checkCollision = function (player1, player2) {
            if (!player1 || !player2)
                return false;
            if (player1.id == player2.id)
                return false;
            var coords1 = player1.coords;
            var coords2 = player2.coords;
            if (coords1.y != coords2.y)
                return false;
            var distance = coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
            if (distance < 0)
                distance = distance * -1;
            if (distance < 40) {
                return this.combinePlayers(player1, player2);
            }
            // nothing changes
            return {
                player1: player1,
                player2: player2
            };
        };
        Collisions.prototype.deletePlayer = function (player) {
            delete this.players[player.id];
        };
        Collisions.prototype.addPlayer = function (player) {
            this.players[player.id] = player;
        };
        Collisions.prototype.chooseHigherLevelPlayer = function (player1, player2) {
            if (player1.value > player2.value)
                return player1;
            if (player2.value > player1.value)
                return player2;
            if (player1.value == player2.value)
                return player1;
        };
        Collisions.prototype.combinePlayers = function (player1, player2) {
            //console.log('combinePlayers', player1, player2);
            var newValue = player1.value + player2.value;
            var higherPlayer = this.chooseHigherLevelPlayer(player1, player2);
            for (var type in this.playerTypes) {
                if (this.playerTypes[type].value == newValue) {
                    var newPlayer = this.jetpack.createNewPlayer(type, higherPlayer.coords, higherPlayer.direction);
                    this.addPlayer(newPlayer);
                    this.deletePlayer(player1);
                    this.deletePlayer(player2);
                    return true;
                }
            }
            // nothing changes
            return {
                player1: player1,
                player2: player2
            };
        };
        return Collisions;
    }());
    exports.Collisions = Collisions;
});
//# sourceMappingURL=Jetpack.js.map