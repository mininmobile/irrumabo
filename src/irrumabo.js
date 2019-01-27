let Engine = Matter.Engine;
let Events = Matter.Events;
let Mouse = Matter.Mouse;
let MouseConstraint = Matter.MouseConstraint;
let Runner = Matter.Runner;
let World = Matter.World;
let Composite = Matter.Composite;
let Composites = Matter.Composites;
let Bodies = Matter.Bodies;

const Tools = utilenum(
	"drag",
	"water",
	"rectangle",
	"circle",
	"brush",
	"eraser",
);

// get buttons
let buttonPause = document.getElementById("pause");
let buttonSettings = document.getElementById("settings");
let buttonTools = document.getElementById("tools");
let buttonComponents = document.getElementById("components");
// get panels
let panelTools = document.getElementById("tools-panel");
let panelToolOptions = document.getElementById("tools-option-panel");
let panelComponents = document.getElementById("components-panel");

let canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;
document.body.appendChild(canvas);

let tool = Tools.drag;
let drawing = undefined;
let paused = false;

// create enviroment
let engine = Engine.create();

let runner = Runner.create({
	delta: 1000 / 30,
	isFixed: false,
	enabled: true,
});

// create example scene
let ballA = Bodies.circle(200, document.body.scrollHeight / 3 - 300, 40, { density: 0.001 });
let groundA = Bodies.rectangle(document.body.scrollWidth / 4, document.body.scrollHeight / 3, document.body.scrollWidth / 2, 60, { isStatic: true, angle: Math.PI * 0.1 });
let ballB = Bodies.circle(200, document.body.scrollHeight / 1.5 - 300, 40, { density: 1 });
let groundB = Bodies.rectangle(document.body.scrollWidth / 4, document.body.scrollHeight / 1.5, document.body.scrollWidth / 2, 60, { isStatic: true, angle: Math.PI * 0.1 });
let groundC = Bodies.rectangle(document.body.scrollWidth / 1.5, document.body.scrollHeight / 1.5, document.body.scrollWidth / 2, 60, { isStatic: true, angle: Math.PI * -0.1 });

World.add(engine.world, [ballA, groundA, ballB, groundB, groundC]);

// add button actions
buttonPause.addEventListener("click", togglePaused);
buttonSettings.addEventListener("click", () => {});
buttonTools.addEventListener("click", () => { panelTools.classList.toggle("hidden"); panelToolOptions.classList.toggle("hidden") });
buttonComponents.addEventListener("click", () => { panelComponents.classList.toggle("hidden") });

Object.keys(Tools).forEach((t) => {
	let button = document.createElement("div");
	button.classList.add("tool");
	if (tool == Tools[t]) button.classList.add("selected");
	button.setAttribute("tooltip", t.toString());

	button.addEventListener("click", () => {
		tool = Tools[t];

		for (let i = 0; i < panelTools.children.length; i++) {
			panelTools.children[i].classList.remove("selected");
		}

		button.classList.add("selected");
	});

	panelTools.appendChild(button);
});

// add keyboard shortcuts
document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "Space": togglePaused(); break;
	}
});

// support for resizing
document.addEventListener("resize", () => {
	canvas.width = document.body.scrollWidth;
	canvas.height = document.body.scrollHeight;
});

// add mouse control
let mouse = Mouse.create(canvas);
let mouseConstraint = MouseConstraint.create(engine, {
	mouse: mouse,
	constraint: {
		stiffness: 1,
		render: {
			visible: false
		}
	}
});

World.add(engine.world, mouseConstraint);

Events.on(mouseConstraint, "mousedown", (e) => {
	switch (tool) {
		case Tools.water: case Tools.rectangle: case Tools.circle: {
			drawing = {
				startX: mouse.absolute.x,
				startY: mouse.absolute.y,
				endX: mouse.absolute.x,
				endY: mouse.absolute.y,
			}
		} break;

		case Tools.eraser: {
			drawing = true;
			if (mouseConstraint.body) World.remove(engine.world, mouseConstraint.body, true);
		} break;
	}
});

Events.on(mouseConstraint, "mousemove", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.water: case Tools.rectangle: case Tools.circle: {
				drawing.endX = mouse.absolute.x;
				drawing.endY = mouse.absolute.y;
			} break;

			case Tools.eraser: {
				if (mouseConstraint.body) World.remove(engine.world, mouseConstraint.body, true);
			} break;
		}
	}
});

Events.on(mouseConstraint, "mouseup", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.water: {
				let water = Composites.stack(
						drawing.startX,
						drawing.startY,
						Math.floor((drawing.endX - drawing.startX) / 10),
						Math.floor((drawing.endY - drawing.startY) / 10),
						0, 0, (x, y) => {
					let body = Bodies.circle(x, y, 10, {
						friction: 0, frictionStatic: 0, label: "water", render: { fillStyle: "#00f" }
					});
				
					return body;
				});

				World.add(engine.world, [water]);
			} break;

			case Tools.rectangle: {
				World.add(engine.world, [
					Bodies.rectangle(
						drawing.startX,
						drawing.startY,
						drawing.endX - drawing.startX,
						drawing.endY - drawing.startY)
				]);
			} break;

			case Tools.circle: {
				World.add(engine.world, [
					Bodies.circle(
						drawing.startX,
						drawing.startY,
						Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY))
				]);
			} break;
		}

		drawing = undefined;
	}
});

// start engine
Runner.run(runner, engine);

// start rendering
let context = canvas.getContext("2d");

(function render() {
	let bodies = Composite.allBodies(engine.world);

	window.requestAnimationFrame(render);

	context.fillStyle = "#161621";
	context.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < bodies.length; i += 1) {
		context.beginPath();

		let vertices = bodies[i].vertices;

		context.moveTo(vertices[0].x, vertices[0].y);

		for (let j = 1; j < vertices.length; j += 1) {
			context.lineTo(vertices[j].x, vertices[j].y);
		}

		context.lineTo(vertices[0].x, vertices[0].y);

		context.fillStyle = bodies[i].render.fillStyle;
		context.fill();
	}

	if ((tool == Tools.rectangle || tool == Tools.water) && drawing) {
		context.strokeStyle = "#ddd";
		context.strokeRect(drawing.startX, drawing.startY, drawing.endX - drawing.startX, drawing.endY - drawing.startY);
	}

	if (tool == Tools.circle && drawing) {
		context.strokeStyle = "#ddd";
		context.beginPath();
		context.ellipse(
			drawing.startX,
			drawing.startY,
			Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY),
			Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY),
			0, 0, Math.PI * 2);
		context.stroke();
	}
})();

function togglePaused() {
	paused = !paused;

	paused ? document.body.classList.add("paused") : document.body.classList.remove("paused");
	paused ? buttonPause.setAttribute("tooltip", "play") : buttonPause.setAttribute("tooltip", "pause");

	runner.enabled = !paused;
}

function utilenum(...args) {
	let enumerator = {}

	args.forEach((arg, i) => {
		enumerator[arg] = i;
	});

	return enumerator;
}
