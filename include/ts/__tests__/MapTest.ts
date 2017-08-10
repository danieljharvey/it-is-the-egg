import { Map } from '../Map.ts';
import { TileSet } from '../TileSet.ts';
import { BoardSize } from '../BoardSize.ts';

test("Translate rotation", () => {
	
	const rotateData = [
		{inX: 0, inY: 0, clockwise: true, outX: 9, outY: 0},
		{inX: 9, inY: 0, clockwise: true, outX: 9, outY: 9},
		{inX: 9, inY: 9, clockwise: true, outX: 0, outY: 9},
		{inX: 0, inY: 9, clockwise: true, outX: 0, outY: 0},
		{inX: 0, inY: 0, clockwise: false, outX: 0, outY: 9},
		{inX: 0, inY: 9, clockwise: false, outX: 9, outY: 9},
		{inX: 9, inY: 9, clockwise: false, outX: 9, outY: 0},
		{inX: 9, inY: 0, clockwise: false, outX: 0, outY: 0}
	];

	const boardSize = new BoardSize(10);

	const map = new Map(undefined, boardSize);

	rotateData.map(data => {
		let expected: object = {
			'x': data.outX,
			'y': data.outY 
		};
		const result = map.translateRotation(data.inX, data.inY, data.clockwise);
		expect(result).toEqual(expected);
	});
}	


test("Correct board size with shrinking", () => {

	const board = [
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0]
	];

	const boardSize = {
		width: 4,
		height: 4
	}

	const expected = [
		[0,1,0,0],
		[0,1,0,0],
		[0,1,0,0],
		[0,1,0,0]
	];

	const map = new Map();

	const result = map.correctBoardSizeChange(board,boardSize);
	expect(result).toEqual(expected);
})

test("Correct board size with shrinking", () => {

	const board = [
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0],
		[0,1,0,0,0]
	];

	const boardSize = {
		width: 6,
		height: 6
	}

	const tileSet = new TileSet();
	const map = new Map(tileSet);

	const tile = map.cloneTile(1);

	const expected = [
		[0,1,0,0,0,tile],
		[0,1,0,0,0,tile],
		[0,1,0,0,0,tile],
		[0,1,0,0,0,tile],
		[0,1,0,0,0,tile],
		[tile,tile,tile,tile,tile,tile]
	];

	const result = map.correctBoardSizeChange(board,boardSize);
	expect(result).toEqual(expected);
})

test("Correct non-existant empty board to reasonably full one", () => {

	const board = [];

	const boardSize = {
		width: 5,
		height: 5
	}

	const tileSet = new TileSet();
	const map = new Map(tileSet);

	const tile = map.cloneTile(1);

	const expected = [
		[tile,tile,tile,tile,tile],
		[tile,tile,tile,tile,tile],
		[tile,tile,tile,tile,tile],
		[tile,tile,tile,tile,tile],
		[tile,tile,tile,tile,tile]
	];

	const result = map.correctBoardSizeChange(board,boardSize);
	expect(result).toEqual(expected);
})

