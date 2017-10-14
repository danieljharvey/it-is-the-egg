import { Record } from "immutable";
import { Board } from "./Board";
import { Player } from "./Player";

interface IGameState {
  players?: Player[];
  board?: Board;
  score?: number;
  rotations?: number;
  rotateAngle?: number;
  outcome?: string;
}

export class GameState extends Record({
  board: null,
  players: [],
  score: 0,
  rotations: 0,
  rotateAngle: 0,
  outcome: ""
}) {
  public players: Player[];
  public board: Board;
  public score: number;
  public rotations: number;
  public rotateAngle: number;
  public outcome: string; // this may be 'level complete' or some other shit, who knows

  constructor(params?: IGameState) {
    params ? super(params) : super();
  }

  public modify(values: IGameState) {
    return this.merge(values) as this;
  }
}
