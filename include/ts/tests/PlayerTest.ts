/// <reference path="../typings/mocha/mocha.d.ts" />
//
import Player from '../compiled/Player.js';
mocha = require('mocha');

// basic testa
assert = require('assert');
describe('Player', function() {
	describe('incrementPlayerFrame', function() {
		it('should do nothing when the eggs are still', function(){
			player = new Player;
			player.direction = 0;
			player.oldDirection = 0;
			player.currentFrame = 0;
			var returnVal = player.incrementPlayerFrame();
			assert.equal(returnVal, false);
		});
	});
});


