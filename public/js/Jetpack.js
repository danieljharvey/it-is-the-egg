define("Editor", ["require", "exports", "./BoardSize", "./Canvas", "./Coords", "./Levels", "./Loader", "./Map", "./Renderer", "./RenderMap", "./TileChooser", "./TileSet", "./Utils"], function (require, exports, BoardSize_1, Canvas_1, Coords_1, Levels_1, Loader_1, Map, Renderer_1, RenderMap_1, TileChooser_1, TileSet_1, Utils_1) {
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
            this.boardSize = new BoardSize_1.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_1.Canvas(this.boardSize);
            const apiLocation = "http://" + window.location.hostname + "/levels/";
            const loader = new Loader_1.Loader(apiLocation);
            this.levels = new Levels_1.Levels(loader);
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
            this.boardSize = new BoardSize_1.BoardSize(newBoard.getLength());
            this.sizeCanvas(this.boardSize);
            this.updateBoard(newBoard);
            this.renderEverything(newBoard);
        }
        shrinkBoard() {
            const newBoard = Map.shrinkBoard(this.board);
            this.boardSize = new BoardSize_1.BoardSize(newBoard.getLength());
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
            this.boardSize = new BoardSize_1.BoardSize(this.board.getLength());
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
            const chosenKey = Utils_1.Utils.getRandomArrayKey(availableLevels);
            if (!chosenKey) {
                return false;
            }
            const levelID = availableLevels[chosenKey].levelID;
            return levelID;
        }
        // with no arguments this will cause a blank 12 x 12 board to be created and readied for drawing
        createRenderer(boardSize) {
            this.canvas = new Canvas_1.Canvas(boardSize);
            this.boardSize = boardSize;
            const tiles = TileSet_1.TileSet.getTiles();
            return new Renderer_1.Renderer(this, tiles, [], // no players in edit mode
            this.boardSize, this.canvas, () => {
                // 
            });
        }
        renderEverything(board) {
            const boardSize = new BoardSize_1.BoardSize(board.getLength());
            const blankMap = RenderMap_1.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(board, blankMap, [], 0);
        }
        renderSelected(board, renderMap) {
            this.renderer.render(board, renderMap, [], 0);
        }
        renderFromBoards(oldBoard, newBoard) {
            const renderMap = RenderMap_1.RenderMap.createRenderMapFromBoards(oldBoard, newBoard);
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
            const coords = new Coords_1.Coords({
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
define("Jetpack", ["require", "exports", "hammerjs", "ramda", "./AudioTriggers", "./BoardSize", "./Canvas", "./Coords", "Editor", "./GameState", "./Levels", "./Loader", "./Map", "./Player", "./PlayerTypes", "./Renderer", "./RenderMap", "./TheEgg", "./TileSet", "./TitleScreen", "./Utils", "./WebAudio"], function (require, exports, Hammer, _, AudioTriggers, BoardSize_2, Canvas_2, Coords_2, Editor_1, GameState_1, Levels_2, Loader_2, Map, Player_1, PlayerTypes_1, Renderer_2, RenderMap_2, TheEgg_1, TileSet_2, TitleScreen_1, Utils_2, WebAudio_1) {
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
                    this.canvas.gradientBackground();
                    this.startRender();
                });
            });
        }
        getEditor() {
            return new Editor_1.Editor();
        }
        // load static stuff - map/renderer etc will be worked out later
        bootstrap(callback) {
            const boardSize = new BoardSize_2.BoardSize(this.defaultBoardSize);
            this.canvas = new Canvas_2.Canvas(boardSize);
            const playerTypes = new PlayerTypes_1.PlayerTypes();
            this.playerTypes = playerTypes.getPlayerTypes();
            this.webAudio = new WebAudio_1.WebAudio();
            this.webAudio.init(); // load web audio stuff
            const apiLocation = "http://" + window.location.hostname + "/levels/";
            const loader = new Loader_2.Loader(apiLocation);
            this.levels = new Levels_2.Levels(loader);
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
            const chosenKey = Utils_2.Utils.getRandomArrayKey(availableLevels);
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
            this.canvas = new Canvas_2.Canvas(boardSize);
            this.boardSize = boardSize;
            const tiles = TileSet_2.TileSet.getTiles();
            return new Renderer_2.Renderer(this, tiles, this.playerTypes, this.boardSize, this.canvas, () => completedCallback());
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
            const boardSize = new BoardSize_2.BoardSize(gameState.board.getLength());
            const blankMap = RenderMap_2.RenderMap.createRenderMap(boardSize.width, true);
            this.renderer.render(gameState.board, blankMap, gameState.players, gameState.rotateAngle);
        }
        renderChanges(oldGameState, newGameState) {
            const boardSize = new BoardSize_2.BoardSize(newGameState.board.getLength());
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
                const coords = new Coords_2.Coords({
                    offsetX: 0,
                    offsetY: 0,
                    x: tile.x,
                    y: tile.y
                });
                const direction = new Coords_2.Coords({ x: 1 });
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
//# sourceMappingURL=Jetpack.js.map