// @ts-ignore
type SpriteObj = { [key: string]: Sprite };
let sprites: SpriteObj = {};
export class World {
	/** Removes every sprite from the world */
	static deleteAll () {
		sprites = {}
	}
	/** Returns an object with every sprite where the key is the sprite ID */
	static getAll () {
		return sprites
	}
	/** Returns an array with every sprite in the world */
	static getAllAsArr () {
		return Object.values(sprites)
	}
}