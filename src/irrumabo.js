let Engine = Matter.Engine;
let World = Matter.World;
let Runner = Matter.Runner;
let Events = Matter.Events;
let Bounds = Matter.Bounds;
let Mouse = Matter.Mouse;
let Vertices = Matter.Vertices;
let Vector = Matter.Vector;
let MouseConstraint = Matter.MouseConstraint;
let Composite = Matter.Composite;
let Body = Matter.Body;
let Composites = Matter.Composites;
let Bodies = Matter.Bodies;

let defaultColors = [
	{ red: 0,	green: 107,	blue: 166,	alpha: 1 },
	{ red: 4,	green: 150,	blue: 255,	alpha: 1 },
	{ red: 255,	green: 188,	blue: 66,	alpha: 1 },
	{ red: 216,	green: 17,	blue: 89,	alpha: 1 },
	{ red: 143,	green: 45,	blue: 86,	alpha: 1 },
]

let options = JSON.parse(localStorage.getItem("options"));

if (!options) {
	options = {
		announcer: false,
		hints: true,
		borderMode: 0,
		renderMode: 0,
		gravity: true,
		gravityX: 0,
		gravityY: 1,
	}

	localStorage.setItem("options", JSON.stringify(options))
}

class Objective {
	constructor(...args) {
		if (!isNaN(args[0])) {
			this.hint = undefined;
			this.args = args;
		} else {
			this.hint = args.shift();
			this.args = args;
		}
	}

	toString() {
		let string = "";

		if (this.args[0] == Verb.component) {
			string += "Drag in a";

			if (this.args[1][0] == "A" ||
				this.args[1][0] == "E" ||
				this.args[1][0] == "I" ||
				this.args[1][0] == "O" ||
				this.args[1][0] == "U") {
					string += "n";
				}

			string += " ";

			string += this.args[1];

			string += " component";
		} else {
			this.args.forEach((a, i) => {
				if (i == 0) {
					switch (a) {
						case Verb.create: string += "Create a"; break;
						case Verb.change: string += "Change the"; break;
						case Verb.set: string += "Set the"; break;
						case Verb.rotate: string += "Rotate the"; break;
						case Verb.wait: string += "Wait for"; break;
						case Verb.pause: string += "Pause the simulation"; break;
						case Verb.unpause: string += "Unpause the simulation"; break;
					}
				} else {
					switch (a) {
						case Noun.water: string += " pool of water"; break;
						case Noun.steam: string += " wisp of steam"; break;
						case Noun.fire: string += " fire"; break;
						case Noun.polygon: string += " polygon"; break;
						case Noun.rectangle: string += " rectangle"; break;
						case Noun.ball: string += " ball"; break;
						case Noun.density: string += " density of the"; break;
						case Noun.static: string += " static property of the"; break;
						case Noun.true: string += " to true"; break;
						case Noun.false: string += " to false"; break;
						case Noun.sec5: string += " 5 seconds"; break;
						case Noun.deg0: string += " to 0 degrees"; break;
						case Noun.deg15: string += " to 15 degrees"; break;
						case Noun.deg30: string += " to 30 degrees"; break;
						case Noun.deg45: string += " to 45 degrees"; break;
						case Noun.deg60: string += " to 60 degrees"; break;
						case Noun.deg75: string += " to 75 degrees"; break;
						case Noun.deg90: string += " to 90 degrees"; break;
						case Noun.deg105: string += " to 105 degrees"; break;
						case Noun.deg120: string += " to 120 degrees"; break;
						case Noun.deg135: string += " to 135 degrees"; break;
						case Noun.deg150: string += " to 150 degrees"; break;
						case Noun.deg165: string += " to 165 degrees"; break;
						case Noun.deg180: string += " to 180 degrees"; break;
						case Noun.deg195: string += " to 195 degrees"; break;
						case Noun.deg210: string += " to 210 degrees"; break;
						case Noun.deg225: string += " to 225 degrees"; break;
						case Noun.deg240: string += " to 240 degrees"; break;
						case Noun.deg255: string += " to 255 degrees"; break;
						case Noun.deg270: string += " to 270 degrees"; break;
						case Noun.deg285: string += " to 285 degrees"; break;
						case Noun.deg300: string += " to 300 degrees"; break;
						case Noun.deg315: string += " to 315 degrees"; break;
						case Noun.deg330: string += " to 330 degrees"; break;
						case Noun.deg345: string += " to 345 degrees"; break;
						case Noun.deg360: string += " to 360 degrees"; break;
					}
				}
			});
		}

		string += ".";

		return string;
	}
}

const Liquids = utilenum(
	"water",
	"oil",
);

const Gasses = utilenum(
	"fire",
	"steam",
	"smoke",
);

const LiquidOptions = [
	{
		label: "water",
		density: 0.05,
		friction: 0,
		frictionStatic: 0,
		temperature: 22,
		render: { color: { red: 5, green: 50, blue: 255, alpha: 1 } },
	},
	{
		label: "oil",
		friction: 1,
		frictionStatic: 1,
		temperature: 22,
		render: { color: { red: 0, green: 0, blue: 0, alpha: 1 } },
	},
];

const GasOptions = [
	{
		label: "fire",
		friction: 0,
		frictionStatic: 0,
		temperature: 432,
		render: { color: { red: 255, green: 100, blue: 20, alpha: 1 } },
	},
	{
		label: "steam",
		friction: 0,
		frictionStatic: 0,
		temperature: 100,
		render: { color: { red: 255, green: 255, blue: 255, alpha: 0.6 } },
	},
	{
		label: "smoke",
		friction: 0,
		frictionStatic: 0,
		temperature: 432,
		render: { color: { red: 155, green: 155, blue: 155, alpha: 0.4 } },
	},
];

