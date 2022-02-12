declare let nextframe: any;
// @ts-ignore
type SpriteObj = { [key: string]: Sprite };
declare let sprites: SpriteObj;
declare let globals: any[];

// declare module "*.png" {
// 	const file: any;
// 	export default file;
// }
// declare module "*.svg" {
// 	const file: any;
// 	export default file;
// }


interface OffscreenCanvas extends EventTarget {
	width: number;
	height: number;
	getContext(
		contextId: "2d",
		contextAttributes?: CanvasRenderingContext2DSettings
	): OffscreenCanvasRenderingContext2D | null;
}
interface OffscreenCanvasRenderingContext2D
	extends CanvasState,
		CanvasTransform,
		CanvasCompositing,
		CanvasImageSmoothing,
		CanvasFillStrokeStyles,
		CanvasShadowStyles,
		CanvasFilters,
		CanvasRect,
		CanvasDrawPath,
		CanvasText,
		CanvasDrawImage,
		CanvasImageData,
		CanvasPathDrawingStyles,
		CanvasTextDrawingStyles,
		CanvasPath {
	readonly canvas: OffscreenCanvas;
}

declare var OffscreenCanvas: {
	prototype: OffscreenCanvas;
	new (width: number, height: number): OffscreenCanvas;
};
