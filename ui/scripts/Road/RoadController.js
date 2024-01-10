controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		emphasizeMode: "ColoredRoads",

		showLegendOnSelect: true,

		supportedEntityTypes: [
			"Class", 
			"Report", 
			"FunctionGroup", 
			"Interface"],

		relationTypes: {
			calls: "calls",
			isCalled: "isCalled",
			bidirectionalCall: "bidirectionalCall",
			ambiguous: "ambiguous"
		},

		roadColors: {
			ambiguous: "white",
			calls: "turquoise",
			isCalled: "orange",
			bidirectionalCall: "magenta",
		},
	}

	let roadSectionRelationsTypeMap = new Map();
	let roadSectionStatesMap = new Map();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		if(controllerConfig.emphasizeMode == "ColoredRoads") {
			roadColorHelper = createRoadColorHelper(controllerConfig);
			roadColorHelper.initialize();
		}
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	// handle supported entity types on select
	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });

			startElementId = startElement[0].id
			determineRoadSectionRelations(startElementId)
			determineRoadSectionStates()

			roadColorHelper.handleRoadSectionStates(roadSectionStatesMap, controllerConfig.roadSectionStatesDefinition);

		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
			roadColorHelper.resetRoadSectionStateHandling(roadSectionStatesMap, controllerConfig.roadSectionStatesDefinition);
			resetRoadSectionStates()
		}
	}

	// determine all relations of a startElement
	function determineRoadSectionRelations(startElementId) {
		// get elements called by startElement and that call the startElement
		const destinationsOfStart = roadModel.getRoadDestinationsForStartElement(startElementId);
		const startIsDestination = roadModel.getRoadStartElementsForDestination(destinationElementId = startElementId);
		// adds relation to roadSections
		function addRelationIfNotEmpty(elements, relationType) {
			if (elements.length !== 0) {
				addRelationToRoadSection(startElementId, elements, relationType);
			}
		}
		
		// apply logic to determine all relations a roadSection has (e.g. calls, calls, bidirectional, calls, isCalled, ...)
		const bidirectionalCallElements = destinationsOfStart.filter(id => startIsDestination.includes(id));
		addRelationIfNotEmpty(bidirectionalCallElements, controllerConfig.relationTypes.bidirectionalCall);
	
		const callsElements = destinationsOfStart.filter(id => !startIsDestination.includes(id));
		addRelationIfNotEmpty(callsElements, controllerConfig.relationTypes.calls);
	
		const isCalledElements = startIsDestination.filter(id => !destinationsOfStart.includes(id));
		addRelationIfNotEmpty(isCalledElements, controllerConfig.relationTypes.isCalled);
	}
	

	// helper function to get all roadSections and add relations to a map with their relation
	function addRelationToRoadSection(startElementId, elements, relationType) {
		elements.forEach(id => {
			const roadSections = roadModel.getRoadSectionsOfUniqueRelationship(id, startElementId)
			roadSections.forEach(roadSection => {
				const existingRelations = roadSectionRelationsTypeMap.get(roadSection) || [];
				const newRelations = [...existingRelations, relationType];
				roadSectionRelationsTypeMap.set(roadSection, newRelations)
			})
		})
	}

	// check all added relations on roadSections and assign a determinable undeterminable (ambiguous) or determinable (calls, isCalled, bidirectionalCall) state 
	function determineRoadSectionStates() {
		roadSectionRelationsTypeMap.forEach((relationsArray, roadSection) => {
			let state;
			switch (true) {
				case isArrayContainsOnly(relationsArray, controllerConfig.relationTypes.calls):
					state = controllerConfig.relationTypes.calls;
					break;
				case isArrayContainsOnly(relationsArray, controllerConfig.relationTypes.isCalled):
					state = controllerConfig.relationTypes.isCalled;
					break;
				case isArrayContainsOnly(relationsArray, controllerConfig.relationTypes.bidirectionalCall):
					state = controllerConfig.relationTypes.bidirectionalCall;
					break;
				default:
					state = controllerConfig.relationTypes.ambiguous;
			}
			roadSectionStatesMap.set(roadSection, state);
		});
	}

	// helper function to check if an array contains only a specific value
	function isArrayContainsOnly(arr, value) {
		return arr.every(item => item === value);
	}

	function resetRoadSectionStates() {
		roadSectionRelationsTypeMap.clear();
		roadSectionStatesMap.clear();
	}

	return {
		initialize: initialize,
	};
}();