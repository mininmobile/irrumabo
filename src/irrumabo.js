let Engine = Matter.Engine;
let World = Matter.World;
let Runner = Matter.Runner;
let Events = Matter.Events;
let Bounds = Matter.Bounds;
let Mouse = Matter.Mouse;
let Vertices = Matter.Vertices;
let MouseConstraint = Matter.MouseConstraint;
let Composite = Matter.Composite;
let Body = Matter.Body;
let Composites = Matter.Composites;
let Bodies = Matter.Bodies;

class Objective {
	constructor(...args) {
		this.args = args;
	}

	toString() {
		let string = "";

		this.args.forEach((a, i) => {
			if (i == 0) {
				switch (a) {
					case Verb.create: string += "Create a"; break;
					case Verb.change: string += "Change the"; break;
					case Verb.pause: string += "Pause the simulation"; break;
				}
			} else {
				switch (a) {
					case Noun.water: string += " pool of water"; break;
					case Noun.polygon: string += " polygon"; break;
					case Noun.rectangle: string += " rectangle"; break;
					case Noun.ball: string += " ball"; break;
					case Noun.density: string += " density of the"; break;
				}
			}
		});

		string += ".";

		return string;
	}
}

const RenderMode = utilenum(
	"regular",
	"colorWireframe",
	"wireframe",
	"heat",
);

const Tools = utilenum(
	"drag",
	"water",
	"rectangle",
	"circle",
	"brush",
	"eraser",
);

const Verb = utilenum(
	"create",
	"change",
	"pause",
);

