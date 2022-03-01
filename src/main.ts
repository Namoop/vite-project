// @ts-ignore
window["globals"] = [];

import maps from "#config/maps.toml";
import dots from "#config/dots.toml";
import towers from "#config/towers.toml";
import laneMapString from "#images/dotlane.png";
import redTower from "#images/bob.png";
import {
	beginLoop,
	preload,
	Sprite,
	SVGSprite,
	Button,
	World, Point
} from "./assets/lib/lib";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(World.canvas);
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
	}).move(100, 180);
	lane.onclick = () => {
		World.deleteAll();
		laneInit();
	};
}

let map: typeof maps.interface;
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
	dots.forEach((d) => {
		if (d.touchingAny(Tower)) d.hide();
		else d.show();
	});
}

class Tower extends Sprite {
	dirspeed = 0.2;
	bullet: typeof towers.interface.bullet;
	constructor(type: string) {
		super(type == "red" ? redTower : "");
		this.bullet = towers[type].bullet;
	}
	newBullet (target: Point) {
		new Bullet(this, target)
	}
}

class Bullet extends SVGSprite {
	spawn = World.frame;
	link: Tower;
	target: Point
	stats: typeof towers.interface.bullet;
	private xlastmovedframe = World.frame-1;
	private ylastmovedframe = World.frame-1;
	get x() {
		if (this.xlastmovedframe != World.frame) {
			this.xlastmovedframe = World.frame
			let radians = Math.atan2(this.target.y - super.y, this.target.x - super.x);
			World.debuglines = [
				[new Point(this.link.x, this.link.y), new Point(this.target.x, this.target.y)]
			]
			super.x += this.stats.speed*Math.cos(radians)
		}
		return super.x;
	}
	get y() {
		if (this.ylastmovedframe != World.frame) {
			this.ylastmovedframe == World.frame
			let radians = Math.atan2(this.target.y - super.y, this.target.x - super.x);
			globals[0] = Math.round(radians * 180/Math.PI)
			super.y += this.stats.speed*Math.sin(radians)
		}
		return super.y;
	}
	set x(z) {
		super.x = z;
	}
	set y(z) {
		super.y = z;
	}
	constructor(link: Tower, target: Point) {
		super(link.bullet.src);
		this.stats = link.bullet
		this.link = link;
		this.x = link.x;
		this.y = link.y;
		this.target = target
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
		this.path = path;
		this.speed = c.speed;
		this.health = c.health;
	}
	get x() {
		let fin = Number(this.path[0][0]);
		let dist = (World.frame - this.spawn) * this.speed;
		for (let i = 1; dist >= 0; i++) {
			if (!this.path[i]) {
				delete World.getAll()[this.id];
				break;
			}
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
			if (!this.path[i]) {
				delete World.getAll()[this.id];
				break;
			}
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
