controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],

		colorsParallelColorStripes: {
			calls: "lime",
			isCalled: "magenta",
		},
	}

	let glbParallelColorStripesHelper;
	let glbStartDistrictComponent;
	let glbRelatedRoadObjsMap = new Map();

	/************************
		Initialization
	************************/



	//include in master setup

	// wiki schreiben

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelect);
		events.selected.off.subscribe(onEntityDeselect);
		glbParallelColorStripesHelper = createParallelColorStripesHelper(controllerConfig);
	}

	/************************
	   District Selection
	************************/

	function onEntitySelect(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			glbStartDistrictComponent = document.getElementById(appEventEntity.id);
			highlightDistrict();
			handleRoadsHighlightForStartDistrict();
		}
	}

	function onEntityDeselect(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			unhighlightDistrict();
			handleRoadsHighlightsReset();
		}
	}

	/************************
	  District Highlighting
	************************/

	// select controller
	function highlightDistrict() {
		canvasManipulator.highlightEntities([glbStartDistrictComponent], "red", { name: controllerConfig.name });
	}

	function unhighlightDistrict() {
		canvasManipulator.unhighlightEntities([glbStartDistrictComponent], { name: controllerConfig.name });
	}

	/************************
		Road Highlighting
	************************/

	// prepare a glb map of all related roadObjs as input for the variant helpers
	function storeRelatedRoadObjsInMap() {
		const startCallsOtherDistricts = roadModel.getRoadObjsForStartDistrictId(glbStartDistrictComponent.id);
		const tmpDestDistrictComponent = glbStartDistrictComponent;
		const startIsCalledByOtherDistricts = roadModel.getRoadObjsForDestDistrictId(tmpDestDistrictComponent.id);
		glbRelatedRoadObjsMap = new Map([...startCallsOtherDistricts, ...startIsCalledByOtherDistricts]);
	}

	function handleRoadsHighlightForStartDistrict() {
		storeRelatedRoadObjsInMap();
		if (glbRelatedRoadObjsMap.size != 0) {
			glbParallelColorStripesHelper.startRoadHighlightActionsForStartDistrict(glbStartDistrictComponent, glbRelatedRoadObjsMap);
		}
	}

	function handleRoadsHighlightsReset() {
		if (glbRelatedRoadObjsMap.size != 0) {
			glbParallelColorStripesHelper.resetRoadsHighlight();
			glbRelatedRoadObjsMap.clear();
		}
	}

	return {
		initialize,
	};
}();