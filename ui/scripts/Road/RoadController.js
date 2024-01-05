controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		guideMode: "coloredRoads",
		roadColorCalls: { r: 0, g: 0, b: 1 },
		roadColorIsCalled: { r: 1, g: 0, b: 1 },
		roadColorBidirectional: { r: 1, g: 0, b: 1 },
		roadColorAmbiguous: { r: 0, g: 1, b: 0 },

		activeRoadOffsetY: 0.1,

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
			const roadSections = model.getAllRoadSectionsForStartElement(startElement[0].id)
			roadSections.forEach(roadSection => {
				const roadSectionDTO = [{ id: roadSection }] // create DTO to match required input of canvasManipulator
				canvasManipulator.highlightEntities(roadSectionDTO, "white", { name: "roadController" });
				canvasManipulator.alterPositionOfEntities(roadSectionDTO, controllerConfig.activeRoadOffsetY) // Y offset to dodge overlaps
			});

			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
		} else {
			return;
		}
	}

	function onEntityDeselected(applicationEvent) {
		startElementId = [applicationEvent.entities[0]]
		const roadSections = model.getAllRoadSectionsForStartElement(startElement[0].id)
		roadSections.forEach(roadSection => {
			const roadSectionDTO = [{ id: roadSection }] // create DTO to match required input of canvasManipulator
			canvasManipulator.unhighlightEntities(roadSectionDTO, { name: "roadController" });
			canvasManipulator.alterPositionOfEntities(roadSectionDTO, - controllerConfig.activeRoadOffsetY) // undo Y offset

		});
		canvasManipulator.resetColorOfEntities(startElementId, { name: "roadController" })
	}

	// function showRoadGuideForStartElement(startElementId) {
	// 	const roadSectionsStartElement = model.getAllRoadSectionsForStartElement(startElementId)
	// 	const destinationElements = model.getAllRoadDestinationElementsForStartElement(startElementId)
	// 	const roadSectionsDestinationElement = model.
	// }

	return {
		initialize: initialize,
	};
}();
