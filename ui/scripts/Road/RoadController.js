controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		roadHighlightVariant: "MultiColorStripes",

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

	// intitialize roadHighlightHelpers based on variant defined in config, making public functions accessible via roadHighlightHelper[variant]
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

		Object.keys(roadHighlightHelper).includes(controllerConfig.roadHighlightVariant)
			? (variant = controllerConfig.roadHighlightVariant)
			: (variant = "ColoredRoads"); // default

		roadHighlightHelper[variant].initialize();
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
		roadHighlightHelper[variant].highlightRelatedRoadsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
	}

	function handleRoadsHighlightsReset() {
		roadHighlightHelper[variant].resetRoadsHighlight();
		globalRelatedRoadObjsMap.clear();
	}

	return {
		initialize: initialize,
	};
}();