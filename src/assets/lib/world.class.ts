import { Sprite } from "./sprite.class";
import config from "../config/system.toml"
export { World, Point, Poly };
type SpriteObj = { [key: string]: Sprite };
let sprites: SpriteObj = {};
/** World object that offers useful data about the current state of the game and other methods*/
const World = {
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
	/** Returns true if both sprites' hitboxes are currently colliding */
	areColliding(a: Sprite, b: Sprite): boolean {
		if (a.poly[0].inPoly(b.poly)) return true;
		return false;
	},
	frame: 0,
	nextframe: new Promise(() => {}),
	hover: null as null | Sprite,
	canvas: document.createElement("canvas"),
	scale: 1,
	debugView: config.runOptions.debugView
};

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	arr(): [number, number] {
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

let g = new Point(5, 9);
let jk: Poly = [
	new Point(0, 0),
	new Point(0, 10),
	new Point(10, 10),
	new Point(10, 0),
];
console.log(g.inPoly(jk));

type Poly = { 0: Point; 1: Point; 2: Point } & Point[];
//class Poly extends Array {}
