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

declare module "*/maps.toml" {
	const file: {
		[map: string]: {
			background: string;
			life: number;
			gold: number;
			path_start: [number, number];
			path: ["l" | "u" | "d" | "r", number][][];
		};
	};
	export default file;
}

declare module "*/dots.toml" {
	const file: {
		[dot: string]: {
			speed: number;
			health: number;
			src: string;
			srcSize: number;
		};
	};
	export default file;
}

declare module "*/towers.toml" {
	const file: {
		[tower: string]: {
			src: string;
			bullet: {
				power: number;
				size: number;
				src: string;
				speed: number;
			};
			magazine_size: number;
			pellets: number;
			fireDelay: number;
			reloadTime: number;
		};
	};
	export default file;
}
