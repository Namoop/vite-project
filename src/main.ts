// @ts-ignore
window["globals"] = [];

import maps from "#config/maps.toml";
import dots from "#config/dots.toml";
import laneMapString from "./assets/images/dotlane.png";
import { cnv, beginLoop, preload } from "./assets/lib";
import { Button, Sprite, SVGSprite } from "./assets/classes/sprite.class";
import { World } from "./assets/classes/world.class";
import tower from "#images/bob.png";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(cnv);
// @ts-ignore
globals.world = World;

const [laneMap] = preload(laneMapString);

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

let map = maps.interface;
function laneInit() {
	map = maps.lane;
	new Sprite(laneMap).center(); //background
	let towerbtn = new Sprite(tower).move(660, 100).resize(80);
	towerbtn.draggable = true;
	towerbtn.ondragend = () => {
		new Tower("red").moveTo(towerbtn).resize(80);
		towerbtn.move(660, 100);
	};

	let nextwavebtn = new Button(" ▶", {
		width: 30,
		height: 30,
		stroke: "none",
		textColor: "blue",
		fill: "orange",
		textSize: 20,
	}).move(20, 50);
	nextwavebtn.onclick = () => {};

	new Dot("red");

	beginLoop(gameloop);
}

function gameloop() {
	let towers = World.getEvery(Tower) as Tower[];
	towers.forEach((t) => {
		t.rotate(t.dirspeed);
		if (Math.random() > 0.999) t.dirspeed = (Math.random() * 0.2 - 0.1) * 3;
	});

	let dots = World.getEvery(Dot) as Dot[];
	dots.forEach;
}

class Tower extends Sprite {
	dirspeed = 0.2;
	constructor(type: string) {
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

class Dot extends SVGSprite {
	spawn = World.frame;
	speed: number;
	health: number;
	conf;
	constructor(type: string) {
		let c = dots[type];
		super(
			`<svg width=${c.srcSize * 2} height=${c.srcSize * 2}>
				${c.src.replaceAll("size", String(c.srcSize))}
			</svg>`
		);
		this.conf = c;
		this.speed = c.speed;
		this.health = c.health;
	}
	get x() {
		let fin = map.path_start[0];
		let dist = World.frame - this.spawn;
		globals[1] = dist
		for (let i = 0; dist >= 0; i++) {
			let [dir, len] = map.path[i];
			if (dist < len) {
				fin += dist
				break;
			}
			dist -= len;
			if (dir == "r") fin += len;
			if (dir == "l") fin -= len;
		}
		//globals[1] = dist
		globals[2] = fin;
		return fin;
	}
	get y () {
		return 150
	}
}

init();
beginLoop(() => {});
