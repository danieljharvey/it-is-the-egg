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

	static returnRandomKey(keys: any[]) {
		if (keys.length===0) return false;
		return keys[ keys.length * Math.random() << 0];
	}

	static getControlStyle(id: string, property: string) {
		const controlHeader = document.getElementById(id);
		if (!controlHeader) return 0;
		const style = window.getComputedStyle(controlHeader);
		const value = style[property];
		if (isNaN(value)) return parseInt(value);
		return value;
	}

	static getControlProperty(id: string, property: string) {
		const controlHeader = document.getElementById(id);
		if (!controlHeader) return 0;
		const value = controlHeader[property];
		if (isNaN(value)) return parseInt(value);
		return value;
	}
}