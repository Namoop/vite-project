import { towerimages, mapimages, config } from "./assets/exports";
import {
	beginLoop,
	preload,
	IMGSprite,
	SVGSprite,
	//TXTSprite,
	Button,
	World,
	Point,
} from "./assets/lib/lib";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(World.canvas);
//@ts-ignore
(window.globals = []).world = World;

const [laneMap] = preload(mapimages.lane);

//const bob: Sprite, button: Sprite;
init();
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

let autoplay = false;
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
	})
		.move(30, 50)
		.disable();
	new Button({
		text: "🟡  ",
		width: 60,
		height: 30,
		stroke: "none",
		fill: "blue",
		textSize: 25,
		id: "autoplay",
		noDarken: true,
	}).move(100, 50).onclick = function () {
		this.mirrored = !this.mirrored;
		autoplay = !autoplay;
		if (autoplay) World.getById("wavebtn").onclick();
	};
	console.log(World.getAll());
}

let map: typeof config.maps.interface;
function laneInit() {
	map = config.maps.lane;
	new IMGSprite({ src: laneMap }).center(); //background
	new TowerBtn("red", new Point(660, 100));
	new TowerBtn("blue", new Point(660, 150));
	new TowerBtn("aqua", new Point(660, 200));
	new TowerBtn("pink", new Point(750, 150));

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
		d.move(...Dot.distToXY(d));
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

const twrs: { [str: string]: HTMLImageElement } = {
	red: preload(towerimages.red)[0],
	blue: preload(towerimages.blue)[0],
	aqua: preload(towerimages.aqua)[0],
	pink: preload(towerimages.pink)[0],
};

class TowerBtn extends IMGSprite {
	constructor(target: string, pos: Point) {
		super({ src: twrs[target] });
		this.move(...pos.a).resize(40);
		this.draggable = true;
		this.ondragend = () => {
			new Tower(target).moveTo(this).resize(40);
			this.move(...pos.a);
		};
	}
}

class Tower extends IMGSprite {
	dirspeed = 0.2;
	bullet: typeof config.tower.interface.bullet;
	idle = true;
	range: number;
	reloadTime: number;
	fireDelay: number;
	magazineSize: number;
	pellets: number;
	constructor(type: string) {
		super({ src: twrs[type] });
		({
			range: this.range,
			reloadTime: this.reloadTime,
			fireDelay: this.fireDelay,
			magazine_size: this.magazineSize,
			pellets: this.pellets,
			bullet: this.bullet,
		} = config.tower[type]);
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
	stats: typeof config.tower.interface.bullet;
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
	private onDeathDist = 0;
	speed: number;
	health: number;
	onDeath: string[];
	conf;
	path;
	constructor(type: string, path: typeof map.path[0]) {
		const c = config.dot[type];
		super({
			src: `<svg width=${c.srcSize * 2} height=${c.srcSize * 2}>
				${c.src.replaceAll("size", String(c.srcSize))}
			</svg>`,
		});
		this.conf = c;
		this.path = path;
		this.speed = c.speed;
		this.health = c.health;
		this.onDeath = c.onDeath;
	}
	get dist() {
		return (World.frame - this.spawn) * this.speed + this.onDeathDist;
	}
	static distToXY(dot: Dot) {
		let finX = Number(dot.path[0][0]),
			finY = dot.path[0][1],
			dist = dot.dist;
		for (let i = 1; dist >= 0; i++) {
			if (!dot.path[i]) {
				World.delete(dot);
				break;
			}
			const [dir, len] = dot.path[i];
			if (dir == "r") finX += dist < len ? dist : len;
			if (dir == "l") finX -= dist < len ? dist : len;
			if (dir == "d") finY += dist < len ? dist : len;
			if (dir == "u") finY -= dist < len ? dist : len;
			dist -= len;
		}
		return [finX, finY] as [number, number];
	}
	damage(b: Bullet) {
		if (b.stats.power > this.health) {
			b.stats.power -= this.health;
			World.delete(this); //add animation with .collision false?
			for (let o = 0; o < this.onDeath.length; o++)
				new Dot(this.onDeath[0], this.path).onDeathDist =
					this.dist - o * 35; //
		} else if (this.health > b.stats.power) {
			this.health -= b.stats.power;
			World.delete(b);
		} else {
			//must be equal
			World.delete(b);
			World.delete(this);
			for (let o = 0; o < this.onDeath.length; o++)
				new Dot(this.onDeath[0], this.path).onDeathDist =
					this.dist - o * 35;
		}
	}
}

async function spawnWaves(waves: typeof config.maps.int.waves) {
	const types = ["", "red", "blue", "green", "yellow"];
	const wavebtn = World.getById("wavebtn") as Button;
	for (let wave of waves) {
		await World.inFrames(200, () => wavebtn.enable());
		if (!autoplay) await new Promise((r) => (wavebtn.onclick = r));
		wavebtn.disable();
		let maxlen = wave.reduce((a, v) => Math.max(a, v.length), 0);
		for (let i = 0; i < maxlen; i++) {
			//loop through each index
			for (let p = 0; p < wave.length; p++) {
				//loop through each path and create the balloon
				const type = types[Number(wave[p][i])];
				if (type) new Dot(type, map.path[p]);
			}
			await World.inFrames(config.dot.spawndelay);
		}
	}
	while (true) {
		await World.inFrames(200, () => wavebtn.enable());
		if (!autoplay) await new Promise((r) => (wavebtn.onclick = r));
		wavebtn.disable();
		for (let i = 0; i < 12; ) {
			if (Math.random() > 0.99)
				new Dot(
					types[Math.floor(Math.random() * (types.length - 1)) + 1],
					map.path[++i * 0]
				);
			await World.nextframe;
		}
	}
}
