import { Entity, entityOptions } from "./entity.class";
import { World } from "./world.class";
import { Point } from "./point.class";

interface textOptions extends entityOptions {
	text: string | (() => string | number);
	font?: string;
	size?: number;
	color?: string;
	align?: "center" | "left" | "right";
	formatNumber?: boolean;
}
type getstr = () => string | number;
export class TXTSprite extends Entity {
	drawType = "txt";
	txtfunc: getstr = () => "";
	get text(): string | number {
		if (this.formatNumber) return formatNum(this.txtfunc() as number);
		return this.txtfunc();
	}
	set text(z: string | number | getstr) {
		if (typeof z == "string" || typeof z == "number")
			this.txtfunc = () => z;
		else this.txtfunc = z;
		this.resetPoly();
	}
	font: string;
	size: number;
	color: string;
	align: "center" | "left" | "right";
	twidth = 10;
	theight = 10;
	formatNumber: boolean;
	constructor(op: textOptions) {
		super(op);
		this.text = op.text;
		this.font = op.font ?? "arial";
		this.size = op.size ?? 24;
		this.align = op.align ?? "center";
		this.color = op.color ?? "black";
		this.formatNumber = op.formatNumber ?? false;
		this.resetPoly();
	}
	resetPoly() {
		const measure = World.context.measureText(this.text + "");
		this.twidth = (measure.width * this.size) / 8;
		this.theight = this.size;
		const center =
			this.align == "center"
				? 0
				: this.align == "left"
				? this.twidth / 2
				: this.align == "right"
				? 0 - this.twidth / 2
				: 0;
		this.poly = [
			new Point(-this.twidth / 2 + center, -this.theight / 2),
			new Point(-this.twidth / 2 + center, +this.theight / 2),
			new Point(+this.twidth / 2 + center, +this.theight / 2),
			new Point(+this.twidth / 2 + center, -this.theight / 2),
		];
	}
	backupsvg?: HTMLImageElement;
	backupsvgtext?: string;
	render(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
		ctx.textAlign = this.align;
		ctx.font = this.size + "px " + this.font;
		ctx.fillStyle = this.color;
		ctx.stroke;
		if (!ctx.fillText) {
			let svg = `<svg width=${this.twidth} height=${this.theight} xmlns=${svgURL} ><text font=${this.font} fillstyle=${this.color} >${this.text}</text></svg>`;
			if (this.backupsvgtext != svg) {
				const blob = new Blob([svg], {
					type: "image/svg+xml",
				});
				const url = URL.createObjectURL(blob);
				const image = new Image();
				image.src = url;
				image.addEventListener("load", () => URL.revokeObjectURL(url), {
					once: true,
				});
				this.backupsvgtext = svg;
				this.backupsvg = image;
			}
			ctx.drawImage(
				this.backupsvg as HTMLImageElement,
				(this.width / 100) * World.scale,
				(this.theight / 2) * (this.height / 100) * World.scale
			);
		} else
		ctx.fillText(
			this.text + "",
			(this.width / 100) * World.scale,
			(this.theight / 2) * (this.height / 100) * World.scale
		);
	}
	getBoundingBox(): [number, number, number, number] {
		//if align = right
		//if align = center
		return [
			0,
			(-this.theight / 2) * World.scale,
			this.twidth * World.scale,
			this.theight * World.scale,
		];
	}
}

interface imageOptions extends entityOptions {
	src: HTMLImageElement | string;
}
/** A base sprite that draws an image. Use .move(x, y) or .rotate(degrees) to interact. Check collision with .touching(sprite) and much more.
 * @param {entityOptions} options specify source image and optionally hitbox or id.
 */
export class IMGSprite extends Entity {
	drawType = "img";
	src: HTMLImageElement;
	constructor(op: imageOptions) {
		if (typeof op.src == "string") {
			const container = new Image();
			container.src = op.src;
			op.src = container;
		}
		super(op);
		this.src = op.src;

		const setPoly = () => {
			this.poly = [
				new Point(-this.src.width / 2, -this.src.height / 2),
				new Point(-this.src.width / 2, +this.src.height / 2),
				new Point(+this.src.width / 2, +this.src.height / 2),
				new Point(+this.src.width / 2, -this.src.height / 2),
			];
		};
		if (!op.hitbox) {
			if ((op.src as HTMLImageElement).complete) setPoly();
			else op.src.addEventListener("load", setPoly);
		}
	}
	render(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.src, -(this.src.width / 2), -(this.src.height / 2));
	}
	getBoundingBox(): [number, number, number, number] {
		return [
			-(this.src.width / 2) * (this.width / 100) * World.scale,
			-(this.src.height / 2) * (this.height / 100) * World.scale,
			((this.src.width * this.width) / 100) * World.scale,
			((this.src.height * this.height) / 100) * World.scale,
		];
	}
}

