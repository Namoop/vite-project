// @ts-ignore
window["sprites"] = {};
// @ts-ignore
window["globals"] = [2];

import maps from "#config/maps.toml";
import { cnv, Time, loop } from "./assets/lib";
import { Button, Sprite, SVGSprite } from "./assets/classes/sprite.class";
import tower from "#images/bob.png";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(cnv);

//let bob: Sprite, button: Sprite;
function init() {
	let background = `<svg width=800 height=400 style=background-color:#5e5e5e>
	<text x=100 y=80 fill=white font-family=arial font-size=60>Dots Defense Towers</text>
	</svg>`;
	let bg = new SVGSprite(background).move(400, 200);
	console.log(bg.svg);

	let lane = new Button("Dot Lane", {
		width: 100,
		height: 30,
		textSize: 20,
	}).move(100, 200);
}
function myloop() {}

init();
loop(myloop);
