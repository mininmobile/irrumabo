let Engine = Matter.Engine;
let Render = Matter.Render;
let Mouse = Matter.Mouse;
let MouseConstraint = Matter.MouseConstraint;
let Runner = Matter.Runner;
let World = Matter.World;
let Bodies = Matter.Bodies;

let paused = false;

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
let ballA = Bodies.circle(400, 200, 40, { density: 0.001 });
let ballB = Bodies.circle(450, 50, 40, { density: 1 });
let ground = Bodies.rectangle(document.body.scrollWidth / 2, document.body.scrollHeight / 2, document.body.scrollWidth, 60, { isStatic: true, angle: Math.PI * 0.06 });

World.add(engine.world, [ballA, ballB, ground]);

// add keyboard shortcuts
document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "Space": {
			paused = !paused;

			runner.enabled = !paused;
		} break;
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

// run
Runner.run(runner, engine);
Render.run(render);
