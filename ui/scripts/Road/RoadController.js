controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",

		emphasizeMode: "ColoredRoads",

		showLegendOnSelect: true,
		enableTransparency: true,
		enableRoadVanishing: true,
		spawnTrafficSigns: true,

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

	let transparentElements = new Map();
	let startElement;

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

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = applicationEvent.entities[0];
			canvasManipulator.highlightEntities([startElement], "red", { name: controllerConfig.name });

			// setup properties for each involved roadSection (e.g., state)
			assignRoadSectionRelativeProperties();
			// 
			helpers[mode].handleRoadSectionEmphasizing(roadSectionRelativePropertiesMap);

			if (controllerConfig.enableTransparency) toggleMutingEffects();
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: controllerConfig.name });
			helpers[mode].resetRoadSectionEmphasizing();
			resetRoadSectionRelativeProperties()
			if (controllerConfig.enableTransparency) resetMutingEffects()
		}
	}

	// fill state map with necessary information for generic use in downstream modules
	function assignRoadSectionRelativeProperties() {
		const destinationsOfStartRoadSectionIds = roadModel.getRoadSectionIdsOfDestinationForOfStartElement(startElement);
		const startAsDestinationRoadSectionIds = roadModel.getRoadStartElementsForDestination(destinationElement = startElement);

		assignAllRoadSectionRelations(destinationsOfStartRoadSectionIds, startAsDestinationRoadSectionIds);
		assignRoadSectionStates();
		assignRoadSectionRamps(startAsDestinationRoadSectionIds)
	}

	// determine all relations of a startElement
	function assignAllRoadSectionRelations(destinationsOfStartRoadSectionIds, startAsDestinationRoadSectionIds) {
		// get elements called by startElement and that call the startElement

		// adds relation to roadSections
		function addRelationIfNotEmpty(elements, relationType) {
			if (elements.length !== 0) {
				addRelationToRoadSection(elements, relationType);
			}
		}

		// apply logic to determine all relation types a roadSection has (e.g. calls, calls, bidirectional, calls, isCalled, ...)
		const bidirectionalCallElements = destinationsOfStartRoadSectionIds.filter(id => startAsDestinationRoadSectionIds.includes(id));
		addRelationIfNotEmpty(bidirectionalCallElements, controllerConfig.relationTypes.bidirectionalCall);

		const callsElements = destinationsOfStartRoadSectionIds.filter(id => !startAsDestinationRoadSectionIds.includes(id));
		addRelationIfNotEmpty(callsElements, controllerConfig.relationTypes.calls);

		const isCalledElements = startAsDestinationRoadSectionIds.filter(id => !destinationsOfStartRoadSectionIds.includes(id));
		addRelationIfNotEmpty(isCalledElements, controllerConfig.relationTypes.isCalled);
	}


	// helper function to get all roadSections and add relations to a map with their relation type
	function addRelationToRoadSection(elements, relationType) {
		elements.forEach(id => {
			const roadSectionsIds = roadModel.getRoadSectionIdsOfUniqueRelationship(id, startElement.id)
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

		// helper function to check if an array contains only a specific value
		function isArrayContainsOnly(arr, value) {
			return arr.every(item => item === value);
		}
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

	function assignRoadSectionRamps(startIsDestination) {
		// get ramps (first or last items) in all involved roads
		const rampRoadSections1 = roadModel.getRampRoadSectionsForStartElement(startElement.id);
		const rampRoadSections2 = startIsDestination.flatMap(id => {
			const rampRoadSections = roadModel.getRampRoadSectionsForStartElement({ id });
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

	function toggleMutingEffects() {
		let involvedElements = new Map();

		[...roadModel.getRoadSectionIdsOfDestinationForOfStartElement(startElement)].forEach(id => {
			involvedElements.set(id, { id, type: "entity" });
		});

		[...roadModel.getRoadStartElementsForDestination(startElement)].forEach(id => {
			involvedElements.set(id, { id, type: "entity" });
		});

		involvedElements.set(startElement.id, { id: startElement.id, type: "entity" });

		const allRoadSections = roadModel.getAllRoadSectionIds();

		allRoadSections.forEach(id => {
			if (roadSectionRelativePropertiesMap.has(id)) {
				involvedElements.set(id, { id, type: "roadSection" })
			}

		});

		const allElements = new Map(model.getAllEntities());

		// Helper function to check nested property existence
		function hasNestedProperty(obj, propPath) {
			const props = propPath.split('.');
			return props.every(p => obj.hasOwnProperty(p) && (obj = obj[p]));
		}

		allRoadSections.forEach(roadSection => {
			allElements.set(roadSection, { id: roadSection, type: "roadSection" });
		});

		allElements.forEach((value, id) => {
			if (typeof value === 'object' && hasNestedProperty(value, 'belongsTo.type')) {
				// check if nested "belongsTo.type" value is in the involvedElements set
				if (involvedElements.has(value.belongsTo.id) || involvedElements.has(id)) {
					return;
				}
			}

			if (!involvedElements.has(id)) {
				if (value.type === "roadSection") {
					if (controllerConfig.enableRoadVanishing) {
						canvasManipulator.alterPositionOfEntities([{ id }], { deltaY: - 0.1 }); // apply negative offset
						canvasManipulator.changeColorOfEntities([{ id }], "grey", { name: controllerConfig.name });
					}
					canvasManipulator.changeTransparencyOfEntities([{ id }], 0.3, { name: controllerConfig.name });
					transparentElements.set(id, "roadSection")
				} else {
					canvasManipulator.changeTransparencyOfEntities([{ id }], 0.3, { name: controllerConfig.name });
					transparentElements.set(id, "entity")
				}
			}
		});
	}

	function resetMutingEffects() {
		transparentElements.forEach((value, id) => {
			if (value.includes("roadSection")) {
				if (controllerConfig.enableRoadVanishing) {
					canvasManipulator.alterPositionOfEntities([{ id }], { deltaY: 0.1 });
					canvasManipulator.changeColorOfEntities([{ id }], "black", { name: controllerConfig.name });
				}
			}
			canvasManipulator.resetTransparencyOfEntities([{ id }], { name: controllerConfig.name });
		});
		transparentElements.clear();
	}

	function resetRoadSectionRelativeProperties() {
		roadSectionRelativePropertiesMap.clear();
	}

	return {
		initialize: initialize,
	};
}();