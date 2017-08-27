import * as _ from 'ramda'; 

// wee lad full of reusable functions

export class Utils {
    static getRandomObjectKey(object: object) {
		const keys = Object.keys(object);
		return this.returnRandomKey(keys);
	}

	static getRandomArrayKey(array: object[]) {
		const keys = _.keys(array);
		return this.returnRandomKey(keys);
	}

	static returnRandomKey(keys) {
		if (keys.length===0) return false;
		return keys[ keys.length * Math.random() << 0];
	}
    //static doSomethingElse(val: string) { return val; }
}