import { World } from "./world.class";
import { Entity } from "./entity.class";
export {Mouse}
let windowMouseX: number, windowMouseY: number;
const cnv = World.canvas as HTMLCanvasElement
cnv.onmousemove = (e) => {
	if (World.hover?.draggable) onClickStartSprite = null;
	[windowMouseX, windowMouseY] = [e.clientX, e.clientY];
	if (World.hover?.dragging) [World.hover.x, World.hover.y] = Mouse.pos;
	else if (World.hover?.draggable && Mouse.left) {
		World.hover.ondragstart();
	}
};
// cnv.ontouchmove = (
// 	e //probably broken
// ) =>
// 	([windowMouseX, windowMouseY] = [
// 		e.touches[0].clientX,
// 		e.touches[0].clientY,
// 	]); //consider tap and place?

const windowMouseDownArray = [false, false, false];
let onClickStartSprite: Entity | null, clickCancel: number;
cnv.onmouseup = function (e) {
	windowMouseDownArray[e.button] = false;
	let dragThisEvent = false;
	if (World.hover == onClickStartSprite) {
		if (World.hover?.draggable) {
			if (!World.hover.dragging) {
				dragThisEvent = true;
				World.hover?.ondragstart();
			}
		}
		onClickStartSprite?.onclick(e.button);
	}
	if (World.hover?.dragging && !dragThisEvent) {
		World.hover.ondragend();
	}
	clearTimeout(clickCancel);
	World.hover?.onmouseup();
};
// cnv.ontouchend = function (/*e*/) {
// 	//might be broken
// 	windowMouseDownArray[0] = false;
// };
cnv.onmousedown = function (e) {
	windowMouseDownArray[e.button] = true;
	onClickStartSprite = World.hover;
	clickCancel = setTimeout(() => (onClickStartSprite = null), 5000);
	World.hover?.onmousedown();
};
// cnv.ontouchstart = function (e) {
// 	//might be broken
// 	[windowMouseX, windowMouseY] = [e.touches[0].clientX, e.touches[0].clientY];
// 	windowMouseDownArray[0] = true;
// };

/** Returns user mouse input including position and buttons pressed */
const Mouse = {
	/** The position of the mouse, before scale transformations. Used internally. */
	raw: {
		get x() {
			const data = windowMouseX - cnv.getBoundingClientRect().x;
			if (isNaN(data)) return 0;
			return data;
		},
		get y() {
			const data = windowMouseY - cnv.getBoundingClientRect().y;
			if (isNaN(data)) return 0;
			return data;
		},
	},
	/** X Position of mouse pointer, relative to canvas (0-800) */
	get x() {
		const relative = this.raw.x / (World.scale as number);
		const rounded = Math.round(relative * 100) / 100;
		return rounded;
	},
	/** Y Position of mouse pointer, relative to canvas (0-400) */
	get y() {
		const relative = this.raw.y / (World.scale as number);
		const rounded = Math.round(relative * 100) / 100;
		return rounded;
	},
	/** Returns the mouse x and y as an array */
	get pos() {
		return [this.x, this.y];
	},
	/** Returns true if currently pressed */
	get left() {
		return windowMouseDownArray[0];
	},
	/** Returns true if currently pressed */
	get middle() {
		return windowMouseDownArray[1];
	},
	/** Returns true if currently pressed */
	get right() {
		return windowMouseDownArray[2];
	},
};