controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		roadHighlightMode: "ColoredRoads",

		showLegendOnSelect: true,
		// enableTransparency: true,
		// enableRoadVanishing: true,
		// spawnTrafficSigns: true,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],

		roadColors: {
			ambiguous: "white",
			calls: "turquoise",
			isCalled: "orange",
			bidirectionalCall: "magenta",
		},

	}

	let usedHighlightMode;
	let helpers = {}
	let globalStartElementComponent;
	let globalRelatedRoadObjsMap = new Map();

	//
	// initialization

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		initializeHelpers();
	}

	function initializeHelpers() {
		roadColorHelper = createRoadColorHelper(controllerConfig);
		roadStripesHelper = createRoadStripesHelper(controllerConfig);
		helpers = {
			ColoredRoads: {
				initialize: roadColorHelper.initialize,
				highlightRelatedRoadsForStartElement: roadColorHelper.highlightRelatedRoadsForStartElement,
				resetRoadsHighlight: roadColorHelper.resetRoadsHighlight
			},
			ColoredStripes: {
				initialize: roadStripesHelper.initialize,
				highlightRelatedRoadsForStartElement: roadStripesHelper.highlightRelatedRoadsForStartElement,
				resetRoadsHighlight: roadStripesHelper.resetRoadsHighlight
			},
		}

		Object.keys(helpers).includes(controllerConfig.roadHighlightMode)
			? (usedRoadHighlightMode = controllerConfig.roadHighlightMode)
			: (usedRoadHighlightMode = "ColoredRoads"); // default

		helpers[usedRoadHighlightMode].initialize()
	}

	//
	// selection handling

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

	//
	// road helper calls

	function handleRoadsHighlightForStartElement() {
		storeRelatedRoadObjsInMap();

		helpers[usedRoadHighlightMode]
			.highlightRelatedRoadsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
	}

	function handleRoadsHighlightsReset() {
		helpers[usedRoadHighlightMode]
			.resetRoadsHighlight(globalRelatedRoadObjsMap);

		globalRelatedRoadObjsMap.clear();
	}


	function storeRelatedRoadObjsInMap() {
		const startCallsOtherElements = roadModel.getRoadObjsForStartElementId(globalStartElementComponent.id);
		const tmpDestinationElementComponent = globalStartElementComponent;
		const startIsCalledByOtherElements = roadModel.getRoadObjsForDestinationElementId(tmpDestinationElementComponent.id);

		globalRelatedRoadObjsMap = new Map([...startCallsOtherElements, ...startIsCalledByOtherElements]);
	}



	//
	// selection highlighting

	function highlightStartElement() {
		canvasManipulator.highlightEntities([globalStartElementComponent], "red", { name: controllerConfig.name });
	}

	function unhighlightStartElement() {
		canvasManipulator.unhighlightEntities([globalStartElementComponent], { name: controllerConfig.name });
	}

	return {
		initialize: initialize,
	};
}();