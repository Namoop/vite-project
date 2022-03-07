import maps from "#config/maps.toml";
import dotconfig from "#config/dots.toml";
import towerconfig from "#config/towers.toml";
import laneMapString from "#images/dotlane.png";
import redTowerSrc from "#images/bob.png";
import {
	beginLoop,
	preload,
	IMGSprite,
	SVGSprite,
	TXTSprite,
	Button,
	World,
	Point,
} from "./assets/lib/lib";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(World.canvas);
//@ts-ignore
(window.globals = []).world = World;

const [laneMap, redTower] = preload(laneMapString, redTowerSrc);

//const bob: Sprite, button: Sprite;
function init() {
	const background = `<svg width=800 height=400 style=background-color:#5e5e5e>
	<text x=100 y=80 fill=white font-family=arial font-size=60>Dots Defense Towers</text>
	</svg>`;
	new SVGSprite({ src: background }).move(400, 200); //background

	const lane = new Button({
		text: "Dot Lane",
		width: 100,
		height: 30,
		textSize: 20,
	}).move(100, 180);
	lane.onclick = () => {
		World.deleteAll();
		generalSetup();
		laneInit();
	};
}

function generalSetup() {
	new Button({
		text: " ▶",
		width: 40,
		height: 40,
		stroke: "none",
		textColor: "blue",
		fill: "orange",
		textSize: 25,
		id: "wavebtn",
	}).move(30, 50).onclick = (e: number) => {
		//if right click change mode to autoplay
		//if left click play next wave / pause
	};
}

let map: typeof maps.interface;
function laneInit() {
	map = maps.lane;
	new IMGSprite({ src: laneMap }).center(); //background
	const towerbtn = new IMGSprite({ src: redTower }).move(660, 100).resize(80);
	towerbtn.draggable = true;
	towerbtn.ondragend = () => {
		new Tower("red").moveTo(towerbtn).resize(80);
		towerbtn.move(660, 100);
	};

	spawnWaves(map.waves);
	beginLoop(gameloop);
}

function gameloop() {
	const dots = World.getEvery(Dot) as Dot[];
	const bullets = World.getEvery(Bullet) as Bullet[];
	const towers = World.getEvery(Tower) as Tower[];

	dots.forEach((d) => {
		if (d.touchingAny(Bullet))
			d.damage(d.allCollisions(Bullet)[0] as Bullet);
		else d.show();
	});

	towers.forEach((t) => {
		if (t.idle) t.rotate(t.dirspeed);
		if (Math.random() > 0.999) t.dirspeed = (Math.random() * 0.2 - 0.1) * 3;

		let inRange = dots
			.filter((d) => Math.hypot(t.x - d.x, t.y - d.y) <= t.range)
			.sort(
				(a, b) =>
					(World.frame - b.spawn) * b.speed -
					(World.frame - a.spawn) * a.speed
			);
		if (t.idle && inRange[0]) {
			t.fire(inRange);
		}
	});

	bullets.forEach((b) => {
		const radians = Math.atan2(b.target.y - b.y, b.target.x - b.x);
		if (Math.hypot(b.target.x - b.x, b.target.y - b.y) <= b.stats.speed)
			b.targetEdge(radians);
		else
			b.move(
				b.x + b.stats.speed * Math.cos(radians),
				b.y + b.stats.speed * Math.sin(radians)
			);
		if (World.OutOfBounds(b)) World.delete(b);
	});
}

class Tower extends IMGSprite {
	dirspeed = 0.2;
	bullet: typeof towerconfig.interface.bullet;
	idle = true;
	range: number;
	reloadTime: number;
	fireDelay: number;
	magazineSize: number;
	pellets: number;
	constructor(type: string) {
		super({ src: type == "red" ? redTower : "" });
		({
			range: this.range,
			reloadTime: this.reloadTime,
			fireDelay: this.fireDelay,
			magazine_size: this.magazineSize,
			pellets: this.pellets,
			bullet: this.bullet,
		} = towerconfig[type]);
	}
	newBullet(target: Point) {
		this.pointTowards(target);
		new Bullet(this, target);
	}
	async fire(inRange: Dot[]) {
		this.idle = false;
		for (let i = 0; i < this.magazineSize; i++) {
			this.newBullet(new Point(inRange[0].x, inRange[0].y));
			// TODO pellets
			await World.inFrames(this.fireDelay);
		}
		await World.inFrames(this.reloadTime);
		this.idle = true;
	}
}

class Bullet extends SVGSprite {
	spawn = World.frame;
	link: Tower;
	target: Point;
	stats: typeof towerconfig.interface.bullet;
	constructor(link: Tower, target: Point) {
		super({ src: link.bullet.src });
		this.stats = link.bullet;
		this.link = link;
		this.x = link.x;
		this.y = link.y;
		this.target = target;
	}
	targetEdge(angle: number) {
		this.target.x += 500 * Math.cos(angle);
		this.target.y += 500 * Math.sin(angle);
	}
}

class Dot extends SVGSprite {
	spawn = World.frame;
	speed: number;
	health: number;
	conf;
	path;
	constructor(type: string, path: typeof map.path[0]) {
		const c = dotconfig[type];
		super({
			src: `<svg width=${c.srcSize * 2} height=${c.srcSize * 2}>
				${c.src.replaceAll("size", String(c.srcSize))}
			</svg>`,
		});
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
				World.delete(this);
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
				World.delete(this);
				break;
			}
			const [dir, len] = this.path[i];
			if (dir == "d") fin += dist < len ? dist : len;
			if (dir == "u") fin -= dist < len ? dist : len;
			dist -= len;
		}
		return fin;
	}
	damage(b: Bullet) {
		if (b.stats.power > this.health) {
			b.stats.power -= this.health;
			World.delete(this);
			//spawn link
		} else if (this.health > b.stats.power) {
			this.health -= b.stats.power;
			World.delete(b);
			//spawn link
		} else {
			//must be equal
			World.delete(b);
			World.delete(this);
			//spawn link
		}
	}
}

async function spawnWaves(waves: typeof maps.int.waves) {
	let types = ["", "red", "blue", "green", "yellow"];
	for (let wave of waves) {
		await new Promise((r) => (World.getById("wavebtn").onclick = r));
		let maxlen = wave.reduce((a, v) => Math.max(a, v.length), 0);
		for (let i = 0; i < maxlen; i++) {
			//loop through each index
			for (let p = 0; p < wave.length; p++) {
				//loop through each path and create the balloon
				const type = types[Number(wave[p][i])];
				if (type) new Dot(type, map.path[p]);
			}
			await World.inFrames(dotconfig.spawndelay);
		}
	}
	while (true) {
		await new Promise((r) => (World.getById("wavebtn").onclick = r));
		for (let i = 0; i < 12; i++) {
			if (Math.random() > 0.99) new Dot("red", map.path[0]);
			await World.nextframe;
		}
	}
}

init();
beginLoop(() => {});
