import { BoardSize } from "./BoardSize";

export class SavedLevel {
  public boardSize: BoardSize;
  public board: any;
  public levelID: number;

  constructor(boardSize: BoardSize, board: any, levelID: number) {
    this.boardSize = boardSize;
    this.board = board;
    this.levelID = levelID;
  }

  public toString() {
    const data = this.getData();
    return JSON.stringify(data);
  }

  public getData() {
    return {
      levelID: this.levelID,
      boardSize: this.boardSize.getData(),
      board: this.board
    };
  }
}
