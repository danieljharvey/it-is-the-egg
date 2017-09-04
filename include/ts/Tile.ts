export class Tile {

	id: number;
	title: string;
	img: string;
	background: boolean = false;
	needsDraw: boolean = true;
	frontLayer: boolean = false;
	collectable: number = 0;
	breakable: boolean = false;
	action: string = "";
	dontAdd: boolean = false;
	createPlayer: string = "";

	constructor(params: object) {
		// fill this object with entries from params
		(Object as any).entries(params).map(([key, value]) => {
			this[key] = value;
		});
	}

}
