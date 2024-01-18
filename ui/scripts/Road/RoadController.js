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

		colorsParallelColorStripes: {
			calls: "blue",
			isCalled: "red",
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
		parallelColorStripesHelper = createParallelColorStripesHelper(controllerConfig);
		roadHighlightHelper = {
			MultiColorStripes: {
				initialize: multiColorStripesHelper.initialize,
				highlightRelatedRoadsForStartElement: multiColorStripesHelper.highlightRelatedRoadsForStartElement,
				resetRoadsHighlight: multiColorStripesHelper.resetRoadsHighlight
			},
			ParallelColorStripes: {
				initialize: parallelColorStripesHelper.initialize,
				highlightRelatedRoadsForStartElement: parallelColorStripesHelper.highlightRelatedRoadsForStartElement,
				resetRoadsHighlight: parallelColorStripesHelper.resetRoadsHighlight
			},
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
			const appEventEntity = applicationEvent.entities[0];
			globalStartElementComponent = document.getElementById(appEventEntity.id)
			highlightStartElement();
			handleRoadsHighlightForStartElement();
		}
	}

	function onEntityUnselected(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
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