import { Entity } from "./sprite.class";
import { Point } from "./point.class"
import config from "#lib/system.toml";
export { World };
type SpriteObj = { [key: string]: Entity };
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
	delete(target: Entity) {
		delete sprites[target.id];
	},
	/** Returns an object with every sprite where the key is the sprite ID */
	getAll() {
		return sprites;
	},
	/** Returns the sprite with the specified ID
	 * @param {string} id The id to search for
	 */
	getById(id: string) {
		return sprites[id]
	},
	/** An object detailing the bounds for the World.OutOfBounds() function */
	gameBounds: {
		top: 0,
		bottom: 400,
		right: 800,
		left: 0,
	},
	/** Returns a boolean that is true if the given sprite or point is out of the viewable screen, or the bounds specified with (World.gameBounds = {right: 600, top:0...})
	 * @param {Sprite | Point} target Can be a point or a sprite
	 */
	OutOfBounds(target: Entity | Point) {
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
	areColliding(first: Entity, second: Entity): boolean {
		if (!(first.collision && second.collision)) return false;
		const colliding = Point.polyTouchingPoly(
			first.getHitbox(),
			second.getHitbox()
		);
		return colliding;
	},
	frame: 0,
	nextframe: new Promise(() => {}),
	hover: null as null | Entity,
	canvas: tempcnv,
	context: tempcnv.getContext("2d") as CanvasRenderingContext2D,
	scale: 1,
	debugView: config.runOptions.debugView,
	debuglines: [] as [Point, Point][],
};