const Noun = utilenum(
	"water",
	"polygon",
	"rectangle",
	"ball",
	"density",
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
		rendermodeSelect: document.getElementById("settings-rendermode-select"),
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
		content: document.getElementById("missions-content"),
	},
	missions: {
		order: ["Intro to Density", "Rolling Balls", "Playing with Fire", "Reactions", "Distillation"],
		"Intro to Density": {
			xp: 10,
			objectives: [
				new Objective(Verb.create, Noun.ball),
				new Objective(Verb.create, Noun.water),
				new Objective(Verb.change, Noun.density, Noun.ball),
			],
		},
		"Rolling Balls": {
			xp: 10,
			objectives: ["Pause simulation", "Create a rectangle", "Rotate to 15 degrees", "Set as static in right click menu", "Copy and move copy down beneath the first", "Place two balls on the different slopes", "Set the density of one of them to maximum", "Resume simulation"]
		},
		"Playing with Fire": {
			xp: 10,
			objectives: ["Create a box with water inside", "Use the fire tool to light a flame under it"]
		},
		"Reactions": {
			xp: 25,
			objectives: ["todo"]
		},
		"Distillation": {
			xp: 50,
			objectives: ["todo"]
		},
	},
	status: {
		complete: [],
		currentMission: undefined,
		currentObjectiveId: undefined,
		currentObjective: undefined,
		xp: 0,
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
let panelObjective = document.getElementById("mission-objective");

let canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth;
canvas.height = document.body.scrollHeight;
document.body.appendChild(canvas);

let context = document.getElementById("context");

let tool = Tools.drag;
let mode = RenderMode.regular;
let paused = false;

let drawing = undefined;
let contextClick = false;
let contextBegin = false;

// create enviroment
let engine = Engine.create();

let runner = Runner.create({
	delta: 1000 / 30,
	isFixed: false,
	enabled: true,
});

// extend simulation
Events.on(engine, "collisionActive", (e) => {
	e.pairs.forEach((c) => {
		let tempA = c.bodyA.temperature;
		let tempB = c.bodyB.temperature;

		if (tempA != tempB) {
			let eqA = tempA > tempB ? tempA - ((tempA - tempB) / 2) : tempA + ((tempB - tempA) / 2);
			let eqB = tempB > tempA ? tempB - ((tempB - tempA) / 2) : tempB + ((tempA - tempB) / 2);

			Body.set(c.bodyA, "temperature", eqA);
			Body.set(c.bodyB, "temperature", eqB);
		}
	});
});

Events.on(engine, "beforeUpdate", (e) => {
	let bodies = Composite.allBodies(engine.world);

	for (i = 0; i < bodies.length; i++) {
		var body = bodies[i];

		if (body.label == "water") {
			if (body.temperature >= 100) {
				// turn water to steam
				World.remove(engine.world, body, true);
			}
		}
	}
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

	{ // update missions
		generateMissionList();
	}

	function generateMissionList() {
		missions.window.content.innerHTML = "";

		{ // progress bar
			let meter = document.createElement("div");
			meter.classList.add("meter");
			meter.setAttribute("max", "105");
			meter.setAttribute("value", missions.status.xp);

			let meterBar = document.createElement("div");
			meterBar.style.width = (100 / parseInt(meter.getAttribute("max"))) * parseInt(meter.getAttribute("value")) + "%"

			meter.appendChild(meterBar);
			missions.window.content.appendChild(meter);
		}

		{ // mission list
			missions.missions.order.forEach((m, i) => {
				let mission = missions.missions[m];
				let complete = missions.status.complete;

				let button = document.createElement("div");
				button.classList.add("mission");

				let title = document.createElement("span");
				let indicator = document.createElement("span");
				let xp = document.createElement("span");

				title.innerText = m;

				indicator.classList.add("indicator");
				if (complete.includes(i)) {
					button.classList.add("complete");
					indicator.innerText = "✓";
				} else {
					if ((i == complete[complete.length - 1] + 1) || (complete.length == 0 && i == 0)) {
						button.classList.add("next");
						indicator.innerText = "!";
					} else {
						button.classList.add("incomplete");
						indicator.innerText = "-";
					}
				}

				xp.innerText = `+${mission.xp}xp`;

				button.appendChild(title);
				button.appendChild(indicator);
				button.appendChild(xp);

				if (button.classList.contains("complete") || button.classList.contains("next")) {
					button.addEventListener("click", () => generateSelectedMissionPage(m));
				}

				missions.window.content.appendChild(button);
			});
		}
	}

	function generateSelectedMissionPage(m) {
		missions.window.content.innerHTML = "";

		let mission = missions.missions[m];
		let position = missions.missions.order.indexOf(m);

		let titleContainer = document.createElement("div"); titleContainer.classList.add("title-container");
		let back = document.createElement("div"); back.classList.add("back");
		let title  = document.createElement("div"); title.innerText = m; title.classList.add("title");
		let xp = document.createElement("div"); xp.innerText = `+${mission.xp}xp`; xp.classList.add("xp");
		let objectives = document.createElement("ol"); objectives.classList.add("objectives-list");
		let trackButton = document.createElement("div"); trackButton.innerText = "Track Mission"; trackButton.classList.add("mission-track-button");

		titleContainer.appendChild(back);
		titleContainer.appendChild(title);
		titleContainer.appendChild(xp);

		back.addEventListener("click", () => {
			generateMissionList();
		});

		mission.objectives.forEach((o) => {
			let subMission = document.createElement("li");
			subMission.innerText = o;

			objectives.appendChild(subMission);
		});

		if (missions.status.complete.includes(position)) {
			trackButton.setAttribute("disabled", "");
			xp.innerText = `(completed) ${xp.innerText}`;
		} else {
			trackButton.addEventListener("click", () => trackMission(m));
		}

		missions.window.content.appendChild(titleContainer);
		missions.window.content.appendChild(objectives);
		missions.window.content.appendChild(trackButton);
	}

	function trackMission(m) {
		let mission = missions.missions[m];

		missions.status.currentMission = m;
		missions.status.currentObjectiveId = 0;
		missions.status.currentObjective = mission.objectives[0];

		panelObjective.innerText = `${0 + 1}/${mission.objectives.length}) ${mission.objectives[0]}`;
	}

	function completeObjective() {
		if (!missions.status.currentMission) return;

		let mission = missions.missions[missions.status.currentMission];

		missions.status.currentObjectiveId++;
		missions.status.currentObjective = mission.objectives[missions.status.currentObjectiveId];

		panelObjective.innerText = `${missions.status.currentObjectiveId + 1}/${mission.objectives.length}) ${mission.objectives[missions.status.currentObjectiveId]}`;

		if (missions.status.currentObjectiveId == mission.objectives.length) completeMission();
	}

	function completeMission() {
		let m = missions.status.currentMission;
		let mission = missions.missions[missions.status.currentMission];

		if (!missions.status.complete.includes(missions.missions.order.indexOf(m))) {
			missions.status.complete.push(missions.missions.order.indexOf(m));
			missions.status.xp += mission.xp;
		}

		missions.status.currentMission = undefined;
		missions.status.currentObjectiveId = undefined;
		missions.status.currentObjective = undefined;

		panelObjective.innerText = "press ESC to open settings";
	}
}

{ // settings window
	settings.window.window.style.left = `${document.body.scrollWidth / 3}px`;
	settings.window.window.style.top = `${document.body.scrollHeight / 4}px`;
	settings.window.close.addEventListener("click", () => { settings.window.window.classList.add("hidden") });

	settings.inputs.gravityEnable.checked = true;
	settings.inputs.rendermodeSelect.selectedIndex = 0;

	settings.inputs.gravityEnable.addEventListener("change", () => {
		engine.world.gravity.scale = settings.inputs.gravityEnable.checked ? 0.001 : 0;
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

	settings.inputs.rendermodeSelect.addEventListener("change", () => {
		mode = settings.inputs.rendermodeSelect.selectedIndex;
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

	button.addEventListener("click", () => selectTool(Tools[t]));

	panelTools.appendChild(button);
});

// add keyboard shortcuts
document.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "Space": togglePaused(); break;
		case "Escape": settings.window.window.classList.toggle("hidden"); break;

		case "Digit1": selectTool(0); break;
		case "Digit2": selectTool(1); break;
		case "Digit3": selectTool(2); break;
		case "Digit4": selectTool(3); break;
		case "Digit5": selectTool(4); break;
		case "Digit6": selectTool(5); break;
	}

	return false;
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

				let bodies = Composite.allBodies(engine.world);

				for (i = 0; i < bodies.length; i++) {
					var body = bodies[i];
		
					if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
						World.remove(engine.world, body, true);

						break;
					}
				}
			} break;
		}
	} else if (e.button == 2) {
		contextBegin = true;
	}
});

