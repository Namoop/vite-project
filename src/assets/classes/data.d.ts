declare let nextframe: any;
declare let globals: any[];

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