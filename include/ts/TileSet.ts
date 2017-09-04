export class TileSet {
	protected tiles: object = {};

	public getTiles() {
		this.tiles = {
			1: {
				background: true,
				id: 1,
				img: "sky.png",
				needsDraw: true,
				title: "Sky",
			},
			2: {
				background: false,
				id: 2,
				img: "fabric.png",
				title: "Fabric",
				needsDraw: true,
			},
			3: {
				id: 3,
				title: "Cacti",
				img: "cacti.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				collectable: 1,
			},
			4: {
				id: 4,
				title: "Plant",
				img: "plant.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				collectable: 10,
			},
			5: {
				id: 5,
				title: "Crate",
				img: "crate.png",
				background: false,
				needsDraw: true,
				breakable: true,
			},
			8: {
				id: 8,
				title: "Work surface 2",
				img: "work-surface-2.png",
				background: false,
				needsDraw: true,
			},
			9: {
				id: 9,
				title: "Work surface 3",
				img: "work-surface-3.png",
				background: false,
				needsDraw: true,
			},
			10: {
				id: 10,
				title: "Work surface 4",
				img: "work-surface-4.png",
				background: false,
				needsDraw: true,
			},
			11: {
				id: 11,
				title: "Tiles",
				img: "tile.png",
				background: false,
				needsDraw: true,
			},
			12: {
				id: 12,
				title: "Egg Cup",
				img: "egg-cup.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				createPlayer: "egg",
				action: "completeLevel",
			},
			13: {
				id: 13,
				title: "Toast",
				img: "toast.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				collectable: 100,
				dontAdd: true,
			},
			14: {
				id: 14,
				title: "Door",
				img: "door.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				action: "teleport",
			},
			15: {
				id: 15,
				title: "Pink door open",
				img: "pink-door-open.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
			},
			16: {
				id: 16,
				title: "Pink door closed",
				img: "pink-door.png",
				background: false,
				needsDraw: true,
			},
			17: {
				id: 17,
				title: "Pink door switch",
				img: "pink-switch.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				action: "pink-switch",
			},
			18: {
				id: 18,
				title: "Green door open",
				img: "green-door-open.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
			},
			19: {
				id: 19,
				title: "Green door closed",
				img: "green-door.png",
				background: false,
				needsDraw: true,
			},
			20: {
				id: 20,
				title: "Green door switch",
				img: "green-switch.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				action: "green-switch",
			},
			21: {
				id: 21,
				title: "Silver Egg Cup",
				img: "silver-egg-cup.png",
				background: true,
				needsDraw: true,
				frontLayer: true,
				createPlayer: "silver-egg",
			},
		};
		// return a copy rather than letting this get messed with
		return JSON.parse(JSON.stringify(this.tiles));
	}

	public getTile(id) {
		const tiles = this.getTiles();
		if (tiles.hasOwnProperty(id)) return tiles[id];
		return false;
	}
}
