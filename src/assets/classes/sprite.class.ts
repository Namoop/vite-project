import { Base } from "./events.class";
import { World } from "./world.class";
/** An object with a postion, that is drawn to the screen
 * and can be moved around, rotated, hidden, etc
 * @param {CanvasImageSource | String} source
 * an htmlImage or a url string to an image
 */
export class Sprite extends Base {
	src: any;
	x = 0;
	y = 0;
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
	constructor(src: CanvasImageSource | string) {
		if (typeof src == "string") {
			let container = new Image();
			container.src = src;
			src = container;
		}
		super();
		while (World.getAll()[this.id]) this.id++;
		//this.id = performance.now();
		this.src = src;

		World.getAll()[this.id] = this;
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
		this.direction += deg
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
			await nextframe;
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

export class SVGSprite extends Sprite {
	svg: SVGSVGElement;
	constructor(svg: SVGSVGElement | string) {
		if (typeof svg == "string") {
			let container = document.createElement("div");
			container.innerHTML = svg;
			svg = container.firstChild as SVGSVGElement;
		}
		svg.setAttribute("xmlns", svgURL);
		const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const image = new Image();
		image.src = url;
		image.addEventListener("load", () => URL.revokeObjectURL(url), {
			once: true,
		});
		super(image);
		this.svg = svg;
	}

	refreshSVG() {
		const blob = new Blob([this.svg.outerHTML], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const image = new Image();
		image.src = url;
		image.addEventListener("load", () => URL.revokeObjectURL(url), {
			once: true,
		});
		this.src = image;
	}
}

interface buttonOptions {
	width?: number;
	svgWidth?: number;
	svgHeight?: number;
	height?: number;
	roundedx?: number;
	roundedy?: number;
	fill?: string;
	stroke?: string;
	strokewidth?: number;
	font?: string;
	textSize?: number;
	textColor?: string;
	additionalData?: string;
}
export class Button extends SVGSprite {
	constructor(text: string, op: buttonOptions = {}) {
		const w = op.width ?? 70;
		const h = op.height ?? (op.width ?? 70) / 3.5;
		const sw = op.strokewidth ?? 2;
		const svg = newSVG("svg") as SVGSVGElement;
		setatts(svg, {
			width: op.svgWidth ?? w + sw,
			height: op.svgHeight ?? h + sw,
		});
		const rect = newSVG("rect");
		setatts(rect, {
			x: sw / 2,
			y: sw / 2,
			width: w,
			height: h,
			rx: op.roundedx ?? 15,
			ry: op.roundedy ?? 15,
			fill: op.fill ?? "gray",
			stroke: op.stroke ?? "black",
			"stroke-width": sw,
		});
		const txt = newSVG("text");
		txt.innerHTML = text;
		setatts(txt, {
			fill: op.textColor ?? "white",
			x: w / 2,
			y: h / 2,
			"font-family": op.font ?? "Arial",
			"font-size": op.textSize ?? 15,
			"text-anchor": "middle",
			"dominant-baseline": "central",
		});

		svg.appendChild(rect);
		svg.appendChild(txt);
		if (op.additionalData) svg.innerHTML += op.additionalData;
		super(svg);
	}
	defaultOnBlur(): void {
		this.resize(100);
	}
	defaultOnHover() {
		this.resize(110);
	}
}

const svgURL = "http://www.w3.org/2000/svg";
const newSVG = (type: string) => document.createElementNS(svgURL, type);
const setatts = (el: any, vals: object) => {
	// @ts-ignore
	for (let i of Object.keys(vals)) el.setAttribute(i, vals[i]);
};
