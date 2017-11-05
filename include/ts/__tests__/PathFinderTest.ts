/* tslint:disable: only-arrow-functions */

import assert from 'assert'
import { Maybe } from 'tsmonad';
import * as path from "../PathFinder";
import { Coords } from "../Coords"

test("Map size", function() {
	const map = [
		[1,2,5],
		[3,4,8]
	]
	const mapSize = path.getMapSize(map)
	expect(mapSize).toEqual({width: 2, height: 3})
})

test("Wraps width under", function() {
	const map = [
		[1,2],
		[3,4]
	]
	const point = {
		x: -1,
		y: 4
	}
	const expected = {
		x: 1,
		y: 0
	}
	const actual = path.wrapValue(map)(point)
	expect(actual).toEqual(expected)
})

test("Returns a valid map point", function() {

	const map = [
		[1,2],
		[3,4]
	]

	const value1 = path.findAdjacent(map)({x:0, y:0})
	expect(value1).toEqual(Maybe.just(1))

	const value2 = path.findAdjacent(map)({x:0, y:1})
	expect(value2).toEqual(Maybe.just(2))

	const value3 = path.findAdjacent(map)({x:1, y:0})
	expect(value3).toEqual(Maybe.just(3))

	const value4 = path.findAdjacent(map)({x:1, y:1})
	expect(value4).toEqual(Maybe.just(4))

})

test("Returns wrapped value for invalid map point", function() {

	const map = [
		[1,2],
		[3,4]
	]

	const valueFalse = path.findAdjacent(map)({x:-1, y:0})
	expect(valueFalse).toEqual(Maybe.just(3))

})

test("Finds a previously used point", function() {

	const map = [
		[0,0,0],
		[0,1,0],
		[0,0,0]
	]

	const list = [{x:1, y:0}, {x: 0, y:0}]

	const point = {x:0, y:0}

	const expected = [{x:0, y:0},{x:1, y:0}, {x:0, y:0}]

	const actual = path.addAdjacent(map)(list)(point)
	
	expect(actual).toEqual(expected)
})

test("Finds an unavailable point", function() {

	const map = [
		[0,1,0],
		[0,1,0],
		[0,0,0]
	]

	const list = [{x: 0, y:0}]

	const point = {x: 0, y:1}

	const expected = []

	const actual = path.addAdjacent(map)(list)(point)
	
	expect(actual).toEqual(expected)

})

test("Gets rid of those duplicates", function() {

	const list = [{x:0, y:1}, {x:0, y:0}, {x:0, y:1}]

	const expected = false

	const actual = path.filterDuplicates(list)
	
	expect(actual).toEqual(expected)
})

test("Leaves those non-duplicates", function() {

	const list = [{x:0, y:1}, {x:0, y:0}, {x:0, y:2}]

	const expected = true

	const actual = path.filterDuplicates(list)

	expect(actual).toEqual(expected)
})

test("Adds to empty list", function() {
	const list = []

	const point = {x:1, y:0}

	const expected = [{x:1, y:0}]

	const actual = path.addToList(list, point)

	expect(actual).toEqual(expected)
})

test("Adds to small list", function() {
	const list = [{x:1, y:0},{x:0, y:0}]

	const point = {x:1, y:1}

	const expected = [{x:1,y:1},{x:1,y:0},{x:0,y:0}]

	const actual = path.addToList(list, point)

	expect(actual).toEqual(expected)
})

test("Finds them all", function() {
	
	const map =[
		[1,1,1],
		[1,1,1],
		[1,1,1]
	]

	const point = {x:0,y:0}

	const expected = [
		{x:2, y:0},
		{x:1, y:0},
		{x:0, y:2},
		{x:0, y:1}
	]

	const actual = path.squaresAround(map)(point)

	expect(expected).toEqual(actual)
})

test("Finds one that is", function() {
	const point = {x:0,y:0}

	const list = [
		{x:0,y:0},
		{x:1,y:0}
	]

	const found = path.isInList(list, point)

	expect(found).toEqual(true)
})

test("Finds one that isn't", function() {
	const point = {x:4,y:0}

	const list = [
		{x:0,y:0},
		{x:1,y:0}
	]

	const found = path.isInList(list, point)

	expect(found).toEqual(false)
})

test("Finds only option from starting point", function() {
	
	const map = [
		[0,1,0,0,1],
		[0,1,1,1,1],
		[0,1,0,0,1],
		[0,0,0,0,1],
		[1,1,1,1,1]
	]

	const list = [{x:0,y:0}]

	const expected = [
		[{x:1,y:0},{x:0,y:0}]
	]
		
	const actual = path.getMoveOptions(map)(list)

	expect(actual).toEqual(expected)

})

test("Doesn't go back on itself", function() {
	
	const map = [
		[0,1,0,0,1],
		[0,1,1,1,1],
		[0,1,0,0,1],
		[0,0,0,0,1],
		[1,1,1,1,1]
	]

	const list = [{x:1, y:0},{x:0, y:0}]

	const expected = [
		[{x:2, y:0}, {x:1, y:0}, {x:0, y:0}]
	]
		
	const actual = path.getMoveOptions(map)(list)

	expect(actual).toEqual(expected)

})

