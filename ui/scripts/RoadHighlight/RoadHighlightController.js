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
	let glbLegendDistrict;

	/************************
		Initialization
	************************/

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
			handleLegendForAction("select");
		}
	}

	function onEntityDeselect(applicationEvent) {
		const appEventEntity = applicationEvent.entities[0];
		if (controllerConfig.supportedEntityTypes.includes(appEventEntity.type)) {
			unhighlightDistrict();
			handleRoadsHighlightsReset();
			handleLegendForAction("unselect");
		}
	}

	/************************
	  District Highlighting
	************************/

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

	function handleLegendForAction(action) {
		if(action === "unselect") canvasManipulator.removeElement(glbLegendDistrict)
		if(action === "select") {
			const popupId = "legend_popup";
			const title = "Relations";
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
			// create a popup window leveraging the application functionality
			glbLegendDistrict = application.createCustomPopupContainer(title, text, dimProps, popupId);
		}	
	}

	return {
		initialize,
	};
}();