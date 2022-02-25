import { World, Point } from "./world.class";
import { Sprite } from "./sprite.class";
import { Button, SVGSprite } from "./templates.class";
import config from "#config/system.toml";
import { Mouse } from "./mouse.class";
export { Sprite, SVGSprite, Button, World, Mouse, preload, beginLoop };

const cnv = World.canvas;
const ctx = World.context;
cnv.oncontextmenu = function () {
	return false;
};
cnv.style.border = "3px solid #000000";
let spriteArr: Sprite[];

function filterString(obj: Sprite) {
	let dragshadow = obj.dragging
		? `drop-shadow(${10 * World.scale}px ${10 * World.scale}px ${
				3 * World.scale
		  }px)`
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
	context.translate(sprite.x * World.scale, sprite.y * World.scale);
	context.rotate((sprite.direction * Math.PI) / 180);
	context.drawImage(
		sprite.src,
		0 - (sprite.src.width / 2) * (sprite.width / 100) * World.scale,
		0 - (sprite.src.height / 2) * (sprite.height / 100) * World.scale,
		((sprite.src.width * sprite.width) / 100) * World.scale,
		((sprite.src.height * sprite.height) / 100) * World.scale
	);

	// if (World.debugView) {
	// 	context.moveTo(sprite.poly[0].x*World.scale,sprite.poly[0].y*World.scale)
	// 	context.beginPath()
	// 	for (let k=0;k<sprite.poly.length;k++) context.lineTo(sprite.poly[k].x*World.scale,sprite.poly[k].y*World.scale)
	// 	context.lineTo(sprite.poly[0].x*World.scale,sprite.poly[0].y*World.scale)
	// 	context.lineWidth = 5
	// 	context.strokeStyle = "orange"
	// 	World.getEvery(Sprite).forEach((s)=>{
	// 		if (s != sprite)
	// 			if (World.areColliding(s, sprite))
	// 				context.strokeStyle = "red"
	// 	})
	// 	context.stroke()
	// }
	context.restore();
}
function draw(): void {
	for (let i of spriteArr) {
		spriteToCanvas(ctx, i);
		if (World.debugView) {
			ctx.lineWidth = 5;
			ctx.strokeStyle = "orange";
			World.getEvery(Sprite).forEach((s) => {
				World.context.beginPath()
				if (s != i) {
					World.areColliding(s, i)
					if (World.areColliding(s, i)) ctx.strokeStyle = "red";
					else ctx.strokeStyle = "orange";
				}
				ctx.stroke();
			});
		}
	}
}

const offscreencanvas = new OffscreenCanvas(cnv.width, cnv.height);
// const offctx = offscreencanvas.getContext(
// 	"2d"
// ) as OffscreenCanvasRenderingContext2D;
function checkHover(): void {
	if (World.frame % config.mouse.onHoverDelay != 0) return;
	if (World.getAll()[World.hover?.id ?? -1] != World.hover)
		World.hover = null;
	let hoverHold = World.hover,
		prev = false;
	for (let i of spriteArr) {
		//method1: pixel perfect
		// offctx.clearRect(0, 0, offscreencanvas.width, offscreencanvas.height);
		// spriteToCanvas(offctx, i);
		// let newpixel: string;
		// newpixel = offctx
		// 	.getImageData(Mouse.raw.x, Mouse.raw.y, 1, 1)
		// 	.data.join();
		// let touching = newpixel != "0,0,0,0";

		//method2: hitbox-based
		let mPoint = new Point(Mouse.x, Mouse.y)
		let touching = mPoint.inPoly(i.getHitbox())

		if (World.hover == i) {
			if (!touching) hoverHold = null;
			prev = true;
		}
		if (!World.hover || prev) if (touching) hoverHold = i;
	}

	if (hoverHold != World.hover) {
		World.hover?.onblur();
		hoverHold?.onhover();
	}
	World.hover = hoverHold;
}

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

let resolveframe: Function, run: Function;
let fps: number[] = [];
World.nextframe = new Promise((r) => (resolveframe = r));

let looping = false;
function beginLoop(func: Function) {
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
	World.scale = (window.innerWidth * config.runOptions.scale) / 82475;
	offscreencanvas.width = cnv.width = 800 * World.scale;
	offscreencanvas.height = cnv.height = 400 * World.scale;

	//run code!
	run();
	spriteArr = Object.values(World.getAll())
		.filter((k) => !k.isHidden())
		.sort((a, b) => Number(a.zIndex - b.zIndex));
	draw();
	resolveframe();
	checkHover();
	globals[0] = World.hover?.constructor.name as string;
	(document.getElementById("other") as HTMLElement).innerHTML =
		globals.join();

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
function preload(...args: string[]) {
	let arr = [];
	for (let i of args) {
		let container = new Image();
		container.src = i;
		arr.push(container);
	}
	return arr;
}
