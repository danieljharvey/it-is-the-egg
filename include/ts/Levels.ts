class Levels {
	
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
		this.levelList = Object.keys(localStorage);
		this.populateLevelsList();
	}

	populateLevelsList(): void {
		var select = document.getElementById('levelList');
		if (!select) return false;
		while (select.firstChild) {
		    select.removeChild(select.firstChild);
		}
		for (var i in this.levelList) {
		    var levelID:number = parseInt(this.levelList[i]);
		    var el = document.createElement("option");
		    el.textContent = levelID;
		    el.value = levelID;
		    select.appendChild(el);
		}​
		select.addEventListener('click',this.jetpack.loadLevelFromList);
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
		if (!levelID) levelID = this.generateLevelID();
		if (!levelID) {
			console.log("ALL LEVELS SAVED, GIVE UP");
			return false;
		}
		var saveData = {
			'board':board,
			'boardSize':boardSize,
			'levelID':levelID
		}
		var saveString:string = JSON.stringify(saveData);
		var saveKey:string = levelID.toString();
		localStorage.setItem(saveKey, saveString);
		this.getLevelList();
		this.levelID = levelID;
		callback(levelID);
	}

	loadLevel(levelID: number, callback: (object) => any): void {
		this.getLevelList();
		var params = {
			levelID: levelID
		}
		this.loader.callServer('getLevel',params,function(data: object) {
			this.levelID = data.levelID;
			callback(data.data);
		}, function(errorMsg: string) {
			console.log('ERROR: ',errorMsg);
		})
	}
}