document.addEventListener("mousemove", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.water: case Tools.rectangle: case Tools.circle: {
				drawing.endX = mouse.absolute.x;
				drawing.endY = mouse.absolute.y;
			} break;
			
			case Tools.eraser: {
				let bodies = Composite.allBodies(engine.world);

				for (i = 0; i < bodies.length; i++) {
					var body = bodies[i];
		
					if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
						World.remove(engine.world, body, true);

						break;
					}
				}
			} break;
		}
	}

	if (contextBegin)
		contextBegin = false;
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
						friction: 0, frictionStatic: 0, density: 0.05, label: "water", render: { fillStyle: "#00f" }
					});
				
					return body;
				});

				World.add(engine.world, [water]);

				if (missions.status.currentObjective == "Create a pool of water.") completeObjective();
			} break;

			case Tools.rectangle: {
				World.add(engine.world, [
					Bodies.rectangle(
						drawing.startX,
						drawing.startY,
						(drawing.endX - drawing.startX),
						(drawing.endY - drawing.startY))
				]);

				if (missions.status.currentObjective == "Create a rectangle.") completeObjective();
			} break;

			case Tools.circle: {
				World.add(engine.world, [
					Bodies.circle(
						drawing.startX,
						drawing.startY,
						Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY))
				]);

				if (missions.status.currentObjective == "Create a ball.") completeObjective();
			} break;
		}

		drawing = undefined;
	} else if (contextBegin) {
		let bodies = Composite.allBodies(engine.world);

		for (i = 0; i < bodies.length; i++) {
			var body = bodies[i];

			if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
				contextClick = true;

				context.classList.remove("hidden");

				context.style.left = mouse.absolute.x - 1 + "px";
				context.style.top = mouse.absolute.y - 1 + "px";

				generateContextMenu(context, [
					{ type: "button", name: "Erase", action: () => World.remove(engine.world, body, true) },
					{ type: "divider" },
					{ type: "sub", name: "Appearance", menu: [] },
					{ type: "sub", name: "Material", menu: [
						{ type: "title", hidden: body.isStatic, name: "Density" },
						{ type: "range", hidden: body.isStatic, min: 0.001, max: 0.1, step: 0.001, value: body.density, onchange: (e) => { if (!body.isStatic) {
							Body.setDensity(body, e.value);

							if (missions.status.currentObjective == "Change the density of the ball." && body.shape == "circle") completeObjective();
							if (missions.status.currentObjective == "Change the density of the rectangle." && body.shape == "rectangle") completeObjective();
							if (missions.status.currentObjective == "Change the density of the polygon." && body.shape == "polygon") completeObjective();
						} } },
						{ type: "title", name: "Temperature" },
						{ type: "range", min: 0, max: 532, step: 2, value: body.temperature + 100, onchange: (e) => body.temperature = e.value - 100 },
						{ type: "divider" },
						{ type: "check", name: "Static", value: body.isStatic, onchange: (e) => Body.setStatic(body, e.value) }
					] },
					{ type: "sub", name: "Collision", menu: [] },
					{ type: "divider" },
					{ type: "sub", name: "Info", menu: [] },
					{ type: "sub", name: "Behavior", menu: [] },
				]);

				break;
			}
		}
	}

	if (contextClick) {
		contextClick = false;
	} else {
		let contexts = document.getElementsByClassName("context");

		for (let i = 0; i < contexts.length; i++) {
			let c = contexts[i];

			if (c != context) {
				c.remove();
			} else {
				c.classList.add("hidden");
			}
		}
	}
});

