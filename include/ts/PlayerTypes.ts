class PlayerTypes {
    playerTypes:object = {
		egg: {
			type:'egg',
			title:"It is of course the egg",
			'img':'egg-sprite.png',
			'frames':18,
			'multiplier':1,
			'value':1
		},
		'red-egg': {
			'type':'red-egg',
			'title':"It is of course the red egg",
			'img':'egg-sprite-red.png',
			'frames':18,
			'multiplier':2,
			value:2
		},
		'blue-egg': {
			'type':'blue-egg',
			'title':"It is of course the blue egg",
			'img':'egg-sprite-blue.png',
			'frames':18,
			'multiplier':5,
			value:3
		},
		'yellow-egg': {
			'type':'yellow-egg',
			'title':"It is of course the yellow egg",
			'img':'egg-sprite-yellow.png',
			'frames':18,
			'multiplier':10,
			value:4
		}
	}

    getPlayerTypes() {
        return this.playerTypes;
    }
}