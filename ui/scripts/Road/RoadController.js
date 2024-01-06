controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
		roadColorCalls: { r: 0, g: 0, b: 1 },
		roadColorIsCalled: { r: 1, g: 0, b: 1 },
		roadColorBidirectional: { r: 1, g: 0, b: 1 },
		roadColorAmbiguous: { r: 0, g: 1, b: 0 },

		emphasizedRoadOffsetY: 0.1,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"]
	}

	let emphasizedRoadSections = new Set();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		// LD TODO: Add logic for guideMode helper initialization here (if we plan to implement multiple modes)
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			handleRoadEmphasizingForStartElement(startElement)
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		resetRoadEmphasizing();
	}

	function handleRoadEmphasizingForStartElement(startElement) {
		startElementId = startElement[0].id
		const roadSections = model.getAllRoadSectionsForStartElement(startElementId)
		roadSections.forEach(roadSection => {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "white", { name: "roadController" });
			if (!emphasizedRoadSections.has(roadSection)) {
				canvasManipulator.alterPositionOfEntities([{ id: roadSection }], controllerConfig.emphasizedRoadOffsetY) // Y offset to dodge overlaps
			}
			emphasizedRoadSections.add(roadSection)
		});


		const destinationElements = model.getAllRoadStartElementsForDestinationElement(startElementId);
		destinationElements.forEach(destinationElement => {
			const roadSections = model.getAllRoadSectionsForStartElement(destinationElement)
			roadSections.forEach(roadSection => {
				canvasManipulator.changeColorOfEntities([{ id: roadSection }], "green", { name: "roadController" });
				if (!emphasizedRoadSections.has(roadSection)) {
					canvasManipulator.alterPositionOfEntities([{ id: roadSection }], controllerConfig.emphasizedRoadOffsetY) // Y offset to dodge overlaps
				}				
				emphasizedRoadSections.add(roadSection)
			});
		})
	}

	function resetRoadEmphasizing() {
		emphasizedRoadSections.forEach(roadSection =>  {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
			canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - controllerConfig.emphasizedRoadOffsetY)
		});
		emphasizedRoadSections.clear();
	}

	return {
		initialize: initialize,
	};
}();