// start engine
Runner.run(runner, engine);

// start rendering
let ctx = canvas.getContext("2d");
ctx.lineWidth = 2;
ctx.font = "1em Arial";

(function render() {
	let bodies = Composite.allBodies(engine.world);

	window.requestAnimationFrame(render);

	ctx.fillStyle = "#161621";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (let i = 0; i < bodies.length; i += 1) {
		ctx.beginPath();

		let body = bodies[i];
		let vertices = body.vertices;

		ctx.moveTo(vertices[0].x, vertices[0].y);

		for (let j = 1; j < vertices.length; j += 1) {
			ctx.lineTo(vertices[j].x, vertices[j].y);
		}

		ctx.lineTo(vertices[0].x, vertices[0].y);

		switch (mode) {
			case RenderMode.regular: {
				ctx.fillStyle = body.render.fillStyle;
				ctx.fill();
			} break;

			case RenderMode.colorWireframe: {
				if (body.circleRadius) ctx.lineTo(body.position.x, body.position.y);

				ctx.strokeStyle = body.render.fillStyle;
				ctx.stroke();
			} break;

			case RenderMode.wireframe: {
				if (body.circleRadius) ctx.lineTo(body.position.x, body.position.y);

				ctx.strokeStyle = "#ddd";
				ctx.stroke();
			} break;

			case RenderMode.heat: {
				ctx.fillStyle = `rgb(${Math.max(Math.min((body.temperature - 22), 255), 0)}, 0, ${
					body.temperature - 22 < 0 ? Math.max(Math.min(Math.abs(body.temperature - 22), 255), 0) : 0
				})`;
				ctx.fill();
			} break;
		}
	}

	if (mode == RenderMode.heat) {
		let bodies = Composite.allBodies(engine.world);
	
		for (i = 0; i < bodies.length; i++) {
			var body = bodies[i];
	
			if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
				ctx.fillStyle = "#ddd";
				ctx.fillText(
					`${body.temperature}°c`,
					mouse.absolute.x,
					mouse.absolute.y - 5);
			}
		}
	}

	{ // show action
		if (tool == Tools.water && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.strokeRect(
				drawing.startX,
				drawing.startY,
				Math.floor((drawing.endX - drawing.startX) / 20) * 20,
				Math.floor((drawing.endY - drawing.startY) / 20) * 20);
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`${Math.floor((drawing.endX - drawing.startX) / 20)}x${Math.floor((drawing.endY - drawing.startY) / 20)}`,
				drawing.startX,
				drawing.startY - 5);
		}

		if (tool == Tools.rectangle && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.strokeRect(drawing.startX, drawing.startY, drawing.endX - drawing.startX, drawing.endY - drawing.startY);
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`${drawing.endX - drawing.startX}x${drawing.endY - drawing.startY}`,
				drawing.startX,
				drawing.startY - 5);
		}

		if (tool == Tools.circle && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.beginPath();
			ctx.ellipse(
				drawing.startX,
				drawing.startY,
				Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY),
				Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY),
				0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`r${Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY)}`,
				drawing.startX,
				drawing.startY);
		}
	}
})();

