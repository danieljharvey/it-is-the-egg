import * as _ from "lodash";
import { Maybe } from "tsmonad";
import { Coords } from "./Coords";

import { List } from "immutable";

export type PointList = Coords[];

export type Map = boolean[][];

export const getMapSize = (map: Map) => {
  return {
    width: map.length,
    height: map[0].length
  };
};

const overflow = (num: number, max: number): number => {
  if (num < 0) {
    return max + num;
  }
  return num < max ? num : num % max;
};

export const wrapValue = (map: Map) => (x: number, y: number): Coords => {
  const mapSize = getMapSize(map);
  return new Coords({
    x: overflow(x, mapSize.width),
    y: overflow(y, mapSize.height)
  });
};

export const findAdjacent = (map: Map) => (point: Coords): Maybe<boolean> => {
  const wrappedPoint = wrapValue(map)(point.x, point.y);
  const { x, y } = wrappedPoint;
  return Maybe.just(map[x][y]);
};

export const addToList = (list: PointList, point: Coords): PointList => [
  point,
  ...list
];

export const squaresAround = (map: Map) => (point: Coords): PointList => {
  const partialWrapValue = wrapValue(map);
  const { x, y } = point;
  return [
    partialWrapValue(x - 1, y),
    partialWrapValue(x + 1, y),
    partialWrapValue(x, y - 1),
    partialWrapValue(x, y + 1)
  ];
};

export const checkAnswer = (list: PointList) => (point: Coords) => (
  tile: boolean
): PointList => {
  return tile ? [] : addToList(list, point);
};

export const addAdjacent = (map: Map) => (list: PointList) => (
  point: Coords
): PointList => {
  return findAdjacent(map)(point)
    .map(checkAnswer(list)(point))
    .caseOf({
      just: tile => tile,
      nothing: () => []
    });
};

export const filterDuplicates = (arr: PointList): boolean => {
  const problems = arr.filter((item: Coords) => {
    const matching = arr.filter((checkItem: Coords) => {
      return pointMatch(item)(checkItem);
    });
    return matching.length > 1;
  });
  return problems.length < 1;
};

export const pointMatch = (matchPoint: Coords) => (point: Coords): boolean =>
  matchPoint.x === point.x && matchPoint.y === point.y;

export const isInList = (list: PointList, point: Coords): boolean => {
  const partialPointMatch = pointMatch(point);
  return list.filter(partialPointMatch).length > 0;
};

const filterInPrevList = (prevList: PointList) => (
  pointList: PointList
): boolean => {
  return !isInList(prevList, pointList[0]);
};

export const getMoveOptions = (prevList: PointList) => (map: Map) => (
  list: PointList
): PointList[] => {
  const startPoint = list[0];
  const partialAddAdjacent = addAdjacent(map)(list);
  return squaresAround(map)(startPoint)
    .map(partialAddAdjacent)
    .filter(entry => entry.length > 0)
    .filter(entry => entry.length < 13) // this is stop it timing out by trying too hard
    .filter(filterDuplicates)
    .filter(filterInPrevList(prevList));
};

// try out all possible and return new list of options
export const getMultipleMoveOptions = (prevList: PointList) => (map: Map) => (
  lists: PointList[]
): PointList[] => {
  return _.flatMap(lists, list => {
    return getMoveOptions(prevList)(map)(list);
  });
};

export const findAnswer = (targetPoint: Coords) => (
  potentialAnswer: PointList
): boolean => pointMatch(potentialAnswer[0])(targetPoint);

export const findAnswerInList = (targetPoint: Coords) => (
  list: PointList[]
): Maybe<PointList> => {
  const partialFindAnswer = findAnswer(targetPoint);
  const found = _.find(list, partialFindAnswer);
  if (found) {
    return Maybe.just(found);
  }
  return Maybe.nothing();
};

export const flipAnswer = (list: PointList) => _.reverse(list);

export const processMoveList = (prevList: PointList) => (map: Map) => (
  lists: PointList[]
) => (targetPoint: Coords): Maybe<PointList> => {
  // combine all nodes we've tried already
  const allPrevious = combinePreviousPaths([prevList, ...lists]);
  const moveOptions = getMultipleMoveOptions(allPrevious)(map)(lists);

  if (moveOptions.length === 0) {
    return Maybe.nothing();
  }

  const solution = findAnswerInList(targetPoint)(moveOptions);

  return solution.caseOf({
    just: value => {
      return Maybe.just(flipAnswer(value));
    },
    nothing: () => {
      return processMoveList(allPrevious)(map)(moveOptions)(targetPoint);
    }
  });
};

export const findPath = (map: Map) => (start: Coords) => (
  target: Coords
): Maybe<PointList> => {
  if (start.equals(target)) {
    return Maybe.nothing();
  }
  return processMoveList([start])(map)([[start]])(target);
};

const sortArray = (a: Coords[], b: Coords[]): number => {
  if (b.length < a.length) {
    return -1;
  }
  if (b.length > a.length) {
    return 1;
  }
  return 0;
};

// do findPath for each thing, return shortest
export const findClosestPath = (map: Map) => (start: Coords) => (
  targets: List<Coords>
): Maybe<PointList> => {
  return actualFindClosestPath(map, start, targets);
};

const actualFindClosestPath = (
  map: Map,
  start: Coords,
  targets: List<Coords>
): Maybe<PointList> => {
  const partialFindPath = findPath(map)(start);
  const paths = targets
    .map(partialFindPath)
    .map(obj => obj.valueOr([]))
    .filter(arr => arr.length > 0)
    .sort(sortArray);

  return paths.count() > 0 ? Maybe.just(paths.first()) : Maybe.nothing();
};

// work out what first move is according to directions
export const findNextDirection = (pointList: PointList): Coords => {
  const parts = _.slice(pointList, 0, 2);
  const start = parts[0];
  const end = parts[1];
  return new Coords({
    x: calcDifference(start.x, end.x),
    y: calcDifference(start.y, end.y)
  });
};

const calcDifference = (start: number, end: number): number => {
  const diff = end - start;
  if (diff < -1) {
    return 1;
  }
  if (diff > 1) {
    return -1;
  }
  return diff;
};

// collect all paths and gets the coords used so we don't go there again and end
// up in a big stupid loop for no reason
export const combinePreviousPaths = (pointLists: PointList[]): PointList => {
  return pointLists.reduce((allPoints, pointList) => {
    const newPoints = pointList.filter(point => {
      return !isInList(allPoints, point);
    });
    return [...pointList, ...newPoints];
  }, []);
};
