type SpriteObj = { [key: string]: Sprite };
let sprites: SpriteObj = {};
/** World object that offers useful data about the current state of the game and other methods*/
export const World = {
	/** Removes every sprite from the world */
	deleteAll() {
		sprites = {};
	},
	/** Returns an object with every sprite where the key is the sprite ID */
	getAll() {
		return sprites;
	},
	/** Returns an array with every sprite of the specified type
	 * @param {Function} type e.g. Button, Sprite, etc
	 * @param {boolean} exact If true will not include extensions: getEvery(Sprite, true) would not include Button
	 */
	getEvery(type: Function, exact?: boolean) {
		let arr = Object.values(sprites);
		if (exact) return arr.filter((a) => a.constructor == type);
		else return arr.filter((a) => a instanceof type);
	},
	/** Async function that will execute code after waiting x number of frames
	 * @param {number} frames How many frames to wait - most useful to wait one frame when code internally is not executed in the preffered order
	 * @param {Function} callback Callback function after waiting frames
	 */
	async inFrames(frames: number, callback: Function) {
		for (let n = 0; n < frames; n++) await World.nextframe;
		callback();
	},
	frame: 0,
	nextframe: new Promise(() => {}),
	hover: null as null | Sprite,
	canvas: document.createElement("canvas"),
	scale: 1,
};

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	arr() {
		return [this.x, this.y];
	}
	inPoly(poly: Poly) {
		let pt = this,
			c: boolean,
			i: number,
			l: number,
			j: number;
		for (c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
			((poly[i].y <= pt.y && pt.y < poly[j].y) ||
				(poly[j].y <= pt.y && pt.y < poly[i].y)) &&
				pt.x <
					((poly[j].x - poly[i].x) * (pt.y - poly[i].y)) /
						(poly[j].y - poly[i].y) +
						poly[i].x &&
				(c = !c);
		return c;
	}
}

type Poly = Point[];
//class Poly extends Array {}