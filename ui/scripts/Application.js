$(document).ready(function () {
	initializeApplication();
});

async function initializeApplication() {
	// load setup, metadata and model in parallel
	// parsing the setup happens later, since it requires controllers to be running
	const setupLoaded = application.startLoadingSetup(setupPath);
	const metadataLoaded = application.startLoadingMetadata(metadataPath);
	const modelLoaded = application.startLoadingModel(modelPath);

	try {
		await Promise.all([setupLoaded, metadataLoaded, modelLoaded]);
	} catch (error) {
		console.error(error);
		return;
	}
	// from here on, setup/metadata/model are sure to have been loaded

	defaultLogger.initialize();
	defaultLogger.activate();
	actionController.initialize();
	canvasManipulator.initialize();
	application.initialize();

	if (setup.loadPopUp) {
		$("#RootLoadPopUp").jqxWindow("close");
	}
}

var application = (function () {

	let controllers = new Map();
	let controllerDivs = new Map();
	let uiConfig = null;

	let bodyElement;
	let canvasElement;


	// initialize application

	function initialize() {
		if (!setup.ui) {
			events.log.error.publish({ text: "No UI config in setup found" });
			return;
		}

		uiConfig = setup.ui;

		controllers = getControllerObjects(setup.controllers);
		if (setup.controllers.length !== controllers.size) {
			events.log.error.publish({ text: "One or more controllers failed to load, aborting" });
			return;
		}

		createUiLayout();

		setup.controllers.forEach((controllerSetup) => {
			const controllerObject = controllers.get(controllerSetup.name);
			initializeController(controllerObject, controllerSetup);
			activateController(controllerObject);
		});
	}

	function createUiLayout() {
		bodyElement = document.body;
		canvasElement = document.getElementById("canvas");

		const uiDiv = createDivAsChildOf(bodyElement, "ui");
		uiConfig.uiDiv = uiDiv;

		try {
			parseUIConfig(uiConfig.name, uiConfig, uiDiv);
			events.log.info.publish({ text: "new config loaded: " + uiConfig.name });
		} catch (err) {
			events.log.error.publish({ text: err.message });
		}
	}

	async function startLoadingSetup(setupPath) {
		return new Promise(
				(resolve) => $.getScript(setupPath, resolve).fail((response) => mapResponseToError(response, setupPath))
			).then(() => {
				if (!window.setup) {
					throw new Error("No setup definition found!");
				} else if (setup.loadPopUp) {
					const loadPopup = application.createPopup("Load Visualization", "Visualization is loading...", "RootLoadPopUp");
					document.body.appendChild(loadPopup);
					$("#RootLoadPopUp").jqxWindow({
						theme: "metro",
						width: 200,
						height: 200,
						isModal: true,
						autoOpen: true,
						resizable: false
					});
				}
		});
	}

	async function startLoadingMetadata(metadataPath) {
		return fetch(encodeURI(metadataPath))
			.then(response => {
				if (!response.ok) mapResponseToError(response, metadataPath);
				else return response.json();
			}).then(metadataJson => {
				model.initialize();
				model.createEntititesFromMetadata(metadataJson);
		});
	}

	async function startLoadingModel(modelPath) {
		return fetch(encodeURI(modelPath))
			.then(response => {
				if (!response.ok) mapResponseToError(response, modelPath);
				else return response.text();
			}).then(modelHtml => {
				$("#canvas").append(modelHtml);
		});
	}

	function parseUIConfig(configName, configPart, parent) {
		// areas
		if (configPart.area !== undefined) {
			const area = configPart.area;
			const splitterName = `${configName}_${area.name}`;
			const splitterId = `#${splitterName}`;
			const splitterOrientation = area.orientation ?? "vertical";
			const splitterResizable = area.resizable ?? true;

			const splitterObject = createSplitter(splitterName);
			parent.appendChild(splitterObject.splitter);

			const firstPart = area.first;
			const secondPart = area.second;
			const firstPanel = createPanel(firstPart);
			const secondPanel = createPanel(secondPart);

			$(splitterId).jqxSplitter({ theme: "metro", width: "100%", height: "100%", resizable: splitterResizable, orientation: splitterOrientation, panels: [firstPanel, secondPanel] });

			$(splitterId).on("resize", () => { canvasManipulator.resizeScene() });

			// recursively parse layout of the children
			parseUIConfig(configName, firstPart, splitterObject.firstPanel);
			if (secondPart !== undefined) {
				parseUIConfig(configName, secondPart, splitterObject.secondPanel);
			}
		}

		// expanders
		if (configPart.expanders !== undefined) {
			configPart.expanders.forEach((expander) => {
				const expanderName = `${configName}_${expander.name}`;
				const expanderId = `#${expanderName}`;
				const expanderTitle = expander.title;
				const expanderObject = createExpander(expanderName, expanderTitle);

				parent.appendChild(expanderObject.expander);

				$(expanderId).jqxExpander({ theme: "metro", width: "100%", height: "100%" });

				// recursively parse layout of the children
				const expanderContent = createDiv();
				parseUIConfig(configName, expander, expanderContent);

				$(expanderId).jqxExpander('setContent', expanderContent);
			});
		}

		// canvas
		if (configPart.canvas !== undefined) {
			const canvasParentElement = canvasElement.parentElement;
			canvasParentElement.removeChild(canvasElement);
			parent.appendChild(canvasElement.cloneNode(true));
		}

		// controller divs
		if (configPart.controllers !== undefined) {
			configPart.controllers.forEach((controller) => {
				addControllerDiv(controller, parent);
			});
		}
	}


	// controller handling

	function getControllerObjects(controllerSetupArray) {
		const controllers = new Map();
		for (const controllerSetup of controllerSetupArray) {
			const controllerObject = window[controllerSetup.name];
			if (!controllerObject) {
				events.log.error.publish({ text: "Controller " + controllerSetup.name + " not found!" });
			}
			controllers.set(controllerSetup.name, controllerObject);
		}
		return controllers;
	}

	function initializeController(controllerObject, controllerSetup) {
		if (typeof controllerObject.initialize === 'function') {
			controllerObject.initialize(controllerSetup);
		}
	}

	function activateController(controllerObject) {
		const controllerDiv = controllerDivs.get(controllerObject.name);
		if (typeof controllerObject.activate === 'function') {
			controllerObject.activate(controllerDiv);
		}
	}

	function addControllerDiv(controller, parent) {
		const controllerName = controller.name;
		if (!controllerDivs.has(controllerName)) {
			const controllerDiv = createDivAsChildOf(parent);
			controllerDivs.set(controllerName, controllerDiv);
		}
	}

	// gui creation

	function createPanel(areaPart) {
		const panel = {
			size: areaPart.size,
			min: areaPart.min,
			collapsible: areaPart.collapsible
		};
		return panel;
	}

	function createSplitter(id) {
		const splitter = createDiv(id);
		const firstPanel = createDivAsChildOf(splitter, `${id}firstPanel`);
		const secondPanel = createDivAsChildOf(splitter, `${id}secondPanel`);

		return {
			splitter: splitter,
			firstPanel: firstPanel,
			secondPanel: secondPanel
		};
	}

	function createExpander(id, title) {
		const expander = createDiv(id);
		const expanderHead = createDivAsChildOf(expander);
		expanderHead.innerHTML = title;
		const expanderContent = createDivAsChildOf(expander);

		return {
			expander: expander,
			head: expanderHead,
			content: expanderContent
		};
	}

	function createPopup(title, text, popupId) {
		const popupWindow = createDiv(popupId);
		const popupTitle = createDivAsChildOf(popupWindow);
		popupTitle.innerHTML = title;
		const popupContent = createDivAsChildOf(popupWindow);
		const popupText = createDivAsChildOf(popupContent);
		popupText.innerHTML = text;

		return popupWindowDiv;
	}

	function createDivAsChildOf(parent, newDivId) {
		const div = createDiv(newDivId);
		parent.appendChild(div);
		return div;
	}

	function createDiv(id) {
		const div = document.createElement("DIV");
		if (id) {
			div.id = id;
		}
		return div;
	}

	function transferConfigParams(setupConfig, controllerConfig) {
		for (const property in setupConfig) {
			if (property === "name") {
				continue;
			}

			if (setupConfig.hasOwnProperty(property) && controllerConfig.hasOwnProperty(property)) {
				controllerConfig[property] = setupConfig[property];
			}

			if (setupConfig.hasOwnProperty(property) && !controllerConfig.hasOwnProperty(property)) {
				events.log.warning.publish({ text: "setup property: " + property + " not in controller config" });
			}
		}
	}

	function loadCSS(cssPath) {
		const cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = cssPath;
		document.getElementsByTagName("head")[0].appendChild(cssLink);
	}

	function mapResponseToError(response, path) {
		throw new Error(`Error ${response.status} ${response.statusText} for ${path}`);
	}


	return {
		initialize: initialize,
		transferConfigParams: transferConfigParams,
		loadCSS: loadCSS,
		createPopup: createPopup,
		createDiv: createDiv,
		createDivAsChildOf: createDivAsChildOf,

		startLoadingSetup: startLoadingSetup,
		startLoadingMetadata: startLoadingMetadata,
		startLoadingModel: startLoadingModel
	};
})();
