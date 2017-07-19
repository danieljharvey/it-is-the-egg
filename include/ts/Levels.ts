function Levels(jetpack: Jetpack) {
	
	var self = this;
	this.levelID = false;
	this.levels = {};
	this.levelList = [];

	this.construct = function(jetpack: Jetpack) {
		this.jetpack = jetpack;
		this.getLevelList();
	}

	this.getLevelList = function() {
		this.levelList = Object.keys(localStorage);
		this.populateLevelsList();
	}

	this.populateLevelsList = function() {
		var select = document.getElementById('levelList');
		while (select.firstChild) {
		    select.removeChild(select.firstChild);
		}
		for (var i in this.levelList) {
		    var levelID = this.levelList[i];
		    var el = document.createElement("option");
		    el.textContent = levelID;
		    el.value = levelID;
		    select.appendChild(el);
		}​
		select.addEventListener('click',self.jetpack.loadLevelFromList);
	}

	this.generateLevelID = function() {
		for (var levelID = 1; levelID < 10000; levelID++) {
			if (this.levelList.indexOf(levelID) == -1) {
				return levelID;
			}
		}
		return false;
	}

	this.saveLevel = function(board: object, boardSize: object, levelID: number, callback: ()) {
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
		var saveString = JSON.stringify(saveData);
		localStorage.setItem(levelID, saveString);
		this.getLevelList();
		this.levelID = levelID;
		callback(levelID);
	}

	this.loadLevel = function(levelID: number, callback: ()) {
		console.log('loadLevel', levelID);
		if (this.levelList.indexOf(levelID) == -1) {
			console.log('Could not load levelID' + levelID + ': does not exist in localStorage');
			return false;
		}
		var dataString = localStorage.getItem(levelID);
		var data = JSON.parse(dataString);
		this.levelID = levelID;
		callback(data);
	}

	this.construct(jetpack);
}