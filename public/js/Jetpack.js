function Jetpack() {
    var self = this;
    this.paused = true;
    this.map; // Map object
    this.renderer; // Renderer object
    this.nextPlayerID = 1;
    this.score = 0;
    this.playerTypes = {
        'egg': {
            'type': 'egg',
            'title': "It is of course the egg",
            'img': 'egg-sprite.png',
            'frames': 18,
            'multiplier': 1
        },
        'red-egg': {
            'type': 'red-egg',
            'title': "It is of course the red egg",
            'img': 'egg-sprite-red.png',
            'frames': 18,
            'multiplier': 2
        },
        'blue-egg': {
            'type': 'blue-egg',
            'title': "It is of course the blue egg",
            'img': 'egg-sprite-blue.png',
            'frames': 18,
            'multiplier': 5
        },
        'yellow-egg': {
            'type': 'yellow-egg',
            'title': "It is of course the yellow egg",
            'img': 'egg-sprite-yellow.png',
            'frames': 18,
            'multiplier': 10
        }
    };
    this.players = [];
    this.go = function () {
        var tileSet = new TileSet();
        var tiles = tileSet.getTiles();
        this.map = new Map(tiles);
        this.renderer = new Renderer(this, this.map, tiles);
        this.bindSizeHandler();
        this.bindClickHandler();
        this.createPlayers();
        this.resetScore();
        var s = setTimeout(function () {
            self.startRender();
        }, 1000);
    };
    this.startRender = function () {
        if (!this.paused)
            return false;
        window.cancelAnimationFrame(this.animationHandle);
        this.map.markAllForRedraw();
        this.paused = false;
        this.animationHandle = window.requestAnimationFrame(self.renderer.render);
    };
    this.resetScore = function (score) {
        this.score = 0;
        this.addScore(0);
    };
    this.addScore = function (amount) {
        this.score += amount;
        var scoreElement = document.getElementById('score');
        scoreElement.innerHTML = this.score;
    };
    this.pauseRender = function () {
        this.paused = true;
        window.cancelAnimationFrame(this.animationHandle);
    };
    this.doPlayerCalcs = function () {
        for (var i in this.players) {
            var player = this.players[i];
            player.doCalcs();
        }
    };
    this.combinePlayers = function (player1, player2) {
        delete this.players[player1.id];
        delete this.players[player2.id];
        if (player1.type == 'egg' && player2.type == 'egg') {
            var type = 'red-egg';
            var coords = {
                'x': player2.x,
                'y': player2.y,
                'offsetX': player2.offsetX,
                'offsetY': player2.offsetY
            };
            var newPlayer = this.createNewPlayer(type, coords, player2.direction);
            this.players[newPlayer.id] = newPlayer;
        }
        else if (player1.type == 'egg' && player2.type == 'red-egg') {
            var type = 'blue-egg';
            var coords = {
                'x': player2.x,
                'y': player2.y,
                'offsetX': player2.offsetX,
                'offsetY': player2.offsetY
            };
            var newPlayer = this.createNewPlayer(type, coords, player2.direction);
            this.players[newPlayer.id] = newPlayer;
        }
        else if (player1.type == 'red-egg' && player2.type == 'egg') {
            var type = 'blue-egg';
            var coords = {
                'x': player1.x,
                'y': player1.y,
                'offsetX': player1.offsetX,
                'offsetY': player1.offsetY
            };
            var newPlayer = this.createNewPlayer(type, coords, player1.direction);
            this.players[newPlayer.id] = newPlayer;
        }
    };
    // only deal with horizontal collisions for now
    this.checkCollision = function (player1, player2) {
        if (!player1 || !player2)
            return false;
        if (player1.x == player2.x && player1.y == player2.y) {
            if (player1.offsetX == 0 && player1.offsetY == 0 && player2.offsetX == 0 && player2.offsetY == 0) {
                if (player1.falling || player2.falling) {
                    this.combinePlayers(player1, player2);
                    return false;
                }
            }
        }
        if (player1.y != player2.y)
            return false;
        // horizontal collisions
        if (player1.x == player2.x) {
            if (player1.offsetX == 0 && player2.offsetX == 0) {
                this.combinePlayers(player1, player2);
                return false;
            }
        }
        if (player1.offsetX > 0) {
            if (player1.x + 1 == player2.x && player2.offsetX < 0) {
                this.combinePlayers(player1, player2);
                return false;
                //player1.direction = -1; // flip direction
                //player2.direction = 1; // flip direction
            }
        }
        else if (player1.offsetX < 0) {
            if (player1.x - 1 == player2.x && player2.offsetX > 0) {
                this.combinePlayers(player1, player2);
                return false;
                //player1.direction = 1; // flip direction
                //player2.direction = -1; // flip direction
            }
        }
    };
    this.createPlayers = function () {
        for (var i = 0; i < 3; i++) {
            var x = parseInt(Math.random() * this.map.boardSize.width) - 1;
            var y = parseInt(Math.random() * this.map.boardSize.height) - 2;
            if (x < 0)
                x = 0;
            if (y < 0)
                y = 0;
            var type = 'egg';
            var coords = {
                'x': x,
                'y': y,
                'offsetX': 0,
                'offsetY': 0
            };
            var player = this.createNewPlayer(type, coords, 1);
            this.players[player.id] = player;
        }
    };
    // create player and load their sprite
    this.createNewPlayer = function (type, coords, direction) {
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
        params.image = document.createElement("img");
        params.image.setAttribute('src', this.renderer.getTileImagePath(params));
        var player = new Player(params, this.map);
        console.log(player);
        return player;
    };
    // make this actually fucking rotate, and choose direction, and do the visual effect thing
    this.rotateBoard = function (clockwise) {
        self.pauseRender();
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
        for (var i in this.players) {
            this.rotatePlayer(this.players[i], clockwise);
        }
        this.drawRotatingBoard(clockwise);
        return newBoard;
    };
    this.rotatePlayer = function (player, clockwise) {
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
    this.drawRotatingBoard = function (clockwise) {
        var cw = this.canvas.width;
        var ch = this.canvas.height;
        var savedData = new Image();
        savedData.src = this.canvas.toDataURL("image/png");
        if (clockwise) {
            this.drawRotated(savedData, 1, 0, 90);
        }
        else {
            this.drawRotated(savedData, -1, 0, -90);
        }
    };
    this.drawRotated = function (savedData, direction, angle, targetAngle) {
        if (direction > 0) {
            if (angle >= targetAngle) {
                self.startRender();
                return false;
            }
        }
        else {
            if (angle <= targetAngle) {
                self.startRender();
                return false;
            }
        }
        var angleInRad = angle * (Math.PI / 180);
        var offset = this.canvas.width / 2;
        var left = offset;
        var top = offset;
        self.wipeCanvas('rgba(0,0,0,0.1)');
        this.ctx.translate(left, top);
        this.ctx.rotate(angleInRad);
        this.ctx.drawImage(savedData, -offset, -offset);
        this.ctx.rotate(-angleInRad);
        this.ctx.translate(-left, -top);
        angle += (direction * this.moveSpeed);
        this.animationHandle = window.requestAnimationFrame(function () {
            self.drawRotated(savedData, direction, angle, targetAngle);
        });
    };
    this.bindSizeHandler = function () {
        window.addEventListener('resize', function () {
            self.checkResize = true; // as this event fires quickly - simply request system check new size on next redraw
        });
    };
    this.bindClickHandler = function () {
        var canvas = document.getElementById('canvas');
        canvas.addEventListener('click', function (event) {
            var coords = {
                x: parseInt(event.offsetX / self.tileSize),
                y: parseInt(event.offsetY / self.tileSize),
                offsetX: (event.offsetX % self.tileSize) - (self.tileSize / 2),
                offsetY: (event.offsetY % self.tileSize) - (self.tileSize / 2)
            };
            self.handleClick(coords);
        });
    };
    // coords is always x,y,offsetX, offsetY
    this.handleClick = function (coords) {
        this.cycleTile(coords.x, coords.y);
    };
    this.cycleTile = function (x, y) {
        var currentTile = this.board[x][y];
        var currentKey = currentTile.id;
        var keys = Object.keys(this.tiles);
        var newKey = nextKey = false;
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
}
function Map(tiles) {
    var self = this;
    this.tiles = tiles;
    this.tileSize = 48;
    this.boardSize = {
        width: 14,
        height: 14
    };
    this.board = [];
    this.construct = function () {
        var board = this.generateRandomBoard();
        this.board = this.addWaterToBoard(board);
    };
    this.correctForOverflow = function (x, y) {
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
        return { 'x': newX, 'y': newY };
    };
    this.getTileProperty = function (tile, property) {
        if (!tile.hasOwnProperty(property))
            return false;
        return tile[property];
    };
    this.tileIsBreakable = function (tile) {
        return this.getTileProperty(tile, 'breakable');
    };
    // is intended next tile empty / a wall?
    this.checkTileIsEmpty = function (x, y) {
        //var x = player.x + player.direction;
        if (x >= this.boardSize.width) {
            x = 0; // wrap around
        }
        if (x < 0) {
            x = this.boardSize.width - 1; // wrap around
        }
        var tile = this.board[x][y];
        return tile.background;
    };
    this.tileIsFrontLayer = function (tile) {
        return this.getTileProperty(tile, 'frontLayer');
    };
    this.markAllForRedraw = function () {
        // force redraw
        for (var x in this.board) {
            for (var y in this.board[x]) {
                this.board[x][y].needsDraw = true;
            }
        }
    };
    this.getTileAction = function (tile) {
        return this.getTileProperty(tile, 'action');
    };
    this.generateRandomBoard = function () {
        var board = [];
        for (var x = 0; x < this.boardSize.width; x++) {
            board[x] = [];
            for (var y = 0; y < this.boardSize.height; y++) {
                var randomTile = this.getRandomTile(this.tiles);
                board[x][y] = randomTile;
            }
        }
        return board;
    };
    this.addWaterToBoard = function (board) {
        return board; // don't do this for now
        var bottomRow = this.boardSize.height - 1; // compensate for beginning at zero
        for (var x = 0; x < this.boardSize.width; x++) {
            var waterTile = this.getTile(1);
            board[x][bottomRow] = waterTile;
        }
        return board;
    };
    this.getTile = function (id) {
        var tile = JSON.parse(JSON.stringify(this.tiles[id])); // create copy of object so we're not changing original
        return tile;
    };
    this.getRandomTile = function (tiles) {
        var randomProperty = function (obj) {
            var keys = Object.keys(obj);
            var randomKey = keys[keys.length * Math.random() << 0];
            return self.getTile(randomKey);
        };
        var theseTiles = JSON.parse(JSON.stringify(tiles));
        // remove unwanted tiles
        for (var i in theseTiles) {
            if (this.getTileProperty(theseTiles[i], 'dontAdd')) {
                delete theseTiles[i];
            }
        }
        return randomProperty(theseTiles);
    };
    this.getBlankBoard = function () {
        var newBoard = [];
        for (var x = 0; x < this.boardSize.width; x++) {
            newBoard[x] = [];
            for (var y = 0; y < this.boardSize.height; y++) {
                newBoard[x][y] = [];
            }
        }
        return newBoard;
    };
    this.translateRotation = function (x, y, clockwise) {
        var coords = {
            x: 0,
            y: 0
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
    this.construct();
}
function Player(params, map) {
    var self = this;
    this.construct = function (params, map) {
        for (var i in params) {
            this[i] = params[i];
        }
        this.map = map;
    };
    this.doCalcs = function () {
        this.setRedrawAroundPlayer();
        this.incrementPlayerFrame();
        //this.checkFloorBelowPlayer(player);
        //this.incrementPlayerDirection(player);	
        //this.checkPlayerCollisions(player);
    };
    this.setRedrawAroundPlayer = function () {
        // first just do the stuff around player
        for (var x = this.x - 1; x < this.x + 2; x++) {
            for (var y = this.y - 1; y < this.y + 2; y++) {
                var coords = this.map.correctForOverflow(x, y);
                this.map.board[coords.x][coords.y].needsDraw = true;
            }
        }
    };
    this.incrementPlayerFrame = function () {
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
    this.checkPlayerTileAction = function () {
        if (this.offsetX != 0 || this.offsetY != 0)
            return false;
        var board = this.map.board;
        var tile = board[this.x][this.y];
        var collectable = this.map.getTileProperty(tile, 'collectable');
        if (collectable) {
            var score = collectable * this.multiplier;
            this.addScore(score);
            var blankTile = this.map.getTile(1);
            blankTile.needsDraw = true;
            board[this.x][this.y] = blankTile;
        }
        if (this.falling) {
            var coords = this.map.correctForOverflow(this.x, this.y + 1);
            var tile = board[coords.x][coords.y];
            if (this.tileIsBreakable(tile)) {
                board[coords.x][coords.y] = this.map.getTile(1); // smash block, replace with empty
            }
        }
        else {
            var tile = board[this.x][this.y];
            var action = this.map.getTileAction(tile);
            if (action == 'rotateLeft') {
                this.map.rotateBoard(false);
            }
            else if (action == 'rotateRight') {
                this.map.rotateBoard(true);
            }
        }
    };
    this.checkPlayerCollisions = function (player) {
        for (var i in this.players) {
            var player2 = this.players[i];
            if (player.id !== player2.id) {
                this.checkCollision(player, player2);
            }
        }
    };
    this.incrementPlayerDirection = function (player) {
        if (player.falling)
            return false;
        /*
        if (player.direction !== 0 && !this.checkTileIsEmpty(player.x - 1, player.y) && !this.checkTileIsEmpty(player.x + 1, player.y)) {
            // trapped
            player.oldDirection = player.direction;
            player.direction = 0;
            return false;
        }*/
        if (player.direction < 0) {
            if (!this.checkTileIsEmpty(player.x - 1, player.y)) {
                // turn around
                player.direction = 1;
            }
            else {
                // move
                player.offsetX -= this.moveSpeed;
                ;
            }
        }
        if (player.direction > 0) {
            if (!this.checkTileIsEmpty(player.x + 1, player.y)) {
                // turn around
                player.direction = -1;
            }
            else {
                // move
                player.offsetX += this.moveSpeed;
                ;
            }
        }
        // if we've stopped and ended up not quite squared up, correct this
        if (player.direction == 0 && player.falling == false) {
            if (player.offsetX > 0) {
                player.offsetX -= this.moveSpeed;
            }
            else if (player.offSetX < 0) {
                player.offsetX += this.moveSpeed;
            }
        }
        this.checkIfPlayerIsInNewTile(player);
    };
    this.checkIfPlayerIsInNewTile = function (player) {
        if (player.offsetX > this.tileSize) {
            player.offsetX = 0;
            this.checkPlayerTileAction(player);
            player.x++;
            if (player.x >= this.boardSize.width) {
                player.x = 0; // wrap around
            }
        }
        if (player.offsetX < (-1 * this.tileSize)) {
            player.offsetX = 0;
            this.checkPlayerTileAction(player);
            player.x--;
            if (player.x < 0) {
                player.x = this.boardSize.width - 1; // wrap around
            }
        }
        if (player.offsetY > this.tileSize) {
            player.offsetY = 0;
            this.checkPlayerTileAction(player);
            player.y++;
            if (player.y >= this.boardSize.height) {
                player.y = 0; // wrap around
            }
        }
        if (player.offsetY < (-1 * this.tileSize)) {
            player.offsetY = 0;
            this.checkPlayerTileAction(player);
            player.y--;
            if (player.y < 0) {
                player.y = this.boardSize.height - 1; // wrap around
            }
        }
    };
    this.checkFloorBelowPlayer = function (player) {
        if (player.offsetX !== 0)
            return false;
        var coords = this.correctForOverflow(player.x, player.y + 1);
        var tile = this.board[coords.x][coords.y];
        if (tile.background) {
            player.falling = true;
            player.offsetY += this.moveSpeed;
        }
        else if (player.falling && this.tileIsBreakable(tile)) {
            player.offsetY += this.moveSpeed;
        }
        else {
            player.falling = false;
            this.checkPlayerTileAction(player);
        }
        this.checkIfPlayerIsInNewTile(player);
    };
    this.construct(params, map);
}
function Renderer(jetpack, map, tiles) {
    var self = this;
    this.construct = function (Jetpack, Map, object) {
        this.jetpack = jetpack;
        this.map = map;
        this.tiles = tiles;
        this.loadTilePalette();
        this.loadCanvas();
    };
    this.tileSize = 48;
    this.moveSpeed = 7;
    this.renderAngle = 0;
    this.checkResize = true;
    this.imagesFolder = 'img/';
    this.animationHandle;
    this.canvas; // canvas object
    this.ctx; // canvas context for drawing
    this.tileImages = {}; // image elements of tiles
    this.render = function () {
        if (this.jetpack.paused)
            return false;
        self.sizeCanvas();
        //self.wipeCanvas('rgba(0,0,0,0.02)');
        self.renderBoard();
        self.renderPlayers();
        self.renderFrontLayerBoard();
        self.jetpack.doPlayerCalcs();
        //self.wipeCanvas('rgba(255,255,0,0.04)');	
        self.animationHandle = window.requestAnimationFrame(self.render);
    };
    this.loadTilePalette = function () {
        for (var i in this.tiles) {
            var thisTile = this.tiles[i];
            var tileImage = document.createElement("img");
            tileImage.setAttribute('src', this.getTileImagePath(thisTile));
            tileImage.setAttribute('width', 64);
            tileImage.setAttribute('height', 64);
            this.tileImages[thisTile.id] = tileImage;
        }
    };
    this.getTileImagePath = function (tile) {
        return this.imagesFolder + tile.img;
    };
    this.sizeCanvas = function () {
        if (!this.checkResize)
            return false;
        var maxBoardSize = this.getMaxBoardSize();
        this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + 'px';
        this.tileSize = maxBoardSize / this.map.boardSize.width;
        this.loadCanvas();
        this.map.markAllForRedraw();
        this.checkResize = false; // all done
    };
    this.getMaxBoardSize = function () {
        var width = window.innerWidth;
        var height = window.innerHeight;
        var controlHeader = document.getElementById('controlHeader');
        height = height - (controlHeader.offsetHeight * 2);
        width = width - (controlHeader.offsetHeight * 2);
        if (width > height) {
            var difference = (height % this.map.boardSize.width);
            height = height - difference;
            return height;
        }
        else {
            var difference = (width % this.map.boardSize.width);
            width = width - difference;
            return width;
        }
    };
    this.wipeCanvas = function (fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    this.loadCanvas = function () {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = this.map.boardSize.width * this.tileSize;
        this.canvas.height = this.map.boardSize.height * this.tileSize;
        this.ctx = this.canvas.getContext("2d");
    };
    this.renderBoard = function () {
        for (var x = 0; x < this.map.boardSize.width; x++) {
            for (var y = 0; y < this.map.boardSize.height; y++) {
                var tile = this.map.board[x][y];
                if (tile.needsDraw === false) {
                    this.showUnrenderedTile(x, y);
                    continue;
                }
                var frontLayer = this.tileIsFrontLayer(tile);
                if (!frontLayer) {
                    if (this.renderTile(x, y, tile, false)) {
                        tile.needsDraw = false;
                        tile.drawnBefore = true;
                    }
                }
                else {
                    // render sky behind see through tiles
                    this.drawSkyTile(tile, x, y);
                }
            }
        }
    };
    this.tileIsFrontLayer = function (tile) {
        return this.map.getTileProperty(tile, 'frontLayer');
    };
    this.drawSkyTile = function (tile, x, y) {
        var skyTile = this.map.getTile(1);
        var skyTileImage = this.tileImages[skyTile.id];
        this.renderTile(x, y, tile, skyTileImage);
    };
    // just go over and draw the over-the-top stuff
    this.renderFrontLayerBoard = function () {
        for (var x = 0; x < this.map.boardSize.width; x++) {
            for (var y = 0; y < this.map.boardSize.height; y++) {
                var tile = this.map.board[x][y];
                if (tile.needsDraw === false)
                    continue;
                if (this.tileIsFrontLayer(tile)) {
                    if (this.renderTile(x, y, tile, false)) {
                        tile.needsDraw = false;
                        tile.drawnBefore = true;
                    }
                }
            }
        }
    };
    // debugging tools
    this.showUnrenderedTile = function (x, y) {
        return false;
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    };
    this.renderPlayers = function () {
        for (var i in this.jetpack.players) {
            var player = this.jetpack.players[i];
            this.renderPlayer(player);
        }
    };
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
        if (this.renderAngle == 0 || this.getTileProperty(tile, 'dontRotate')) {
            this.ctx.drawImage(img, left, top, this.tileSize, this.tileSize);
        }
        else {
            var angleInRad = this.renderAngle * (Math.PI / 180);
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
    this.renderPlayer = function (player) {
        var left = (player.x * this.tileSize) + player.offsetX;
        var top = (player.y * this.tileSize) + player.offsetY;
        var clipLeft = player.currentFrame * 64;
        var clipTop = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, left, top, this.tileSize, this.tileSize);
        if (left < 0) {
            // also draw on right
            var secondLeft = (this.tileSize * this.boardSize.width) + player.offsetX;
            this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, secondLeft, top, this.tileSize, this.tileSize);
        }
        if ((left + this.tileSize) > (this.tileSize * this.boardSize.width)) {
            // also draw on left
            var secondLeft = left - (this.tileSize * this.boardSize.width);
            this.ctx.drawImage(player.image, clipLeft, 0, 64, 64, secondLeft, top, this.tileSize, this.tileSize);
        }
    };
    this.construct(jetpack, map, tiles);
}
function TileSet() {
    this.getTiles = function () {
        var tiles = {
            1: {
                'id': 1,
                'title': 'Sky',
                'img': 'sky.png',
                'background': true,
                'needsDraw': true
            },
            2: {
                'id': 2,
                'title': 'Fabric',
                'img': 'fabric.png',
                'background': false,
                'needsDraw': true
            },
            3: {
                'id': 3,
                'title': 'Cacti',
                'img': 'cacti.png',
                'background': true,
                'needsDraw': true,
                'frontLayer': true,
                'collectable': 1
            },
            4: {
                'id': 4,
                'title': 'Plant',
                'img': 'plant.png',
                'background': true,
                'needsDraw': true,
                'frontLayer': true,
                'collectable': 10
            },
            5: {
                'id': 5,
                'title': 'Crate',
                'img': 'crate.png',
                'background': false,
                'needsDraw': true,
                'breakable': true
            },
            8: {
                'id': 8,
                'title': 'Work surface 2',
                'img': 'work-surface-2.png',
                'background': false,
                'needsDraw': true
            },
            9: {
                'id': 9,
                'title': 'Work surface 3',
                'img': 'work-surface-3.png',
                'background': false,
                'needsDraw': true
            },
            10: {
                'id': 10,
                'title': 'Work surface 4',
                'img': 'work-surface-4.png',
                'background': false,
                'needsDraw': true
            },
            11: {
                'id': 11,
                'title': 'Tiles',
                'img': 'tile.png',
                'background': false,
                'needsDraw': true
            },
        };
        return tiles;
    };
}
//# sourceMappingURL=Jetpack.js.map