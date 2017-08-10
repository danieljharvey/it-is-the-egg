import { Canvas } from "./Canvas";
import { Jetpack } from "./Jetpack";
import { BoardSize } from "./BoardSize";

export class TitleScreen {
		
	jetpack: Jetpack;
	canvas: Canvas;
	imagePath: string; // image to show
	width: number; // 
	height: number;

	constructor(jetpack: Jetpack, canvas: Canvas, imagePath: string, width: number, height: number) {
		this.jetpack = jetpack;
		this.canvas = canvas;
		this.imagePath = this.canvas.getImagesFolder() + imagePath;
		this.width = width;
		this.height = height;
	}

	render(callback) {

		const boardSize = new BoardSize(10);
		this.canvas.sizeCanvas(boardSize);
		
		const titleImage: HTMLElement = document.createElement("img");
		titleImage.addEventListener("load", () => {
		  this.drawTheBigEgg(titleImage, 0.02, true, callback);
		}, false);

		titleImage.setAttribute("src", this.imagePath);
		titleImage.setAttribute("width", this.width.toString());
		titleImage.setAttribute("height", this.height.toString());
	}

	drawTheBigEgg(titleImage, opacity: number, show: boolean, callback) {

		const ctx = this.canvas.getDrawingContext();
		const canvas = this.canvas.getCanvas();

		ctx.globalAlpha = 1;
		this.canvas.wipeCanvas("rgb(0,0,0)");

		ctx.globalAlpha = opacity;

		ctx.drawImage(titleImage, 0, 0, titleImage.width, titleImage.height, 0, 0, canvas.width, canvas.height);
		if (show) {
			opacity += 0.01;
			if (opacity >= 1) {
				// wait, fade the egg
				const v = setTimeout(() => {
					// and start fading!
					this.drawTheBigEgg(titleImage, opacity, false, callback);
				}, 1000);
				return false;
			}
		} else {
			opacity = opacity - 0.03;
			if (opacity <= 0) {
				callback();
				titleImage = null;
				return false;
			}
		}
		this.jetpack.animationHandle = window.requestAnimationFrame(() => {
	    	this.drawTheBigEgg(titleImage, opacity, show, callback);
	    });
	}

}