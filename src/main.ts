// @ts-ignore
window["globals"] = [2];

//import maps from "#config/maps.toml";
import laneMapString from "./assets/images/dotlane.png";
import { cnv, beginLoop, preload } from "./assets/lib";
import { Button, Sprite, SVGSprite } from "./assets/classes/sprite.class";
import { World } from "./assets/classes/world.class";
import tower from "#images/bob.png";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(cnv);

let [laneMap] = preload(laneMapString);

//let bob: Sprite, button: Sprite;
function init() {
	let background = `<svg width=800 height=400 style=background-color:#5e5e5e>
	<text x=100 y=80 fill=white font-family=arial font-size=60>Dots Defense Towers</text>
	</svg>`;
	new SVGSprite(background).move(400, 200); //background

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
	new Sprite(laneMap).center(); //background

	let towerbtn = new Button("", {
		roundedx: 0,
		roundedy: 0,
		width: 50,
		height: 50,
		svgWidth: 65,
		fill: "red",
		stroke: "none",
		additionalData: `<rect width=40 height=15 x=25 y=17.5></rect>`,
	})
		.move(660, 100)
		.resize(80);
	towerbtn.draggable = true;
	towerbtn.ondragend = () => {
		new Tower("red").moveTo(towerbtn).resize(80);
		towerbtn.move(660, 100);
	};

	beginLoop(gameloop);
}

function gameloop() {
	let towers = World.getEvery(Tower) as Tower[];
	towers.forEach((t) => {
		t.rotate(t.dirspeed);
		if (Math.random() > 0.999) t.dirspeed = (Math.random() * 0.2 - 0.1) * 3;
	});
}

class Tower extends Sprite {
	dirspeed = 0.2;
	constructor(type: String) {
		let src;
		switch (type) {
			case "red":
			default:
				src = tower;
				break;
		}
		super(src);
	}
}
function myloop() {}
//function loop2 () {console.log("3")}

init();
beginLoop(myloop);
