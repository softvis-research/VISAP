controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		roadHighlightMode: "MultiColorStripes",

		showLegendOnSelect: true,
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

	let usedHighlightMode;
	let roadHighlightHelper = {}
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
		multiColorStripesHelper = createMultiColorStripesHelper(controllerConfig);
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

		console.log(mode)
		roadHighlightHelper[mode].initialize()
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

		roadHighlightHelper[mode]
			.highlightRelatedRoadsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
	}

	function handleRoadsHighlightsReset() {
		roadHighlightHelper[mode]
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