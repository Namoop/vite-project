import { towerimages, mapimages, config } from "./assets/exports";
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

const [laneMap] = preload(mapimages.lane);
let gold = 0,
	health = 0,
	wave = 1;

init();
function init() {
	World.deleteAll();
	//stop async
	const background = `<svg
	  width=800 height=400 style=background-color:#5e5e5e>
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
	new SVGSprite({
		src: `<svg width=100 height=100><circle cx=50 cy=50 r=50 /></svg>`,
		id: "towerrange",
	})
		.move(100, 100)
		.hide()
		.goToLayer(1).effects.opacity = 40;
	gold = 1000;
	health = 50;
	new TXTSprite({
		text: ()=>gold,
		color: "gold",
		size: 24,
		align: "left",
		formatNumber: true
	}).move(630, 45);

	new TXTSprite({
		text: () => health,
		color: "red",
		size: 24,
		align: "left",
		formatNumber: true
	}).move(730, 45);
}

let map: typeof config.maps.interface;
function laneInit() {
	World.gameBounds.right = 600;
	map = config.maps.lane;
	new IMGSprite({ src: laneMap }).center().goToLayer(-1); //background
	new TowerBtn("red", 660, 100);
	new TowerBtn("blue", 660, 175);
	new TowerBtn("aqua", 660, 250);
	new TowerBtn("pink", 750, 100);

	spawnWaves(map.waves);
	beginLoop(gameloop);
}

function gameloop() {
	//@ts-ignore
	globals[0] = World.hover?.id ?? "";
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
			.filter(
				(d) =>
					Math.hypot(t.x - d.x, t.y - d.y) <= t.range + d.conf.srcSize
			)
			.sort(
				(a, b) =>
					(World.frame - b.spawn) * b.speed -
					(World.frame - a.spawn) * a.speed
			);
		if (t.idle && inRange[0]) {
			t.fire(inRange);
		}
	});

	const wizbullets = bullets.filter((v) => v.parent.type == "aqua");
	globals[1] = wizbullets;
	wizbullets.forEach((wb) => {
		if (wb.target) return;
		const tar = dots.sort((a, b) => b.dist - a.dist)[0];
		wb.target = new Point(tar.x, tar.y);
	});

	bullets.forEach((b) => {
		let radians = Math.atan2(b.target.y - b.y, b.target.x - b.x);
		if (Math.hypot(b.target.x - b.x, b.target.y - b.y) <= b.stats.speed)
			b.targetEdge(radians);
		//if (Math.abs(radians-b.lastAngle) > 0.5)
		//radians = b.lastAngle + (radians < 0 ? -0.5 : 0.5)
		// set max possible radian change using dot.lastAngle
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
	text: TXTSprite;
	constructor(target: string, x: number, y: number) {
		super({ src: twrs[target] });
		this.move(x, y).resize(40);
		this.draggable = true;
		this.text = new TXTSprite({
			text: "$" + config.tower[target].price,
			color: "gold",
			size: 12,
		})
			.link(this)
			.move(0, 30);
		World.inFrames(1, () => this.text.unlink());
		this.ondragstart = () =>
			(async () => {
				const range = World.getById("towerrange");
				range.show();
				range.resize(config.tower[target].range * 2);
				while (this.dragging) {
					range.moveTo(this);
					await World.nextframe;
				}
				range.hide();
			})();

		this.ondragend = () => {
			if (gold >= config.tower[target].price)
				if (!World.OutOfBounds(this))
					if (!this.nearest(40, Tower)[0])
						new Tower(target).moveTo(this).resize(40);
			this.move(x, y);
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
	spread = 0;
	type: string;
	value: number;
	constructor(type: string) {
		super({ src: twrs[type] });
		this.type = type;
		this.goToLayer(2);
		({
			range: this.range,
			reloadTime: this.reloadTime,
			fireDelay: this.fireDelay,
			magazine_size: this.magazineSize,
			pellets: this.pellets,
			bullet: this.bullet,
			spread: this.spread,
			price: this.value,
		} = config.tower[type]);
		gold -= this.value;
	}
	newBullet(target: Point) {
		this.pointTowards(target);
		new Bullet(this, target);
	}
	async fire(inRange: Dot[]) {
		this.idle = false;
		for (let i = 0; i < this.magazineSize; i++) {
			let target = new Point(
				inRange[0].x + this.spread * (Math.random() - 0.5),
				inRange[0].y + this.spread * (Math.random() - 0.5)
			);
			if (this.type == "aqua")
				target = new Point(
					() => inRange[0].x,
					() => inRange[0].y
				); //targetting
			this.newBullet(target);
			// TODO: pellets

			await World.inFrames(this.fireDelay);
		}
		await World.inFrames(this.reloadTime);
		this.idle = true;
	}
	protected defaultOnClick(): void {
		World.getById("towerrange")
			.moveTo(this)
			.resize(this.range * 2)
			.toggleHiddenState();
	}
}

class Bullet extends SVGSprite {
	spawn = World.frame;
	parent: Tower;
	target: Point;
	lastAngle: number;
	stats: typeof config.tower.interface.bullet;
	constructor(parent: Tower, target: Point) {
		super({ src: parent.bullet.src });
		this.stats = { ...parent.bullet };
		this.parent = parent;
		this.x = parent.x;
		this.y = parent.y;
		this.target = target;
		this.lastAngle = (parent.direction * Math.PI) / 180;
	}
	targetEdge(angle: number) {
		this.target.x = this.target.x + 500 * Math.cos(angle);
		this.target.y = this.target.y + 500 * Math.sin(angle);
		if (World.OutOfBounds(this)) World.delete(this);
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
				health--;
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
			//bullet has enough power to kill dot
			b.stats.power -= this.health;
			this.die();
		} else if (this.health < b.stats.power) {
			//bullet does not have enough power, kill it
			this.health -= b.stats.power;
			World.delete(b);
		} else {
			//must be equal, kill both
			World.delete(b);
			this.die();
		}
	}
	die() {
		//animation
		gold += this.conf.health;
		World.delete(this);
		for (let o = 0; o < this.onDeath.length; o++)
			new Dot(this.onDeath[0], this.path).onDeathDist =
				this.dist - o * 35;
	}
}

async function spawnWaves(waves: typeof config.maps.int.waves) {
	const types = ["", "red", "blue", "green", "yellow"];
	const wavebtn = World.getById("wavebtn") as Button;

	for (let curr of waves) {
		await World.inFrames(200, () => wavebtn.enable());
		if (!autoplay) await new Promise((r) => (wavebtn.onclick = r));
		wavebtn.disable();
		let maxlen = curr.reduce((a, v) => Math.max(a, v.length), 0);
		for (let i = 0; i < maxlen; i++) {
			//loop through each index
			for (let p = 0; p < curr.length; p++) {
				//loop through each path and create the balloon
				const type = types[Number(curr[p][i])];
				if (type) new Dot(type, map.path[p]);
			}
			await World.inFrames(config.dot.spawndelay);
		}
		gold += 100 + ++wave;
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
