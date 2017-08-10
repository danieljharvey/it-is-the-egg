define("BoardSize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BoardSize = (function () {
        function BoardSize(size) {
            this.minSize = 8;
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
        return BoardSize;
    }());
    exports.BoardSize = BoardSize;
});
// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc
define("Canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Canvas = (function () {
        function Canvas(boardSize) {
            this.checkResize = true;
            this.boardSize = boardSize;
        }
        Canvas.prototype.sizeCanvas = function () {
            if (!this.checkResize)
                return false;
            var maxBoardSize = this.getMaxBoardSize();
            this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + "px";
            var controlHeader = document.getElementById("controlHeader");
            controlHeader.style.width = maxBoardSize.toString() + 'px';
            this.tileSize = maxBoardSize / this.boardSize.width;
            this.loadCanvas();
            //this.map.markAllForRedraw();
            this.checkResize = false; // all done
        };
        Canvas.prototype.getMaxBoardSize = function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var wrapper = document.getElementById('wrapper');
            var wrapMargin = parseInt(window.getComputedStyle(wrapper).margin);
            var controlHeader = document.getElementById("controlHeader");
            var controlSpacing = parseInt(window.getComputedStyle(controlHeader).marginTop);
            height = height - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
            width = width - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
            if (width > height) {
                var difference = (height % this.boardSize.width);
                height = height - difference;
                return height;
            }
            else {
                var difference = (width % this.boardSize.width);
                width = width - difference;
                return width;
            }
        };
        Canvas.prototype.wipeCanvas = function (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        Canvas.prototype.loadCanvas = function () {
            this.canvas = document.getElementById("canvas");
            this.canvas.width = this.boardSize.width * this.tileSize;
            this.canvas.height = this.boardSize.height * this.tileSize;
            this.ctx = this.canvas.getContext("2d");
        };
        Canvas.prototype.getDrawingContext = function () {
            if (!this.ctx) {
                this.loadCanvas();
            }
            return this.ctx;
        };
        Canvas.prototype.getCanvas = function () {
            if (!this.canvas) {
                this.loadCanvas();
            }
            return this.canvas;
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
                        var object = JSON.parse(xhr.responseText);
                        if (object.rc > 0) {
                            failCallback(object.msg);
                        }
                        else {
                            callback(object);
                        }
                    }
                    else {
                        failCallback("Error: " + xhr.status);
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
define("Levels", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Levels = (function () {
        function Levels(jetpack, loader) {
            this.levelID = 0;
            this.levels = {};
            this.levelList = [];
            this.jetpack = jetpack;
            this.loader = loader;
        }
        Levels.prototype.getLevelList = function () {
            var _this = this;
            this.loader.callServer("getLevelsList", {}, function (data) {
                _this.levelList = data.data;
                _this.populateLevelsList();
            });
        };
        Levels.prototype.populateLevelsList = function () {
            var select = document.getElementById("levelList");
            if (!select)
                return false;
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            var nullEl = document.createElement("option");
            nullEl.textContent = "New";
            nullEl.value = false;
            if (!this.levelID)
                nullEl.selected = true;
            select.appendChild(nullEl);
            for (var i in this.levelList) {
                var levelID = parseInt(this.levelList[i]);
                var el = document.createElement("option");
                el.textContent = levelID.toString();
                el.value = levelID.toString();
                if (levelID == this.levelID) {
                    el.selected = true;
                }
                select.appendChild(el);
            }
        };
        Levels.prototype.generateLevelID = function () {
            for (var levelID = 1; levelID < 10000; levelID++) {
                var levelIDString = levelID.toString();
                if (this.levelList.indexOf(levelIDString) == -1) {
                    return levelID;
                }
            }
            return 0;
        };
        Levels.prototype.saveLevel = function (board, boardSize, levelID, callback) {
            var _this = this;
            var saveData = {
                board: board,
                boardSize: boardSize,
                levelID: levelID,
            };
            var saveString = JSON.stringify(saveData);
            var saveKey = levelID.toString();
            var params = {
                data: saveString,
                levelID: 0,
            };
            if (levelID) {
                params.levelID = levelID;
            }
            this.loader.callServer("saveLevel", params, function (data) {
                _this.levelID = data.data;
                callback(data.data);
            }, function (errorMsg) {
                console.log("ERROR: ", errorMsg);
            });
        };
        Levels.prototype.loadLevel = function (levelID, callback, failCallback) {
            var _this = this;
            this.getLevelList();
            var params = {
                levelID: levelID,
            };
            this.loader.callServer("getLevel", params, function (data) {
                _this.levelID = levelID;
                callback(data.data);
            }, function (errorMsg) {
                console.log("ERROR: ", errorMsg);
                failCallback();
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
        function Renderer(jetpack, map, tiles, playerTypes, boardSize) {
            this.tileSize = 48;
            this.checkResize = true;
            this.imagesFolder = "img/";
            this.tileImages = {}; // image elements of tiles
            this.playerImages = {}; // image element of players
            this.playerTypes = {};
            this.renderTile = function (x, y, tile, overwriteImage) {
                if (overwriteImage) {
                    var img = overwriteImage;
                }
                else {
                    var img = this.tileImages[tile.id];
                }
                if (!img) {
                    console.log("Could not find tile image for id " + tile.id);
                    return false;
                }
                var left = x * this.tileSize;
                var top = y * this.tileSize;
                var opacity = 1;
                this.ctx.globalAlpha = opacity;
                if (this.map.renderAngle == 0) {
                    this.ctx.drawImage(img, left, top, this.tileSize, this.tileSize);
                }
                else {
                    var angleInRad = this.map.renderAngle * (Math.PI / 180);
                    var offset = this.tileSize / 2;
                    left = left + offset;
                    top = top + offset;
                    this.ctx.translate(left, top);
                    this.ctx.rotate(angleInRad);
                    this.ctx.drawImage(img, -offset, -offset, this.tileSize, this.tileSize);
                    this.ctx.rotate(-angleInRad);
                    this.ctx.translate(-left, -top);
                }
                return true;
            };
            this.jetpack = jetpack;
            this.map = map;
            this.tiles = tiles;
            this.playerTypes = playerTypes;
            this.boardSize = boardSize;
            this.loadTilePalette();
            this.loadPlayerPalette();
            this.loadCanvas();
        }
        Renderer.prototype.renderTitleScreen = function (callback) {
            var _this = this;
            this.sizeCanvas();
            var titleImage = document.createElement("img");
            titleImage.addEventListener("load", function () {
                _this.drawTheBigEgg(titleImage, 0.02, true, callback);
            }, false);
            titleImage.setAttribute("src", this.imagesFolder + "large/the-egg.png");
            titleImage.setAttribute("width", 1024);
            titleImage.setAttribute("height", 1024);
        };
        Renderer.prototype.drawTheBigEgg = function (titleImage, opacity, show, callback) {
            var _this = this;
            this.ctx.globalAlpha = 1;
            this.wipeCanvas("rgb(0,0,0)");
            this.ctx.globalAlpha = opacity;
            this.ctx.drawImage(titleImage, 0, 0, titleImage.width, titleImage.height, 0, 0, this.canvas.width, this.canvas.height);
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
            this.animationHandle = window.requestAnimationFrame(function () {
                _this.drawTheBigEgg(titleImage, opacity, show, callback);
            });
        };
        Renderer.prototype.render = function () {
            var _this = this;
            if (this.jetpack.paused)
                return false;
            this.sizeCanvas();
            //this.wipeCanvas('rgba(0,0,0,0.02)');
            this.renderBoard();
            this.renderPlayers();
            this.renderFrontLayerBoard();
            this.jetpack.doPlayerCalcs();
            //this.wipeCanvas('rgba(255,255,0,0.04)');
            this.animationHandle = window.requestAnimationFrame(function () { return _this.render(); });
        };
        Renderer.prototype.loadTilePalette = function () {
            for (var i in this.tiles) {
                var thisTile = this.tiles[i];
                var tileImage = document.createElement("img");
                tileImage.setAttribute("src", this.getTileImagePath(thisTile));
                tileImage.setAttribute("width", SPRITE_SIZE);
                tileImage.setAttribute("height", SPRITE_SIZE);
                this.tileImages[thisTile.id] = tileImage;
            }
        };
        Renderer.prototype.loadPlayerPalette = function () {
            for (var i in this.playerTypes) {
                var playerType = this.playerTypes[i];
                var playerImage = document.createElement("img");
                playerImage.setAttribute("src", this.getTileImagePath(playerType));
                this.playerImages[playerType.img] = playerImage;
            }
        };
        Renderer.prototype.getTileImagePath = function (tile) {
            return this.imagesFolder + tile.img;
        };
        Renderer.prototype.sizeCanvas = function () {
            if (!this.checkResize)
                return false;
            var maxBoardSize = this.getMaxBoardSize();
            this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + "px";
            var controlHeader = document.getElementById("controlHeader");
            controlHeader.style.width = maxBoardSize.toString() + 'px';
            this.tileSize = maxBoardSize / this.boardSize.width;
            this.loadCanvas();
            this.map.markAllForRedraw();
            this.checkResize = false; // all done
        };
        Renderer.prototype.getMaxBoardSize = function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var wrapper = document.getElementById('wrapper');
            var wrapMargin = parseInt(window.getComputedStyle(wrapper).margin);
            var controlHeader = document.getElementById("controlHeader");
            var controlSpacing = parseInt(window.getComputedStyle(controlHeader).marginTop);
            height = height - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
            width = width - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
            if (width > height) {
                var difference = (height % this.boardSize.width);
                height = height - difference;
                return height;
            }
            else {
                var difference = (width % this.boardSize.width);
                width = width - difference;
                return width;
            }
        };
        Renderer.prototype.wipeCanvas = function (fillStyle) {
            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        };
        Renderer.prototype.loadCanvas = function () {
            this.canvas = document.getElementById("canvas");
            this.canvas.width = this.boardSize.width * this.tileSize;
            this.canvas.height = this.boardSize.height * this.tileSize;
            this.ctx = this.canvas.getContext("2d");
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
                    if (_this.renderTile(tile.x, tile.y, tile, false)) {
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
            var skyTile = this.map.getTile(1);
            var skyTileImage = this.tileImages[skyTile.id];
            this.renderTile(x, y, tile, skyTileImage);
        };
        // just go over and draw the over-the-top stuff
        Renderer.prototype.renderFrontLayerBoard = function () {
            var _this = this;
            var tiles = this.map.getAllTiles();
            tiles.map(function (tile) {
                if (tile.needsDraw === false)
                    return;
                if (tile.frontLayer) {
                    if (_this.renderTile(tile.x, tile.y, tile, false)) {
                        tile.needsDraw = false;
                        tile.drawnBefore = true;
                    }
                }
            });
        };
        // debugging tools
        Renderer.prototype.showUnrenderedTile = function (x, y) {
            return false;
            this.ctx.fillStyle = "#f00";
            this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        };
        Renderer.prototype.renderPlayers = function () {
            for (var i in this.jetpack.players) {
                var player = this.jetpack.players[i];
                this.renderPlayer(player);
            }
        };
        Renderer.prototype.renderPlayer = function (player) {
            var offsetRatio = (this.tileSize / SPRITE_SIZE);
            var left = (player.x * this.tileSize) + (player.offsetX * offsetRatio);
            var top = (player.y * this.tileSize) + (player.offsetY * offsetRatio);
            var clipLeft = player.currentFrame * SPRITE_SIZE;
            var clipTop = 0;
            this.ctx.globalAlpha = 1;
            var image = this.playerImages[player.img];
            this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, left, top, this.tileSize, this.tileSize);
            if (left < 0) {
                // also draw on right
                var secondLeft = (this.tileSize * this.boardSize.width) + player.offsetX;
                this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, this.tileSize, this.tileSize);
            }
            if ((left + this.tileSize) > (this.tileSize * this.boardSize.width)) {
                // also draw on left
                var secondLeft = left - (this.tileSize * this.boardSize.width);
                this.ctx.drawImage(image, clipLeft, 0, SPRITE_SIZE, SPRITE_SIZE, secondLeft, top, this.tileSize, this.tileSize);
            }
        };
        Renderer.prototype.drawRotatingBoard = function (clockwise, completed) {
            var cw = this.canvas.width;
            var ch = this.canvas.height;
            var savedData = new Image();
            savedData.src = this.canvas.toDataURL("image/png");
            if (clockwise) {
                this.drawRotated(savedData, 1, 0, 90, completed);
            }
            else {
                this.drawRotated(savedData, -1, 0, -90, completed);
            }
        };
        Renderer.prototype.drawRotated = function (savedData, direction, angle, targetAngle, completed) {
            var _this = this;
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
            var offset = this.canvas.width / 2;
            var left = offset;
            var top = offset;
            this.wipeCanvas("rgba(0,0,0,0.1)");
            this.ctx.translate(left, top);
            this.ctx.rotate(angleInRad);
            this.ctx.drawImage(savedData, -offset, -offset);
            this.ctx.rotate(-angleInRad);
            this.ctx.translate(-left, -top);
            angle += (direction * this.jetpack.moveSpeed);
            this.animationHandle = window.requestAnimationFrame(function () {
                _this.drawRotated(savedData, direction, angle, targetAngle, completed);
            });
        };
        return Renderer;
    }());
    exports.Renderer = Renderer;
});
define("Player", ["require", "exports", "Coords"], function (require, exports, Coords_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SPRITE_SIZE = 64;
    var Player = (function () {
        function Player(params, map, renderer, jetpack, collisions) {
            this.x = 0;
            this.y = 0;
            this.offsetX = 0;
            this.offsetY = 0;
            this.direction = 0;
            this.oldDirection = 0;
            this.currentFrame = 0;
            this.id = 0;
            this.frames = 1;
            this.multiplier = 1;
            this.falling = false;
            this.type = "egg";
            this.moveSpeed = 1;
            this.lastAction = "string";
            this.value = 1;
            for (var i in params) {
                this[i] = params[i];
            }
            this.map = map;
            this.renderer = renderer;
            this.jetpack = jetpack;
            this.collisions = collisions;
        }
        Player.prototype.doCalcs = function () {
            this.setRedrawAroundPlayer();
            this.incrementPlayerFrame();
            this.checkFloorBelowPlayer();
            this.incrementPlayerDirection();
            this.checkPlayerCollisions();
        };
        Player.prototype.getCoords = function () {
            return new Coords_1.Coords(this.x, this.y, this.offsetX, this.offsetY);
        };
        Player.prototype.setRedrawAroundPlayer = function () {
            // first just do the stuff around player
            for (var x = this.x - 1; x < this.x + 2; x++) {
                for (var y = this.y - 1; y < this.y + 2; y++) {
                    var coords = this.map.correctForOverflow(x, y);
                    this.map.board[coords.x][coords.y].needsDraw = true;
                }
            }
        };
        Player.prototype.incrementPlayerFrame = function () {
            if (this.direction === 0 && this.oldDirection === 0 && this.currentFrame === 0) {
                // we are still, as it should be
                return false;
            }
            if (this.direction === 0 && this.currentFrame === 0) {
                // if we're still, and have returned to main frame, disregard old movement
                this.oldDirection = 0;
            }
            // if going left, reduce frame
            if (this.direction < 0 || this.oldDirection < 0) {
                this.currentFrame--;
                if (this.currentFrame < 0)
                    this.currentFrame = (this.frames - 1);
            }
            // if going left, reduce frame
            if (this.direction > 0 || this.oldDirection > 0) {
                this.currentFrame++;
                if (this.currentFrame >= this.frames)
                    this.currentFrame = 0;
            }
        };
        Player.prototype.checkPlayerTileAction = function () {
            if (this.offsetX != 0 || this.offsetY != 0)
                return false;
            var coords = this.map.correctForOverflow(this.x, this.y);
            var board = this.map.board;
            var tile = board[coords.x][coords.y];
            if (tile.collectable > 0) {
                var score = tile.collectable * this.multiplier;
                var blankTile = this.map.getTile(1);
                blankTile.needsDraw = true;
                board[coords.x][coords.y] = blankTile;
                this.jetpack.addScore(score);
                return true;
            }
            if (this.falling) {
                var belowCoords = this.map.correctForOverflow(coords.x, coords.y + 1);
                var tile_1 = board[belowCoords.x][belowCoords.y];
                if (tile_1.breakable) {
                    board[belowCoords.x][belowCoords.y] = this.map.getTile(1); // smash block, replace with empty
                    return true;
                }
            }
            var tile = board[coords.x][coords.y];
            if (tile.action == "rotateLeft") {
                this.jetpack.rotateBoard(false);
            }
            else if (tile.action == "rotateRight") {
                this.jetpack.rotateBoard(true);
            }
            else if (tile.action == "completeLevel") {
                this.jetpack.completeLevel();
            }
            else if (tile.action == "teleport") {
                this.teleport();
            }
        };
        Player.prototype.checkPlayerCollisions = function () {
            for (var i in this.jetpack.players) {
                var player = this.jetpack.players[i];
                this.collisions.checkCollision(this, player);
            }
        };
        // find another teleport and go to it
        // if no others, do nothing
        Player.prototype.teleport = function () {
            if (this.lastAction == "teleport")
                return false;
            var newTile = this.findTile(14);
            if (newTile) {
                this.x = newTile.x;
                this.y = newTile.y;
                this.lastAction = "teleport";
            }
        };
        // find random tile of type
        Player.prototype.findTile = function (id) {
            var _this = this;
            var tiles = this.map.getAllTiles();
            var teleporters = tiles.filter(function (tile) {
                if (tile.x == _this.x && tile.y == _this.y)
                    return false;
                return (tile.id == id);
            });
            if (teleporters.length == 0)
                return false; // no options
            var newTile = teleporters[Math.floor(Math.random() * teleporters.length)];
            return newTile;
        };
        Player.prototype.incrementPlayerDirection = function () {
            if (this.falling)
                return false;
            /*
            if (this.direction !== 0 && !this.checkTileIsEmpty(this.x - 1, this.y) && !this.checkTileIsEmpty(this.x + 1, this.y)) {
                // trapped
                this.oldDirection = this.direction;
                this.direction = 0;
                return false;
            }*/
            var moveAmount = this.calcMoveAmount(this.moveSpeed, this.renderer.tileSize);
            if (this.direction < 0) {
                if (!this.map.checkTileIsEmpty(this.x - 1, this.y)) {
                    // turn around
                    this.direction = 1;
                    this.offsetX = 0;
                }
                else {
                    // move
                    this.offsetX -= moveAmount;
                }
            }
            if (this.direction > 0) {
                if (!this.map.checkTileIsEmpty(this.x + 1, this.y)) {
                    // turn around
                    this.offsetX = 0;
                    this.direction = -1;
                }
                else {
                    // move
                    this.offsetX += moveAmount;
                }
            }
            // if we've stopped and ended up not quite squared up, correct this
            if (this.direction == 0 && this.falling == false) {
                if (this.offsetX > 0) {
                    this.offsetX -= moveAmount;
                }
                else if (this.offsetX < 0) {
                    this.offsetX += moveAmount;
                }
            }
            this.checkIfPlayerIsInNewTile();
        };
        Player.prototype.calcMoveAmount = function (moveSpeed, tileSize) {
            var fullSize = SPRITE_SIZE; // size of image tiles
            var moveAmount = (tileSize / fullSize) * moveSpeed;
            return Math.round(moveAmount);
        };
        Player.prototype.checkIfPlayerIsInNewTile = function () {
            if (this.offsetX > SPRITE_SIZE) {
                this.offsetX = 0;
                this.x++;
                this.lastAction = "";
                this.checkPlayerTileAction();
            }
            if (this.offsetX < (-1 * SPRITE_SIZE)) {
                this.offsetX = 0;
                this.x--;
                this.lastAction = "";
                this.checkPlayerTileAction();
            }
            if (this.offsetY > SPRITE_SIZE) {
                this.offsetY = 0;
                this.y++;
                this.lastAction = "";
                this.checkPlayerTileAction();
            }
            if (this.offsetY < (-1 * SPRITE_SIZE)) {
                this.offsetY = 0;
                this.y--;
                this.lastAction = "";
                this.checkPlayerTileAction();
            }
            // have we gone over the edge?
            var coords = this.map.correctForOverflow(this.x, this.y);
            this.x = coords.x;
            this.y = coords.y;
        };
        Player.prototype.checkFloorBelowPlayer = function () {
            if (this.offsetX !== 0)
                return false;
            var coords = this.map.correctForOverflow(this.x, this.y + 1);
            var tile = this.map.board[coords.x][coords.y];
            if (tile.background) {
                var moveAmount = this.calcMoveAmount(this.moveSpeed, this.renderer.tileSize);
                var fallAmount = Math.round(moveAmount * 1.5);
                this.falling = true;
                this.offsetY += fallAmount;
            }
            else if (this.falling && tile.breakable) {
                this.checkPlayerTileAction();
            }
            else {
                this.falling = false;
            }
            this.checkIfPlayerIsInNewTile();
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
define("Map", ["require", "exports", "Coords", "Tile"], function (require, exports, Coords_2, Tile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Map = (function () {
        function Map(tileSet, boardSize, board) {
            if (board === void 0) { board = []; }
            this.renderAngle = 0;
            this.board = [];
            this.tileSet = tileSet;
            this.boardSize = boardSize;
            this.board = this.correctBoardSizeChange(board, boardSize);
            this.markAllForRedraw();
        }
        Map.prototype.updateBoard = function (board, boardSize) {
            this.board = board;
            this.boardSize = boardSize;
        };
        Map.prototype.correctForOverflow = function (x, y) {
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
            return new Coords_2.Coords(newX, newY);
        };
        // is intended next tile empty / a wall?
        Map.prototype.checkTileIsEmpty = function (x, y) {
            var coords = this.correctForOverflow(x, y);
            var tile = this.board[coords.x][coords.y];
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
                    var blankTile = this.getTile(1);
                    board[x][y] = blankTile;
                }
            }
            return board;
        };
        Map.prototype.generateRandomBoard = function () {
            var board = [];
            for (var x = 0; x < this.boardSize.width; x++) {
                board[x] = [];
                for (var y = 0; y < this.boardSize.height; y++) {
                    var blankTile = this.getRandomTile(this.tiles);
                    board[x][y] = blankTile;
                }
            }
            return board;
        };
        Map.prototype.getPrototypeTile = function (id) {
            return this.tileSet.getTile(id);
        };
        Map.prototype.getTile = function (id) {
            var prototypeTile = this.getPrototypeTile(id);
            var tile = new Tile_1.Tile(prototypeTile); // create new Tile object with these 
            return tile;
        };
        Map.prototype.getRandomTile = function (tiles) {
            var _this = this;
            var randomProperty = function (obj) {
                var keys = Object.keys(obj);
                var randomKey = keys[keys.length * Math.random() << 0];
                return _this.getTile(randomKey);
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
        Map.prototype.translateRotation = function (x, y, clockwise) {
            var coords = {
                x: 0,
                y: 0,
            };
            var width = this.boardSize.width - 1;
            var height = this.boardSize.height - 1;
            if (clockwise) {
                // 0,0 -> 9,0
                // 9,0 -> 9,9
                // 9,9 -> 0,9
                // 0,9 -> 0,0
                coords.x = width - y;
                coords.y = x;
            }
            else {
                // 0,0 -> 0,9
                // 0,9 -> 9,9
                // 9,9 -> 9,0
                // 9,0 -> 0,0
                coords.x = y;
                coords.y = height - x;
            }
            return coords;
        };
        Map.prototype.rotateBoard = function (clockwise) {
            var newBoard = this.getBlankBoard();
            var width = this.boardSize.width - 1;
            var height = this.boardSize.height - 1;
            for (var x in this.board) {
                for (var y in this.board[x]) {
                    var coords = this.translateRotation(x, y, clockwise);
                    newBoard[coords.x][coords.y] = this.board[x][y];
                    newBoard[coords.x][coords.y].needsDraw = true;
                }
            }
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
            var coords = this.translateRotation(player.x, player.y, clockwise);
            player.x = coords.x;
            player.y = coords.y;
            player.offsetX = 0; //offsetX;
            player.offsetY = 0; //offsetY;
            // if player is still, nudge them in rotation direction
            if (player.direction == 0) {
                if (clockwise) {
                    player.direction = 1;
                }
                else {
                    player.direction = -1;
                }
            }
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
            var newKey = false, nextKey = false;
            for (var i in keys) {
                if (newKey === false || nextKey)
                    newKey = keys[i];
                if (keys[i] == currentKey) {
                    nextKey = true;
                }
                else {
                    nextKey = false;
                }
            }
            var tile = this.getTile(newKey);
            this.board[x][y] = tile;
        };
        Map.prototype.shrinkBoard = function () {
            this.boardSize.shrink();
            this.board = this.correctBoardSizeChange(this.board, this.boardSize);
        };
        Map.prototype.growBoard = function () {
            this.boardSize.grow();
            this.board = this.correctBoardSizeChange(this.board, this.boardSize);
        };
        Map.prototype.correctBoardSizeChange = function (board, boardSize) {
            var newBoard = [];
            var currentWidth = board.length;
            var currentHeight = board[0].length;
            for (var x = 0; x < boardSize.width; x++) {
                newBoard[x] = [];
                for (var y = 0; y < boardSize.height; y++) {
                    if (x < currentWidth && y < currentHeight) {
                        // using current board
                        newBoard[x][y] = board[x][y];
                    }
                    else {
                        // adding blank tiles
                        newBoard[x][y] = this.getTile(1);
                    }
                }
            }
            return newBoard;
        };
        return Map;
    }());
    exports.Map = Map;
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
            };
        }
        PlayerTypes.prototype.getPlayerTypes = function () {
            return this.playerTypes;
        };
        return PlayerTypes;
    }());
    exports.PlayerTypes = PlayerTypes;
});
define("Jetpack", ["require", "exports", "Collisions", "Coords", "Levels", "Loader", "Map", "Player", "PlayerTypes", "Renderer", "TileSet", "BoardSize"], function (require, exports, Collisions_1, Coords_3, Levels_1, Loader_1, Map_1, Player_1, PlayerTypes_1, Renderer_1, TileSet_1, BoardSize_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Jetpack = (function () {
        function Jetpack() {
            this.paused = true;
            this.editMode = false;
            this.moveSpeed = 15;
            this.levelID = 1;
            this.nextPlayerID = 1;
            this.score = 0;
            this.collectable = 0; // total points on screen
            this.playerTypes = {};
            this.defaultBoardSize = 20;
        }
        Jetpack.prototype.go = function () {
            var _this = this;
            this.bootstrap();
            this.bindSizeHandler();
            this.bindClickHandler();
            this.bindKeyboardHandler();
            this.pauseRender();
            this.renderer.renderTitleScreen(function () {
                _this.loadLevel(_this.levelID, function () {
                    _this.createPlayers();
                    _this.resetScore(0);
                    _this.startRender();
                });
            });
        };
        // go function but for edit mode
        Jetpack.prototype.edit = function () {
            var _this = this;
            this.bootstrap();
            this.levels.getLevelList();
            this.editMode = true;
            this.bindSizeHandler();
            this.bindClickHandler();
            var s = setTimeout(function () {
                _this.startRender();
            }, 1000);
        };
        // load static stuff - map/renderer etc will be worked out later
        Jetpack.prototype.bootstrap = function () {
            this.tileSet = new TileSet_1.TileSet();
            var playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            this.collisions = new Collisions_1.Collisions(this, this.playerTypes); // pass the data, not the object
            var apiLocation = "http://" + window.location.hostname + "/levels/";
            var loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(this, loader);
        };
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        Jetpack.prototype.createRenderer = function (board, size) {
            if (board === void 0) { board = []; }
            if (size === void 0) { size = 12; }
            this.boardSize = new BoardSize_1.BoardSize(size);
            this.map = new Map_1.Map(this.tileSet, this.boardSize, board);
            var tiles = this.tileSet.getTiles();
            this.renderer = new Renderer_1.Renderer(this, this.map, tiles, this.playerTypes, this.boardSize);
        };
        Jetpack.prototype.startRender = function () {
            var _this = this;
            if (!this.paused)
                return false;
            window.cancelAnimationFrame(this.animationHandle);
            this.map.markAllForRedraw();
            this.paused = false;
            this.showControls();
            this.animationHandle = window.requestAnimationFrame(function () { return _this.renderer.render(); });
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
            var playerCount = this.countPlayers();
            if (this.collectable < 1 && playerCount < 2) {
                this.nextLevel();
            }
        };
        Jetpack.prototype.nextLevel = function () {
            this.levelID++;
            this.go();
        };
        Jetpack.prototype.pauseRender = function () {
            this.paused = true;
            this.hideControls();
            window.cancelAnimationFrame(this.animationHandle);
        };
        Jetpack.prototype.showControls = function () {
            var controlHeader = document.getElementById('controlHeader');
            if (controlHeader.classList.contains('hidden')) {
                controlHeader.classList.remove('hidden');
            }
        };
        Jetpack.prototype.hideControls = function () {
            var controlHeader = document.getElementById('controlHeader');
            if (!controlHeader.classList.contains('hidden')) {
                controlHeader.classList.add('hidden');
            }
        };
        Jetpack.prototype.doPlayerCalcs = function () {
            for (var i in this.players) {
                var player = this.players[i];
                player.doCalcs();
            }
        };
        Jetpack.prototype.countPlayers = function () {
            var count = 0;
            for (var i in this.players) {
                if (this.players[i])
                    count++;
            }
            return count;
        };
        // cycle through all map tiles, find egg cups etc and create players
        Jetpack.prototype.createPlayers = function () {
            var _this = this;
            this.destroyPlayers();
            var tiles = this.map.getAllTiles();
            tiles.map(function (tile) {
                var type = tile.createPlayer;
                if (type) {
                    var coords = new Coords_3.Coords(tile.x, tile.y);
                    _this.createNewPlayer(type, coords, 1);
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
            params.currentFrame = 0;
            params.x = coords.x; // x in tiles
            params.y = coords.y; // y in tiles
            params.direction = direction;
            params.oldDirection = 0;
            params.falling = false; // can't move when falling
            params.offsetX = coords.offsetX;
            params.offsetY = coords.offsetY;
            params.moveSpeed = this.moveSpeed;
            var player = new Player_1.Player(params, this.map, this.renderer, this, this.collisions);
            this.players[player.id] = player;
            return player;
        };
        // make this actually fucking rotate, and choose direction, and do the visual effect thing
        Jetpack.prototype.rotateBoard = function (clockwise) {
            var _this = this;
            if (this.paused || this.editMode)
                return false;
            this.pauseRender();
            this.map.rotateBoard(clockwise);
            for (var i in this.players) {
                this.map.rotatePlayer(this.players[i], clockwise);
            }
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
            this.levels.saveLevel(this.map.board, this.map.boardSize, this.levels.levelID, function (levelID) {
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
            this.levels.loadLevel(levelID, function (data) {
                var text = "Level " + data.levelID + " loaded!";
                _this.showEditMessage(text);
                _this.createRenderer(data.board, data.boardSize.width);
                callback();
            }, function () {
                _this.createRenderer();
                _this.map.board = _this.generateRandomBoard();
                callback();
            });
        };
        Jetpack.prototype.generateRandomBoard = function () {
            this.map.board = this.map.generateRandomBoard();
            return this.map.board;
        };
        Jetpack.prototype.growBoard = function () {
            if (!this.editMode)
                return false;
            this.map.growBoard();
        };
        Jetpack.prototype.shrinkBoard = function () {
            if (!this.editMode)
                return false;
            this.map.shrinkBoard();
        };
        Jetpack.prototype.bindSizeHandler = function () {
            var _this = this;
            window.addEventListener("resize", function () {
                _this.renderer.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
            });
        };
        Jetpack.prototype.bindClickHandler = function () {
            var _this = this;
            var canvas = document.getElementById("canvas");
            canvas.addEventListener("click", function (event) {
                var tileSize = _this.renderer.tileSize;
                var coords = new Coords_3.Coords((event.offsetX / tileSize), (event.offsetY / tileSize), (event.offsetX % tileSize) - (tileSize / 2), (event.offsetY % tileSize) - (tileSize / 2));
                _this.handleClick(coords);
            });
        };
        Jetpack.prototype.bindKeyboardHandler = function () {
            var _this = this;
            window.addEventListener("keydown", function (event) {
                if (event.keyCode == "37") {
                    _this.rotateBoard(false);
                }
                if (event.keyCode == "39") {
                    _this.rotateBoard(true);
                }
            });
        };
        // coords is always x,y,offsetX, offsetY
        Jetpack.prototype.handleClick = function (coords) {
            if (this.editMode) {
                this.map.cycleTile(coords.x, coords.y);
            }
            else {
                // destroy tile or something
            }
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
        // only deal with horizontal collisions for now
        Collisions.prototype.checkCollision = function (player1, player2) {
            if (!player1 || !player2)
                return false;
            if (player1.id == player2.id)
                return false;
            if (player1.y != player2.y)
                return false;
            var coords1 = player1.getCoords();
            var coords2 = player2.getCoords();
            var distance = coords1.getActualPosition().fullX - coords2.getActualPosition().fullX;
            if (distance < 0)
                distance = distance * -1;
            if (distance < 40) {
                return this.combinePlayers(player1, player2);
            }
            return false;
        };
        Collisions.prototype.chooseHigherLevelPlayer = function (player1, player2) {
            if (player1.level > player2.level)
                return player1;
            if (player2.level > player1.level)
                return player2;
            if (player1.level == player2.level)
                return player1;
        };
        Collisions.prototype.combinePlayers = function (player1, player2) {
            //console.log('combinePlayers', player1, player2);
            var newValue = player1.value + player2.value;
            var higherPlayer = this.chooseHigherLevelPlayer(player1, player2);
            for (var type in this.playerTypes) {
                if (this.playerTypes[type].value == newValue) {
                    this.jetpack.createNewPlayer(type, higherPlayer, higherPlayer.direction);
                    this.jetpack.deletePlayer(player1);
                    this.jetpack.deletePlayer(player2);
                    return true;
                }
            }
            return false;
        };
        return Collisions;
    }());
    exports.Collisions = Collisions;
});
define("TitleScreen", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TitleScreen = (function () {
        function TitleScreen(canvas, imagePath, width, height) {
            this.canvas = canvas;
        }
        TitleScreen.prototype.render = function (callback) {
            var _this = this;
            //this.sizeCanvas();
            var titleImage = document.createElement("img");
            titleImage.addEventListener("load", function () {
                _this.drawTheBigEgg(titleImage, 0.02, true, callback);
            }, false);
            titleImage.setAttribute("src", this.imagesFolder + "large/the-egg.png");
            titleImage.setAttribute("width", 1024);
            titleImage.setAttribute("height", 1024);
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
            this.animationHandle = window.requestAnimationFrame(function () {
                _this.drawTheBigEgg(titleImage, opacity, show, callback);
            });
        };
        return TitleScreen;
    }());
    exports.TitleScreen = TitleScreen;
});
//# sourceMappingURL=Jetpack.js.map