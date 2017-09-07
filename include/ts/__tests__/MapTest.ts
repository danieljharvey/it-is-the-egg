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


test("Get all tiles test", () => {
		
		const board = [[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"0"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"2"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"4"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"6"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"8"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"10"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"0","y":"12"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"0","y":"13"}],[{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"1","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"1","y":"13"}],[{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"2","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"2","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"2","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"2","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"2","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"11"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"2","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"3","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"1"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"3","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"3","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"3","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"9"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"3","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"3","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"4","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"4","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"3"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"4","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"7"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"4","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"4","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"4","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"5"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"5","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"5","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"4"},{"id":12,"title":"Egg Cup","img":"egg-cup.png","background":true,"needsDraw":false,"frontLayer":true,"createPlayer":"egg","action":"completeLevel","drawnBefore":true,"x":"6","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"6","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"6","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"4"},{"id":12,"title":"Egg Cup","img":"egg-cup.png","background":true,"needsDraw":false,"frontLayer":true,"createPlayer":"egg","action":"completeLevel","drawnBefore":true,"x":"7","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"7","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"7","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"5"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"8","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"8","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"9","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"9","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"3"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"9","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"7"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"9","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"9","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"9","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"10","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"1"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"10","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"10","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"10","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"9"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":true,"drawnBefore":true,"x":10,"y":10},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":true,"drawnBefore":true,"x":10,"y":11},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":true,"drawnBefore":true,"x":10,"y":12},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"10","y":"13"}],[{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"11","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"11","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"11","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"11","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":true,"drawnBefore":true,"x":11,"y":10},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":true,"drawnBefore":true,"x":11,"y":11},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":true,"drawnBefore":true,"x":11,"y":12},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"11","y":"13"}],[{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"0"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"2"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"4"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"6"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"8"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"10"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"12","y":"12"},{"id":1,"title":"Sky","img":"sky.png","background":true,"needsDraw":false,"drawnBefore":true,"x":"12","y":"13"}],[{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"0"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"1"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"2"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"3"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"4"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"5"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"6"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"7"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"8"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"9"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"10"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"11"},{"id":2,"title":"Fabric","img":"fabric.png","background":false,"needsDraw":false,"drawnBefore":true,"x":"13","y":"12"},{"id":3,"title":"Cacti","img":"cacti.png","background":true,"needsDraw":false,"frontLayer":true,"collectable":1,"drawnBefore":true,"x":"13","y":"13"}]];
		const map = new Map(null, null, board);

		expect(map.getAllTiles()).toMatchSnapshot();
	});
	
	