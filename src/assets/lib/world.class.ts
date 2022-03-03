import { Sprite } from "./sprite.class";
import config from "../config/system.toml";
export { World, Point, Poly };
type SpriteObj = { [key: string]: Sprite };
const sprites: SpriteObj = {};
const tempcnv = document.createElement("canvas");
/** World object that offers useful data about the current state of the game and other methods*/
const World = {
	/** Removes every sprite from the world */
	deleteAll() {
		Object.keys(sprites).forEach((key) => delete sprites[key]);
	},
	/** Remove the specified sprite from existence
	 * @param {Sprite} target Target sprite to delete
	 */
	delete(target: Sprite) {
		delete sprites[target.id];
	},
	/** Returns an object with every sprite where the key is the sprite ID */
	getAll() {
		return sprites;
	},
	gameBounds: {
		top: 0,
		bottom: 400,
		right: 800,
		left: 0,
	},
	/** Returns a boolean that is true if the given sprite or point is out of the viewable screen, or the bounds specified with (World.gameBounds = {right: 600, top:0...})
	 * @param {Sprite | Point} target Can be a point or a sprite
	 */
	OutOfBounds(target: Sprite | Point) {
		return (
			target.y < this.gameBounds.top ||
			target.y > this.gameBounds.bottom ||
			target.x < this.gameBounds.left ||
			target.x > this.gameBounds.right
		);
	},
	/** Returns an array with every sprite of the specified type
	 * @param {Function} type e.g. Button, Sprite, etc
	 * @param {boolean} exact If true will not include extensions: getEvery(Sprite, true) would not include Button, only basic Sprites
	 */
	getEvery(type: Function, exact?: boolean) {
		const arr = Object.values(sprites);
		if (exact) return arr.filter((a) => a.constructor == type);
		else return arr.filter((a) => a instanceof type);
	},
	/** Async function that will execute code after waiting x number of frames
	 * @param {number} frames How many frames to wait - most useful to wait one frame when code internally is not executed in the preffered order
	 * @param {Function} callback Callback function after waiting frames
	 */
	async inFrames(frames: number, callback?: Function) {
		for (let n = 0; n < frames; n++) await World.nextframe;
		if (callback) callback();
	},
	/** Returns true if both sprites' hitboxes are currently colliding */
	areColliding(first: Sprite, second: Sprite): boolean {
		const colliding = polyTouchingPoly(
			first.getHitbox(),
			second.getHitbox()
		);
		return colliding;
	},
	frame: 0,
	nextframe: new Promise(() => {}),
	hover: null as null | Sprite,
	canvas: tempcnv,
	context: tempcnv.getContext("2d") as CanvasRenderingContext2D,
	scale: 1,
	debugView: config.runOptions.debugView,
	debuglines: [] as [Point, Point][],
};

/** Has an x and a y value. Comes with usefull functions
 * @param {number} x
 * @param {number} y
 */
class Point {
	_x = 0;
	_y = 0;
	width = 100;
	height = 100;
	dir = 0;
	get x() {
		const radians = this.dir * (Math.PI / 180);
		const rotated =
			this._x * Math.cos(radians) - this._y * Math.sin(radians);
		const dilated = (rotated * this.width) / 100;
		return dilated;
	}
	set x(z) {
		this._x = z;
	}
	get y() {
		const radians = this.dir * (Math.PI / 180);
		const rotated =
			this._x * Math.sin(radians) + this._y * Math.cos(radians);
		const dilated = (rotated * this.height) / 100;
		return dilated;
	}
	set y(z) {
		this._y = z;
	}
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	add(b: Point) {
		return new Point(this.x + b.x, this.y + b.y);
	}
	arr(): [number, number] {
		return [this.x, this.y];
	}
	inPoly(poly: Poly) {
		const pt = this;
		let c: boolean, i: number, l: number, j: number;
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
	dilate(width: number, height?: number) {
		this.width = width;
		this.height = height ?? width;
		return this;
	}
	rotate(degrees: number) {
		this.dir = degrees;
		return this;
	}
}
/** An array of points, with a minimum length of three */
type Poly = { 0: Point; 1: Point; 2: Point } & Point[];

function polyTouchingPoly(a: Poly, b: Poly) {
	//if either are inside of the other, any random point would be inside
	if (a[0].inPoly(b)) return true;
	if (b[0].inPoly(a)) return true;

	//this part checks if any line from poly a
	//intersects with any line from poly b
	for (let i = 0; i < a.length; i++)
		for (let k = 0; k < b.length; k++)
			if (
				lineIntersects(
					...a[i].arr(),
					...(a[i + 1] ?? a[0]).arr(),

					...b[k].arr(),
					...(b[k + 1] ?? b[0]).arr()
				)
			)
				return true;
	return false;
}

/** returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s) */
function lineIntersects(
	a: number,
	b: number,
	c: number,
	d: number,
	p: number,
	q: number,
	r: number,
	s: number
) {
	let gamma, lambda;
	const det = (c - a) * (s - q) - (r - p) * (d - b);
	let ans = false;
	if (det === 0) {
		//return false;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		ans = 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
	}
	return ans;
}
