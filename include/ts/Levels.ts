import { Jetpack } from "./Jetpack";
import { Loader } from "./Loader";
import { BoardSize } from "./BoardSize";
import { SavedLevel } from "./SavedLevel";

export class Levels {

	levelID: number = 0;
	levels: object = {};
	levelList: number[] = [];
	jetpack: Jetpack;
	loader: Loader;

	constructor(jetpack: Jetpack, loader: Loader) {
		this.jetpack = jetpack;
		this.loader = loader;
	}

	getLevelList(): void {
		this.loader.callServer("getLevelsList", {}, (data) => {
			this.levelList = data;
			this.populateLevelsList();
		}, () => {
			this.levelList = [];
			this.populateLevelsList();
		});
	}

	populateLevelsList(): void {
		const select = document.getElementById("levelList");
		
		if (!select) return;

		while (select.firstChild) {
		    select.removeChild(select.firstChild);
		}
		const nullEl = document.createElement("option");
		nullEl.textContent = "New";
		nullEl.value = "";
		if (!this.levelID) nullEl.selected = true;
		select.appendChild(nullEl);

		for (const i in this.levelList) {
		    const levelID: number = this.levelList[i];
		    const el = document.createElement("option");
		    el.textContent = levelID.toString();
		    el.value = levelID.toString();
		    if (levelID == this.levelID) {
		    	el.selected = true;
		    }
		    select.appendChild(el);
		}​
	}

	generateLevelID(): number {
		for (let levelID = 1; levelID < 10000; levelID++) {
			if (this.levelList.indexOf(levelID) == -1) {
				return levelID;
			}
		}
		return 0;
	}

	saveLevel(board: object, boardSize: BoardSize, levelID: number, callback: (number) => any): void {
		const saveData = new SavedLevel(boardSize,board,levelID);
		const saveString: string = saveData.toString();
		const params = {
			data: saveString,
			levelID: 0,
		};
		if (levelID) {
			params.levelID = levelID;
		}
		this.loader.callServer("saveLevel", params, (levelID) => {
			this.levelID = levelID;
			callback(levelID);
		}, function(errorMsg: string) {
			console.log("ERROR: ", errorMsg);
		});
	}

	loadLevel(levelID: number, callback: (SavedLevel) => any, failCallback: () => any): void {
		this.getLevelList();
		const params = {
			levelID,
		};
		this.loader.callServer("getLevel", params, (data) => {
			this.levelID = levelID;
			const boardSize = new BoardSize(data.boardSize.width);
			const savedLevel = new SavedLevel(boardSize, data.board, levelID);
			callback(savedLevel);
		}, function(errorMsg: string) {
			console.log("ERROR: ", errorMsg);
			failCallback();
		});
	}

	saveData(levelID: number, rotationsUsed:number, score: number, callback: (object) => any): void {
		const params = {
			levelID,
			rotationsUsed,
			score
		}
		this.loader.callServer("saveScore",params, (data: object) => {
			callback(data);
		}, () => {
			callback({msg:"call failed"})
		})
	}
}
