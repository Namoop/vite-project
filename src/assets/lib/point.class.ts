/** An array of points, with a minimum length of three */
export type Poly = { 0: Point; 1: Point; 2: Point } & Point[];
/** Has an x and a y value. Comes with useful methods
 * @param {number} x
 * @param {number} y
 */
export class Point {
	*[Symbol.iterator]() {
		yield this._x
		return this._y
	}
	__x = 0 as number | (()=>number);
	__y = 0 as number | (()=>number);
	get _x ():number {
		if (typeof this.__x == "function") return this.__x()
		else return this.__x
	}
	get _y ():number {
		if (typeof this.__y == "function") return this.__y()
		else return this.__y
	}
	set _x(z: number | (()=>number)) {this.__x = z}
	set _y(z: number | (()=>number)) {this.__y = z}
	width = 100;
	height = 100;
	dir = 0;
	/** Get the point as an array */
	get a() {
		type PointLike = [number, number]
		return [this.x, this.y] as PointLike;
	}
	/** Horizontal position of the point */
	get x():number {
		const radians = this.dir * (Math.PI / 180);
		const rotated =
			this._x * Math.cos(radians) - this._y * Math.sin(radians);
		const dilated = (rotated * this.width) / 100;
		return dilated;
	}
	set x(z: number | (()=>number)) {
		this._x = z;
	}
	/** Vertical position of the point */
	get y():number {
		const radians = this.dir * (Math.PI / 180);
		const rotated =
			this._x * Math.sin(radians) + this._y * Math.cos(radians);
		const dilated = (rotated * this.height) / 100;
		return dilated;
	}
	set y(z: number | (()=>number)) {
		this._y = z;
	}
	constructor(x: number | (()=>number), y: number | (()=>number)) {
		this.x = x;
		this.y = y;
	}
	/** Add a point to this point - the x and y combine */
	add(b: Point) {
		return new Point(this.x + b.x, this.y + b.y);
	}
	/** Check if the point exists inside of the given polygon */
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
	/** Resize the position of the point relative to the origin - more useful when resizing a group of points to resize a shape */
	dilate(width: number, height?: number) {
		this.width = width;
		this.height = height ?? width;
		return this;
	}
	/** Rotate a point around the origin - useful when rotating a group of points to rotate a shape */
	rotate(degrees: number) {
		this.dir = degrees;
		return this;
	}
	/** Returns true if either poly a or poly b is fully inside of or intersecting with at any edge the other poly */
	static polyTouchingPoly(a: Poly, b: Poly) {
		//if either are inside of the other, any random point would be inside
		if (a[0].inPoly(b)) return true;
		if (b[0].inPoly(a)) return true;
	
		//this part checks if any line from poly a
		//intersects with any line from poly b
		for (let i = 0; i < a.length; i++)
			for (let k = 0; k < b.length; k++)
				if (
					Point.lineIntersects(
						...a[i].a,
						...(a[i + 1] ?? a[0]).a,
	
						...b[k].a,
						...(b[k + 1] ?? b[0]).a
					)
				)
					return true;
		return false;
	}
	/** returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s) */
	static lineIntersects(
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
	
}