const MyComponents = [
	{
		name: "beaker",
		parts: [
			{ type: "rectangle", x: 0, y: 0, w: 50, h: 300, options: { isStatic: true, render: { color: { red: 255, green: 255, blue: 255, alpha: 0.1 } } } },
			{ type: "rectangle", x: 0, y: 250, w: 300, h: 50, options: { isStatic: true, render: { color: { red: 255, green: 255, blue: 255, alpha: 0.1 } } } },
			{ type: "rectangle", x: 250, y: 0, w: 50, h: 300, options: { isStatic: true, render: { color: { red: 255, green: 255, blue: 255, alpha: 0.1 } } } },
		],
	},
	{
		name: "bunson burner",
		parts: [
			{ type: "rectangle", x: 50, y: 0, w: 25, h: 220, options: { isStatic: true, render: { color: { red: 0, green: 50, blue: 150, alpha: 1 } } } },
			{ type: "rectangle", x: 125, y: 0, w: 25, h: 220, options: { isStatic: true, render: { color: { red: 0, green: 50, blue: 150, alpha: 1 } } } },
			{ type: "rectangle", x: 2, y: 225, w: 75, h: 25, options: { angle: toRad(135), isStatic: true, render: { color: { red: 0, green: 50, blue: 150, alpha: 1 } } } },
			{ type: "rectangle", x: 122, y: 225, w: 75, h: 25, options: { angle: toRad(45), isStatic: true, render: { color: { red: 0, green: 50, blue: 150, alpha: 1 } } } },
			{ type: "rectangle", x: 4, y: 255, w: 191, h: 25, options: { isStatic: true, render: { color: { red: 0, green: 50, blue: 150, alpha: 1 } } } },
			{ type: "rectangle", x: 75, y: 220, w: 50, h: 15, options: { isStatic: true,
				clonerBody: { ...GasOptions[Gasses.fire], vertices: Bodies.circle(0, 0, 10).vertices, position: { x: 100, y: 210 } }, render: { visible: false } } }
		],
	},
];

const RenderMode = utilenum(
	"regular",
	"colorWireframe",
	"wireframe",
	"heat",
);

const Tools = utilenum(
	"drag",
	"gas",
	"liquid",
	"rectangle",
	"circle",
	"eraser",
);

const Verb = utilenum(
	"create",
	"component",
	"rotate",
	"set",
	"change",
	"wait",
	"pause",
	"unpause",
);

const Noun = utilenum(
	"deg0",
	"deg15",
	"deg30",
	"deg45",
	"deg60",
	"deg75",
	"deg90",
	"deg105",
	"deg120",
	"deg135",
	"deg150",
	"deg165",
	"deg180",
	"deg195",
	"deg210",
	"deg225",
	"deg240",
	"deg255",
	"deg270",
	"deg285",
	"deg300",
	"deg315",
	"deg330",
	"deg345",
	"deg360",
	"water",
	"steam",
	"polygon",
	"rectangle",
	"ball",
	"density",
	"static",
	"sec5",
	"true",
	"false",
);

let settings = {
	window: {
		window: document.getElementById("settings-window"),
		close: document.getElementById("settings-close"),
		content: document.getElementById("settings-content"),
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
				new Objective({ x: 50, y: 100, w: 50, h: 50, round: true }, Verb.create, Noun.ball),
				new Objective({ x: 25, y: 25, w: 100, h: 50, balls: true }, Verb.create, Noun.water),
				new Objective(Verb.change, Noun.density, Noun.ball),
			],
		},
		"Rolling Balls": {
			xp: 10,
			objectives: [
				new Objective(Verb.pause),
				new Objective({ x: 25, y: 50, w: 150, h: 15, angle: 15 }, Verb.create, Noun.rectangle),
				new Objective(Verb.rotate, Noun.rectangle, Noun.deg15),
				new Objective(Verb.set, Noun.static, Noun.rectangle, Noun.true),
				new Objective({ x: 25, y: 125, w: 150, h: 15, angle: 15 }, Verb.create, Noun.rectangle),
				new Objective(Verb.rotate, Noun.rectangle, Noun.deg15),
				new Objective(Verb.set, Noun.static, Noun.rectangle, Noun.true),
				new Objective({ x: 50, y: 10, w: 25, h: 25, round: true }, Verb.create, Noun.ball),
				new Objective(Verb.change, Noun.density, Noun.ball),
				new Objective({ x: 50, y: 85, w: 25, h: 25, round: true }, Verb.create, Noun.ball),
				new Objective(Verb.unpause),
				new Objective(Verb.wait, Noun.sec5),
			],
		},
		"Playing with Fire": {
			xp: 10,
			objectives: [
				new Objective([{ x: 25, y: 25, w: 15, h: 100 }, { x: 25, y: 110, w: 100, h: 15 }, { x: 125, y: 25, w: 15, h: 100 }], Verb.component, "beaker"),
				new Objective({ x: 47, y: 32, w: 70, h: 70, balls: true }, Verb.create, Noun.water),
				new Objective(Verb.create, Noun.fire),
			],
		},
		"Reactions": {
			xp: 25,
			objectives: ["todo"],
		},
		"Distillation": {
			xp: 50,
			objectives: ["todo"],
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

let hintObjective = document.getElementById("objective-hint");

let componentTooltip = document.getElementById("component-tooltip");

let tool = Tools.drag;
let toolOptions = {
	"drag": {},
	"gas": {
		selected: "fire",
	},
	"liquid": {
		selected: "water",
	},
	"rectangle": {},
	"circle": {},
	"eraser": {},
}

let announcerOptions = {
	"enabled": false,
}

let mode = RenderMode.regular;
let killerWalls = false;
let shift = false;
let ctrl = false;
let paused = false;

let drawing = undefined;
let componentDrag = undefined;
let contextClick = false;
let contextBegin = false;
let typing = false;
let hoverUi = false;

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
		if (!c.bodyA.isCloner && !c.bodyB.isCloner) { // temperature
			let tempA = c.bodyA.temperature;
			let tempB = c.bodyB.temperature;

			if (tempA != tempB) {
				let eqA = tempA > tempB ? tempA - ((tempA - tempB) / 2) : tempA + ((tempB - tempA) / 2);
				let eqB = tempB > tempA ? tempB - ((tempB - tempA) / 2) : tempB + ((tempA - tempB) / 2);

				Body.set(c.bodyA, "temperature", eqA);
				Body.set(c.bodyB, "temperature", eqB);
			}
		}

		if (c.bodyA.isCloner || c.bodyB.isCloner) {
			let cloner = undefined;
			let clonerBody = undefined;

			if (c.bodyA.isCloner) {
				cloner = c.bodyA;
				clonerBody = c.bodyB;
			} else if (c.bodyB.isCloner) {
				cloner = c.bodyB;
				clonerBody = c.bodyA;
			}

			if (cloner && clonerBody && !clonerBody.isStatic && cloner.clonerBody == undefined) {
				cloner.clonerBody = {
					label: clonerBody.label,
					density: clonerBody.density,
					friction: clonerBody.friction,
					frictionStatic: clonerBody.frictionStatic,
					frictionAir: clonerBody.frictionAir,
					temperature: clonerBody.temperature,
					vertices: clonerBody.vertices,
					position: Vector.clone(clonerBody.position),
					render: clonerBody.render,
				}
			}
		}

		switch (c.bodyA.label) {
			case "wall": {
				if (killerWalls) {
					World.remove(engine.world, c.bodyB, true);
				}
			} break;

			default: {}
		}
	});
});

