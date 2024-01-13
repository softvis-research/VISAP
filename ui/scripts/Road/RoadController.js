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

	let roadSectionRelativePropertiesMap = new Map();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		switch (controllerConfig.emphasizeMode) {
			case "ColoredRoads":
				roadColorHelper = createRoadColorHelper(controllerConfig);
				roadColorHelper.initialize();
				break;
			case "LinesOnRoad":
				//xyz = xyz(controllerConfig);
				//xyz.initialize();
				break;
			default:
				events.log.error.publish(
					{
						text: `RoadController - initialize – ${controllerConfig.emphasizeMode} - unknown emphasizeMode, return`
					});
					break;
		}
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	// handle supported entity types on select
	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			canvasManipulator.highlightEntities(startElement, "red", { name: controllerConfig.name });

			startElementId = startElement[0].id
			assignRoadSectionRelativeProperties(startElementId)

			roadColorHelper.handleRoadSectionStates(roadSectionRelativePropertiesMap);

		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: controllerConfig.name });
			roadColorHelper.resetRoadSectionStateHandling(roadSectionRelativePropertiesMap, controllerConfig.roadSectionStatesDefinition);
			resetRoadSectionStates()
		}
	}

	// fill state map with necessary information for generic use in downstream modules
	function assignRoadSectionRelativeProperties(startElementId) {
		const destinationsOfStart = roadModel.getRoadDestinationsForStartElement(startElementId);
		const startIsDestination = roadModel.getRoadStartElementsForDestination(destinationElementId = startElementId);
		assignAllRoadSectionRelations(startElementId, destinationsOfStart, startIsDestination);
		assignRoadSectionStates();
	}

	// determine all relations of a startElement
	function assignAllRoadSectionRelations(startElementId, destinationsOfStart, startIsDestination) {
		// get elements called by startElement and that call the startElement

		// adds relation to roadSections
		function addRelationIfNotEmpty(elements, relationType) {
			if (elements.length !== 0) {
				addRelationToRoadSection(startElementId, elements, relationType);
			}
		}

		// apply logic to determine all relation types a roadSection has (e.g. calls, calls, bidirectional, calls, isCalled, ...)
		const bidirectionalCallElements = destinationsOfStart.filter(id => startIsDestination.includes(id));
		addRelationIfNotEmpty(bidirectionalCallElements, controllerConfig.relationTypes.bidirectionalCall);

		const callsElements = destinationsOfStart.filter(id => !startIsDestination.includes(id));
		addRelationIfNotEmpty(callsElements, controllerConfig.relationTypes.calls);

		const isCalledElements = startIsDestination.filter(id => !destinationsOfStart.includes(id));
		addRelationIfNotEmpty(isCalledElements, controllerConfig.relationTypes.isCalled);
	}


	// helper function to get all roadSections and add relations to a map with their relation type
	function addRelationToRoadSection(startElementId, elements, relationType) {
		elements.forEach(id => {
			const roadSectionsIds = roadModel.getRoadSectionsOfUniqueRelationship(id, startElementId)
			roadSectionsIds.forEach(id => {
				const existingProperties = roadSectionRelativePropertiesMap.get(id) || {};
				const existingRelations = existingProperties.relations || [];
				const newRelations = [...existingRelations, relationType];
				roadSectionProperties = { ...existingProperties, relations: newRelations };
				roadSectionRelativePropertiesMap.set(id, roadSectionProperties)
			})
		})
	}

	// check all added relations on roadSections and assign a determinable undeterminable (ambiguous) or determinable (calls, isCalled, bidirectionalCall) state 
	function assignRoadSectionStates() {
		roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
			const relationsArray = roadSectionProperties.relations;
			let state;

			// check if relationsArray is defined before using it
			if (relationsArray) {
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

				// update state property in roadSectionProperties
				roadSectionProperties = { ...roadSectionProperties, state: state };
				roadSectionRelativePropertiesMap.set(roadSection, roadSectionProperties);
			}
		});
	}

	// helper function to check if an array contains only a specific value
	function isArrayContainsOnly(arr, value) {
		return arr.every(item => item === value);
	}

	function resetRoadSectionStates() {
		roadSectionRelativePropertiesMap.clear();
	}

	return {
		initialize: initialize,
	};
}();