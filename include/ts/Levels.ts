import { BoardSize } from "./BoardSize";
import { Jetpack } from "./Jetpack";
import { Loader } from "./Loader";
import { SavedLevel } from "./SavedLevel";

export class Levels {

	levelID: number = 0;
	levels: object = {};
	jetpack: Jetpack;
	loader: Loader;

	constructor(jetpack: Jetpack, loader: Loader) {
		this.jetpack = jetpack;
		this.loader = loader;
	}

	getLevelList(callback) {
		this.loader.callServer("getLevelsList", {}, (data) => {
			const levelList = this.cleanLevelList(data);
			callback(levelList);
		}, () => {
			const levelList = this.cleanLevelList([]);
			callback(levelList);
		});
	}

	// turn array of numbers into list key'd by levelID with object of won/lost
	cleanLevelList(list) {
		const levelList = [];
		for (const i in list) {
			const levelID = parseInt(list[i]);
			levelList[levelID] = {
				levelID,
				completed: false,
			};
		}
		return levelList;
	}

	populateLevelsList(levelList): void {
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

		for (const i in levelList) {
		    const levelID: number = parseInt(i);
		    const el = document.createElement("option");
		    el.textContent = levelID.toString();
		    el.value = levelID.toString();
		    if (levelID == this.levelID) {
		    	el.selected = true;
		    }
		    select.appendChild(el);
		}​
	}

	saveLevel(board: object, boardSize: BoardSize, levelID: number, callback: (number) => any): void {
		const saveData = new SavedLevel(boardSize, board, levelID);
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
		this.getLevelList(() => {

		});
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

	saveData(levelID: number, rotationsUsed: number, score: number, callback: (object) => any): void {
		const params = {
			levelID,
			rotationsUsed,
			score,
		};
		this.loader.callServer("saveScore", params, (data: object) => {
			callback(data);
		}, () => {
			callback({msg: "call failed"});
		});
	}
}
