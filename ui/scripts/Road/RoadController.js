controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		roadHighlightVariant: "MultiColorStripes",

		showLegendOnSelect: true,
		enableMonochromeForUnrelatedEntities: true,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],

		colorsParallelColorStripes: {
			calls: "orange",
			isCalled: "magenta",
		},
	}

	let globalRoadHighlightHelper = {}
	let globalStartElementComponent;
	let globalRelatedRoadObjsMap = new Map();

	let globalLegendHelper = {};

	let globalLegendPopupElement;

	/************************
		Initialization
	************************/

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		initializeHelpers();
		globalLegendHelper = createLegendHtmlHelper(controllerConfig)
		globalLegendHelper.initialize()
	}

	// intitialize roadHighlightHelpers based on variant defined in config, making respective helpers a generic global
	function initializeHelpers() {
		multiColorStripesHelper = createMultiColorStripesHelper(controllerConfig);
		parallelColorStripesHelper = createParallelColorStripesHelper(controllerConfig);

		// add helpers API
		globalRoadHighlightHelper = {
			MultiColorStripes: {
				initialize: multiColorStripesHelper.initialize,
				startRoadHighlightActionsForStartElement: multiColorStripesHelper.startRoadHighlightActionsForStartElement,
				resetRoadsHighlight: multiColorStripesHelper.resetRoadsHighlight
			},
			ParallelColorStripes: {
				initialize: parallelColorStripesHelper.initialize,
				startRoadHighlightActionsForStartElement: parallelColorStripesHelper.startRoadHighlightActionsForStartElement,
				resetRoadsHighlight: parallelColorStripesHelper.resetRoadsHighlight
			},
		}

		Object.keys(globalRoadHighlightHelper).includes(controllerConfig.roadHighlightVariant)
			? (variant = controllerConfig.roadHighlightVariant)
			: (variant = "ColoredRoads"); // default

		globalRoadHighlightHelper[variant].initialize();
	}

	/************************
	   Selection Handling
	************************/

	function onEntitySelected(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			globalStartElementComponent = document.getElementById(appEventEntity.id);
			console.log("START ELEMENT ID: " + globalStartElementComponent.id)
			highlightStartElement();
			handleRoadsHighlightForStartElement();
			globalLegendPopupElement = application.createCustomPopupContainer(`Relations`, globalLegendHelper.getLegendInnerHtml(), { width: 150, height: 145 }, "1",)
		}
	}

	function onEntityUnselected(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];

		canvasManipulator.removeElement(globalLegendPopupElement)

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

	// prepare a global map of all related roadObjs as necessary input for every roadHighlighHelper
	function storeRelatedRoadObjsInMap() {
		const startCallsOtherElements = roadModel.getRoadObjsForStartElementId(globalStartElementComponent.id);
		const tmpDestinationElementComponent = globalStartElementComponent;
		const startIsCalledByOtherElements = roadModel.getRoadObjsForDestinationElementId(tmpDestinationElementComponent.id);
		globalRelatedRoadObjsMap = new Map([...startCallsOtherElements, ...startIsCalledByOtherElements]);
	}

	function handleRoadsHighlightForStartElement() {
		storeRelatedRoadObjsInMap();
		if (globalRelatedRoadObjsMap.size != 0) {
			globalRoadHighlightHelper[variant].startRoadHighlightActionsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
		}
	}

	function handleRoadsHighlightsReset() {
		if (globalRelatedRoadObjsMap.size != 0) {
			globalRoadHighlightHelper[variant].resetRoadsHighlight();
			globalRelatedRoadObjsMap.clear();
			canvasManipulator.removeElement(globalLegendPopupElement)
		}
	}

	return {
		initialize,
	};
}();