/** @param {HTMLElement} menu */
function generateContextMenu(menu, items) {
	menu.innerHTML = "";

	items.forEach((item) => {
		if (item.hidden) return;

		switch (item.type) {
			case "button": {
				let button = document.createElement("div");
				button.classList.add("button");
				button.innerText = item.name;
				button.addEventListener("click", item.action);

				menu.appendChild(button);
			} break;

			case "title": {
				let title = document.createElement("div");
				title.classList.add("title");
				title.innerText = item.name;

				menu.appendChild(title);
			} break;

			case "range": {
				let range = document.createElement("input");
				range.classList.add("range");
				range.setAttribute("type", "range");
				range.setAttribute("min", item.min);
				range.setAttribute("max", item.max);
				range.setAttribute("step", item.step);
				range.setAttribute("value", item.value);
				range.addEventListener("mousedown", () => contextClick = true);
				range.addEventListener("mousemove", () => {
					item.onchange({
						value: range.value,
						source: range,
					});
				});

				menu.appendChild(range);
			} break;

			case "check": {
				let c = document.createElement("div");
				c.classList.add("check");

				let check = document.createElement("input");
				check.setAttribute("type", "checkbox");
				check.checked = item.value;
				c.appendChild(check);
				
				let label = document.createElement("span");
				label.innerText = item.name;
				c.appendChild(label);

				c.addEventListener("mousedown", () => contextClick = true);
				label.addEventListener("mouseup", () => check.click());
				check.addEventListener("change", () => {
					item.onchange({
						value: check.checked,
						source: check,
					});
				});

				menu.appendChild(c);
			} break;

			case "sub": {
				let submenu = document.createElement("div");
				submenu.classList.add("submenu");
				submenu.innerText = item.name;
				submenu.addEventListener("mouseup", () => {
					contextClick = true;

					let c = document.createElement("div");
					c.classList.add("context", "submenu");
					generateContextMenu(c, item.menu);

					c.style.left = `calc(${context.style.left} + ${context.clientWidth}px)`;
					c.style.top = `calc(${context.style.top} + ${submenu.offsetTop}px)`;

					document.body.appendChild(c);
				});

				menu.appendChild(submenu);
			} break;

			case "divider": {
				let divider = document.createElement("div");
				divider.classList.add("divider");

				menu.appendChild(divider);
			} break;
		}
	});
}

function togglePaused() {
	paused = !paused;

	paused ? document.body.classList.add("paused") : document.body.classList.remove("paused");
	paused ? buttonPause.setAttribute("tooltip", "play") : buttonPause.setAttribute("tooltip", "pause");

	runner.enabled = !paused;
}

function selectTool(t) {
	tool = t;

	for (let i = 0; i < panelTools.children.length; i++) {
		panelTools.children[i].classList.remove("selected");
		if (i == t) panelTools.children[i].classList.add("selected");
	}
}

function utilenum(...args) {
	let enumerator = {}

	args.forEach((arg, i) => {
		enumerator[arg] = i;
	});

	return enumerator;
}
