import { EventBase } from "./events.class";
import { Point, Poly } from "./point.class";
import { World } from "./world.class";
export type entityOptions = {
	hitbox?: Poly;
	id?: string;
};
/** A base sprite. Use .move(x, y) or .rotate(degrees) to interact. Check collision with .touching(sprite) and much more.
 * @param {spriteOptions} options optionally specify hitbox, id, or a sprite to link
 */
export abstract class Entity extends EventBase {
	constructor({ hitbox, id }: entityOptions) {
		super();
		if (hitbox) this.poly = hitbox;
		if (id) this.id = id;
		else while (World.entities[this.id]) (this.id as number)++;
		World.entities[this.id] = this;
	}
	get trueX() {
		return (
			(this._link?.x ?? 0) + this.x + (this._link ? this._link.linkOffsetX : 0)
		);
	}
	get trueY() {
		return (
			(this._link?.y ?? 0) + this.y + (this._link ? this._link.linkOffsetY : 0)
		);
	}
	get trueDirection() {
		return (this._link?.direction ?? 0) + this.direction;
	}
	private _link?: Entity;
	get parent () {
		return this._link
	}
	get linkOffsetX () {
		return 0
	}
	get linkOffsetY () {
		return 0
	}
	/** Attach this sprite to another. While linked both the
	 * position and direction will be relative to the parent.
	 * The sprite will automatically move with the parent.
	 * The position of this sprite will not change when linked,
	 * but will update to be relative to the parent.
	 * @param {Entity} parent The sprite to be linked to
	 */
	link(parent: Entity) {
		if (this._link) throw new Error (`Cannot link to two entities: Connected to entity with id ${this._link.id} and trying to connect to entity with id ${parent.id}.`)
		for (let p:Entity | undefined = parent; p; p=p.parent)
			if (p == this) throw new Error (`Cannot create entity loop: The requested link is itself or its parent, or its parent parent...`)
		this._link = parent;
		this._x -= parent.x;
		this._y -= parent.y;
		this.direction -= parent.direction;
		parent.children.push(this)
		return this;
	}
	get clip (): false | [number, number, number, number] { return false}
	/** Unlink the sprite from its parent. Its x, y, and
	 * direction will set themselves relative to (0,0)
	 * and the sprite will move independently from now on.
	 */
	unlink() {
		if (!this._link) return this;
		this._x = this.trueX;
		this._y = this.trueY;
		this.direction = this.trueDirection;
		this._link.children.splice(this._link.children.indexOf(this), 1)
		this._link = undefined;
		return this;
	}
	children: Entity[] = []
	// getChildren() {
	// 	return World.getEvery().filter((e) => (e._link = this));
	// }
	private _x = 0;
	private _y = 0;
	/** the horizontal coordinate of the sprite */
	get x(): number {
		return this._x;
	}
	set x(z) {
		this._x = z;
	}
	/** the vertical coordinate of the sprite */
	get y(): number {
		return this._y;
	}
	set y(z) {
		this._y = z;
	}
	/** orientation of the sprite in degrees */
	direction = 0;
	private _zIndex = 0;
	/** drawing layer of the sprite (e.g. background should be 0) | use BigInt (0n, 2n) */
	get zIndex() {
		if (this.dragging) return 999;
		return this._zIndex;
	}
	/** Set the layer of the sprite. Use a number to set the exact layer or use a shortcut:
	 *
	 * "back" = backmost layer
	 *
	 * "front" = frontmost layer
	 *
	 * "forward" = up one layer
	 *
	 * "backward" = back one layer
	 */
	goToLayer(z: number | "back" | "front" | "forward" | "backward") {
		try {
			BigInt(z);
		} catch {
			throw new Error(
				"Input to goToLayer() should be an integer (no decimal points)"
			);
		}
		switch (z) {
			case "back":
				this._zIndex = 0;
				break;
			case "front":
				const max = Math.max(...World.getEvery().map((s) => s.zIndex));
				this._zIndex = max + 1;
				break;
			case "forward":
				this._zIndex++;
				break;
			case "backward":
				this._zIndex--;
				break;
			default:
				//must be number
				this._zIndex = z;
				break;
		}
		return this;
	}
	/** If the sprite should be rendered mirrored */
	mirrored = false;
	/** horizontal stretch as a percentage 0-100, of the sprite */
	private _width = 100;
	get width() {
		return this._width;
	}
	protected set width(z) {
		this._width = z;
	}
	/** vertical stretch as a percentage 0-100, of the sprite */
	private _height = 100;
	get height() {
		return this._height;
	}
	protected set height(z) {
		this._height = z;
	}
	/** id in World.getAll() object. If this sprite is deleted another sprite may use the same id */
	id = 0 as number | string;
	/** boolean if the player can click and drag this sprite somewhere else */
	draggable = false;
	/** Method for rendering a sprite - to be defined by the template used */
	abstract render(ctx: CanvasRenderingContext2D): void;
	/** Returns a rectangle (x, y, width height) that should include every pixel this entity would render - To be defined by a template */
	abstract getBoundingBox(): [number, number, number, number];
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
	/** if false, ifTouching() checks will always return false */
	collision = true;

