controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
        supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],
	}

	const relationTypes = {
		calls: "REL__calls",
		isCalled: "REL__isCalled",
		bidirectionalCall: "REL__bidirectionalCall",
		ambiguous: "REL__ambiguous"
	}
	const roadSectionStatesDefinition = {
		calls: "STATE_calls",
		isCalled: "STATE__isCalled",
		bidirectionalCall: "STATE__bidirectionalCall",
		ambiguous: "STATE__ambiguous"
	}

	let roadSectionRelationsMap = new Map();
    let roadSectionStatesMap = new Map();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		roadColorHelper = createRoadColorHelper(controllerConfig)
		roadColorHelper.initialize(setupConfig);

		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });

			startElementId = startElement[0].id
			console.log("START-ELEMENT: " + startElementId)
			determineRoadSectionRelations(startElementId)
			determineRoadSectionStates()

			roadColorHelper.handleRoadSectionStates(roadSectionStatesMap, roadSectionStatesDefinition);

		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		roadColorHelper.resetRoadSectionStateHandling(roadSectionStatesMap, roadSectionStatesDefinition);
		resetRoadSectionStates()
	}

	// determine all relations of a startElement
	function determineRoadSectionRelations(startElementId) {
        // 1. get all destinationElements for startElement
        const destinationElements = model.getAllRoadDestinationElementsForStartElement(startElementId)
        // 2. determine which destinationElements calls the startElement
        const isDestinationElements = model.getAllRoadStartElementsForDestinationElement(startElementId);
		// 3. determine all destinationElements which call the startElement AND the startElement also calls the destinationElement 
		// => add a "bidirectionalCall" relation to all involved roadSections 
		const bidirectionalCallElements = destinationElements.filter(id => isDestinationElements.includes(id));
		bidirectionalCallElements.length !== 0 && addRelationToRoadSection(startElementId, bidirectionalCallElements, relationTypes.bidirectionalCall)
		// 4. determine all destinationElements that get called by the startElement but do not call the startElement
		// => add a "calls" relation to all involved roadSections 
		const callsElements = destinationElements.filter(id => !isDestinationElements.includes(id));
		callsElements.length !== 0 && addRelationToRoadSection(startElementId, callsElements, relationTypes.calls)
		// 5. determine all destinationElements that call the startElement but are not called by the startElement
		// => add a "isCalled" relation to all involved roadSections
		const isCalledElements = isDestinationElements.filter(id => !destinationElements.includes(id));
		isCalledElements.length !== 0 && addRelationToRoadSection(startElementId, isCalledElements, relationTypes.isCalled);
		console.log(roadSectionRelationsMap)
	}

	// helper function to get all roadSections and add relations to a map with their relation
	function addRelationToRoadSection(startElementId, elements, relation) {
		elements.forEach(id => {
			const roadSections = model.getAllRoadSectionsForStartAndDestinationElement(id, startElementId)
			roadSections.forEach(rs => {
				const existingRelations = roadSectionRelationsMap.get(rs) || [];
				const newRelations = [...existingRelations, relation];
				roadSectionRelationsMap.set(rs, newRelations)
			})
		})
	}

	// check all added relations on roadSections and assign a determinable undeterminable (ambiguous)or determinable (calls, isCalled, bidirectionalCall) state 
	function determineRoadSectionStates() {
		roadSectionRelationsMap.forEach((relationsArray, roadSection) => {
		  let state;
	  
		  switch (true) {
			case isArrayContainsOnly(relationsArray, relationTypes.calls):
			  state = roadSectionStatesDefinition.calls;
			  break;
			
			case isArrayContainsOnly(relationsArray, relationTypes.isCalled):
			  state = roadSectionStatesDefinition.isCalled;
			  break;
			
			case isArrayContainsOnly(relationsArray, relationTypes.bidirectionalCall):
			  state = roadSectionStatesDefinition.bidirectionalCall;
			  break;
	  
			default:
			  state = roadSectionStatesDefinition.ambiguous;
		  }
	  
		  roadSectionStatesMap.set(roadSection, state);
		});
	  }
	  
	  // helper function to check if an array contains only a specific value
	  function isArrayContainsOnly(arr, value) {
		return arr.every(item => item === value);
	  }
	  

	function resetRoadSectionStates() {
		roadSectionRelationsMap.clear();
		roadSectionStatesMap.clear();
	}

	return {
		initialize: initialize,
	};
}();