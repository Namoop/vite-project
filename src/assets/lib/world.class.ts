import { Sprite } from "./sprite.class";
import config from "../config/system.toml";
export { World, Point, Poly };
type SpriteObj = { [key: string]: Sprite };
let sprites: SpriteObj = {};
let tempcnv = document.createElement("canvas")
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
		let apos = new Point(a.x, a.y)
		let bpos = new Point(b.x, b.y)
		//polyactual = poly.map(a=>a.add(apos))
		
		//if either are inside of the other, any random point would be inside
		if (a.poly[0].add(apos).inPoly(b.poly, bpos)) return true;
		if (b.poly[0].add(bpos).inPoly(a.poly, apos)) return true;
		
		//this part checks if any line from poly a
		//intersects with any line from poly b
		for (let i = 0; i < a.poly.length; i++)
			for (let k = 0; k < b.poly.length; k++)
				if (lineIntersects(
					...a.poly[i].add(apos).arr(),
					...(a.poly[i+1] ?? a.poly[0]).add(apos).arr(),

					...b.poly[k].add(bpos).arr(),
					...(b.poly[k+1] ?? b.poly[0]).add(bpos).arr()
				)) return true
		return false;
	},
	frame: 0,
	nextframe: new Promise(() => {}),
	hover: null as null | Sprite,
	canvas: tempcnv,
	context: tempcnv.getContext("2d") as CanvasRenderingContext2D,
	scale: 1,
	debugView: config.runOptions.debugView,
};

class Point {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	add(b:Point) {
		return new Point (this.x+b.x, this.y+b.y)
	}
	arr(): [number, number] {
		return [this.x, this.y];
	}
	inPoly(poly: Poly, offset?: Point) {
		if (offset) poly = poly.map(b=>b.add(offset)) as Poly
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
type Poly = { 0: Point; 1: Point; 2: Point } & Point[];

// function polyTouchingPoly (a: Poly, b: Poly) {
// 	let apos = new Point(a.x, a.y)
// 	let bpos = new Point(b.x, b.y)
// 	//polyactual = poly.map(a=>a.add(apos))
	
// 	//if either are inside of the other, any random point would be inside
// 	if (a.poly[0].add(apos).inPoly(b.poly, bpos)) return true;
// 	if (b.poly[0].add(bpos).inPoly(a.poly, apos)) return true;
	
// 	//this part checks if any line from poly a
// 	//intersects with any line from poly b
// 	for (let i = 0; i < a.poly.length; i++)
// 		for (let k = 0; k < b.poly.length; k++)
// 			if (intersects(
// 				...a.poly[i].add(apos).arr(),
// 				...(a.poly[i+1] ?? a.poly[0]).add(apos).arr(),

// 				...b.poly[k].add(bpos).arr(),
// 				...(b.poly[k+1] ?? b.poly[0]).add(bpos).arr()
// 			)) return true
// 	return false;
// }

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
	World.context.moveTo(a*World.scale, b*World.scale)
	World.context.lineTo(c*World.scale,d*World.scale)
	let det, gamma, lambda;
	det = (c - a) * (s - q) - (r - p) * (d - b);
	let ans = false
	if (det === 0) {
		//return false;
	} else {
		lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
		gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
		ans = 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
	}
	return ans
}
