import * as _ from 'lodash'
import { Maybe } from 'tsmonad';

export interface Point {
	x: number
	y: number
}

export type PointList = Point[]

export type Map = number[][]

export const getMapSize = (map : Map) => {
	return {
		width: map.length,
		height: map[0].length
	}
}

const overflow = (num: number, max: number) : number => {
	if (num < 0) {
		return max + num;
	}
	return (num < max) ? num : num % max
}

export const wrapValue = (map: Map) => (point: Point) : Point => {
	const mapSize = getMapSize(map)
	return {
		x: overflow(point.x, mapSize.width),
		y: overflow(point.y, mapSize.height)
	}
}

export const findAdjacent = (map: Map) => (point: Point) : Maybe<number> => {
	const wrappedPoint = wrapValue(map)(point)
	const {x,y} = wrappedPoint
	return Maybe.just(map[x][y])
}

export const addToList = (list: PointList, point: Point) : PointList => [point, ...list]

export const squaresAround = (map: Map) => (point: Point) : PointList => {
	const partialWrapValue = wrapValue(map)
	const {x, y} = point
	return [
		partialWrapValue({x: x - 1, y}),
		partialWrapValue({x: x + 1, y}),
		partialWrapValue({x, y: y - 1}),
		partialWrapValue({x, y: y + 1})
	]
}

export const checkAnswer = (list: PointList) => (point: Point) => (tile: Number) : PointList => {
	if (tile === 0) {
		return addToList(list, point)
	}
	return []
}

export const addAdjacent = (map: Map) => (list: PointList) => (point: Point) : PointList => {
	return findAdjacent(map)(point)
			.map(checkAnswer(list)(point))
			.caseOf({
				just: tile => tile,
				nothing: () => []
			})
}

export const filterDuplicates = (arr: PointList) : boolean => {
	const problems = arr.filter((item: Point) => {
		const matching = arr.filter((checkItem: Point) => {
			return pointMatch(item)(checkItem);
		})
		return (matching.length > 1)
	})
	return (problems.length < 1)
}

export const pointMatch = (matchPoint: Point) => (point: Point) : boolean => (matchPoint.x==point.x && matchPoint.y==point.y)

export const isInList = (list: PointList, point: Point) : boolean => {
	const partialPointMatch = pointMatch(point)
	return (list.filter(partialPointMatch).length > 0)
}

export const getMoveOptions = (map: Map) => (list: PointList) : PointList[] => {
	const startPoint = list[0];
	const partialAddAdjacent = addAdjacent(map)(list)
	return squaresAround(map)(startPoint)
			.map(partialAddAdjacent)
			.filter(entry => (entry.length > 0))
			.filter(filterDuplicates)
}

// try out all possible and return new list of options
export const getMultipleMoveOptions = (map: Map) => (lists: PointList[]) : PointList[] => {
	return _.flatMap(lists, list => {
		return getMoveOptions(map)(list)
	})
}

export const findAnswer = (targetPoint: Point) => (potentialAnswer: PointList) : boolean => (pointMatch(potentialAnswer[0])(targetPoint))

export const findAnswerInList = (targetPoint: Point) => (list: PointList[]) : Maybe<PointList> => {
	const partialFindAnswer = findAnswer(targetPoint)
	const found = _.find(list, partialFindAnswer)
	if (found) {
		return Maybe.just(found)
	}
	return Maybe.nothing()
}

export const flipAnswer = (list: PointList) => _.reverse(list)

export const processMoveList = (map: Map) => (lists: PointList[]) => (targetPoint: Point) : Maybe<PointList> => {
	const moveOptions = getMultipleMoveOptions(map)(lists)

	if (moveOptions.length === 0) {
		return Maybe.nothing()
	}

	const solution = findAnswerInList(targetPoint)(moveOptions)

	return solution.caseOf({
		just: value => {
			return Maybe.just(flipAnswer(value))
		},
		nothing: () => {
			return processMoveList(map)(moveOptions)(targetPoint)
		}
	})
}

export const findPath = (map: Map) => (start: Point) => (target: Point) : Maybe<PointList> => {
	return processMoveList(map)([[start]])(target)
}

// do findPath for each thing, return shortest
export const findClosestPath = (map: Map) => (start: Point) => (targets: Point[]) : Maybe<PointList> => {
	console.log('findClosestPath map', map)
	console.log('findClosestPath start', start)
	console.log('findClosestPath targets', targets)
	const paths = targets.map(target => {
		return findPath(map)(start)(target)
	}).filter(maybe => {
		return maybe.caseOf({
			just: val => true,
			nothing: () => false
		})
	}).map(obj => {
		return obj.caseOf({
			just: val => val,
			nothing: () => false
		})
	}).sort((a,b) => {
		return (b.length < a.length)
	})
	if (paths.length === 0) {
		return Maybe.nothing()
	}
	const first = _.first(paths);
	return Maybe.just(first)
}

// work out what first move is according to directions
export const findNextDirection = (pointList: PointList) : Point => {
	const parts = _.slice(pointList, 0, 2);
	const start = parts[0]
	const end = parts[1]
	return {
		x: end.x - start.x,
		y: end.y - start.y
	}
}