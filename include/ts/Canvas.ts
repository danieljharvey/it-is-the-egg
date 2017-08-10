// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc

import { BoardSize } from "./BoardSize";

export class Canvas {
	
	checkResize: boolean = true;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	imagesFolder: string = "img/";
	boardSize: BoardSize;
	tileSize: number;

	constructor(boardSize: BoardSize) {
		this.boardSize = boardSize;
		this.tileSize = this.sizeCanvas(boardSize);
	}

	// takes BoardSize, returns size of each tile
	sizeCanvas(boardSize: BoardSize) {
		this.boardSize = boardSize;

		const maxBoardSize = this.getMaxBoardSize(this.boardSize);

		//this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + "px";

		const controlHeader = document.getElementById("controlHeader");
		
		controlHeader.style.width = maxBoardSize.toString() + 'px';		

		this.tileSize = maxBoardSize / this.boardSize.width;
		
		this.checkResize = false; // all done
		this.loadCanvas(this.boardSize, this.tileSize);
		return this.tileSize;
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
		if (!this.ctx) {
			this.loadCanvas(this.boardSize, this.tileSize);
		}
		return this.ctx;
	}

	getCanvas() {
		if (!this.canvas) {
			this.loadCanvas(this.boardSize, this.tileSize);
		}
		return this.canvas;
	}

	getImagesFolder() {
		return this.imagesFolder;
	}
}