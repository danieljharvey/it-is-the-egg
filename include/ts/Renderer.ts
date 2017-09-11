import { BoardSize } from "./BoardSize";
import { Canvas } from "./Canvas";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Map } from "./Map";
import { Player } from "./Player";
import { Tile } from "./Tile";

const SPRITE_SIZE: number = 64;

export class Renderer {
  protected jetpack: Jetpack;
  protected map: Map;
  protected tiles: object;
  protected playerTypes: object;
  protected boardSize: BoardSize;
  protected canvas: Canvas;

  protected checkResize: boolean = true;

  protected tileImages: object = {}; // image elements of tiles
  protected playerImages: object = {}; // image element of players
  public tileSize: number;

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
    this.tileSize = this.canvas.calcTileSize(boardSize);
  }

  public render() {
    this.renderBoard();
    this.renderPlayers();
    this.renderFrontLayerBoard();
  }

  public resize() {
    this.tileSize = this.canvas.sizeCanvas(this.boardSize);
    this.map.markAllForRedraw();
  }

  public drawRotatingBoard(clockwise: boolean, completed: () => void) {
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

  protected loadTilePalette() {
    for (const i in this.tiles) {
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

  protected loadPlayerPalette() {
    for (const i in this.playerTypes) {
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

  protected markPlayerImageAsLoaded(img: string) {
    this.playerImages[img].ready = true;
  }

  protected markTileImageAsLoaded(id: number) {
    this.tileImages[id].ready = true;
  }

  protected renderBoard(): void {
    const tiles = this.map.getAllTiles();
    tiles.map(tile => {
      if (tile.needsDraw === false) {
        this.showUnrenderedTile(tile.x, tile.y);
        return;
      }
      if (!tile.frontLayer) {
        if (this.renderTile(tile.x, tile.y, tile)) {
          const coords = new Coords({ x: tile.x, y: tile.y });
          const newTile = tile.modify({
            drawnBefore: true,
            needsDraw: false
          });
          this.map.changeTile(coords, newTile);
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
      if (tile.needsDraw === false) {
        return;
      }
      if (tile.frontLayer) {
        if (this.renderTile(tile.x, tile.y, tile)) {
          const coords = new Coords({ x: tile.x, y: tile.y });
          const newTile = tile.modify({
            drawnBefore: true,
            needsDraw: false
          });
          this.map.changeTile(coords, newTile);
        }
      }
    });
  }

  // debugging tools
  protected showUnrenderedTile(x: number, y: number) {
    return false;
    const tileSize = this.tileSize;
    const ctx = this.canvas.getDrawingContext();
    ctx.fillStyle = "rgba(0,0,0,0.01)";
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }

  protected renderPlayers() {
    for (const i in this.jetpack.players) {
      if (this.jetpack.players[i]) {
        const player = this.jetpack.players[i];
        this.renderPlayer(player);
      }
    }
  }

  protected getTileImage(id: number) {
    const tileImage = this.tileImages[id];
    if (tileImage.ready) {
      return tileImage.image;
    }
    return false;
  }

  protected renderTile = function(x: number, y: number, tile: Tile): boolean {
    const ctx = this.canvas.getDrawingContext();
    const tileSize = this.tileSize;

    const img = this.getTileImage(tile.id);

    if (!img) {
      // console.log("Could not find tile image for id " + tile.id);
      return false;
    }

    let left = x * tileSize;
    let top = y * tileSize;
    const opacity = 1;

    ctx.globalAlpha = opacity;

    if (this.map.renderAngle == 0) {
      ctx.drawImage(img, left, top, tileSize, tileSize);
    } else {
      const angleInRad = this.map.renderAngle * (Math.PI / 180);

      const offset = tileSize / 2;

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

    const offsetRatio = tileSize / SPRITE_SIZE;

    const coords = player.coords;

    const left = Math.floor(coords.x * tileSize + coords.offsetX * offsetRatio);
    const top = Math.floor(coords.y * tileSize + coords.offsetY * offsetRatio);

    const clipLeft = player.currentFrame * SPRITE_SIZE;
    const clipTop = 0;

    ctx.globalAlpha = 1;

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
      const secondLeft = tileSize * this.boardSize.width + coords.offsetX;
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

    angle += direction * this.jetpack.moveSpeed;

    this.jetpack.animationHandle = window.requestAnimationFrame(() => {
      this.drawRotated(savedData, direction, angle, targetAngle, completed);
    });
  }
}
