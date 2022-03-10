declare const globals: any[];

declare module "*/system.toml" {
	const file: {
		runOptions: {
			gamespeed: number;
			scale: number;
			stop: boolean;
			debugView: boolean;
		};
		mouse: {
			onHoverDelay: number;
		};
	};
	export default file;
}
