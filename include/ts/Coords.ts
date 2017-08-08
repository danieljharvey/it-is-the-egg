const SPRITE_SIZE:number = 64;

export class Coords {
	x: number = 0;
	y: number = 0;
	offsetX: number = 0;
	offsetY: number = 0;

	constructor(x: number, y: number, offsetX: number = 0, offsetY: number = 0) {
        this.x = Math.floor(x) as number;
        this.y = Math.floor(y) as number;
        this.offsetX = offsetX as number;
        this.offsetY = offsetY as number;
    }

    getActualPosition() {
        let fullX:number = (this.x * SPRITE_SIZE) + this.offsetX;
        let fullY:number = (this.y * SPRITE_SIZE) + this.offsetY;
        return {
            fullX,
            fullY
        }
    }
}
