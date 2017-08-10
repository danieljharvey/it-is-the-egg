export class TileSet {

	getTiles() {
		const tiles = {
			1: {
				id: 1,
				title: "Sky",
				img: "sky.png",
				background: true,
				needsDraw: true,
			},
			2: {
				id: 2,
				title: "Fabric",
				img: "fabric.png",
				background: false,
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
		};
		return tiles;
	}
}
