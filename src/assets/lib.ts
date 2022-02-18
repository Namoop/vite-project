import { Sprite } from "./classes/sprite.class";
import { World } from "./classes/world.class";
import config from "./config/system.toml";

export const cnv = document.createElement("canvas");
export const ctx = cnv.getContext("2d") as CanvasRenderingContext2D;
cnv.oncontextmenu = function () {
	return false;
};
cnv.style.border = "3px solid #000000";
let hover: Sprite | null, spriteArr: Sprite[];

function filterString(obj: Sprite) {
	let dragshadow = obj.dragging
		? `drop-shadow(${10 * scale}px ${10 * scale}px ${3 * scale}px)`
		: "";
	return `blur(${obj.effects.blur / 10}px)
	brightness(${obj.effects.brightness / 100})
	grayscale(${obj.effects.grayscale / 100})
	hue-rotate(${obj.effects.hue}deg)
	invert(${obj.effects.invert / 100})
	saturate(${obj.effects.saturate / 100})
	${dragshadow}`;
}

function spriteToCanvas(
	context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
	sprite: Sprite
) {
	context.save();
	context.filter = filterString(sprite);
	//context.globalAlpha = sprite.effects.opacity / 100;
	context.translate(sprite.x * scale, sprite.y * scale);
	context.rotate((sprite.direction * Math.PI) / 180);
	context.drawImage(
		sprite.src,
		0 - (sprite.src.width / 2) * (sprite.width / 100) * scale,
		0 - (sprite.src.height / 2) * (sprite.height / 100) * scale,
		((sprite.src.width * sprite.width) / 100) * scale,
		((sprite.src.height * sprite.height) / 100) * scale
	);
	context.restore();
}
export function draw(): void {
	for (let i of spriteArr) {
		spriteToCanvas(ctx, i);
	}
}

const offscreencanvas = new OffscreenCanvas(cnv.width, cnv.height);
const offctx = offscreencanvas.getContext(
	"2d"
) as OffscreenCanvasRenderingContext2D;
function checkHover(): void {
	if (World.frame % config.mouse.onHoverDelay != 0) return;
	if (World.getAll()[hover?.id ?? -1] != hover) hover = null;
	let hoverHold = hover,
		prev = false;
	for (let i of spriteArr) {
		offctx.clearRect(0, 0, offscreencanvas.width, offscreencanvas.height);
		spriteToCanvas(offctx, i);
		let newpixel: string;
		newpixel = offctx
			.getImageData(Mouse.raw.x, Mouse.raw.y, 1, 1)
			.data.join();
		let touching = newpixel != "0,0,0,0";

		if (hover == i) {
			if (!touching) hoverHold = null;
			prev = true;
		}
		if (!hover || prev) if (touching) hoverHold = i;
	}

	if (hoverHold != hover) {
		hover?.onblur();
		hoverHold?.onhover();
	}
	hover = hoverHold;
}

export const Time = {
	sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
	in: async function (time: number, unit: string, callback: Function) {
		switch (unit) {
			case "m":
			case "minutes":
				time *= 60;
			//break;
			case "ms":
			case "milliseconds":
				break;
			case "s":
			case "seconds":
			default:
				time *= 1000;
		}
		await this.sleep(time);
		callback();
	},
};

const kp: any = {};
window.onkeydown = window.onkeyup = function (e) {
	if (e.key.length == 1)
		kp[
			e.key.toLowerCase() == e.key
				? e.key.toUpperCase()
				: e.key.toLowerCase()
		] = 0;
	kp[e.key] = e.type == "keydown" ? kp[e.key] || Date.now() : 0;
	//const event = `key ${e.key} ${e.type.slice(3)}`;
	//me.onEvent?.[event]?.(event, Date.now() - kp[e.key]);
	//if (me.logEvents) console.log(event);
};

