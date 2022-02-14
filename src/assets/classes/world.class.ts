// @ts-ignore
type SpriteObj = { [key: string]: Sprite };
let sprites: SpriteObj = {};
export class World {
	/** Removes every sprite from the world */
	static deleteAll() {
		sprites = {};
	}
	/** Returns an object with every sprite where the key is the sprite ID */
	static getAll() {
		return sprites;
	}
	/** Returns an array with every sprite of the specified type
	 * @param {Function} type e.g. Button, Sprite, etc
	 * @param {boolean} exact If true will not include extensions: getEvery(Sprite, true) would not include Button
	 */
	static getEvery(type: Function, exact?: boolean) {
		let arr = Object.values(sprites);
		if (exact) return arr.filter((a) => a.constructor == type);
		else return arr.filter((a) => a instanceof type);
	}
	/** Async function that will execute code after waiting x number of frames
	 * @param {number} frames How many frames to wait - most useful to wait one frame when code internally is not executed in the preffered order
	 * @param {Function} callback Callback function after waiting frames
	 */
	static async inFrames(frames: number, callback: Function) {
		for (let n = 0; n < frames; n++) await nextframe;
		callback();
	}
}
