import * as AudioTriggers  from "../AudioTriggers";
import { Board } from "../Board"

test("No change, no sounds", () => {
  const array = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

  const board = new Board(array);

  const actual = AudioTriggers.findEatenThings(board)(board)
  
  expect(actual).toEqual([])
});