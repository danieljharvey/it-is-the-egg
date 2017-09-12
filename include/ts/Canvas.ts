// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc

import { BoardSize } from "./BoardSize";
import { Utils } from "./Utils";

export class Canvas {
  public imagesFolder: string = "img/";

  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected boardSize: BoardSize;

  constructor(boardSize: BoardSize) {
    this.boardSize = boardSize;
    const tileSize = this.sizeCanvas(boardSize);
    this.loadCanvas(boardSize, tileSize);
  }

  public getDrawingContext() {
    return this.ctx;
  }

  public getCanvas() {
    return this.canvas;
  }

  public getImagesFolder() {
    return this.imagesFolder;
  }

  public wipeCanvas(fillStyle: string): void {
    this.ctx.fillStyle = fillStyle;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // takes BoardSize, returns size of each tile
  public sizeCanvas(boardSize: BoardSize) {
    const maxBoardSize = this.getMaxBoardSize(boardSize);

    this.sizeControls(maxBoardSize);

    const tileSize = this.calcTileSize(boardSize);

    this.loadCanvas(boardSize, tileSize);

    this.boardSize = boardSize;

    return tileSize;
  }

  public calcTileSize(boardSize: BoardSize) {
    const maxBoardSize = this.getMaxBoardSize(this.boardSize);
    const tileSize = maxBoardSize / boardSize.width;
    return Math.floor(tileSize);
  }

  protected sizeControls(boardSize: number) {
    const controlHeader = document.getElementById("controlHeader");
    if (controlHeader) {
      controlHeader.style.width = boardSize.toString() + "px";
    }
  }

  protected getMaxBoardSize(boardSize: BoardSize): number {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const wrapMargin = Utils.getControlStyle("wrapper", "margin");

    const controlSpacing = Utils.getControlStyle("controlHeader", "marginTop");
    const editSpacing = Utils.getControlStyle("editHeader", "marginTop");

    const offsetHeight = Utils.getControlProperty(
      "controlHeader",
      "offsetHeight"
    );

    height =
      height - offsetHeight - 2 * wrapMargin - controlSpacing - editSpacing;
    width =
      width - offsetHeight - 2 * wrapMargin - controlSpacing - editSpacing;

    if (width > height) {
      const difference = height % boardSize.width;
      height = height - difference;
      return height;
    } else {
      const difference = width % boardSize.width;
      width = width - difference;
      return width;
    }
  }

  protected loadCanvas(boardSize, tileSize): void {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.canvas.width = boardSize.width * tileSize;
    this.canvas.height = boardSize.height * tileSize;
    this.ctx = this.canvas.getContext("2d");
  }
}
