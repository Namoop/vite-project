declare module "*/maps.toml" {
	const file: {
		[map: string]: {
			background: string;
			life: number;
			gold: number;
			path_start: [number, number];
			path: ["l" | "u" | "d" | "r", number][][];
			waves: string[][]
		};
	};
	export default file;
}

declare module "*/dots.toml" {
	const file: {
		// @ts-ignore index-signature things
		spawndelay: number;
		[dot: string]: {
			speed: number;
			health: number;
			src: string;
			srcSize: number;
			onDeath: string[];
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
			range: number;
			spread: number;
		};
	};
	export default file;
}
