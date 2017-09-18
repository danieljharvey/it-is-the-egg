import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Player } from "./Player";
import { Tile } from "./Tile";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;
const OFFSET_DIVIDE: number = 100;

export class Renderer {
  public tileSize: number;

  protected jetpack: Jetpack;
  protected map: Map;
  protected tiles: object;
  protected playerTypes: object;
  protected boardSize: BoardSize;
  protected canvas: Canvas;

  protected lampMode: boolean = false; // lamp mode only draws around the eggs

  protected renderMap: boolean[][]; // map of screen with whether it needs rendering

  protected checkResize: boolean = true;

  protected tileImages: object = {}; // image elements of tiles
  protected playerImages: object = {}; // image element of players

  constructor(
    jetpack: Jetpack,
    map: Map,
    tiles: object,
    playerTypes: object,
    boardSize: BoardSize,
    canvas: Canvas
  ) {
    this.jetpack = jetpack;
    this.map = map;
    this.tiles = tiles;
    this.playerTypes = playerTypes;
    this.boardSize = boardSize;
    this.canvas = canvas;
    this.loadTilePalette();
    this.loadPlayerPalette();
    this.renderMap = this.createRenderMap(boardSize);
  }

  public render() {
    this.tileSize = this.canvas.calcTileSize(this.boardSize);
    this.renderBoard();
    this.renderPlayers();
    this.renderFrontLayerBoard();
  }

  public resize() {
    this.tileSize = this.canvas.sizeCanvas(this.boardSize);
    this.renderMap = this.createRenderMap(this.boardSize); // re-create render map
  }

  public drawRotatingBoard(clockwise: boolean, completed: () => void) {
    this.renderMap = this.createRenderMap(this.boardSize); // set redraw on everything to GREAT

    const canvas = this.canvas.getCanvas();

    const cw = canvas.width;
    const ch = canvas.height;

    const savedData = new Image();
    savedData.src = canvas.toDataURL("image/png");

    if (clockwise) {
      this.drawRotated(savedData, 1, 0, 90, completed);
    } else {
      this.drawRotated(savedData, -1, 0, -90, completed);
    }
  }

  public getTileImagePath(tile: Tile): string {
    return this.canvas.imagesFolder + tile.img;
  }

  public setRenderMap(value: boolean, x: number, y: number) {
    const coords = new Coords({ x, y });

    const fixedCoords = Utils.correctForOverflow(coords, this.boardSize);
    this.renderMap[fixedCoords.x][fixedCoords.y] = value;
  }

  public getRenderMapValue(x: number, y: number): boolean {
    return this.renderMap[x][y];
  }

  // create new render map where every tile needs redrawing
  public createRenderMap(boardSize: BoardSize) {
    const renderMap = [];
    for (let x = 0; x < boardSize.width; x++) {
      renderMap[x] = [];
      for (let y = 0; y < boardSize.height; y++) {
        renderMap[x][y] = !this.lampMode;
      }
    }
    return renderMap;
  }

