// responsible for the care and feeding of the html canvas and it's size on screen etc etc etc

import { BoardSize } from "./BoardSize";

export class Canvas {
	
	checkResize: boolean = true;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	boardSize: BoardSize;

	constructor(boardSize: BoardSize) {
		this.boardSize = boardSize;
	}

	sizeCanvas() {
		if (!this.checkResize) return false;
		const maxBoardSize = this.getMaxBoardSize();

		this.canvas.top = parseInt((window.innerHeight - maxBoardSize) / 2) + "px";

		const controlHeader = document.getElementById("controlHeader");
		
		controlHeader.style.width = maxBoardSize.toString() + 'px';		

		this.tileSize = maxBoardSize / this.boardSize.width;
		this.loadCanvas();
		//this.map.markAllForRedraw();

		this.checkResize = false; // all done
	}

	getMaxBoardSize(): number {
		let width = window.innerWidth;
		let height = window.innerHeight;

		const wrapper = document.getElementById('wrapper');
		const wrapMargin = parseInt(window.getComputedStyle(wrapper).margin);

		const controlHeader = document.getElementById("controlHeader");
		const controlSpacing = parseInt(window.getComputedStyle(controlHeader).marginTop);

		height = height - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;
		width = width - (controlHeader.offsetHeight) - (2 * wrapMargin) + controlSpacing;

		if (width > height) {
			const difference = (height % this.boardSize.width);
			height = height - difference;
			return height;
		} else {
			const difference = (width % this.boardSize.width);
			width = width - difference;
			return width;
		}
	}

	wipeCanvas(fillStyle: string): void {
		this.ctx.fillStyle = fillStyle;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	loadCanvas(): void {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = this.boardSize.width * this.tileSize;
		this.canvas.height = this.boardSize.height * this.tileSize;
		this.ctx = this.canvas.getContext("2d");
	}

	getDrawingContext() {
		if (!this.ctx) {
			this.loadCanvas();
		}
		return this.ctx;
	}

	getCanvas() {
		if (!this.canvas) {
			this.loadCanvas();
		}
		return this.canvas;
	}
}