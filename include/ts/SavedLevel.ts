import { BoardSize } from './BoardSize';

export class SavedLevel {
    boardSize: BoardSize;
    board: any;
    levelID: number;
    
    constructor(boardSize: BoardSize, board: any, levelID: number) {
        this.boardSize = boardSize;
        this.board = board;
        this.levelID = levelID;
    }

    toString() {
        const data = this.getData();
        return JSON.stringify(data);
    }

    getData() {
        return {
            levelID: this.levelID,
            boardSize: this.boardSize.getData(),
            board: this.board,
        }
    }
}