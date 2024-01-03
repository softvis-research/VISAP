$(function () {
	// make all controllers accessible globally, but as read-only references
	for (const [name, controller] of Object.entries(controllers)) {
		Object.defineProperty(window, name, {value: controller});
	}
	Object.freeze(controllers);

	initializeApplication();
});

async function initializeApplication() {
	const paths = application.getResourcePaths();

	// load setup, metadata and model in parallel
	// parsing the setup happens later, since it requires controllers to be running
	const setupLoaded = application.startLoadingSetup(paths.setupPath, paths.defaultSetupPath);
	const metadataLoaded = application.startLoadingMetadata(paths.metadataPath, paths.defaultMetadataPath);
	const modelLoaded = application.startLoadingModel(paths.modelPath, paths.defaultModeLPath);

	try {
		await Promise.all([setupLoaded, metadataLoaded, modelLoaded]);
	} catch (error) {
		alert(error);
		return;
	}
	// from here on, setup/metadata/model are sure to have been loaded

	defaultLogger.initialize();
	defaultLogger.activate();
	actionController.initialize();
	canvasManipulator.initialize();
	application.initialize();

	if (setup.loadPopUp) {
		$("#RootLoadPopUp").igDialog("close");
	}
}

controllers.application = (function () {

	const defaultModelName = 'example';
	const defaultModelDir = 'model';
	const defaultSetupName = 'minimal';

	let controllerDivs = new Map();
	let uiConfig = null;

	// reference to model top element
	let canvasElement;

	// initialize application

	function initialize() {
		if (!setup.ui) {
			alert("No UI config in setup found");
			return;
		}

		uiConfig = setup.ui;

		const unavailableControllers = setup.controllers.map(c => c.name).filter(controllerName => !controllers[controllerName]);
		if (unavailableControllers.length > 0) {
			alert("Aborting - failed to load the following controllers: " + unavailableControllers.join(', '));
			return;
		}

		createUiLayout();

		setup.controllers.forEach((controllerSetup) => {
			const controllerObject = controllers[controllerSetup.name];
			initializeController(controllerObject, controllerSetup);
			activateController(controllerObject, controllerSetup);
		});
	}

	function createUiLayout() {
		const uiDiv = createDivAsChildOf(document.body, "ui");
		uiConfig.uiDiv = uiDiv;

		try {
			parseUIConfig(uiConfig.name, uiConfig, uiDiv);
			events.log.info.publish({ text: "new config loaded: " + uiConfig.name });
		} catch (err) {
			alert(err.message);
		}
	}

	function getResourcePaths() {
		// parse URL arguments
		const searchParams = new URLSearchParams(window.location.search);
		// lowercase the first letter of each param to dodge auto-capitals in URI by browsers
		const modelName = searchParams.get('model').charAt(0).toLowerCase() + str.slice(1) || defaultModelName;
		const modelDir = searchParams.get('srcDir').charAt(0).toLowerCase() + str.slice(1) || defaultModelDir;
		const setupName = searchParams.get('setup').charAt(0).toLowerCase() + str.slice(1) || defaultSetupName;

		return {
			modelPath: `${modelDir}/${modelName}/model.html`,
			metadataPath: `${modelDir}/${modelName}/metaData.json`,
			setupPath: `setups/${setupName}.js`,

			defaultModeLPath: `${defaultModelDir}/${defaultModelName}/model.html`,
			defaultMetadataPath: `${defaultModelDir}/${defaultModelName}/metaData.json`,
			defaultSetupPath: `setups/${defaultSetupName}.js`,
		};
	}

	async function startLoadingSetup(setupPath, defaultSetupPath) {
		return new Promise(
				(resolve, reject) => $.getScript(setupPath, resolve).fail(reject)
			).catch(response => {
				const errorMessage = "Failed to load setup: " + mapResponseToErrorMessage(response, setupPath) + "\n" + "Loading default setup instead.";
				alert(errorMessage);
				return new Promise(
					(resolve, reject) => $.getScript(defaultSetupPath, resolve).fail(reject)
				);
			}).then(() => {
				if (!setup) {
					throw new Error("No setup definition found!");
				} else if (setup.loadPopUp) {
					application.createModalPopup("Loading Visualization", "Visualization is loading...", "RootLoadPopUp");
				}
		});
	}

	async function startLoadingMetadata(metadataPath, defaultMetadataPath) {
		return fetch(encodeURI(metadataPath))
			.then((response) => {
				if (!response.ok) throw new Error(response);
				return response;
			}).catch(response => {
				const errorMessage = "Failed to load metadata: " + mapResponseToErrorMessage(response, metadataPath) + "\n" + "Loading default metadata instead.";
				alert(errorMessage);
				return fetch(encodeURI(defaultMetadataPath));
			}).then(response => {
				if (!response.ok) throw new Error(mapResponseToErrorMessage(response, defaultMetadataPath));
				else return response.json();
			}).then(metadataJson => {
				model.initialize();
				model.createEntititesFromMetadata(metadataJson);
		});
	}

	async function startLoadingModel(modelPath, defaultModeLPath) {
		return fetch(encodeURI(modelPath))
			.then((response) => {
				if (!response.ok) throw new Error(response);
				return response;
			}).catch(response => {
				const errorMessage = "Failed to load model: " + mapResponseToErrorMessage(response, modelPath) + "\n" + "Loading default model instead.";
				alert(errorMessage);
				return fetch(encodeURI(defaultModeLPath));
			}).then(response => {
				if (!response.ok) throw new Error(mapResponseToErrorMessage(response, defaultModeLPath));
				else return response.text();
			}).then(modelHtml => {
				// load model into a separate, temporary document until UI initialization
				const domParser = new DOMParser();
				const canvasDocument = domParser.parseFromString(modelHtml, 'text/html');
				canvasElement = canvasDocument.querySelector('#' + canvasId);
		});
	}

	function parseUIConfig(configName, configPart, parent) {
		// areas
		if (configPart.area !== undefined) {
			const area = configPart.area;

			const firstPart = area.first;
			const secondPart = area.second;
			const firstPanel = createPanel(firstPart);
			const secondPanel = createPanel(secondPart);

			const splitterOptions = {
				theme: "metro",
				width: "100%",
				height: "100%",
				orientation: area.orientation ?? "vertical",
				panels: [firstPanel, secondPanel]
			};
			const splitterDivs = createSplitter(parent, splitterOptions);

			// recursively parse layout of the children
			parseUIConfig(configName, firstPart, splitterDivs.firstPanel);
			if (secondPart !== undefined) {
				parseUIConfig(configName, secondPart, splitterDivs.secondPanel);
			}

			// force a layout recalculation, as calculated sizes may be off due to depth-first creation of nested splitters
			$(splitterDivs.splitter).igSplitter("refreshLayout");
		}

		// canvas
		if (configPart.canvas !== undefined) {
			// transfer canvas HTML from loaded document to actual DOM
			const canvasDiv = createDivAsChildOf(parent, 'canvas');
			canvasDiv.append(canvasElement);
		}

		// controller divs
		if (configPart.controllers !== undefined) {
			configPart.controllers.forEach((controller) => {
				addControllerDiv(controller, parent);
			});
		}
	}

	function getCanvas() {
		return canvasElement;
	}


	// controller handling

	function initializeController(controllerObject, controllerSetup) {
		if (typeof controllerObject.initialize === 'function') {
			controllerObject.initialize(controllerSetup);
		}
	}

	function activateController(controllerObject, controllerSetup) {
		const controllerDiv = controllerDivs.get(controllerSetup.name);
		if (typeof controllerObject.activate === 'function') {
			controllerObject.activate(controllerDiv);
		}
	}

	function addControllerDiv(controller, parent) {
		const controllerName = controller.name;
		if (!controllerDivs.has(controllerName)) {
			const controllerDiv = createDivAsChildOf(parent, controllerName + "Div");
			controllerDiv.classList.add("controllerDiv");
			controllerDivs.set(controllerName, controllerDiv);
		}
	}

	// gui creation

	function createPanel(areaPart) {
		const panel = {
			size: areaPart.size,
			min: areaPart.min,
			collapsible: areaPart.collapsible ?? false,
			resizable: areaPart.resizable ?? true
		};
		return panel;
	}

	function createSplitter(splitterDiv, options) {
		const firstPanel = createDivAsChildOf(splitterDiv);
		const secondPanel = createDivAsChildOf(splitterDiv);

		const splitter = $(splitterDiv);
		splitter.igSplitter(options);

		splitter.on("igsplitterresizeended", canvasManipulator.resizeScene);
		splitter.on("igsplittercollapsed", canvasManipulator.resizeScene);
		splitter.on("igsplitterexpanded", canvasManipulator.resizeScene);

		return {
			splitter: splitterDiv,
			firstPanel: firstPanel,
			secondPanel: secondPanel
		};
	}

	function createModalPopup(title, text, popupId) {
		const popupWindow = createDiv(popupId);
		popupWindow.innerHTML = text;
		document.body.appendChild(popupWindow);

		$("#" + popupId).igDialog({
			width: 300,
			height: 200,
			headerText: title,
			modal: true,
			state: "open",
			resizable: true,
			draggable: true
		});
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

	function mapResponseToErrorMessage(response, path) {
		return `Error ${response.status} ${response.statusText} for ${path}`;
	}


	return {
		initialize: initialize,
		getResourcePaths: getResourcePaths,
		transferConfigParams: transferConfigParams,
		loadCSS: loadCSS,
		createModalPopup: createModalPopup,
		createDiv: createDiv,
		createDivAsChildOf: createDivAsChildOf,
		getCanvas: getCanvas,

		startLoadingSetup: startLoadingSetup,
		startLoadingMetadata: startLoadingMetadata,
		startLoadingModel: startLoadingModel
	};
})();