Events.on(engine, "beforeUpdate", (e) => {
	let bodies = Composite.allBodies(engine.world);

	for (i = 0; i < bodies.length; i++) {
		let body = bodies[i];

		body.age++;

		if (body.clonerBody && body.clonerInterval == undefined) {
			body.clonerInterval = setInterval(() => {
				let x = Body.create({ ...body.clonerBody });

				World.add(engine.world, [x]);
			}, 50);

			body.event.remove = () => clearInterval(body.clonerInterval);
		}

		switch (body.label) {
			case "water": {
				if (body.temperature >= 100) {
					let steam = Bodies.circle(body.position.x, body.position.y, 10, { ...GasOptions[Gasses.steam], temperature: body.temperature });

					World.add(engine.world, [steam]);
					World.remove(engine.world, body, true);
				}
			} break;

			case "oil": {
				if (body.temperature >= 60) {
					let burn = Bodies.circle(body.position.x, body.position.y, 10, GasOptions[Gasses.fire]);

					if (Math.random() >= 0.9) World.add(engine.world, [burn]);
					if (Math.random() >= 0.9) World.remove(engine.world, body, true);
				}
			} break;

			case "steam": {
				if (body.temperature <= 99) {
					let water = Bodies.circle(body.position.x, body.position.y, 10, { ...LiquidOptions[Liquids.water], temperature: body.temperature });

					World.add(engine.world, [water]);
					World.remove(engine.world, body, true);
				} else {
					body.force = { x: 0, y: -0.0003 * engine.world.gravity.y };
				}
			} break;

			case "smoke": {
				if (body.render.color.alpha <= 0) {
					World.remove(engine.world, body, true);
				} else if (body.age > 200) {
					body.render.color.alpha -= 0.001;
					body.render.fillStyle = getFillStyle(body);
				}

				body.force = { x: 0, y: -0.0003 * engine.world.gravity.y };
			} break;

			case "fire": {
				if (body.render.color.red == 155) {
					let smoke = Bodies.circle(body.position.x, body.position.y, 10, { ...GasOptions[Gasses.smoke] });

					World.add(engine.world, [smoke]);
					World.remove(engine.world, body, true);
				} else if (body.age > 50) {
					body.render.color.red -= 1;
					body.render.color.green += 0.55;
					body.render.color.blue += 1.35;
					body.render.color.alpha -= 0.006;
					body.render.fillStyle = getFillStyle(body);
				}
				
				if (body.temperature < 100) {
					World.remove(engine.world, body, true);
				}

				body.force = { x: 0, y: -0.0005 * engine.world.gravity.y };
			} break;

			default: {}
		}
	}
});

// create walls
let walls = [
	// left
	Bodies.rectangle(-50, document.body.scrollHeight / 2, 100, document.body.scrollHeight, { isStatic: true, label: "wall" }),
	// right
	Bodies.rectangle(document.body.scrollWidth + 50, document.body.scrollHeight / 2, 100, document.body.scrollHeight, { isStatic: true, label: "wall" }),
	// top
	Bodies.rectangle(document.body.scrollWidth / 2, -50, document.body.scrollWidth, 100, { isStatic: true, label: "wall" }),
	// bottom
	Bodies.rectangle(document.body.scrollWidth / 2, document.body.scrollHeight + 50, document.body.scrollWidth, 100, { isStatic: true, label: "wall" }),
];

World.add(engine.world, walls);

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

		if (announcerOptions.enabled)
			window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.objectives[0]));

		if (missions.status.currentObjective.hint) {
			let x = [missions.status.currentObjective.hint];

			if (missions.status.currentObjective.hint[0])
				x = missions.status.currentObjective.hint;

			x.forEach((y) => {
				let hint = { angle: 0, round: false, balls: false, ...y };

				showHint(hint.x, hint.y, hint.w, hint.h, hint.angle, hint.round, hint.balls);
			});
		}
	}

	function completeObjective() {
		if (!missions.status.currentMission) return;

		let mission = missions.missions[missions.status.currentMission];

		missions.status.currentObjectiveId++;
		missions.status.currentObjective = mission.objectives[missions.status.currentObjectiveId];

		panelObjective.innerText = `${missions.status.currentObjectiveId + 1}/${mission.objectives.length}) ${mission.objectives[missions.status.currentObjectiveId]}`;

		if (missions.status.currentObjective) {
			if (announcerOptions.enabled)
				window.speechSynthesis.speak(new SpeechSynthesisUtterance(mission.objectives[missions.status.currentObjectiveId]));

			if (missions.status.currentObjective.hint) {
				let x = [missions.status.currentObjective.hint];

				if (missions.status.currentObjective.hint[0])
					x = missions.status.currentObjective.hint;

				x.forEach((y) => {
					let hint = { angle: 0, round: false, balls: false, ...y };

					showHint(hint.x, hint.y, hint.w, hint.h, hint.angle, hint.round, hint.balls);
				});
			}

			switch (missions.status.currentObjective.args[0]) {
				case Verb.wait: {
					let duration = 0;

					switch (missions.status.currentObjective.args[1]) {
						case Noun.sec5: duration = 5000; break;
					}

					setTimeout(completeObjective, duration);
				} break;

				default: {}
			}
		}

		if (missions.status.currentObjectiveId == mission.objectives.length)
			completeMission();

		{ // doot toot
			let doottoot = document.createElement("div");
			doottoot.classList.add("doottoot");
			document.body.appendChild(doottoot);

			setTimeout(() => doottoot.remove(), 2000);
		}
	}

	function completeMission() {
		let m = missions.status.currentMission;
		let mission = missions.missions[missions.status.currentMission];

		if (!missions.status.complete.includes(missions.missions.order.indexOf(m))) {
			missions.status.complete.push(missions.missions.order.indexOf(m));
			missions.status.xp += mission.xp;
		}

		generateSelectedMissionPage(m);

		missions.status.currentMission = undefined;
		missions.status.currentObjectiveId = undefined;
		missions.status.currentObjective = undefined;

		panelObjective.innerText = "press ESC to open settings";

		hideHint();
	}
}

