import { Sprite, spriteOptions } from "./sprite.class";
import { World } from "./world.class";
// @ts-ignore
interface svgOptions extends spriteOptions {
	src: SVGSVGElement | string
}
export class SVGSprite extends Sprite {
	svg: SVGSVGElement;
	constructor({src: svg, id}: svgOptions) {
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
		super({src: image, id: id});
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
}
export class Button extends SVGSprite {
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
		super({src: svg, id: op.id});
	}
	private blurring = false
	async defaultOnBlur() {
		if (this.blurring) return;
		this.blurring = true
		while (this.effects.brightness > 71) {
			this.effects.brightness -=
				(this.effects.brightness - (this.hovering ? 70 : 100)) / 20;
			if (!this.blurring) return;
			await World.nextframe;
		}
	}
	async defaultOnHover() {
		if (!this.blurring) return;
		this.blurring = false
		while (this.effects.brightness <= 100) {
			this.effects.brightness -=
				(this.effects.brightness - (this.hovering ? 70 : 100)) / 20;
			if (this.blurring) return;
			await World.nextframe;
		}
	}

	// defaultOnBlur(): void {
	// 	this.resize(100);
	// }
	// defaultOnHover() {
	// 	this.resize(110);
	// }
}

const svgURL = "http://www.w3.org/2000/svg";
const newSVG = (type: string) => document.createElementNS(svgURL, type);
const setatts = (el: any, vals: object) => {
	// @ts-ignore
	for (const i of Object.keys(vals)) el.setAttribute(i, vals[i]);
};
