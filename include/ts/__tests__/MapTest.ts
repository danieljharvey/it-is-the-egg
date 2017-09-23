import { Board } from "../Board";
import { Coords } from "../Coords";
import { Map } from "../Map";
import { TileSet } from "../TileSet";
import { BoardSize } from "../BoardSize";

function configureTileSetMock() {
  const tileSet = jest.fn(); // create mock that does nothing
  tileSet.getTile = id => {
    return {
      id: id,
      title: "made up tile"
    };
  };
  return tileSet;
}

test("Translate rotation", () => {
  const rotateData = [
    { inX: 0, inY: 0, clockwise: true, outX: 9, outY: 0 },
    { inX: 9, inY: 0, clockwise: true, outX: 9, outY: 9 },
    { inX: 9, inY: 9, clockwise: true, outX: 0, outY: 9 },
    { inX: 0, inY: 9, clockwise: true, outX: 0, outY: 0 },
    { inX: 0, inY: 0, clockwise: false, outX: 0, outY: 9 },
    { inX: 0, inY: 9, clockwise: false, outX: 9, outY: 9 },
    { inX: 9, inY: 9, clockwise: false, outX: 9, outY: 0 },
    { inX: 9, inY: 0, clockwise: false, outX: 0, outY: 0 }
  ];

  const boardSize = new BoardSize(10);

  const map = new Map(undefined, boardSize, []);

  rotateData.map(data => {
    const expected = new Coords({ x: data.outX, y: data.outY });

    const coords = new Coords({ x: data.inX, y: data.inY });
    const result = map.translateRotation(coords, data.clockwise);
    return expect(result).toEqual(expected);
  });
});

test("Correct board size with shrinking", () => {
  const board = new Board([
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0 ,0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0]
  ]);

  const boardSize = new BoardSize(5); // 5 is minimal actually

  const expected = new Board([[0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0],[0, 1, 0, 0, 0]]);

  const map = new Map(undefined, boardSize, []);

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Correct board size with growing", () => {
  const board = new Board([
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0]
  ]);

  const boardSize = new BoardSize(6;

  const tileSet = new TileSet();
  const map = new Map(tileSet, boardSize, []);

  const tile = map.cloneTile(1);

  const expected = new Board([
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [tile, tile, tile, tile, tile, tile]
  ]);

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Correct non-existant empty board to reasonably full one", () => {
  const board = new Board([]);

  const boardSize = new BoardSize(5);

  const tileSet = new TileSet();
  const map = new Map(tileSet, boardSize, []);

  const tile = map.cloneTile(1);

  const expected = new Board([
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile]
  ]);

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Make board from array", () => {
  const boardArray = [[{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }]];

  const boardSize = new BoardSize(5);

  const tileSet = new TileSet();
  const map = new Map(tileSet, boardSize, []);

  const tile1 = map.cloneTile(1).modify({ x: 0, y: 0 });
  const tile2 = map.cloneTile(2).modify({ x: 1, y: 0 });

  const tile3 = map.cloneTile(2).modify({ x: 0, y: 1 });
  const tile4 = map.cloneTile(1).modify({ x: 1, y: 1 });

  const expected = new Board([[tile1, tile3], [tile2, tile4]]);

  const result = map.makeBoardFromArray(boardArray);
  expect(result).toEqual(expected);
});