interface svgOptions extends entityOptions {
	src: SVGSVGElement | string;
}
export class SVGEntity extends IMGSprite {
	svg: SVGSVGElement;
	constructor(op: svgOptions) {
		let svg = op.src;
		if (typeof svg == "string") {
			const container = document.createElement("div");
			container.innerHTML = svg;
			svg = container.firstChild as SVGSVGElement;
		}
		svg.setAttribute("xmlns", svgURL);
		const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const image = new Image();
		image.src = url;
		(op as imageOptions).src = image;
		super(op as imageOptions);
		image.addEventListener("load", () => URL.revokeObjectURL(url), {
			once: true,
		});
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

interface buttonOptions extends Omit<svgOptions, "src"> {
	text?: string;
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
	noDarken?: boolean;
}
export class Button extends SVGEntity {
	constructor(op: buttonOptions = {}) {
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
		txt.innerHTML = op.text ?? "";
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
		(op as svgOptions).src = svg;
		super(op as svgOptions);
		this.noDarken = op.noDarken ?? false;
	}
	private blurring = true;
	private noDarken: boolean;
	private _disabled = false;
	get disabled() {
		return this._disabled;
	}
	disable() {
		this._disabled = true;
		this.effects.brightness = 50;
		return this;
	}
	enable() {
		this._disabled = false;
		this.effects.brightness = 100;
		return this;
	}
	get onclick() {
		if (this.disabled) return () => {};
		else return super.onclick;
	}
	set onclick(z) {
		super.onclick = z;
	}
	async defaultOnBlur() {
		if (this.blurring || this.noDarken || !this.disabled) return;
		this.blurring = true;
		while (this.effects.brightness > 71) {
			this.effects.brightness -=
				(this.effects.brightness - (this.hovering ? 70 : 100)) / 20;
			if (!this.blurring) return;
			await World.nextframe;
		}
		this.blurring = false;
	}
	async defaultOnHover() {
		if (!this.blurring || this.noDarken) return;
		this.blurring = false;
		while (this.effects.brightness <= 100) {
			this.effects.brightness -=
				(this.effects.brightness - (this.hovering ? 70 : 100)) / 20;
			if (this.blurring || this.disabled) return;
			await World.nextframe;
		}
		this.blurring = true;
	}
}

const svgURL = "http://www.w3.org/2000/svg";
const newSVG = (type: string) => document.createElementNS(svgURL, type);
const setatts = (el: any, vals: object) => {
	// @ts-ignore Overriding value
	for (const i of Object.keys(vals)) el.setAttribute(i, vals[i]);
};
const formatNum = (n: number) => {
	const round = (r: number, d: number) =>
		Math.round(r * Math.pow(10, d)) / Math.pow(10, d);
	if (n < 1e4) return n + "";
	if (n < 1e6) return round(n / 1e3, 3) + "k";
	if (n < 1e9) return round(n / 1e6, 6) + "m";
	if (n < 1e12) return round(n / 1e9, 9) + "b";
	return "∞";
};

interface viewboxOptions extends entityOptions {
	width: number;
	height: number;
}
export class ViewBox extends Entity {
	pixelwidth: number;
	pixelheight: number; //getter of width including all elements (auto), set width should lock
	scrollbar: ScrollBar;
	//viewwidth, viewheight
	constructor(op: viewboxOptions) {
		super(op);
		this.pixelheight = op.height;
		this.pixelwidth = op.width;
		this.scrollbar = new ScrollBar({ parent: this });
	}
	resize(width: number, height?: number) {
		super.resize(width, height);
		//move scrollbar
		return this;
	}
	get linkOffsetX() {
		return this.getBoundingBox()[0];
	}
	get linkOffsetY() {
		return this.getBoundingBox()[1];
	}
	get clip() {
		return this.getBoundingBox();
	}
	render(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = "orange";
		ctx.fillRect(...this.getBoundingBox());
	}
	getBoundingBox(): [number, number, number, number] {
		return [
			-(this.pixelwidth / 2) * (this.width / 100) * World.scale,
			-(this.pixelheight / 2) * (this.width / 100) * World.scale,
			((this.pixelwidth * this.width) / 100) * World.scale,
			((this.pixelheight * this.height) / 100) * World.scale,
		];
	}
}

interface scrollbarOptions extends Omit<svgOptions, "src"> {
	parent: ViewBox;
}
class ScrollBar extends SVGEntity {
	view: ViewBox;
	constructor(op: scrollbarOptions) {
		super({
			src: `<svg width=20 height = 20><circle cx=10 cy=10 r=10 fill="darkgrey" /></svg>`,
			...op,
		});
		this.link(op.parent);
		this.draggable = true;
		this.view = this.parent as ViewBox;
		this.link = () => this;
		this.move(this.view.pixelwidth, 40); //this.view.getBoundingBox()[2]
	}
	unlink = () => this;

	protected async defaultOnDragStart() {
		while (this.dragging) {
			//this.move(this.view.pixelwidth,this.y)
			await World.nextframe;
		}
	}
}