	/** Returns the hitbox relative to (0,0). You can also use Sprite.poly to get the hitbox relative to the sprite's position */
	getHitbox() {
		const tPoint = new Point(this.x, this.y);
		const translatedPoly = this.poly.map((a) => a.add(tPoint));
		return translatedPoly as Poly;
	}

	/** Prevents the sprite from being shown or interacted with */
	hide() {
		this.hidden = true;
		World.hover = null;
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
		if (this.hidden) World.hover = null;
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
	moveTo(target: Entity) {
		this.move(target.x, target.y);
		return this;
	}
	/** Returns a number describing the distance to another sprite
	 * @param {Sprite} target
	 */
	distanceTo(target: Entity) {
		return Math.hypot(this.x - target.x, this.y - target.y);
	}
	/** Returns an array with the closest sprites to this one.
	 * Each sprite in the array will be the same distance away,
	 * there will likely only be one item.
	 * @param {number} maxDist The maximum distance to search (in a circle)
	 * @param {{new(...args: any[]): Entity}} type The type of sprite to search (eg button, svgsprite...)
	 * @param {exact} exactType Should it exclude inherited sprites of the type
	 */
	nearest(
		maxDist: number = 1000,
		type?: { new (...args: any[]): Entity },
		exact?: boolean
	) {
		let furthest: Entity[] = [];
		let dist = 0;
		for (const k of World.getEvery(type, exact)) {
			if (this.distanceTo(k) > maxDist) continue;
			if (this.distanceTo(k) == dist) furthest.push(k);
			else if (this.distanceTo(k) > dist) {
				furthest = [k];
				dist = this.distanceTo(k);
			}
		}
		return furthest;
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
	resize(width = 100, height?: number) {
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
	touching(target: Entity) {
		return World.areColliding(this, target);
	}
	/** Returns true if touching any sprite of the given type
	 * @param {{new(...args: any[]): Entity}} type e.g. Button, Sprite, etc
	 * @param {boolean} exact If true will not include extensions: touchingAny(Sprite, true) would not include Button, only basic Sprites
	 */
	touchingAny(type: { new (...args: any[]): Entity }, exact?: boolean) {
		for (const k of World.getEvery(type, exact))
			if (this.touching(k)) return true;
		return false;
	}
	/** Returns an array with every sprite on top of this one.
	 * @param {{new(...args: any[]): Entity}} type Optional parameter to specify only one type of sprite
	 * @param {boolean} exact Optional parameter if passing a type to not include inherited sprites (eg passing (Sprite, true) does not include Button)
	 */
	allCollisions(type?: { new (...args: any[]): Entity }, exact?: boolean) {
		const ret = [];
		for (const k of World.getEvery(type, exact))
			if (this.touching(k)) ret.push(k);
		return ret;
	}

	/** Point towards target sprite
	 * @param {Sprite} target The sprite to orientate towards | OR
	 * @param {{x: number, y: number}} target An object with an x and y
	 */
	pointTowards(target: Entity | { x: number; y: number }) {
		const radians = Math.atan2(target.y - this.y, target.x - this.x);
		this.direction = (radians * 180) / Math.PI;
		return this;
	}

	/** Overrides any property or function on any sprite | NOT RECCOMENDED FOR RELEASE */
	static Override(spr: Entity, prop: string, newvalue: any): void {
		// @ts-ignore Overriding value no matter what it is
		spr[prop] = newvalue;
	}
}