{ // settings window
	settings.window.window.style.left = `${document.body.scrollWidth / 3}px`;
	settings.window.window.style.top = `${document.body.scrollHeight / 4}px`;
	settings.window.close.addEventListener("click", () => { settings.window.window.classList.add("hidden") });

	{ // update settings
		generateSettingsList();
	}

	function generateSettingsList() {
		settings.window.content.innerHTML = "";

		{ // mission options
			{ // announcer enable
				let set = (state) => {
					input.checked = state;
					options.announcer = state;

					announcerOptions.enabled = state;

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Narrator Enabled";
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "checkbox";
					input.addEventListener("change", () => set(input.checked));
					container.appendChild(input);

				let inputHandle = document.createElement("div");
					inputHandle.classList.add("handle");
					container.appendChild(inputHandle);

				let display = document.createElement("span");
					container.appendChild(display);

				set(options.announcer);
			}

			{ // hints enabled
				let set = (state) => {
					input.checked = state;
					options.hints = state;

					if (state) {
						hintObjective.classList.remove("disabled");
					} else {
						hintObjective.classList.add("disabled");
					}

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Hints Enabled";
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "checkbox";
					input.checked = options.hints;
					input.addEventListener("change", () => set(input.checked));
					container.appendChild(input);

				let inputHandle = document.createElement("div");
					inputHandle.classList.add("handle");
					container.appendChild(inputHandle);

				let display = document.createElement("span");
					container.appendChild(display);

				set(options.hints);
			}
		}

		{ // divider
			let divider = document.createElement("hr");
				settings.window.content.appendChild(divider);
		}

		{ // border options
			{ // border mode
				let set = (state) => {
					input.selectedIndex = state;
					options.borderMode = state;

					switch (state) {
						case 0: {
							killerWalls = false;
						} break;
		
						case 1: {
							killerWalls = true;
						} break;
					}

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Border Mode";
					container.appendChild(title);

				let input = document.createElement("select");
					input.options.add(new Option("Solid", 0));
					input.options.add(new Option("Killer", 1));
					input.addEventListener("change", () => set(input.selectedIndex));
					container.appendChild(input);

				let display = document.createElement("span");
					container.appendChild(display);

				set(options.borderMode);
			}
		}

		{ // divider
			let divider = document.createElement("hr");
				settings.window.content.appendChild(divider);
		}

		{ // render options
			{ // render mode
				let set = (state) => {
					input.selectedIndex = state;
					options.renderMode = state;

					mode = state;

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Render Mode";
					container.appendChild(title);

				let input = document.createElement("select");
					input.options.add(new Option("Regular", 0));
					input.options.add(new Option("Color Wireframe", 1));
					input.options.add(new Option("Wireframe", 2));
					input.options.add(new Option("Heat", 3));
					input.addEventListener("change", () => set(input.selectedIndex));
					container.appendChild(input);

				let display = document.createElement("span");
					container.appendChild(display);

				set(options.renderMode);
			}
		}

		{ // divider
			let divider = document.createElement("hr");
				settings.window.content.appendChild(divider);
		}

		{ // gravity options
			{ // gravity enable
				let set = (state) => {
					input.checked = state;
					options.gravity = state;

					engine.world.gravity.scale = input.checked ? 0.001 : 0;

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Gravity Enabled";
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "checkbox";
					input.addEventListener("change", () => set(input.checked));
					container.appendChild(input);

				let inputHandle = document.createElement("div");
					inputHandle.classList.add("handle");
					container.appendChild(inputHandle);

				let display = document.createElement("span");
					container.appendChild(display);

				set(options.gravity);
			}

			{ // gravity scale x
				let set = (_state) => {
					let state = parseFloat(_state);

					input.value = state;
					options.gravityX = state;

					display.innerText = engine.world.gravity.x = state;

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Gravity Scale X";
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "range";
					input.min = "-1";
					input.max = "1";
					input.step = "0.25";
					input.addEventListener("mousemove", () => set(input.value));
					container.appendChild(input);

				let display = document.createElement("span");
					display.innerText = input.value;
					container.appendChild(display);

				set(options.gravityX);
			}

			{ // gravity scale y
				let set = (_state) => {
					let state = parseFloat(_state);

					input.value = state;
					options.gravityY = state;

					display.innerText = engine.world.gravity.y = state;

					saveProgress();
				}

				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					title.innerText = "Gravity Scale Y";
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "range";
					input.min = "-1";
					input.max = "1";
					input.step = "0.25";
					input.addEventListener("mousemove", () => set(input.value));
					container.appendChild(input);

				let display = document.createElement("span");
					display.innerText = input.value;
					container.appendChild(display);

				set(options.gravityY)
			}
		}

		{ // divider
			let divider = document.createElement("hr");
				settings.window.content.appendChild(divider);
		}

		{ // default options
			{ // default colors button
				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "button";
					input.value = "Edit Default Colors"
					input.addEventListener("click", () => generateDefaultColorsSettingsPage());
					container.appendChild(input);

				let display = document.createElement("span");
					container.appendChild(display);
			}

			{ // clear settings button
				let container = document.createElement("div");
					container.classList.add("option");
					settings.window.content.appendChild(container);

				let title = document.createElement("span");
					container.appendChild(title);

				let input = document.createElement("input");
					input.type = "button";
					input.value = "Reset Settings"
					input.addEventListener("click", () => {
						if (confirm("are you sure you want to perform this action? you will lose all progress!")) {
							localStorage.clear();
							location.reload();
						}
					});
					container.appendChild(input);

				let display = document.createElement("span");
					container.appendChild(display);
			}
		}
	}

	function generateDefaultColorsSettingsPage() {
		settings.window.content.innerHTML = "";

		{ // title
			let container = document.createElement("div");
				container.classList.add("title-container");
				settings.window.content.appendChild(container);

			let back = document.createElement("div");
				back.classList.add("back");
				back.addEventListener("click", () => {
					generateSettingsList();
				});
				container.appendChild(back);

			let title = document.createElement("div");
				title.classList.add("title");
				title.innerText = "Default Colors";
				container.appendChild(title);
		}

		{ // add button
			let c = { red: 250, green: 250, blue: 250, alpha: 1 }

			let color = document.createElement("div");
				color.classList.add("color");
				settings.window.content.appendChild(color);

			let preview = document.createElement("div");
				preview.classList.add("preview");
				preview.style.background = objecToRgba(c);
				color.appendChild(preview);

			{ // spacer
				let spacer = document.createElement("span");
					color.appendChild(spacer);
			}

			{ // color options
				let redTitle = document.createElement("div");
					redTitle.innerText = "R";
					color.appendChild(redTitle);

				let redInput = document.createElement("input");
					redInput.type = "text";
					redInput.value = c.red;
					redInput.addEventListener("focus", () => typing = true);
					redInput.addEventListener("blur", () => typing = false);
					redInput.addEventListener("change", () => { c.red = redInput.value; preview.style.background = objecToRgba(c) });
					color.appendChild(redInput);
				
				let greenTitle = document.createElement("div");
					greenTitle.innerText = "G";
					color.appendChild(greenTitle);

				let greenInput = document.createElement("input");
					greenInput.type = "text";
					greenInput.value = c.green;
					greenInput.addEventListener("focus", () => typing = true);
					greenInput.addEventListener("blur", () => typing = false);
					greenInput.addEventListener("change", () => { c.green = greenInput.value; preview.style.background = objecToRgba(c) });
					color.appendChild(greenInput);
				
				let blueTitle = document.createElement("div");
					blueTitle.innerText = "B";
					color.appendChild(blueTitle);

				let blueInput = document.createElement("input");
					blueInput.type = "text";
					blueInput.value = c.blue;
					blueInput.addEventListener("focus", () => typing = true);
					blueInput.addEventListener("blur", () => typing = false);
					blueInput.addEventListener("change", () => { c.blue = blueInput.value; preview.style.background = objecToRgba(c) });
					color.appendChild(blueInput);

				let alphaTitle = document.createElement("div");
					alphaTitle.innerText = "A";
					color.appendChild(alphaTitle);

				let alphaInput = document.createElement("input");
					alphaInput.type = "text";
					alphaInput.value = c.alpha;
					alphaInput.addEventListener("focus", () => typing = true);
					alphaInput.addEventListener("blur", () => typing = false);
					alphaInput.addEventListener("change", () => { c.alpha = alphaInput.value; preview.style.background = objecToRgba(c) });
					color.appendChild(alphaInput);
			}

			{ // spacer
				let spacer = document.createElement("span");
					color.appendChild(spacer);
			}

			let add = document.createElement("div");
				add.classList.add("add");
				add.addEventListener("click", () => {
					defaultColors.push({
						red: c.red,
						green: c.green,
						blue: c.blue,
						alpha: c.alpha,
					});

					generateDefaultColorsSettingsPage();
				});
				color.appendChild(add);
		}

		{ // divider
			let divider = document.createElement("hr");
				settings.window.content.appendChild(divider);
		}

		{ // generate list
			defaultColors.forEach((c, i) => {
				let color = document.createElement("div");
					color.classList.add("color");
					settings.window.content.appendChild(color);

				let preview = document.createElement("div");
					preview.classList.add("preview");
					preview.style.background = objecToRgba(c);
					color.appendChild(preview);

				{ // spacer
					let spacer = document.createElement("span");
						color.appendChild(spacer);
				}

				{ // color options
					let redTitle = document.createElement("div");
						redTitle.innerText = "R";
						color.appendChild(redTitle);

					let redInput = document.createElement("input");
						redInput.type = "text";
						redInput.value = c.red;
						redInput.addEventListener("focus", () => typing = true);
						redInput.addEventListener("blur", () => typing = false);
						redInput.addEventListener("change", () => { defaultColors[i].red = redInput.value; preview.style.background = objecToRgba(defaultColors[i]) });
						color.appendChild(redInput);
					
					let greenTitle = document.createElement("div");
						greenTitle.innerText = "G";
						color.appendChild(greenTitle);

					let greenInput = document.createElement("input");
						greenInput.type = "text";
						greenInput.value = c.green;
						greenInput.addEventListener("focus", () => typing = true);
						greenInput.addEventListener("blur", () => typing = false);
						greenInput.addEventListener("change", () => { defaultColors[i].green = greenInput.value; preview.style.background = objecToRgba(defaultColors[i]) });
						color.appendChild(greenInput);
					
					let blueTitle = document.createElement("div");
						blueTitle.innerText = "B";
						color.appendChild(blueTitle);

					let blueInput = document.createElement("input");
						blueInput.type = "text";
						blueInput.value = c.blue;
						blueInput.addEventListener("focus", () => typing = true);
						blueInput.addEventListener("blur", () => typing = false);
						blueInput.addEventListener("change", () => { defaultColors[i].blue = blueInput.value; preview.style.background = objecToRgba(defaultColors[i]) });
						color.appendChild(blueInput);
				
					let alphaTitle = document.createElement("div");
						alphaTitle.innerText = "A";
						color.appendChild(alphaTitle);
	
					let alphaInput = document.createElement("input");
						alphaInput.type = "text";
						alphaInput.value = c.alpha;
						alphaInput.addEventListener("focus", () => typing = true);
						alphaInput.addEventListener("blur", () => typing = false);
						alphaInput.addEventListener("change", () => { defaultColors[i].alpha = alphaInput.value; preview.style.background = objecToRgba(defaultColors[i]) });
						color.appendChild(alphaInput);
				}

				{ // spacer
					let spacer = document.createElement("span");
						color.appendChild(spacer);
				}

				let remove = document.createElement("div");
					remove.classList.add("remove");
					remove.addEventListener("click", () => {
						let x = [];

						defaultColors.forEach((col) => {
							if (c.red	== col.red &&
								c.green	== col.green &&
								c.blue	== col.blue &&
								c.alpha	== col.alpha) {
									// ignore, color is effectively removed
								} else {
									x.push(col);
								}
						});

						defaultColors = x;

						if (defaultColors.length == 0) {
							defaultColors.push({
								red: 250,
								green: 250,
								blue: 250,
								alpha: 1,
							});
						}

						generateDefaultColorsSettingsPage();
					});
					color.appendChild(remove);
			});
		}
	}
}

// add button actions
buttonPause.addEventListener("click", () => { togglePaused() });
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

// add components
MyComponents.forEach((c) => {
	let button = document.createElement("div");
	button.classList.add("component", "r");

	button.addEventListener("mouseenter", (e) => {
		componentTooltip.innerText = c.name;
		componentTooltip.classList.remove("hidden");
		componentTooltip.style.top = e.clientY - componentTooltip.clientHeight + "px";
	});

	button.addEventListener("mouseleave", () => {
		componentTooltip.classList.add("hidden");
	});

	button.addEventListener("mousemove", (e) => {
		componentTooltip.style.top = e.clientY - componentTooltip.clientHeight + "px";
	});

	button.addEventListener("mousedown", () => {
		componentDrag = c;
	});

	panelComponents.appendChild(button);
});

// add keyboard shortcuts
document.addEventListener("keypress", (e) => {
	if (!typing) {
		e.preventDefault();
	}
});

document.addEventListener("keydown", (e) => {
	if (!typing) {
		switch (e.code) {
			case "ShiftLeft": shift = true; break;
			case "ShiftRight": shift = true; break;
			case "ControlLeft": ctrl = true; break;
			case "ControlRight": ctrl = true; break;

			case "Tab": panelTools.classList.remove("hidden"); panelToolOptions.classList.remove("hidden"); break;
		}

		e.preventDefault();
	}
});

document.addEventListener("keyup", (e) => {
	if (!typing) {
		switch (e.code) {
			case "ShiftLeft": shift = false; break;
			case "ShiftRight": shift = false; break;
			case "ControlLeft": ctrl = false; break;
			case "ControlRight": ctrl = false; break;

			case "KeyR": if (ctrl) window.location.reload(); break;

			case "Space": togglePaused(); break;

			case "Escape": {
				if (!missions.window.window.classList.contains("hidden")) {
					missions.window.window.classList.add("hidden");
				}

				settings.window.window.classList.toggle("hidden");
			} break;

			case "KeyM": {
				settings.window.window.classList.add("hidden");
				missions.window.window.classList.toggle("hidden");
			} break;

			case "Tab": panelTools.classList.add("hidden"); panelToolOptions.classList.add("hidden"); break;
			case "KeyE": buttonComponents.click(); break;

			case "Digit1": selectTool(0); break;
			case "Digit2": selectTool(1); break;
			case "Digit3": selectTool(2); break;
			case "Digit4": selectTool(3); break;
			case "Digit5": selectTool(4); break;
			case "Digit6": selectTool(5); break;
		}

		e.preventDefault();
	}
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

panelComponents.onmouseenter = panelTools.onmouseenter = panelToolOptions.onmouseenter = () => hoverUi = true;
panelComponents.onmouseleave = panelTools.onmouseleave = panelToolOptions.onmouseleave = () => hoverUi = false;

document.addEventListener("mousedown", (e) => {
	if (e.button == 0) {
		if (!hoverUi) {
			switch (tool) {
				case Tools.liquid: case Tools.rectangle: case Tools.circle: {
					drawing = {
						startX: mouse.absolute.x,
						startY: mouse.absolute.y,
						endX: mouse.absolute.x,
						endY: mouse.absolute.y,
					}
				} break;

				case Tools.gas: {
					let interval = setInterval(() => {
						if (!ctrl) {
							let gas = Bodies.circle(mouse.absolute.x, mouse.absolute.y, 10, GasOptions[Gasses[toolOptions.gas.selected]]);

							World.add(engine.world, [gas]);
						}
					}, 50);

					drawing = {
						interval: interval,
						startX: -1,
						startY: -1,
						endX: -1,
						endY: -1,
					}

					if (!ctrl) {
						if (missions.status.currentObjective) {
							if (missions.status.currentObjective.args[0] == Verb.create) {
								if (missions.status.currentObjective.args[1] == Noun.fire && toolOptions.gas.selected == "fire") completeObjective();
								if (missions.status.currentObjective.args[1] == Noun.steam && toolOptions.gas.selected == "steam") completeObjective();
							}
						}
					}
				} break;

				case Tools.eraser: {
					drawing = true;

					let bodies = Composite.allBodies(engine.world);

					for (i = 0; i < bodies.length; i++) {
						let body = bodies[i];

						if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
							World.remove(engine.world, body, true);

							break;
						}
					}
				} break;
			}
		}
	} else if (e.button == 2) {
		contextBegin = true;
	}
});

document.addEventListener("mousemove", (e) => {
	if (drawing) {
		switch (tool) {
			case Tools.liquid: case Tools.rectangle: case Tools.circle: {
				if (shift) {
					let size = Math.max(Math.abs(mouse.absolute.x - drawing.startX), Math.abs(mouse.absolute.y - drawing.startY));

					drawing.endX = drawing.startX + size;
					drawing.endY = drawing.startY + size;
				} else {
					drawing.endX = mouse.absolute.x;
					drawing.endY = mouse.absolute.y;
				}
			} break;

			case Tools.gas: {
				if (ctrl) {
					if (drawing.startX == -1) {
						drawing.startX = mouse.absolute.x;
						drawing.startY = mouse.absolute.y;
						drawing.endX = mouse.absolute.x;
						drawing.endY = mouse.absolute.y;
					} else {
						if (shift) {
							let size = Math.max(Math.abs(mouse.absolute.x - drawing.startX), Math.abs(mouse.absolute.y - drawing.startY));

							drawing.endX = drawing.startX + size;
							drawing.endY = drawing.startY + size;
						} else {
							drawing.endX = mouse.absolute.x;
							drawing.endY = mouse.absolute.y;
						}
					}
				} else {
					drawing.startX = -1
					drawing.startY = -1
					drawing.endX = -1
					drawing.endY = -1
				}
			} break;

			case Tools.eraser: {
				let bodies = Composite.allBodies(engine.world);

				for (i = 0; i < bodies.length; i++) {
					let body = bodies[i];

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
			case Tools.gas: {
				clearInterval(drawing.interval);

				if (ctrl) {
					let gas = Composites.stack(
							drawing.startX,
							drawing.startY,
							Math.floor(Math.abs(drawing.endX - drawing.startX) / 20),
							Math.floor(Math.abs(drawing.endY - drawing.startY) / 20),
							0, 0, (x, y) => {
						let body = Bodies.circle(x, y, 10, GasOptions[Gasses[toolOptions.gas.selected]]);

						return body;
					});

					World.add(engine.world, [gas]);

					if (Math.floor((drawing.endX - drawing.startX) / 20) * Math.floor((drawing.endY - drawing.startY) / 20) > 0) {
						if (missions.status.currentObjective) {
							if (missions.status.currentObjective.args[0] == Verb.create) {
								if (missions.status.currentObjective.args[1] == Noun.fire && toolOptions.gas.selected == "fire") completeObjective();
								if (missions.status.currentObjective.args[1] == Noun.steam && toolOptions.gas.selected == "steam") completeObjective();
							}
						}
					}
				}
			} break;

			case Tools.liquid: {
				let water = Composites.stack(
						drawing.startX,
						drawing.startY,
						Math.floor(Math.abs(drawing.endX - drawing.startX) / 20),
						Math.floor(Math.abs(drawing.endY - drawing.startY) / 20),
						0, 0, (x, y) => {
					let body = Bodies.circle(x, y, 10, LiquidOptions[Liquids[toolOptions.liquid.selected]]);

					return body;
				});

				World.add(engine.world, [water]);

				if (Math.floor((drawing.endX - drawing.startX) / 20) * Math.floor((drawing.endY - drawing.startY) / 20) > 0) {
					if (missions.status.currentObjective) {
						if (missions.status.currentObjective.args[0] == Verb.create) {
							if (missions.status.currentObjective.args[1] == Noun.water && toolOptions.liquid.selected == "water") completeObjective();
							if (missions.status.currentObjective.args[1] == Noun.oil && toolOptions.liquid.selected == "oil") completeObjective();
						}
					}
				}
			} break;

			case Tools.rectangle: {
				World.add(engine.world, [
					Bodies.rectangle(
						drawing.startX + (Math.abs(drawing.endX - drawing.startX) / 2),
						drawing.startY + (Math.abs(drawing.endY - drawing.startY) / 2),
						Math.abs(drawing.endX - drawing.startX),
						Math.abs(drawing.endY - drawing.startY))
				]);

				if ((drawing.endX - drawing.startX) * (drawing.endY - drawing.startY) > 0 && missions.status.currentObjective == "Create a rectangle.") completeObjective();
			} break;

			case Tools.circle: {
				World.add(engine.world, [
					Bodies.circle(
						drawing.startX,
						drawing.startY,
						Math.max(Math.abs(drawing.endX - drawing.startX), Math.abs(drawing.endY - drawing.startY)))
				]);

				if (Math.max(drawing.endX - drawing.startX, drawing.endY - drawing.startY) > 0 && missions.status.currentObjective == "Create a ball.") completeObjective();
			} break;
		}

		drawing = undefined;
	} else if (contextBegin) {
		let bodies = Composite.allBodies(engine.world);

		for (i = 0; i < bodies.length; i++) {
			let body = bodies[i];

			if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
				contextClick = true;

				context.classList.remove("hidden");

				context.style.left = mouse.absolute.x - 1 + "px";
				context.style.top = mouse.absolute.y - 1 + "px";

				generateContextMenu(context, [
					{ type: "button", name: "Erase", action: () => World.remove(engine.world, body, true) },
					{ type: "divider" },
					{ type: "sub", name: "Appearance", menu: [
						{ type: "title", name: "Red" },
						{ type: "range", min: 0, max: 255, step: 1, value: body.render.color.red, onchange: (e) => {
							body.render.color.red = e.value; body.render.fillStyle = getFillStyle(body) } },
						{ type: "title", name: "Green" },
						{ type: "range", min: 0, max: 255, step: 1, value: body.render.color.green, onchange: (e) => {
							body.render.color.green = e.value; body.render.fillStyle = getFillStyle(body) } },
						{ type: "title", name: "Blue" },
						{ type: "range", min: 0, max: 255, step: 1, value: body.render.color.blue, onchange: (e) => {
							body.render.color.blue = e.value; body.render.fillStyle = getFillStyle(body) } },
						{ type: "title", name: "Alpha (Opacity)" },
						{ type: "range", min: 0, max: 1, step: 0.05, value: body.render.color.blue, onchange: (e) => {
							body.render.color.alpha = e.value; body.render.fillStyle = getFillStyle(body) } },
					] },
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
					] },
					{ type: "sub", name: "Position", menu: [
						{ type: "title", name: "Angle" },
						{ type: "range", min: 0, max: 360, step: 15, value: toDeg(body.angle), onchange: (e) => {
							Body.setAngle(body, toRad(e.value));

							if (missions.status.currentObjective) {
								if (missions.status.currentObjective.args[0] == Verb.rotate) {
									if (missions.status.currentObjective.args[2] * 15 == e.value) {
										if (missions.status.currentObjective.args[1] == Noun.circle && body.shape == "circle") completeObjective();
										if (missions.status.currentObjective.args[1] == Noun.rectangle && body.shape == "rectangle") completeObjective();
										if (missions.status.currentObjective.args[1] == Noun.polygon && body.shape == "polygon") completeObjective();
									}
								}
							}
						} },
						{ type: "check", name: "Static", value: body.isStatic, onchange: (e) => {
							Body.setStatic(body, e.value);

							if (e.value && missions.status.currentObjective == "Set the static property of the ball to true." && body.shape == "circle") completeObjective();
							if (e.value && missions.status.currentObjective == "Set the static property of the rectangle to true." && body.shape == "rectangle") completeObjective();
							if (e.value && missions.status.currentObjective == "Set the static property of the polygon to true." && body.shape == "polygon") completeObjective();
							if (!e.value && missions.status.currentObjective == "Set the static property of the ball to false." && body.shape == "circle") completeObjective();
							if (!e.value && missions.status.currentObjective == "Set the static property of the rectangle to false." && body.shape == "rectangle") completeObjective();
							if (!e.value && missions.status.currentObjective == "Set the static property of the polygon to false." && body.shape == "polygon") completeObjective();
						} },
					] },
					{ type: "sub", name: "Collision", menu: [
						{ type: "check", name: "Cloner", value: body.isCloner, onchange: (e) => body.isCloner = e.value },
					] },
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

	if (componentDrag) {
		if (!hoverUi) {
			componentDrag.parts.forEach((p) => {
				switch (p.type) {
					case "rectangle": {
						let body = Bodies.rectangle(p.x + e.clientX + (p.w / 2), p.y + e.clientY + (p.h / 2), p.w, p.h, p.options);

						World.add(engine.world, [body]);
					} break;
				}
			});

			if (missions.status.currentObjective) {
				if (missions.status.currentObjective.args[0] == Verb.component) {
					if (missions.status.currentObjective.args[1] == componentDrag.name) completeObjective();
				}
			}
		}

		componentDrag = undefined;
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
		let body = bodies[i];

		if (!body.render.visible) continue;

		ctx.beginPath();

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
			let body = bodies[i];

			if (Bounds.contains(body.bounds, mouse.absolute) && Vertices.contains(body.vertices, mouse.absolute)) {
				ctx.fillStyle = "#ddd";
				ctx.fillText(
					`${body.temperature}°c`,
					mouse.absolute.x,
					mouse.absolute.y - 5);
			}
		}
	}

	if (componentDrag) {
		componentDrag.parts.forEach((p) => {
			switch (p.type) {
				case "rectangle": {
					ctx.strokeStyle = "#ddd";
					ctx.strokeRect(p.x + mouse.absolute.x, p.y + mouse.absolute.y, p.w, p.h);
				} break;
			}
		});
	}

	{ // show action
		if (tool == Tools.gas && drawing) {
			if (drawing.startX != -1) {
				ctx.strokeStyle = "#ddd";
				ctx.strokeRect(
					drawing.startX,
					drawing.startY,
					Math.floor(Math.abs(drawing.endX - drawing.startX) / 20) * 20,
					Math.floor(Math.abs(drawing.endY - drawing.startY) / 20) * 20);
				ctx.fillStyle = "#ddd";
				ctx.fillText(
					`${Math.floor(Math.abs(drawing.endX - drawing.startX) / 20)}x${Math.floor(Math.abs(drawing.endY - drawing.startY) / 20)}`,
					drawing.startX,
					drawing.startY - 5);
			}
		}

		if (tool == Tools.liquid && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.strokeRect(
				drawing.startX,
				drawing.startY,
				Math.floor(Math.abs(drawing.endX - drawing.startX) / 20) * 20,
				Math.floor(Math.abs(drawing.endY - drawing.startY) / 20) * 20);
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`${Math.floor(Math.abs(drawing.endX - drawing.startX) / 20)}x${Math.floor(Math.abs(drawing.endY - drawing.startY) / 20)}`,
				drawing.startX,
				drawing.startY - 5);
		}

		if (tool == Tools.rectangle && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.strokeRect(drawing.startX, drawing.startY, Math.abs(drawing.endX - drawing.startX), Math.abs(drawing.endY - drawing.startY));
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`${Math.abs(drawing.endX - drawing.startX)}x${Math.abs(drawing.endY - drawing.startY)}`,
				drawing.startX,
				drawing.startY - 5);
		}

		if (tool == Tools.circle && drawing) {
			ctx.strokeStyle = "#ddd";
			ctx.beginPath();
			ctx.ellipse(
				drawing.startX,
				drawing.startY,
				Math.max(Math.abs(drawing.endX - drawing.startX), Math.abs(drawing.endY - drawing.startY)),
				Math.max(Math.abs(drawing.endX - drawing.startX), Math.abs(drawing.endY - drawing.startY)),
				0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.fillStyle = "#ddd";
			ctx.fillText(
				`r${Math.max(Math.abs(drawing.endX - drawing.startX), Math.abs(drawing.endY - drawing.startY))}`,
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

				range.type = "range";

				range.min = item.min;
				range.max = item.max;
				range.step = item.step;
				range.value = item.value;

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
				let container = document.createElement("div");
					container.classList.add("checkbox-container");
					container.addEventListener("mousedown", () => contextClick = true);
					menu.appendChild(container);

				let check = document.createElement("input");
					check.type = "checkbox";
					check.checked = item.value;
					check.addEventListener("change", () => {
						item.onchange({
							value: check.checked,
							source: check,
						});
					});
					container.appendChild(check);

				let checkhandle = document.createElement("span");
					checkhandle.classList.add("handle");
					container.appendChild(checkhandle);

				let label = document.createElement("span");
					label.innerText = item.name;
					label.addEventListener("mouseup", () => check.click());
					container.appendChild(label);
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

function selectTool(t) {
	tool = t;

	for (let i = 0; i < panelTools.children.length; i++) {
		panelTools.children[i].classList.remove("selected");
		if (i == t) panelTools.children[i].classList.add("selected");
	}

	switch (t) {
		case Tools.gas: {
			panelToolOptions.innerHTML = "";

			Object.keys(Gasses).forEach((m) => {
				let button = document.createElement("div");
				button.classList.add("material", "v");
				if (toolOptions.gas.selected == m) button.classList.add("selected");
				button.setAttribute("tooltip", m.toString());

				button.style.background = getFillStyle(GasOptions[Gasses[m]]);

				button.addEventListener("click", () => {
					toolOptions.gas.selected = m;

					for (let i = 0; i < panelToolOptions.children.length; i++) {
						panelToolOptions.children[i].classList.remove("selected");
						if (i == Gasses[toolOptions.gas.selected]) panelToolOptions.children[i].classList.add("selected");
					}
				});

				panelToolOptions.appendChild(button);
			});
		} break;

		case Tools.liquid: {
			panelToolOptions.innerHTML = "";

			Object.keys(Liquids).forEach((m) => {
				let button = document.createElement("div");
				button.classList.add("material", "v");
				if (toolOptions.liquid.selected == m) button.classList.add("selected");
				button.setAttribute("tooltip", m.toString());

				button.style.background = getFillStyle(LiquidOptions[Liquids[m]]);

				button.addEventListener("click", () => {
					toolOptions.liquid.selected = m;

					for (let i = 0; i < panelToolOptions.children.length; i++) {
						panelToolOptions.children[i].classList.remove("selected");
						if (i == Liquids[toolOptions.liquid.selected]) panelToolOptions.children[i].classList.add("selected");
					}
				});

				panelToolOptions.appendChild(button);
			});
		} break;

		default: {
			panelToolOptions.innerHTML = "";
		} break;
	}
}

function showHint(x, y, w, h, angle = 0, round = false, balls = false) {
	hintObjective.classList.remove("hidden");

	let rectangle = document.createElement("div");
	rectangle.classList.add("hint");
	if (round && !balls) rectangle.classList.add("round");
	if (balls) rectangle.classList.add("balls");

	rectangle.style.left = x + "px";
	rectangle.style.top = y + "px";
	rectangle.style.width = w + "px";
	rectangle.style.height = h + "px";
	rectangle.style.transform = `rotate(${angle}deg)`

	hintObjective.appendChild(rectangle);
}

function hideHint() {
	hintObjective.classList.add("hidden");
	hintObjective.innerHTML = "";
}

function togglePaused(o) {
	paused = o || !paused;

	if (paused && missions.status.currentObjective == "Pause the simulation.") completeObjective();
	if (!paused && missions.status.currentObjective == "Unpause the simulation.") completeObjective();

	paused ? document.body.classList.add("paused") : document.body.classList.remove("paused");
	paused ? buttonPause.setAttribute("tooltip", "play") : buttonPause.setAttribute("tooltip", "pause");

	runner.enabled = !paused;
}

function saveProgress() {
	localStorage.setItem("options", JSON.stringify(options));
	localStorage.setItem("homosexual", JSON.stringify({ local: true }));
}

function getFillStyle(body) {
	return objecToRgba(body.render.color);
}

function objecToRgba(o) {
	return `rgba(${o.red}, ${o.green}, ${o.blue}, ${o.alpha})`;
}

function toDeg(rad) {
	return rad * (180 / Math.PI);
}

function toRad(deg) {
	return deg * (Math.PI / 180);
}

function utilenum(...args) {
	let enumerator = {}

	args.forEach((arg, i) => {
		enumerator[arg] = i;
	});

	return enumerator;
}
