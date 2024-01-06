controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
		roadColorCalls: "turquoise",
		roadColorIsCalled: "",
		roadColorBidirectional: "magenta",
		roadColorAmbiguous: "white",

		emphasizedRoadOffsetY: 0.05,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],
		supportedRelationExpressions: ["calls", "isCalled", "bidirectional", "ambigous"],


	}

	let emphasizedRoadSectionStates = new Map();

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
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
			startElementId = startElement[0].id
			handleRoadEmphasizingForStartElement(startElementId)
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		resetRoadEmphasizing();
	}

	function controlRoadSectionEmphasizingStates(roadSections, roadType) {
		
		// Y offset to dodge overlaps
		const offset = 0.05
		const step = 0.0001
		const emphasizedRoadOffsetY = {
			calls: offset,
			isCalled: offset + step,
			bidirectional: offset + 2*step,
			ambigous: offset + 3*step
		}

		const colors = {
			calls: controllerConfig.roadColorCalls,
			isCalled: controllerConfig.roadColorIsCalled,
			bidirectional: controllerConfig.roadColorBidirectional,
			ambigous: controllerConfig.roadColorAmbiguous,
		}

		roadSections.forEach(roadSection => {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], colors[roadType], { name: "roadController" });
			if (!emphasizedRoadSectionStates.has(roadSection)) {
				canvasManipulator.alterPositionOfEntities([{ id: roadSection }], emphasizedRoadOffsetY[roadType]) 
			}
			emphasizedRoadSectionStates.set(roadSection, roadType)
		});
	}

	function handleRoadEmphasizingForStartElement(startElementId) {
		let roadSections = model.getAllRoadSectionsForStartElement(startElementId)
		controlRoadSectionEmphasizingStates(roadSections, "calls");
		const destinationElements = model.getAllRoadStartElementsForDestinationElement(destinationElemenId = startElementId);
		destinationElements.forEach(destinationElement => {
			roadSections = model.getAllRoadSectionsForStartElement(destinationElement)
			controlRoadSectionEmphasizingStates(roadSections, "isCalled")
		})
		roadSections = model.getAllBidirectionalRoadSectionsForStartElement(startElementId);
		controlRoadSectionEmphasizingStates(roadSections, "bidirectional")
	}

	function resetRoadEmphasizing() {
		console.log(emphasizedRoadSectionStates)
		emphasizedRoadSectionStates.forEach((_, roadSection) =>  {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
			canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - controllerConfig.emphasizedRoadOffsetY)
		});
		emphasizedRoadSectionStates.clear();
	}

	return {
		initialize: initialize,
	};
}();