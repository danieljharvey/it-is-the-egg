const SPRITE_SIZE: number = 64;

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
        const fullX: number = (this.x * SPRITE_SIZE) + this.offsetX;
        const fullY: number = (this.y * SPRITE_SIZE) + this.offsetY;
        return {
            fullX,
            fullY,
        };
    }

    equals(otherCoords: Coords) {
        if (this.x !== otherCoords.x) return false;
        if (this.y !== otherCoords.y) return false;
        if (this.offsetX !== otherCoords.offsetX) return false;
        if (this.offsetY !== otherCoords.offsetY) return false;
        return true;
    }
}
