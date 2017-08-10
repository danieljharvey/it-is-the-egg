export class TitleScreen {
	
	canvas: Canvas;
	imagePath: string;
	width: number;
	height: number;

	constructor(canvas: Canvas, imagePath: string, width: number, height: number) {
		this.canvas = canvas;
	}

	render(callback) {
		//this.sizeCanvas();
		const titleImage: HTMLElement = document.createElement("img");
		titleImage.addEventListener("load", () => {
		  this.drawTheBigEgg(titleImage, 0.02, true, callback);
		}, false);
		titleImage.setAttribute("src", this.imagesFolder + "large/the-egg.png");
		titleImage.setAttribute("width", 1024);
		titleImage.setAttribute("height", 1024);
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
		this.animationHandle = window.requestAnimationFrame(() => {
	    	this.drawTheBigEgg(titleImage, opacity, show, callback);
	    });
	}

}