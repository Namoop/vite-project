// @ts-ignore
window["globals"] = [];

import maps from "#config/maps.toml";
import dots from "#config/dots.toml";
import laneMapString from "#images/dotlane.png";
import redTower from "#images/bob.png";
import { beginLoop, preload, Sprite, SVGSprite, Button, World } from "./assets/lib/lib";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(World.canvas);
// @ts-ignore
globals.world = World;
console.log(globalThis)

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
	let towerbtn = new Sprite(redTower).move(660, 100).resize(80);
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

	new Dot("red", map.path[0]);

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
		super(type == "red" ? redTower : "");

	}
}

class Dot extends SVGSprite {
	spawn = World.frame;
	speed: number;
	health: number;
	conf;
	path;
	constructor(type: string, path: typeof map.path[0]) {
		let c = dots[type];
		super(
			`<svg width=${c.srcSize * 2} height=${c.srcSize * 2}>
				${c.src.replaceAll("size", String(c.srcSize))}
			</svg>`
		);
		this.conf = c;
		this.path = path
		this.speed = c.speed;
		this.health = c.health;
	}
	get x() {
		let fin = Number(this.path[0][0]);
		let dist = (World.frame - this.spawn) * this.speed;
		for (let i = 1; dist >= 0; i++) {
			if (!this.path[i]) {delete World.getAll()[this.id]; break;}
			let [dir, len] = this.path[i];
			if (dir == "r") fin += dist < len ? dist : len;
			if (dir == "l") fin -= dist < len ? dist : len;
			dist -= len;
		}
		return fin;
	}
	get y() {
		let fin = this.path[0][1];
		let dist = (World.frame - this.spawn) * this.speed;
		for (let i = 1; dist >= 0; i++) {
			if (!this.path[i]) {delete World.getAll()[this.id]; break;}
			let [dir, len] = this.path[i];
			if (dir == "d") fin += dist < len ? dist : len;
			if (dir == "u") fin -= dist < len ? dist : len;
			dist -= len;
		}
		return fin;
	}
}

init();
beginLoop(() => {});