test("Returns multiple options", function() {
	
	const map = [
		[0,1],
		[0,1],
		[0,1]
	]

	const list = [{x:1,y:0}]

	const expected = [
		[{x:0,y:0},{x:1,y:0}],
		[{x:2,y:0},{x:1,y:0}]
	]
		
	const actual = path.getMoveOptions(map)(list)

	expect(actual).toEqual(expected)

})

it ("Finds one", function() {

	const target = {x:2,y:2}

	const list = [
		[{x:1,y:2},{x:3,y:4}],
		[{x:2,y:1},{x:3,y:4}],
		[{x:1,y:2},{x:3,y:4}],
		[{x:2,y:2},{x:3,y:4}]
	]

	const expected = Maybe.just([{x:2,y:2},{x:3,y:4}])

	const actual = path.findAnswerInList(target)(list)

	expect(actual).toEqual(expected)
})

it ("Finds nothing", function() {

	const target = {x:7,y:9}

	const list = [
		[{x:1, y:2},{x:3, y:4}],
		[{x:2, y:1},{x:3, y:4}],
		[{x:1, y:2},{x:3, y:4}],
		[{x:2, y:2},{x:3, y:4}]
	]

	const expected = Maybe.nothing()

	const actual = path.findAnswerInList(target)(list)

	expect(actual).toEqual(expected)
})

it ("Very quickly fails", function() {
	const map = [
		[0,1,0,0,1],
		[1,1,1,1,1],
		[0,1,0,0,1],
		[0,0,0,0,1],
		[1,1,1,1,1]
	]

	const start = {x:0,y:0}

	const end = {x:2,y:2}

	const expected = Maybe.nothing();

	const startList = [[start]]

	const actual = path.processMoveList(map)(startList)(end)

	expect(actual).toEqual(expected)
})

it ("Very quickly wins", function() {
	const map = [
		[0,1,1],
		[0,1,1],
		[1,1,1]
	]

	const start = {x:0,y:0}

	const end = {x:1,y:0}

	const expected = Maybe.just([{x:0,y:0},{x:1,y:0}])

	const startList = [[start]]

	const actual = path.processMoveList(map)(startList)(end)

	expect(actual).toEqual(expected)
})

it ("Wins I suppose", function() {
	const map = [
		[0,0,0,0,1],
		[0,1,1,1,1],
		[0,1,0,0,1],
		[0,0,0,0,1],
		[1,1,1,1,1]
	]

	const start = {x:0,y:0}

	const end = {x:2,y:2}

	const expected = Maybe.just([
		{x:0,y:0},
		{x:1,y:0},
		{x:2,y:0},
		{x:3,y:0},
		{x:3,y:1},
		{x:3,y:2},
		{x:2,y:2}
	]);

	const startList = [[start]]

	const actual = path.processMoveList(map)(startList)(end)

	expect(actual).toEqual(expected)
})


it ("Wins another map", function() {
	
	const map = [
		[0,0,0,1],
		[1,1,0,1],
		[0,0,0,1],
		[1,1,1,1]
	]

	const start = {x:2, y:0}

	const end = {x:0, y:0}

	const expected = Maybe.just([
		{x:2, y:0},
		{x:2, y:1},
		{x:2, y:2},
		{x:1, y:2},
		{x:0, y:2},
		{x:0, y:1},
		{x:0, y:0}
	]);

	const startList = [[start]]

	const actual = path.processMoveList(map)(startList)(end)

	expect(actual).toEqual(expected)
})

it ("Wins a silly map", function() {
	
	const map = [
		[0,0,0,1],
		[1,1,0,1],
		[0,0,0,1],
		[0,1,1,1],
		[0,0,0,1],
		[1,1,0,1],
		[0,0,0,1],
		[0,1,1,1],
		[0,1,0,1],
		[0,0,0,1],
		[0,1,0,1],
		[1,1,0,0],
		[1,1,1,1]
	]

	const start = {x:0, y:0}

	const end = {x:11, y:3}

	const expectedLength = 23

	const startList = [[start]]

	const actual = path.processMoveList(map)(startList)(end)

	const value = actual.caseOf({
		just: val => val,
		nothing: () => []
	})

	expect(value.length).toEqual(expectedLength)
})

it ("Finds the easier path", function() {
	
	const map = [
		[1,1,1,1,1,1,1],
		[1,0,0,0,1,0,1],
		[1,0,1,1,1,1,1],
		[1,0,0,0,0,0,1],
		[1,0,1,1,1,0,1],
		[1,0,0,0,0,0,1],
		[1,1,1,1,1,1,1],
	]

	const start = {x:3, y:3}

	const ends = [
		{x:5, y:4},
		{x:3, y:1}, // closer
		{x:1, y:5}
	]

	const expected = [
		{x:3,y:3},
		{x:3,y:2},
		{x:3,y:1}
	]

	const actual = path.findClosestPath(map)(start)(ends)

	const value = actual.caseOf({
		just: val => val,
		nothing: () => []
	})

	expect(value).toEqual(expected)
})

it ("Takes path and works out next move", function() {

	const pointList = [
		{x:2, y:2},
		{x:3,y:2},
		{x:4, y:2}
	]

	const expected = {x:1,y:0}

	const actual = path.findNextDirection(pointList)

	expect(actual).toEqual(expected)
})
