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

//const bob: Sprite, button: Sprite;
function init() {
	const background = `<svg width=800 height=400 style=background-color:#5e5e5e>
	<text x=100 y=80 fill=white font-family=arial font-size=60>Dots Defense Towers</text>
	</svg>`;
	new SVGSprite(background).move(400, 200); //background

	const lane = new Button("Dot Lane", {
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
	const towerbtn = new Sprite(redTower).move(660, 100).resize(80);
	towerbtn.draggable = true;
	towerbtn.ondragend = () => {
		new Tower("red").moveTo(towerbtn).resize(80);
		towerbtn.move(660, 100);
	};

	const nextwavebtn = new Button(" ▶", {
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
	const towers = World.getEvery(Tower) as Tower[];
	towers.forEach(t => {
		if (t.isIdle()) t.rotate(t.dirspeed);

		if (Math.random() > 0.999) t.dirspeed = (Math.random() * 0.2 - 0.1) * 3;
	});

	const dots = World.getEvery(Dot) as Dot[];
	dots.forEach(d => {
		if (d.touchingAny(Bullet)) delete World.getAll()[d.id];
		else d.show();
	});

	const bullets = World.getEvery(Bullet) as Bullet[];
	bullets.forEach(b => {
		const radians = Math.atan2(b.target.y - b.y, b.target.x - b.x);
		if (Math.hypot(b.target.x-b.x, b.target.y-b.y) <= b.stats.speed) b.targetEdge(radians)
		else b.move(b.x+b.stats.speed*Math.cos(radians), b.y+b.stats.speed*Math.sin(radians));

	})
}

class Tower extends Sprite {
	dirspeed = 0.2;
	bullet: typeof towers.interface.bullet;
	private _idlenum = 0;
	constructor(type: string) {
		super(type == "red" ? redTower : "");
		this.bullet = towers[type].bullet;
	}
	newBulconst (target: Point) {
		this.pointTowards(target)
		this._idlenum = World.frame;
		new Bullet(this, target)
	}
	isIdle() {
		return World.frame - this._idlenum > 200
	}
}

class Bullet extends SVGSprite {
	spawn = World.frame;
	link: Tower;
	target: Point
	stats: typeof towers.interface.bullet;
	constructor(link: Tower, target: Point) {
		super(link.bullet.src);
		this.stats = link.bullet
		this.link = link;
		this.x = link.x;
		this.y = link.y;
		this.target = target
	}
	targetEdge(angle: number) {
		this.target.x += 500*Math.cos(angle)
		this.target.y += 500*Math.sin(angle)
	}
}

class Dot extends SVGSprite {
	spawn = World.frame;
	speed: number;
	health: number;
	conf;
	path;
	constructor(type: string, path: typeof map.path[0]) {
		const c = dots[type];
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
		let fin = Number(this.path[0][0]),
			dist = (World.frame - this.spawn) * this.speed;
		for (let i = 1; dist >= 0; i++) {
			if (!this.path[i]) {
				delete World.getAll()[this.id];
				break;
			}
			const [dir, len] = this.path[i];
			if (dir == "r") fin += dist < len ? dist : len;
			if (dir == "l") fin -= dist < len ? dist : len;
			dist -= len;
		}
		return fin;
	}
	get y() {
		let fin = this.path[0][1],
			dist = (World.frame - this.spawn) * this.speed;
		for (let i = 1; dist >= 0; i++) {
			if (!this.path[i]) {
				delete World.getAll()[this.id];
				break;
			}
			const [dir, len] = this.path[i];
			if (dir == "d") fin += dist < len ? dist : len;
			if (dir == "u") fin -= dist < len ? dist : len;
			dist -= len;
		}
		return fin;
	}
}

init();
beginLoop(() => {});
