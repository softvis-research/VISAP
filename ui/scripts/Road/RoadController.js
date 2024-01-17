controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		roadHighlightMode: "MultiColorStripes",

		showLegendOnSelect: true,
		// TODO: Re-Implement
		// enableTransparency: true,
		// enableRoadVanishing: true,
		// spawnTrafficSigns: true,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],

		colorsMultiColorStripes: {
			undecided: "silver",
			calls: "turquoise",
			isCalled: "orange",
			bidirectionalCall: "magenta",
		},

	}

	let roadHighlightHelper = {}
	let globalStartElementComponent;
	let globalRelatedRoadObjsMap = new Map();

	/************************
		Initialization
	************************/

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		initializeHelpers();
	}

	// intitialize roadHighlightHelpers based on mode defined in config, making public functions accessible via roadHighlightHelper[mode]
	function initializeHelpers() {
		multiColorStripesHelper = createMultiColorStripesHelper(controllerConfig);
		// TODO: add further roadHighlightHelpers here:
		// roadStripesHelper = createX(controllerConfig);
		roadHighlightHelper = {
			MultiColorStripes: {
				initialize: multiColorStripesHelper.initialize,
				highlightRelatedRoadsForStartElement: multiColorStripesHelper.highlightRelatedRoadsForStartElement,
				resetRoadsHighlight: multiColorStripesHelper.resetRoadsHighlight
			},
			// X: {
			// 	initialize: X.initialize,
			// 	highlightRelatedRoadsForStartElement: X.highlightRelatedRoadsForStartElement,
			// 	resetRoadsHighlight: X.resetRoadsHighlight
			// },
		}

		Object.keys(roadHighlightHelper).includes(controllerConfig.roadHighlightMode)
			? (mode = controllerConfig.roadHighlightMode)
			: (mode = "ColoredRoads"); // default

		roadHighlightHelper[mode].initialize();
	}

	/************************
	   Selection Handling
	************************/

	function onEntitySelected(applicationEvent) {
		if (controllerConfig.supportedEntityTypes.includes(applicationEvent.entities[0].type)) {
			globalStartElementComponent = applicationEvent.entities[0];
			highlightStartElement();
			handleRoadsHighlightForStartElement();
		}
	}

	function onEntityUnselected(applicationEvent) {
		if (controllerConfig.supportedEntityTypes.includes(applicationEvent.entities[0].type)) {
			unhighlightStartElement();

			handleRoadsHighlightsReset();
		}
	}

	/************************
	 Selection Highlighting
	************************/

	function highlightStartElement() {
		canvasManipulator.highlightEntities([globalStartElementComponent], "red", { name: controllerConfig.name });
	}

	function unhighlightStartElement() {
		canvasManipulator.unhighlightEntities([globalStartElementComponent], { name: controllerConfig.name });
	}

	/************************
	    Road Helper Calls
	************************/

	// prepare a map of all related roadObjs as necessary input for every roadHighlighHelper
	function storeRelatedRoadObjsInMap() {
		const startCallsOtherElements = roadModel.getRoadObjsForStartElementId(globalStartElementComponent.id);
		const tmpDestinationElementComponent = globalStartElementComponent;
		const startIsCalledByOtherElements = roadModel.getRoadObjsForDestinationElementId(tmpDestinationElementComponent.id);

		globalRelatedRoadObjsMap = new Map([...startCallsOtherElements, ...startIsCalledByOtherElements]);
	}

	function handleRoadsHighlightForStartElement() {
		storeRelatedRoadObjsInMap();
		roadHighlightHelper[mode].highlightRelatedRoadsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
	}

	function handleRoadsHighlightsReset() {
		roadHighlightHelper[mode].resetRoadsHighlight();
		globalRelatedRoadObjsMap.clear();
	}

	return {
		initialize: initialize,
	};
}();