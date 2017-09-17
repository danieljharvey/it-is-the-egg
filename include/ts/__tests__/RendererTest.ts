import { BoardSize } from "../BoardSize";
import { Renderer } from "../Renderer";

test("Create small render map", () => {
  
  const boardSize = new BoardSize(5);
  const renderer = new Renderer(null, null, null, null, boardSize, null);

  const expected = [
      [true,true,true,true,true],
      [true,true,true,true,true],
      [true,true,true,true,true],
      [true,true,true,true,true],
      [true,true,true,true,true]
  ];

  const result = renderer.createRenderMap(boardSize);
  expect(result).toEqual(expected);
});
