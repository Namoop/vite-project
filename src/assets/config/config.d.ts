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
	const file: {
		[map: string]: {
			background: string,
			life: number,
			gold: number,
			path_start: [number, number],
			path: number[]
		}
	};
	export default file;
}
