// @ts-ignore
window["globals"] = [2];

//import maps from "#config/maps.toml";
import laneMapString from "./assets/images/dotlane.png"
import { cnv, beginLoop, preload } from "./assets/lib";
import { Button, Sprite, SVGSprite } from "./assets/classes/sprite.class";
import { World } from "./assets/classes/world.class";
//import tower from "#images/bob.png";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(cnv);

let [laneMap] = preload(laneMapString)

//let bob: Sprite, button: Sprite;
function init() {
	let background = `<svg width=800 height=400 style=background-color:#5e5e5e>
	<text x=100 y=80 fill=white font-family=arial font-size=60>Dots Defense Towers</text>
	</svg>`;
	let bg = new SVGSprite(background).move(400, 200);

	let lane = new Button("Dot Lane", {
		width: 100,
		height: 30,
		textSize: 20,
	}).move(100, 200);
	lane.onclick = () => {
		World.deleteAll();
		laneInit();
	};
}

function laneInit() {

	let bg = new Sprite(laneMap).move(400,200)
}
function myloop() {}
//function loop2 () {console.log("3")}

init();
beginLoop(myloop);
