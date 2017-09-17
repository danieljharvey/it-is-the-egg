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

  const map = new Map(undefined, boardSize);

  rotateData.map(data => {
    const expected = new Coords({ x: data.outX, y: data.outY });

    const coords = new Coords({ x: data.inX, y: data.inY });
    const result = map.translateRotation(coords, data.clockwise);
    return expect(result).toEqual(expected);
  });
});

test("Correct board size with shrinking", () => {
  const board = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0]
  ];

  const boardSize = {
    width: 4,
    height: 4
  };

  const expected = [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];

  const map = new Map();

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Correct board size with shrinking", () => {
  const board = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0]
  ];

  const boardSize = {
    width: 6,
    height: 6
  };

  const tileSet = new TileSet();
  const map = new Map(tileSet);

  const tile = map.cloneTile(1);

  const expected = [
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [0, 1, 0, 0, 0, tile],
    [tile, tile, tile, tile, tile, tile]
  ];

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Correct non-existant empty board to reasonably full one", () => {
  const board = [];

  const boardSize = {
    width: 5,
    height: 5
  };

  const tileSet = new TileSet();
  const map = new Map(tileSet);

  const tile = map.cloneTile(1);

  const expected = [
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile],
    [tile, tile, tile, tile, tile]
  ];

  const result = map.correctBoardSizeChange(board, boardSize);
  expect(result).toEqual(expected);
});

test("Get all tiles test", () => {
  const board = [
    [
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "0"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "1"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "2"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "3"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "4"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "5"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "6"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "7"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "8"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "9"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "10"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "11"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "0",
        y: "12"
      },
      {
        id: 3,
        title: "Cacti",
        img: "cacti.png",
        background: true,
        needsDraw: false,
        frontLayer: true,
        collectable: 1,
        drawnBefore: true,
        x: "0",
        y: "13"
      }
    ],
    [
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "0"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "1"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "2"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "3"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "4"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "5"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "6"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "7"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "8"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "9"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "10"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "11"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "12"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "1",
        y: "13"
      }
    ],
    [
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "0"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "1"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "2"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "3"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "4"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "5"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "6"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "7"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "8"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "9"
      },
      {
        id: 2,
        title: "Fabric",
        img: "fabric.png",
        background: false,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "10"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "11"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "12"
      },
      {
        id: 1,
        title: "Sky",
        img: "sky.png",
        background: true,
        needsDraw: false,
        drawnBefore: true,
        x: "2",
        y: "13"
      }
    ]
  ];

  const tileSet = configureTileSetMock();

  const map = new Map(tileSet, null, board);

  expect(map.getAllTiles()).toMatchSnapshot();
});

test("Fix board", () => {
  const board = [[{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }]];

  const tileSet = new TileSet();
  const map = new Map(tileSet);

  const tile1 = map.cloneTile(1).modify({ x: 0, y: 0 });
  const tile2 = map.cloneTile(2).modify({ x: 1, y: 0 });

  const tile3 = map.cloneTile(2).modify({ x: 0, y: 1 });
  const tile4 = map.cloneTile(1).modify({ x: 1, y: 1 });

  const expected = [[tile1, tile2], [tile3, tile4]];

  const result = map.fixBoard(board);
  expect(result).toEqual(expected);
});
