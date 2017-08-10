// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc

import { BoardSize } from "./BoardSize";

export class Canvas {
	
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	imagesFolder: string = "img/";
	boardSize: BoardSize;

	constructor(boardSize: BoardSize) {
		this.boardSize = boardSize;
		const tileSize = this.sizeCanvas(boardSize);
		this.loadCanvas(boardSize, tileSize);
	}

	// takes BoardSize, returns size of each tile
	sizeCanvas(boardSize: BoardSize) {
		const maxBoardSize = this.getMaxBoardSize(boardSize);

		const controlHeader = document.getElementById("controlHeader");
		controlHeader.style.width = maxBoardSize.toString() + 'px';		

		const tileSize = this.calcTileSize(boardSize);
		
		this.loadCanvas(boardSize, tileSize);
		
		this.boardSize = boardSize;

		return tileSize;
	}

	calcTileSize(boardSize: BoardSize) {
		const maxBoardSize = this.getMaxBoardSize(this.boardSize);
		const tileSize = maxBoardSize / boardSize.width;
		return tileSize;
	}

	getMaxBoardSize(boardSize: BoardSize): number {
		let width = window.innerWidth;
		let height = window.innerHeight;

		const wrapper = document.getElementById('wrapper');
		const wrapMargin = parseInt(window.getComputedStyle(wrapper).margin);

		const controlHeader = document.getElementById("controlHeader");
		const controlSpacing = parseInt(window.getComputedStyle(controlHeader).marginTop);

		height = height - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
		width = width - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;

		if (width > height) {
			const difference = (height % boardSize.width);
			height = height - difference;
			return height;
		} else {
			const difference = (width % boardSize.width);
			width = width - difference;
			return width;
		}
	}

	wipeCanvas(fillStyle: string): void {
		this.ctx.fillStyle = fillStyle;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	loadCanvas(boardSize, tileSize): void {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = boardSize.width * tileSize;
		this.canvas.height = boardSize.height * tileSize;
		this.ctx = this.canvas.getContext("2d");
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
}