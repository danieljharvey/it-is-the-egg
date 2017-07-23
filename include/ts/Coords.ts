class Coords {
	x: number = 0;
	y: number = 0;
	offsetX: number = 0;
	offsetY: number = 0;

	constructor(x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        this.x = parseInt(x);
        this.y = parseInt(y);
        this.offsetX = parseInt(offsetX);
        this.offsetY = parseInt(offsetY);
    }
}