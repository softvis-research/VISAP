controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		emphasizeMode: "ColoredRoads",

		showLegendOnSelect: true,

		enableTransparency: true,

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
	let mode;
	let helpers = {}

	let transparentElements = []

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
		initializeHelpers(controllerConfig)
	}

	function initializeHelpers(controllerConfig) {
		// store helpers to make them downstream accessable depending on defined emphasizeMode via helpers[mode].<> 
		roadColorHelper = createRoadColorHelper(controllerConfig);
		roadStripesHelper = createRoadStripesHelper(controllerConfig);
		helpers = {
			ColoredRoads: {
				initialize: roadColorHelper.initialize,
				handleRoadSectionEmphasizing: roadColorHelper.handleRoadSectionEmphasizing,
				resetRoadSectionEmphasizing: roadColorHelper.resetRoadSectionEmphasizing
			},
			ColoredStripes: {
				initialize: roadStripesHelper.initialize,
				handleRoadSectionEmphasizing: roadStripesHelper.handleRoadSectionEmphasizing,
				resetRoadSectionEmphasizing: roadStripesHelper.resetRoadSectionEmphasizing
			},
		}

		// check if emphasizeMode is correctly defined in config, else set basic mode
		Object.keys(helpers).includes(controllerConfig.emphasizeMode)
			? (mode = controllerConfig.emphasizeMode)
			: (mode = "ColoredRoads");

		helpers[mode].initialize()
	}

	// handle supported entity types on select
	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			canvasManipulator.highlightEntities(startElement, "red", { name: controllerConfig.name });

			startElementId = startElement[0].id

			if (controllerConfig.enableTransparency) handleTransparency(startElementId)

			// setup properties for each involved roadSection (e.g. state)
			assignRoadSectionRelativeProperties(startElementId)
			// 
			helpers[mode].handleRoadSectionEmphasizing(roadSectionRelativePropertiesMap)
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: controllerConfig.name });
			helpers[mode].resetRoadSectionEmphasizing(roadSectionRelativePropertiesMap);
			resetRoadSectionRelativeProperties()
			resetTransparencyOfElements()
		}
	}

	function handleTransparency(startElementId) {
		let involvedElements = new Set();
		involvedElements.add(roadModel.getRoadDestinationsForStartElement(startElementId));
		involvedElements.add(roadModel.getRoadStartElementsForDestination(destinationElementId = startElementId));

		// flatten the set to contain single string values
		involvedElements = new Set([...involvedElements].flat());
		involvedElements.add(startElementId)

		const allElements = model.getAllEntities();

		// helper function to check nested property existence
		function hasNestedProperty(obj, propPath) {
			const props = propPath.split('.');
			return props.every(p => obj.hasOwnProperty(p) && (obj = obj[p]));
		}

		allElements.forEach((value, id) => {
			// Check if the value is an object and has the nested "belongsTo" attribute
			if (typeof value === 'object' && hasNestedProperty(value, 'belongsTo.type')) {
				console.log(value.belongsTo.id)
				// check if nested "belongsTo.type" value is in the involvedElements set
				if (involvedElements.has(value.belongsTo.id)) {
					// Skip calling canvasManipulator if it belongs to the involvedElements
					return;
				}
			}

			if (!involvedElements.has(id)) {
				canvasManipulator.changeTransparencyOfEntities([{ id }], 0.3, { name: controllerConfig.name });
				transparentElements.push(id)
			}
		});
	}

	function resetTransparencyOfElements() {
		transparentElements.forEach(id => {
			canvasManipulator.resetTransparencyOfEntities([{ id }], { name: controllerConfig.name });
		})
		transparentElements = []
	}

	// fill state map with necessary information for generic use in downstream modules
	function assignRoadSectionRelativeProperties(startElementId) {
		const destinationsOfStart = roadModel.getRoadDestinationsForStartElement(startElementId);
		const startIsDestination = roadModel.getRoadStartElementsForDestination(destinationElementId = startElementId);
		assignAllRoadSectionRelations(startElementId, destinationsOfStart, startIsDestination);
		assignRoadSectionStates();
		assignRoadSectionRamps(startElementId, startIsDestination)
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

	function assignRoadSectionRamps(startElementId, startIsDestination) {
		// get ramps in all involved roads
		const rampRoadSections1 = roadModel.getRampRoadSectionsForStartElement(startElementId);
		const rampRoadSections2 = startIsDestination.flatMap(elementId => {
			const rampRoadSections = roadModel.getRampRoadSectionsForStartElement(elementId);
			return rampRoadSections ? [rampRoadSections] : [];
		});

		// combine firstRoadSections and lastRoadSections arrays
		const combinedFirstSections = [...(rampRoadSections1?.firstRoadSections || []), ...(rampRoadSections2.flatMap(r => r?.firstRoadSections || []))];
		const combinedLastSections = [...(rampRoadSections1?.lastRoadSections || []), ...(rampRoadSections2.flatMap(r => r?.lastRoadSections || []))];

		if (combinedFirstSections.length > 0 || combinedLastSections.length > 0) {
			roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
				const isRamp = combinedFirstSections.includes(roadSection) || combinedLastSections.includes(roadSection);
				roadSectionProperties = { ...roadSectionProperties, isRamp: isRamp };
				roadSectionRelativePropertiesMap.set(roadSection, roadSectionProperties);
			});
		}
	}

	function resetRoadSectionRelativeProperties() {
		roadSectionRelativePropertiesMap.clear();
	}

	// helper function to check if an array contains only a specific value
	function isArrayContainsOnly(arr, value) {
		return arr.every(item => item === value);
	}

	return {
		initialize: initialize,
	};
}();