let windowMouseX: number, windowMouseY: number;
cnv.onmousemove = (e) => {
	if (hover?.draggable) onClickStartSprite = null;
	[windowMouseX, windowMouseY] = [e.clientX, e.clientY];
	if (hover?.dragging) [hover.x, hover.y] = Mouse.pos;
	else if (hover?.draggable && Mouse.left) {
		hover.dragging = true;
		hover.ondragstart();
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
let onClickStartSprite: Sprite | null;
let clickCancel: number;
cnv.onmouseup = function (e) {
	windowMouseDownArray[e.button] = false;
	let dragThisEvent = false;
	if (hover == onClickStartSprite) {
		if (hover?.draggable) {
			if (!hover.dragging) {
				dragThisEvent = true;
				hover.dragging = true;
				hover?.ondragstart();
			}
		}
		onClickStartSprite?.onclick();
	}
	if (hover?.dragging && !dragThisEvent) {
		hover.dragging = false;
		hover.ondragend();
	}
	clearTimeout(clickCancel);
	hover?.onmouseup();
};
// cnv.ontouchend = function (/*e*/) {
// 	//might be broken
// 	windowMouseDownArray[0] = false;
// };
cnv.onmousedown = function (e) {
	windowMouseDownArray[e.button] = true;
	onClickStartSprite = hover;
	clickCancel = setTimeout(() => (onClickStartSprite = null), 5000);
	hover?.onmousedown();
};
// cnv.ontouchstart = function (e) {
// 	//might be broken
// 	[windowMouseX, windowMouseY] = [e.touches[0].clientX, e.touches[0].clientY];
// 	windowMouseDownArray[0] = true;
// };

/** Returns user mouse input including position and buttons pressed */
export const Mouse = {
	/** The position of the mouse, before scale transformations. Used internally. */
	raw: {
		get x() {
			let data = windowMouseX - cnv.getBoundingClientRect().x;
			if (isNaN(data)) data = 0;
			return data;
		},
		get y() {
			let data = windowMouseY - cnv.getBoundingClientRect().y;
			if (isNaN(data)) data = 0;
			return data;
		},
	},
	/** X Position of mouse pointer, relative to canvas (0-800) */
	get x() {
		let relative = this.raw.x / scale;
		let rounded = Math.round(relative * 100) / 100;
		return rounded;
	},
	/** Y Position of mouse pointer, relative to canvas (0-400) */
	get y() {
		let relative = this.raw.y / scale;
		let rounded = Math.round(relative * 100) / 100;
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

let resolveframe: Function, run: Function, scale: number;
let fps: number[] = [];
World.nextframe = new Promise((r) => (resolveframe = r));

let looping = false;
export function beginLoop(func: Function) {
	if (looping) {
		run = func;
	} else {
		loop(func);
		looping = true;
	}
}
function loop(func: Function | number): void {
	//manage internals
	if (typeof func == "function") run = func;
	World.frame++;
	fps.push(Date.now());
	let dg = document.getElementById("dg") as HTMLElement;
	dg.innerText = `fps: ${fps.length}`;
	let mDOM = document.getElementById("mouse") as HTMLElement;
	mDOM.innerHTML = Mouse.x + " &#9; " + Mouse.y;
	while (Date.now() - fps[0] > 980) fps.shift();

	//clear and resize canvas
	// 82475 from: /800 (base width), /100 (scale as percentage), *0.97 (canvas overflow)
	scale = (window.innerWidth * config.runOptions.scale) / 82475;
	offscreencanvas.width = cnv.width = 800 * scale;
	offscreencanvas.height = cnv.height = 400 * scale;

	//run code!
	run();
	spriteArr = Object.values(World.getAll())
		.filter((k) => !k.hidden)
		.sort((a, b) => Number(a.zIndex - b.zIndex));
	draw();
	resolveframe();
	checkHover();
	globals[0] = hover?.constructor.name as string
	(document.getElementById("other") as HTMLElement).innerHTML = globals.join();

	//prepare for next frame
	World.nextframe = new Promise((r) => (resolveframe = r));
	if (!config.runOptions.stop) {
		if (config.runOptions.gamespeed == 0)
			window.requestAnimationFrame(loop);
		else
			setTimeout(
				window.requestAnimationFrame,
				config.runOptions.gamespeed,
				loop
			);
	} else looping = false;
}

/** Converts image url's into images - should be called at beggining of script
 * @param {string} ImageURL any number...
 */
export function preload(...args: string[]) {
	let arr = [];
	for (let i of args) {
		let container = new Image();
		container.src = i;
		arr.push(container);
	}
	return arr;
}
