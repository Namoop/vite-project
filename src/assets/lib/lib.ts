/// <reference types="./lib"/>
import { World } from "./world.class";
import { Entity } from "./entity.class";

import config from "./system.toml";
import { Mouse } from "./mouse.class";
import {
	Button,
	SVGEntity,
	IMGSprite,
	TXTSprite,
	ViewBox,
} from "./templates.class";
import { Point } from "./point.class";
export {
	IMGSprite,
	TXTSprite,
	Entity,
	SVGEntity,
	Button,
	Point,
	ViewBox,
	World,
	Mouse,
	preload,
	beginLoop,
};

const cnv = World.canvas;
const ctx = World.context;
cnv.oncontextmenu = function () {
	return false;
};
cnv.style.border = "3px solid #000000";
let spriteArr: Entity[];

//prettier-ignore
const getFilterString = (obj: Entity) =>
	`blur(${obj.effects.blur / 10}px)
	brightness(${obj.effects.brightness / 100})
	grayscale(${obj.effects.grayscale / 100})
	hue-rotate(${obj.effects.hue}deg)
	invert(${obj.effects.invert / 100})
	saturate(${obj.effects.saturate / 100})
	${obj.dragging ? `drop-shadow(${10 * World.scale}px ${10 * World.scale}px ${3 * World.scale}px)` : ""}`;

function renderChildren(sprite: Entity, region: Path2D) {
	if (sprite.clip && sprite.children[0]) {
		region.rect(...sprite.clip);
		ctx.clip(region);
	}
	for (const c of sprite.children) {
		ctx.save();
		ctx.filter = getFilterString(c);
		ctx.globalAlpha = c.effects.opacity / 100;
		ctx.translate(
			c.x * World.scale + sprite.linkOffsetX,
			c.y * World.scale + sprite.linkOffsetY
		);
		ctx.rotate((c.direction * Math.PI) / 180);
		ctx.scale(c.mirrored ? -1 : 1, 1);
		c.render(ctx);
		ctx.rect(...c.getBoundingBox());
		ctx.rect(
			c.poly[0].x,
			c.poly[0].y,
			c.poly[2].x - c.poly[0].x,
			c.poly[2].y - c.poly[0].y
		);
		renderChildren(c, region);
		ctx.restore();
	}
}

function draw(): void {
	for (const sprite of spriteArr) {
		ctx.save();
		ctx.filter = getFilterString(sprite);
		ctx.globalAlpha = sprite.effects.opacity / 100;
		ctx.translate(sprite.x * World.scale, sprite.y * World.scale);
		ctx.rotate((sprite.direction * Math.PI) / 180);
		ctx.scale(sprite.mirrored ? -1 : 1, 1);

		if (!sprite.parent) {
			//if it is a top level entity
			//if (Mouse.y < 350 && sprite instanceof TXTSprite)
			sprite.render(ctx);
			if (config.runOptions.debugView) ctx.rect(...sprite.getBoundingBox());
			renderChildren(sprite, new Path2D());
		}
		ctx.restore();
	}

	{
		//draw debug lines
		ctx.save();
		for (const i of World.debuglines) {
			ctx.moveTo(...i[0].dilate(World.scale * 100).a);
			ctx.lineTo(...i[1].dilate(World.scale * 100).a);
		}
		ctx.lineWidth = 3;
		ctx.strokeStyle = "black";
		ctx.stroke();
		ctx.restore();
	}
}

function checkHover(): void {
	if (World.frame % config.mouse.onHoverDelay != 0) return;
	if (World.entities[World.hover?.id ?? -1] != World.hover)
		World.hover = null;
	let hoverHold = World.hover,
		prev = false;
	for (const i of spriteArr) {
		const mPoint = new Point(Mouse.x, Mouse.y);
		const touching = mPoint.inPoly(i.getHitbox());

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
const fps: number[] = [];
World.nextframe = new Promise((r) => (resolveframe = r));
loop(() => {});
/** Used define a function to loop. Will replace the previous function.
 * @param {Function} func A function that will be run once per frame
 */
function beginLoop(func: Function) {
	run = func;
}
function loop(func: Function | number): void {
	//manage internals
	if (typeof func == "function") run = func;
	World.frame++;
	fps.push(Date.now());
	const dg = document.getElementById("dg") as HTMLElement;
	dg.innerText = `fps: ${fps.length}`;
	const mDOM = document.getElementById("mouse") as HTMLElement;
	mDOM.innerHTML = Mouse.x + " &#9; " + Mouse.y;
	while (Date.now() - fps[0] > 980) fps.shift();

	//clear and resize canvas
	// 82475 from: /800 (base width), /100 (scale as percentage), *0.97 (canvas overflow)
	const prevscale = World.scale;
	World.scale = (window.innerWidth * config.runOptions.scale) / 82475;
	if (prevscale != World.scale) {
		cnv.width = 800 * World.scale;
		cnv.height = 400 * World.scale;
	} else {
		cnv.width = cnv.width //less laggy?
		//ctx.clearRect(0, 0, cnv.width, cnv.height);
	}

	//run code!
	run();
	spriteArr = World.getEvery()
		.filter((k) => !k.isHidden())
		.sort((a, b) => Number(a.zIndex - b.zIndex));
	draw();
	resolveframe();
	checkHover();
	try {
		globals[0] = World.hover?.id ?? "";
	} catch {}

	(document.getElementById("other") as HTMLElement).innerHTML =
		//@ts-ignore globals isn't real
		window?.globals?.join();

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
	}
}

/** Converts image url's into images - should be called at beggining of script
 * @param {string} ImageURL any number...
 */
function preload(...args: string[]) {
	const arr = [];
	for (const i of args) {
		const container = new Image();
		container.src = i;
		arr.push(container);
	}
	return arr;
}
