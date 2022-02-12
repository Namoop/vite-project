declare module "*/system.toml" {
	const file: {
		runOptions: {
			gamespeed: number;
			scale: number;
			stop: boolean;
		};
		mouse: {
			onHoverDelay: number;
		}
	};
	export default file;
}

declare module "*/maps.toml" {
	const file: {};
	export default file;
}
