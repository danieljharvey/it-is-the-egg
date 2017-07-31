export class Levels {
	
	levelID:number = 0;
	levels:object = {};
	levelList:array = [];
	jetpack: Jetpack;
	loader: Loader;

	constructor(jetpack: Jetpack, loader: Loader) {
		this.jetpack = jetpack;
		this.loader = loader;
	}

	getLevelList(): void {
		this.loader.callServer('getLevelsList',{}, (data) => {
			this.levelList = data.data;
			this.populateLevelsList();
		});
	}

	populateLevelsList(): void {
		var select = document.getElementById('levelList');
		if (!select) return false;
		while (select.firstChild) {
		    select.removeChild(select.firstChild);
		}
		var nullEl = document.createElement('option');
		nullEl.textContent = "New";
		nullEl.value = false;
		if (!this.levelID) nullEl.selected = true;
		select.appendChild(nullEl);

		for (var i in this.levelList) {
		    var levelID:number = parseInt(this.levelList[i]);
		    var el = document.createElement("option");
		    el.textContent = levelID.toString();
		    el.value = levelID.toString();
		    console.log(levelID, this.levelID);
		    if (levelID == this.levelID) {
		    	el.selected = true;
		    }
		    select.appendChild(el);
		}​
	}

	generateLevelID(): number {
		for (var levelID = 1; levelID < 10000; levelID++) {
			var levelIDString:string = levelID.toString();
			if (this.levelList.indexOf(levelIDString) == -1) {
				return levelID;
			}
		}
		return 0;
	}

	saveLevel(board: object, boardSize: object, levelID: number, callback: (number) => any): void {
		var saveData = {
			'board':board,
			'boardSize':boardSize,
			'levelID':levelID
		}
		var saveString:string = JSON.stringify(saveData);
		var saveKey:string = levelID.toString();
		var params = {
			data: saveString
		};
		if (levelID) {
			params.levelID = levelID;
		}
		this.loader.callServer('saveLevel', params, (data: object) => {
			this.levelID = data.data;
			callback(data.data);
		},function(errorMsg: string) {
			console.log('ERROR: ',errorMsg);
		});
	}

	loadLevel(levelID: number, callback: (object) => any, failCallback: () => any): void {
		this.getLevelList();
		var params = {
			levelID: levelID
		}
		this.loader.callServer('getLevel',params, (data: object) => {
			this.levelID = levelID;
			callback(data.data);
		}, function(errorMsg: string) {
			console.log('ERROR: ',errorMsg);
			failCallback();
		})
	}
}
