controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		guideMode: "coloredRoads",
		roadColorCalls: { r: 0, g: 0, b: 1 },
		roadColorIsCalled: { r: 1, g: 0, b: 1 },
		roadColorBidirectional: { r: 1, g: 0, b: 1 },
		roadColorAmbiguous: { r: 0, g: 1, b: 0 },

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"]
    }

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		// LD TODO: Add logic for guideMode helper initialization here (if we plan to implement multiple modes)

		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityDeselected);
	}

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			console.log(startElement)
			const roadSections = model.getAllRoadSectionsForStartElement(startElement[0].id)
			console.log(roadSections)
			roadSections.forEach(roadSection => {
				const dto = [{
					id: roadSection
				}]
				canvasManipulator.highlightEntities(dto, "red", { name: "roadController" });
				canvasManipulator.alterPositionOfEntities(dto, 1)
			});
			
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
		  } else {
		  }
	}

	function onEntityDeselected(applicationEvent) {
		startElementId = [applicationEvent.entities[0]]
		const roadSections = model.getAllRoadSectionsForStartElement(startElement[0].id)
		roadSections.forEach(roadSection => {
			const dto = [{
				id: roadSection
			}]
			canvasManipulator.resetColorOfEntities(dto, { name: "roadController" });
			canvasManipulator.alterPositionOfEntities(dto, -1)

		});
		canvasManipulator.resetColorOfEntities(startElementId, { name: "roadController" })
	}

	// LD TODO: Implement me.
	return {
		initialize: initialize,
	};
}();