  public markPlayerRedraw(coords: Coords) {
    const startX = coords.x - 1; // coords.offsetX !== 0 ? coords.x - 1 : coords.x;
    const endX = coords.x + 1; // coords.offsetX !== 0 ? coords.x + 1 : coords.x;

    const startY = coords.y - 1; // coords.offsetY !== 0 ? coords.y - 1 : coords.y;
    const endY = coords.y + 1; // coords.offsetY !== 0 ? coords.y + 1 : coords.y;

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        this.setRenderMap(true, x, y);
      }
    }
    this.addExtraRedraws(coords);
  }

  // if in night time mode randomly glow a few tiles around the players too because that'll be nice
  protected addExtraRedraws(coords: Coords) {
    if (!this.lampMode) {
      return false;
    }
    const randX = Math.floor(Math.random() * 2 - 1);
    const randY = Math.floor(Math.random() * 2 - 1);
    this.setRenderMap(true, coords.x + randX, coords.y + randY);
  }

  protected loadTilePalette() {
    for (const i in this.tiles) {
      if (this.tiles[i] !== undefined) {
        const thisTile = this.tiles[i];
        const tileImage = document.createElement("img");
        tileImage.setAttribute("src", this.getTileImagePath(thisTile));
        tileImage.setAttribute("width", SPRITE_SIZE.toString());
        tileImage.setAttribute("height", SPRITE_SIZE.toString());
        tileImage.addEventListener(
          "load",
          () => {
            this.markTileImageAsLoaded(thisTile.id);
          },
          false
        );
        this.tileImages[thisTile.id] = {
          image: tileImage,
          ready: false
        };
      }
    }
  }

  protected loadPlayerPalette() {
    for (const i in this.playerTypes) {
      if (this.playerTypes[i] !== undefined) {
        const playerType = this.playerTypes[i];
        const playerImage = document.createElement("img");
        playerImage.setAttribute("src", this.getTileImagePath(playerType));
        playerImage.addEventListener(
          "load",
          () => {
            this.markPlayerImageAsLoaded(playerType.img);
          },
          false
        );
        this.playerImages[playerType.img] = {
          image: playerImage,
          ready: false
        };
      }
    }
  }

  protected markPlayerImageAsLoaded(img: string) {
    this.playerImages[img].ready = true;
  }

  protected markTileImageAsLoaded(id: number) {
    this.tileImages[id].ready = true;
  }

  protected renderBoard(): void {
    const ctx = this.canvas.getDrawingContext();
    ctx.globalAlpha = 1;
    const tiles = this.map.getAllTiles();
    tiles.map(tile => {
      const needsDraw = this.getRenderMapValue(tile.x, tile.y);
      if (needsDraw === false) {
        this.showUnrenderedTile(tile.x, tile.y);
        return;
      }
      if (!tile.frontLayer) {
        if (this.renderTile(tile.x, tile.y, tile)) {
          this.setRenderMap(false, tile.x, tile.y);
        }
      } else {
        // render sky behind see through tiles
        this.drawSkyTile(tile, tile.x, tile.y);
      }
    });
  }

  protected drawSkyTile(tile: Tile, x: number, y: number) {
    const skyTile = this.map.cloneTile(1);
    this.renderTile(x, y, skyTile);
  }

  // just go over and draw the over-the-top stuff
  protected renderFrontLayerBoard() {
    const tiles = this.map.getAllTiles();
    tiles.map(tile => {
      const needsDraw = this.getRenderMapValue(tile.x, tile.y);
      if (needsDraw === false) {
        return;
      }
      if (tile.frontLayer) {
        if (this.renderTile(tile.x, tile.y, tile)) {
          this.setRenderMap(false, tile.x, tile.y);
        }
      }
    });
  }

  // debugging tools
  protected showUnrenderedTile(x: number, y: number) {
    if (!this.lampMode) {
      return false;
    }
    const tileSize = Math.floor(this.tileSize);
    const ctx = this.canvas.getDrawingContext();
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(
      Math.floor(x * tileSize),
      Math.floor(y * tileSize),
      tileSize,
      tileSize
    );
  }

  protected renderPlayers() {
    for (const i in this.jetpack.players) {
      if (this.jetpack.players[i]) {
        const player = this.jetpack.players[i];
        this.renderPlayer(player);
      }
    }
  }

  protected getTileImage(tile: Tile) {
    if (tile.id < 1) {
      console.log("invalid tile requested", tile.id, tile);
      return false;
    }
    const tileImage = this.tileImages[tile.id];

    if (tileImage.ready) {
      return tileImage.image;
    }
    return false;
  }

  protected renderTile = function(x: number, y: number, tile: Tile): boolean {
    const ctx = this.canvas.getDrawingContext();
    const tileSize = this.tileSize;

    const img = this.getTileImage(tile);

    if (!img) {
      // console.log("Could not find tile image for id " + tile.id);
      return false;
    }

    let left = Math.floor(x * tileSize);
    let top = Math.floor(y * tileSize);

    if (this.map.renderAngle === 0) {
      ctx.drawImage(img, left, top, tileSize, tileSize);
    } else {
      const angleInRad = this.map.renderAngle * (Math.PI / 180);

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

  protected getPlayerImage(img: string) {
    const playerImage = this.playerImages[img];
    if (playerImage.ready) {
      return playerImage.image;
    }
    return false;
  }

  protected renderPlayer(player: Player) {
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
      //console.log('player image not loaded', player.img);
      return false;
    }

    ctx.drawImage(
      image,
      clipLeft,
      0,
      SPRITE_SIZE,
      SPRITE_SIZE,
      left,
      top,
      tileSize,
      tileSize
    );

    if (left < 0) {
      // also draw on right
      const secondLeft = left + tileSize * this.boardSize.width;
      ctx.drawImage(
        image,
        clipLeft,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        secondLeft,
        top,
        tileSize,
        tileSize
      );
    }

    if (left + tileSize > tileSize * this.boardSize.width) {
      // also draw on left
      const secondLeft = left - tileSize * this.boardSize.width;
      ctx.drawImage(
        image,
        clipLeft,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        secondLeft,
        top,
        tileSize,
        tileSize
      );
    }

    if (top + tileSize > tileSize * this.boardSize.height) {
      // also draw on top
      const secondTop = top - tileSize * this.boardSize.height;
      ctx.drawImage(
        image,
        clipLeft,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        left,
        secondTop,
        tileSize,
        tileSize
      );
    }
  }

  protected drawRotated(
    savedData: HTMLImageElement,
    direction: number,
    angle: number,
    targetAngle: number,
    completed: () => void
  ) {
    const canvas = this.canvas.getCanvas();

    if (direction > 0) {
      if (angle >= targetAngle) {
        completed();
        return false;
      }
    } else {
      if (angle <= targetAngle) {
        completed();
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

    angle += direction * (this.jetpack.moveSpeed / 2);

    this.jetpack.animationHandle = window.requestAnimationFrame(() => {
      this.drawRotated(savedData, direction, angle, targetAngle, completed);
    });
  }
}
