import { Board } from "../Board";
import { BoardSize } from "../BoardSize";
import { Coords } from "../Coords";
import { Map } from "../Map";
import { Player } from "../Player";
import { RenderMap } from "../RenderMap";
import { TileSet } from "../TileSet";

function configureTileSetMock() {
  const tileSet = jest.fn(); // create mock that does nothing
  tileSet.getTile = id => {
    return {
      id,
      title: "made up tile"
    };
  };

  return tileSet;
}

const renderMap = new RenderMap;

test("Create render map from board changes", () => {

  const tileSet = configureTileSetMock();

  const map = new Map(tileSet, new BoardSize(1), []);

  const tile1 = map.cloneTile(1);
  const tile2 = map.cloneTile(2);

  const boardArray = [
    [tile1,tile1,tile1],
    [tile1,tile1,tile1],
    [tile1,tile1,tile1]
  ];

  const board = new Board(boardArray);

  const newBoard = board.modify(2,2,tile2);

  const expected = [
    [false,false,false],
    [false,false,false],
    [false,false,true],
  ];

  const result = renderMap.createRenderMapFromBoards(board, newBoard);
  expect(result).toEqual(expected);
});

test("Combine render maps", () => {
  const renderMap1 = [
    [false,false,false],
    [false,false,false],
    [false,false,true],
  ];

  const renderMap2 = [
    [true,false,false],
    [false,true,false],
    [false,false,false],
  ];

  const expected = [
    [true,false,false],
    [false,true,false],
    [false,false,true],
  ];

  const map = new Map(undefined, new BoardSize(1), []);

  const result = renderMap.combineRenderMaps(renderMap1, renderMap2);
  expect(result).toEqual(expected);
});

test("Create small render map", () => {

  const expected = [
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true]
  ];

  const result = renderMap.createRenderMap(5, true);
  expect(result).toEqual(expected);
});

test("Mark render map with player in center", () => {

  const originalMap = [
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false]
  ];

  const player = new Player({
    coords: new Coords({x: 2,y: 2})
  });

  const expected = [
    [false,false,false,false,false],
    [false,true,true,true,false],
    [false,true,true,true,false],
    [false,true,true,true,false],
    [false,false,false,false,false]
  ];

  const result = renderMap.addPlayerToRenderMap(player, originalMap);
  expect(result).toEqual(expected);
})

test("Mark render map with player at side of grid", () => {
  
  const originalMap = [
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [false,false,false,false,false]
  ];

  const player = new Player({
    coords: new Coords({x: 4,y: 4})
  });

  const expected = [
    [true,false,false,true,true],
    [false,false,false,false,false],
    [false,false,false,false,false],
    [true,false,false,true,true],
    [true,false,false,true,true]
  ];

  const result = renderMap.addPlayerToRenderMap(player, originalMap);
  expect(result).toEqual(expected);
})

