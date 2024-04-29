controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],

		colorsParallelColorStripes: {
			calls: "lime",
			isCalled: "magenta",
		},
	}

	let globalParallelColorStripesHelper;
	let globalStartElementComponent;
	let globalRelatedRoadObjsMap = new Map();

	let globalLegendElement;

	/************************
		Initialization
	************************/

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		globalParallelColorStripesHelper = createParallelColorStripesHelper(controllerConfig);
		globalParallelColorStripesHelper.initialize()
	}

	/************************
	   Selection Handling
	************************/

	function onEntitySelected(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			globalStartElementComponent = document.getElementById(appEventEntity.id);
			highlightStartElement();
			handleRoadsHighlightForStartElement();
			handleLegendForAction("select");
		}
	}

	function onEntityUnselected(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			unhighlightStartElement();
			handleRoadsHighlightsReset();
			handleLegendForAction("unselect");
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
			globalParallelColorStripesHelper.startRoadHighlightActionsForStartElement(globalStartElementComponent, globalRelatedRoadObjsMap);
		}
	}

	function handleRoadsHighlightsReset() {
		if (globalRelatedRoadObjsMap.size != 0) {
			globalParallelColorStripesHelper.resetRoadsHighlight();
			globalRelatedRoadObjsMap.clear();
		}
	}

	function handleLegendForAction(action) {
		if(action === "unselect") canvasManipulator.removeElement(globalLegendElement)
		if(action === "select") {
			const popupId = "legend_popup"
			const title = "Relations"
			const text = 
			`
			<p>
				<span style="display: inline-block; width: 20px; height: 20px; background-color: 
				${controllerConfig.colorsParallelColorStripes.calls}; vertical-align: middle; border: 3px solid black;"></span>
				<span style="color: black; padding: 5px;">calls</span>
			</p>
			<p>
				<span style="display: inline-block; width: 20px; height: 20px; background-color: 
				${controllerConfig.colorsParallelColorStripes.isCalled}; vertical-align: middle; border: 3px solid black;"></span>
				<span style="color: black; padding: 5px;">isCalled</span>
			</p>
			`
			const dimProps = {
				width: 100,
				height: 150,
				left: 10,
				top: 10
			}
			globalLegendElement = application.createCustomPopupContainer(title, text, dimProps, popupId);
		}	
	}

	return {
		initialize,
	};
}();