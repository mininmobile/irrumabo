let Engine = Matter.Engine;
let Render = Matter.Render;
let Mouse = Matter.Mouse;
let MouseConstraint = Matter.MouseConstraint;
let Runner = Matter.Runner;
let World = Matter.World;
let Bodies = Matter.Bodies;

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
let boxA = Bodies.rectangle(400, 200, 80, 80);
let boxB = Bodies.rectangle(450, 50, 80, 80);
let ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

World.add(engine.world, [boxA, boxB, ground]);

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
