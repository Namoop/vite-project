import { ViteToml } from "vite-plugin-toml";

export default {
	plugins: [ViteToml({ useBigInt: false })],
	resolve: {
		alias: {
			"#root": __dirname,
			"#images": __dirname + "/src/assets/images",
			"#config": __dirname + "/src/assets/config",
			"#classes": __dirname + "/src/assets/classes",
			"#src": __dirname + "/src",
		},
	},
};
