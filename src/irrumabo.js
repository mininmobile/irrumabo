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

let settings = {
	window: {
		window: document.getElementById("settings-window"),
		close: document.getElementById("settings-close"),
	},
	inputs: {
		gravityEnable: document.getElementById("settings-gravity-enable"),
		gravityX: document.getElementById("settings-gravity-x"),
		gravityY: document.getElementById("settings-gravity-y"),
	},
	displays: {
		gravityX: document.getElementById("settings-display-gravity-x"),
		gravityY: document.getElementById("settings-display-gravity-y"),
	},
}

let missions = {
	window: {
		window: document.getElementById("missions-window"),
		close: document.getElementById("missions-close"),
	},
	mission: {
		"Intro to Density": {},
		"Rolling Balls": {},
		"Playing with Fire": {},
		"Reactions": {},
		"Distillation": {},
	},
	status: {
		complete: [0, 1],
		xp: 20,
	},
}

// get buttons
let buttonPause = document.getElementById("pause");
let buttonMissions = document.getElementById("missions");
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

// initialize dialogs
{ // missions window
	missions.window.window.style.left = `${document.body.scrollWidth / 3}px`;
	missions.window.window.style.top = `${document.body.scrollHeight / 4}px`;
	missions.window.close.addEventListener("click", () => { missions.window.window.classList.add("hidden") });
}

{ // settings window
	settings.window.window.style.left = `${document.body.scrollWidth / 3}px`;
	settings.window.window.style.top = `${document.body.scrollHeight / 4}px`;
	settings.window.close.addEventListener("click", () => { settings.window.window.classList.add("hidden") });
	
	settings.inputs.gravityEnable.checked = true;
	
	settings.inputs.gravityEnable.addEventListener("change", () => {
		engine.world.gravity.scale = settings.inputs.gravityEnable.checked ? 0.001 : 0
	});
	settings.inputs.gravityX.addEventListener("mousemove", () => {
		settings.displays.gravityX.innerText =
		engine.world.gravity.x =
		settings.inputs.gravityX.value;
	});
	settings.inputs.gravityY.addEventListener("mousemove", () => {
		settings.displays.gravityY.innerText =
		engine.world.gravity.y =
		settings.inputs.gravityY.value;
	});
}

// add button actions
buttonPause.addEventListener("click", togglePaused);
buttonMissions.addEventListener("click", () => { missions.window.window.classList.toggle("hidden") });
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

document.addEventListener("mousedown", (e) => {
	if (e.button == 0) {
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
			} break;
		}
	} else if (e.button == 2) {
		
	}
});

document.addEventListener("mousemove", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.water: case Tools.rectangle: case Tools.circle: {
				drawing.endX = mouse.absolute.x;
				drawing.endY = mouse.absolute.y;
			} break;
		}
	}
});

document.addEventListener("mouseup", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.water: {
				let water = Composites.stack(
						drawing.startX,
						drawing.startY,
						Math.floor((drawing.endX - drawing.startX) / 20),
						Math.floor((drawing.endY - drawing.startY) / 20),
						0, 0, (x, y) => {
					let body = Bodies.circle(x, y, 10, {
						friction: 0, frictionStatic: 0, density: 0.1, label: "water", render: { fillStyle: "#00f" }
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
						(drawing.endX - drawing.startX),
						(drawing.endY - drawing.startY))
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

			case Tools.eraser: {
				if (mouseConstraint.body) World.remove(engine.world, mouseConstraint.body, true);
			} break;
		}

		drawing = undefined;
	}
});

// start engine
Runner.run(runner, engine);

// start rendering
let context = canvas.getContext("2d");
context.lineWidth = 2;
context.font = "1em Arial";

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

	{ // show action
		if (tool == Tools.water && drawing) {
			context.strokeStyle = "#ddd";
			context.strokeRect(
				drawing.startX,
				drawing.startY,
				Math.floor((drawing.endX - drawing.startX) / 20) * 20,
				Math.floor((drawing.endY - drawing.startY) / 20) * 20);
			context.fillStyle = "#ddd";
			context.fillText(
				`${Math.floor((drawing.endX - drawing.startX) / 20)}x${Math.floor((drawing.endY - drawing.startY) / 20)}`,
				drawing.startX,
				drawing.startY - 5);
		}

		if (tool == Tools.rectangle && drawing) {
			context.strokeStyle = "#ddd";
			context.strokeRect(drawing.startX, drawing.startY, drawing.endX - drawing.startX, drawing.endY - drawing.startY);
			context.fillStyle = "#ddd";
			context.fillText(
				`${drawing.endX - drawing.startX}x${drawing.endY - drawing.startY}`,
				drawing.startX,
				drawing.startY - 5);
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
			context.fillStyle = "#ddd";
			context.fillText(
				`r${Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY)}`,
				drawing.startX,
				drawing.startY);
		}

		if (tool == Tools.eraser && drawing && mouseConstraint.body) {
			context.beginPath();
	
			let vertices = mouseConstraint.body.vertices;
	
			context.moveTo(vertices[0].x, vertices[0].y);
	
			for (let j = 1; j < vertices.length; j += 1) {
				context.lineTo(vertices[j].x, vertices[j].y);
			}
	
			context.lineTo(vertices[0].x, vertices[0].y);
	
			context.strokeStyle = "#f00";
			context.stroke();
		}
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
