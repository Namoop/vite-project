import { EventBase } from "./events.class";
import { World, Point, Poly } from "./world.class";
/** An object with a postion, that is drawn to the screen
 * and can be moved around, rotated, hidden, etc
 * @param {CanvasImageSource | String} source
 * an htmlImage or a url string to an image
 */
export class Sprite extends EventBase {
	constructor(src: CanvasImageSource | string, hitbox?: Poly) {
		if (typeof src == "string") {
			const container = new Image();
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
	/** internal property for drawing to screen */
	src: any;
	private _x = 0;
	private _y = 0;
	/** the horizontal coordinate of the sprite */
	get x() {
		return this._x;
	}
	set x(z) {
		this._x = z;
	}
	/** the vertical coordinate of the sprite */
	get y() {
		return this._y;
	}
	set y(z) {
		this._y = z;
	}
	/** orientation of the sprite in degrees */
	direction = 0;
	private _zIndex = 0n;
	/** drawing layer of the sprite (e.g. background should be 0) | use BigInt (0n, 2n) */
	get zIndex() {
		if (this.dragging) return 999n;
		return this._zIndex;
	}
	set zIndex(x) {
		this._zIndex = x;
	}
	/** horizontal stretch as a percentage 0-100, of the sprite */
	width = 100;
	/** vertical stretch as a percentage 0-100, of the sprite */
	height = 100;
	/** id in World.getAll() object. If this sprite is deleted another sprite may use the same id */
	id = 0;
	/** boolean if the player can click and drag this sprite somewhere else */
	draggable = false;
	private hidden = false;
	/** visual effects on the sprite */
	effects = {
		blur: 0,
		brightness: 100,
		opacity: 100,
		grayscale: 0,
		hue: 0,
		invert: 0,
		saturate: 100,
	};
	protected async = {
		glide: 0,
	};
	private _poly: Poly = [new Point(0, 0), new Point(1, 0), new Point(0, 1)];
	/** The hitbox as an array of points, each relative to the center of the sprite. Accounts for resizing and rotating */
	get poly() {
		this._poly.forEach((a) =>
			a.dilate(this.width, this.height).rotate(this.direction)
		);

		return this._poly;
	}
	set poly(h) {
		this._poly = h;
	}

	/** Returns the hitbox relative to (0,0). You can also use Sprite.poly to get the hitbox relative to the sprite's position */
	getHitbox() {
		const tPoint = new Point(this.x, this.y);
		const translatedPoly = this.poly.map((a) => a.add(tPoint));
		return translatedPoly as Poly;
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
		const asyncID = ++this.async.glide;
		while (Math.hypot(x - this.x, y - this.y) > 1) {
			if (asyncID != this.async.glide) return;
			const newX = this.x + (x - this.x) / (speed * 10);
			const newY = this.y + (y - this.y) / (speed * 10);
			this.move(newX, newY);
			await World.nextframe;
		}
		[this.x, this.y] = [x, y];
		this.async.glide = 0;
	}
	/** Returns a boolean which is true if the hitbox (by default a square) of sprite is colliding with the hitbox of the target sprite, or if either is entirely within the other
	 * @param {Sprite} target
	 */
	touching(target: Sprite) {
		return World.areColliding(this, target);
	}
	/** Returns true if touching any sprite of the given type
	 * @param {Function} type e.g. Button, Sprite, etc
	 * @param {boolean} exact If true will not include extensions: touchingAny(Sprite, true) would not include Button, only basic Sprites
	 */
	touchingAny(type: Function, exact?: boolean) {
		for (const k of World.getEvery(type, exact))
			if (this.touching(k)) return true;
		return false;
	}
	/** Returns an array with every sprite on top of this one.
	 * @param {Function} type Optional parameter to specify only one type of sprite
	 * @param {boolean} exact Optional parameter if passing a type to not include inherited sprites (eg passing (Sprite, true) does not include Button)
	 */
	allCollisions(type?: Function, exact?: boolean) {
		const ret = []
		for (const k of World.getEvery(type ?? Sprite, exact))
			if (this.touching(k)) ret.push(k)
		return ret
	}

	/** Point towards target sprite
	 * @param {Sprite} target The sprite to orientate towards | OR
	 * @param {{x: number, y: number}} target An object with an x and y
	 */
	pointTowards(target: Sprite | {x: number, y: number}) {
		const radians = Math.atan2(target.y - this.y, target.x - this.x);
		this.direction = (radians * 180) / Math.PI;
		return this;
	}

	/** Overrides any property or function on any sprite - USE SPARINGLY AND CAREFULLY */
	static Override(spr: Sprite, prop: string, newvalue: any): void {
		// @ts-ignore
		spr[prop] = newvalue;
	}
}
