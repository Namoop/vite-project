import { Base } from "./events.class";

export class Sprite extends Base {
	src: any;
	x = 0;
	y = 0;
	direction = 0;
	zIndex: bigint = 0n;
	width = 100;
	height = 100;
	id = 0;
	draggable = false;
	dragging = false;
	effects = {
		blur: 0,
		brightness: 100,
		opacity: 100,
		grayscale: 0,
		hue: 0,
		invert: 0,
		saturate: 100,
	};
	constructor(src: CanvasImageSource) {
		super();
		while (sprites[this.id]) this.id++;
		//this.id = performance.now();
		this.src = src;

		sprites[this.id] = this;
	}
	/** Move the position of the sprite
	 * @param {number} x Target position
	 * @param {number} y
	 */
	move(x: number, y: number): Sprite {
		if (this.dragging) return this;
		this.x = x;
		this.y = y;
		return this;
	}
	/** Change the size (percentage) of the sprite
	 * @param {number} width
	 * @param {number} height | Optional - If left blank will set to same as height
	 */
	resize(width: number, height?: number): Sprite {
		if (typeof height == "undefined") this.height = this.width = width;
		else [this.width, this.height] = [width, height];
		return this;
	}

	/** Asynchronously glide to a location
	 * @param {number} x Target position
	 * @param {number} y
	 */
	async glide(x: number, y: number, speed: number) {
		while (Math.hypot(x - this.x, y - this.y) > 1) {
			this.x += (x - this.x) / (speed * 10);
			this.y += (y - this.y) / (speed * 10);
			await nextframe;
		}
		[this.x, this.y] = [x, y];
	}

	//touching() {} //colliding with
	//touchingAll() {} //colliding with type | sprite.touchingAll(Dot) -> [dot1, dot2]

	/** Point towards target sprite
	 * @param {Sprite} target The sprite to orientate towards
	 */
	pointTowards(target: Sprite): Sprite {
		let radians = Math.atan2(target.y - this.y, target.x - this.x);
		this.direction = (radians * 180) / Math.PI;
		return this;
	}

	filterString() {
		return `blur(${this.effects.blur/10}px) brightness(${this.effects.brightness/100}) grayscale(${this.effects.grayscale/100}) hue-rotate(${this.effects.hue}deg) invert(${this.effects.invert/100}) saturate(${this.effects.saturate/100})`;
	}
	static Override(spr: Sprite, prop: string, value: any): void {
		// @ts-ignore
		spr[prop] = value;
	}
}

class SVGSprite extends Sprite {
	svg: SVGSVGElement;
	constructor(svg: SVGSVGElement) {
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
	height?: number;
	roundedx?: number;
	roundedy?: number;
	fill?: string;
	stroke?: string;
	strokewidth?: number;
	font?: string;
}
export class Button extends SVGSprite {
	constructor(text: string, op: buttonOptions = {}) {
		const w = op.width ?? 70;
		const h = op.height ?? (op.width ?? 70) / 3.5;
		const sw = op.strokewidth ?? 2;
		const svg = newSVG("svg") as SVGSVGElement;
		setatts(svg, {
			xmlns: svgURL,
			width: w + sw,
			height: h + sw,
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
			stroke: op.stroke ?? "orange",
			"stroke-width": sw,
		});
		const txt = newSVG("text");
		txt.innerHTML = text;
		setatts(txt, {
			fill: "white",
			x: w / 2,
			y: h / 2,
			"font-family": op.font ?? "Arial",
			"text-anchor": "middle",
			"dominant-baseline": "central",
		});

		svg.appendChild(rect);
		svg.appendChild(txt);

		console.log(svg);
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
