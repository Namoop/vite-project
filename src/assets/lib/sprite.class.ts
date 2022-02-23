import { Base } from "./events.class";
import { World, Point, Poly } from "./world.class";
/** An object with a postion, that is drawn to the screen
 * and can be moved around, rotated, hidden, etc
 * @param {CanvasImageSource | String} source
 * an htmlImage or a url string to an image
 */
export class Sprite extends Base {
	src: any;
	private _x = 0;
	private _y = 0;
	get x() {
		return this._x;
	}
	set x(z) {
		this._x = z;
	}
	get y() {
		return this._y;
	}
	set y(z) {
		this._y = z;
	}
	direction = 0;
	private _zIndex = 0n;
	get zIndex() {
		if (this.dragging) return 999n;
		return this._zIndex;
	}
	set zIndex(x) {
		this._zIndex = x;
	}
	width = 100;
	height = 100;
	id = 0;
	draggable = false;
	dragging = false;
	private hidden = false;
	effects = {
		blur: 0,
		brightness: 100,
		opacity: 100,
		grayscale: 0,
		hue: 0,
		invert: 0,
		saturate: 100,
	};
	async = {
		glide: 0,
	};
	private _poly: Poly = [new Point(0, 0), new Point(1, 0), new Point(0, 1)];
	get poly() {
		let p = this._poly;
		p.map(
			(a) =>
				new Point((a.x * this.width) / 100, (a.y * this.height) / 100)
		);
		
		return p;
	}
	set poly(h) {
		this._poly = h;
	}
	constructor(src: CanvasImageSource | string, hitbox?: Poly) {
		if (typeof src == "string") {
			let container = new Image();
			container.src = src;
			src = container;
		}
		super();
		while (World.getAll()[this.id]) this.id++;
		this.src = src;

		World.getAll()[this.id] = this;

		if (hitbox) this.poly = hitbox;
		this.src.addEventListener("load", () => {
			this.poly = [
				new Point(-this.src.width / 2, -this.src.height / 2),
				new Point(-this.src.width / 2, +this.src.height / 2),
				new Point(+this.src.width / 2, +this.src.height / 2),
				new Point(+this.src.width / 2, -this.src.height / 2),
			];
		});
	}
	/** Prevents the sprite from being shown or interacted with */
	hide() {
		this.hidden = true;
		return this;
	}
	/** Allow the sprite to be visible and interacted with */
	show() {
		this.hidden = false;
		return this;
	}
	/** Toggle the sprite being hidden or not - prevent or restore visibility and interactivity  */
	toggleHiddenState() {
		this.hidden = !this.hidden;
		return this;
	}
	isHidden() {
		return this.hidden;
	}
	/** Move the position of the sprite
	 * @param {number} x Target position
	 * @param {number} y
	 */
	move(x: number, y: number) {
		if (this.dragging) return this;
		this.x = x;
		this.y = y;
		return this;
	}
	/** Go directly to another sprite
	 * @param {Sprite} target
	 */
	moveTo(target: Sprite) {
		this.move(target.x, target.y);
		return this;
	}
	/** Move the sprite to the center of the screen. Alias to move(400,200)*/
	center() {
		this.move(400, 200);
		return this;
	}
	/** Turn the sprite x degrees
	 * @param {number} degrees The value, in degrees, to change the rotation by
	 */
	rotate(deg: number) {
		this.direction += deg;
		return this;
	}
	/** Change the size (percentage) of the sprite
	 * @param {number} width
	 * @param {number} height | Optional - If left blank will set to same as height
	 */
	resize(width: number, height?: number) {
		if (typeof height == "undefined") this.height = this.width = width;
		else [this.width, this.height] = [width, height];
		return this;
	}

	/** Asynchronously glide to a location
	 * @param {number} x Target position
	 * @param {number} y
	 */
	async glide(x: number, y: number, speed: number) {
		let asyncID = ++this.async.glide;
		while (Math.hypot(x - this.x, y - this.y) > 1) {
			if (asyncID != this.async.glide) return;
			let newX = this.x + (x - this.x) / (speed * 10);
			let newY = this.y + (y - this.y) / (speed * 10);
			this.move(newX, newY);
			await World.nextframe;
		}
		[this.x, this.y] = [x, y];
		this.async.glide = 0;
	}
	//touching() {} //colliding with
	//touchingAll() {} //colliding with type | sprite.touchingAll(Dot) -> [dot1, dot2]

	/** Point towards target sprite
	 * @param {Sprite} target The sprite to orientate towards
	 */
	pointTowards(target: Sprite) {
		let radians = Math.atan2(target.y - this.y, target.x - this.x);
		this.direction = (radians * 180) / Math.PI;
		return this;
	}

	/** Overrides any property or function on any sprite - USE SPARINGLY AND CAREFULLY */
	static Override(spr: Sprite, prop: string, newvalue: any): void {
		// @ts-ignore
		spr[prop] = newvalue;
	}
}
