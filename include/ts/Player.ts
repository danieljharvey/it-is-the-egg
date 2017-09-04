import { Collisions } from "./Collisions";
import { Coords } from "./Coords";
import { Jetpack } from "./Jetpack";
import { Renderer } from "./Renderer";
import { Utils } from "./Utils";

const SPRITE_SIZE: number = 64;

// much more burnable player object
// properties are protected so they can't be changed
// only change is via constructor - destroy and make new if change required

export class Player {

	coords: Coords;
	direction: number = 0;
	oldDirection: number = 0;
	currentFrame: number = 0;
	id: number = 0;
	frames: number = 1;
	multiplier: number = 1;
	falling: boolean = false;
	type: string = "egg";
	moveSpeed: number = 1;
	fallSpeed: number = 1;
	lastAction: string = "string";
	value: number = 1;
	img: string;

	constructor(params: object) {
		for (const i in params) {
			this[i] = params[i];
		}
	}

	modify(params: object): Player {
		const newParams = Object.assign({}, this, params);
		return new Player(newParams);
	}
}
