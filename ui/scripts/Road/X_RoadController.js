controllers.roadControllers = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
		emphasizeColors: {
            calls: "turquoise",
            isCalled: "green",
            bidirectionalCall: "magenta",
            ambiguous: "white",
        },

		emphasizedRoadOffsetY: 0.05,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],
		supportedRelationExpressions: ["calls", "isCalled", "bidirectional", "ambiguous"],


	}

	let legendDivElement;
	let emphasizedRoadSectionStates = new Map();

	let legendHelper;

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		legendHelper = createLegendHelper(controllerConfig)

		legendHelper.createLegend()
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
			legendHelper.showLegend() 
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		resetRoadEmphasizing();
	}

	function controlRoadSectionEmphasizingStates(roadSections, roadType) {
		const offset = 0.05;
		const step = 0.0001;
		const emphasizedRoadOffsetY = {
			calls: offset,
			isCalled: offset + step,
			bidirectional: offset + 2 * step,
			ambiguous: offset + 3 * step
		}
	
		roadSections.forEach(roadSection => {
			const existingTypes = emphasizedRoadSectionStates.get(roadSection) || [];
			const newTypes = [...existingTypes, roadType];
	
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], controllerConfig.emphasizeColors[roadType], { name: "roadController" });
	
			if (!emphasizedRoadSectionStates.has(roadSection)) {
				canvasManipulator.alterPositionOfEntities([{ id: roadSection }], emphasizedRoadOffsetY[roadType]);
			}
			emphasizedRoadSectionStates.set(roadSection, newTypes);

			// LD TODO: FIX
			const currentStates = emphasizedRoadSectionStates.get(roadSection);
			if (currentStates.length > 1 && !["calls", "isCalled", "bidirectionalCalls"].every(state => currentStates.includes(state))) {
				canvasManipulator.changeColorOfEntities([{ id: roadSection }], controllerConfig.emphasizeColors.ambiguous, { name: "roadController" });
				canvasManipulator.alterPositionOfEntities([{ id: roadSection }], emphasizedRoadOffsetY.ambiguous);
			}

		});
	
		console.log(emphasizedRoadSectionStates);
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
		controlRoadSectionEmphasizingStates(roadSections, "bidirectionalCall")
	}

	function resetRoadEmphasizing() {
		console.log(emphasizedRoadSectionStates)
		// legendDivElement.style.display = 'none';
		emphasizedRoadSectionStates.forEach((_, roadSection) =>  {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
			canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - controllerConfig.emphasizedRoadOffsetY)
		});
	
		emphasizedRoadSectionStates.clear();
		legendHelper.hideLegend()
	}

	return {
		initialize: initialize,
	};
}();