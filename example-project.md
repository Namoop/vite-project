```ts
import toml from "#config/maps.toml";
import { cnv, Time, loop } from "./assets/lib";
import { Button, Sprite } from "./assets/classes/sprite.class";
import Bob from "#images/bob.png";
import lmnop from "#images/brown.png";
const app = document.getElementById("app") as HTMLElement;
app.appendChild(cnv);

let bob: Sprite, button: Sprite;
function init() {
	let img = new Image();
	img.src = Bob;
	bob = new Sprite(img).move(100, 100).resize(200);
	bob.draggable = true;

	bob.glide(600, 100, 10);
	Time.in(5, "seconds", () => {
		bob.move(100, 100).glide(350, 100, 10);
		console.log(toml);
		console.log("you're welcome");
	});

	button = new Button("balloon 12pt", { width: 100 });
	console.log(button);
	let bruh = new Image();
	bruh.src = lmnop;
	let square = new Sprite(bruh);
	square.move(80, 150).resize(100, 200);
	//square.zIndex = 3n
	button.zIndex = 2n;
	let rect = new Sprite(bruh);
	rect.move(90, 180);

	rect.onhover = () => {
		console.log("rect hovered");
	};
	bob.onclick = () => {
		console.log("Face clicked");
	};
}
function myloop() {
	bob.direction += 0.1;
	button.move(Math.sin(Date.now() / 3000) * 100 + 200, 200);
	button.pointTowards(bob);
}

init();
loop(myloop);
```
