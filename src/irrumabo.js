let Engine = Matter.Engine;
let Render = Matter.Render;
let Mouse = Matter.Mouse;
let MouseConstraint = Matter.MouseConstraint;
let Runner = Matter.Runner;
let World = Matter.World;
let Composites = Matter.Composites;
let Bodies = Matter.Bodies;

const Tools = utilenum(
	"drag",
	"move",
	"pencil",
	"brush",
	"rubber",
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

let tool = Tools.drag;
let paused = false;

// create enviroment
let engine = Engine.create();

let render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: document.body.scrollWidth,
		height: document.body.scrollHeight,
		background: "#161621",
		wireframes: false,
	}
});

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

let water = Composites.stack(document.body.scrollWidth / 2 + 200, 200, 15, 15, 0, 0, (x, y) => {
	let body = Bodies.circle(x, y, 10, {
		friction: 0, frictionStatic: 0, label: "water", render: { fillStyle: "#00f" }
	});

	return body;
});

World.add(engine.world, [ballA, groundA, ballB, groundB, groundC, water]);

// add button actions
buttonPause.addEventListener("click", togglePaused);
buttonSettings.addEventListener("click", () => {});
buttonTools.addEventListener("click", () => { panelTools.classList.toggle("hidden"); panelToolOptions.classList.toggle("hidden") });
buttonComponents.addEventListener("click", () => { panelComponents.classList.toggle("hidden") });

// add keyboard shortcuts
document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "Space": togglePaused(); break;
	}
});

// add mouse control
let mouse = Mouse.create(render.canvas);
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
render.mouse = mouse;

Runner.run(runner, engine);
Render.run(render);

function togglePaused() {
	paused = !paused;

	runner.enabled = !paused;
}

function utilenum(...args) {
	let enumerator = {}

	args.forEach((arg, i) => {
		enumerator[arg] = i;
	});

	return enumerator;
}
