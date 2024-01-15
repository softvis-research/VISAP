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

	// globals

	let includedRoadSections = [];
	let mode;
	let helpers = {}

	let transparentElements = new Map();
	let startElementComponent;


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
			startElementComponent = applicationEvent.entities[0];
			canvasManipulator.highlightEntities([startElementComponent], "red", { name: controllerConfig.name });

			// setup properties for each involved roadSection (e.g., state)
			assignRoadSectionRelativeProperties();
			// 
			// helpers[mode].handleRoadSectionEmphasizing(roadSectionRelativePropertiesMap);

			// if (controllerConfig.enableTransparency) toggleMutingEffects();
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
		const destinationsOfStartElementRoadIds = (roadModel.getRoadIdsForStartElementId(startElementComponent.id))
		const startAsDestinationElementRoadIds = roadModel.getRoadIdsForDestinationElementId(destinationElementId = startElementComponent.id);

		assignRelationsToRoadSectionObjs(destinationsOfStartElementRoadIds, startAsDestinationElementRoadIds);
		assignRoadSectionObjStates();
	}

	// determine all relations of a startElement
	function assignRelationsToRoadSectionObjs(destinationsOfStartElementRoadIds, startAsDestinationElementRoadIds) {
		// adds relation to roadSections
		function addRelationIfNotEmpty(elements, relationType) {
			if (elements.length !== 0) {
				addRelationToRoadSection(elements, relationType);
			}
		}

		let destinationsOfStartElementRoadSectionObjs = []
		destinationsOfStartElementRoadIds.forEach(roadId => {
			destinationsOfStartElementRoadSectionObjs.push(...roadModel.getRoadSectionObjsForRoadId(roadId));
		})

		let startAsDestinationElementRoadSectionObjs = []
		destinationsOfStartElementRoadIds.forEach(roadId => {
			startAsDestinationElementRoadSectionObjs.push(...roadModel.getRoadSectionObjsForRoadId(roadId));
		})

		const roadSectionObjsBidirectional = destinationsOfStartElementRoadSectionObjs
			.filter(obj1 => startAsDestinationElementRoadSectionObjs
				.some(obj2 => obj2.roadSectionId === obj1.roadSectionId));
		addRelationIfNotEmpty(roadSectionObjsBidirectional, controllerConfig.relationTypes.bidirectionalCall);

		const roadSectionObjsCalls = destinationsOfStartElementRoadSectionObjs
			.filter(obj1 => !startAsDestinationElementRoadSectionObjs
				.some(obj2 => obj2.roadSectionId === obj1.roadSectionId));
		addRelationIfNotEmpty(roadSectionObjsCalls, controllerConfig.relationTypes.calls);

		const roadSectionObjsIsCalled = startAsDestinationElementRoadSectionObjs
			.filter(obj1 => !destinationsOfStartElementRoadSectionObjs
				.some(obj2 => obj2.roadSectionId === obj1.roadSectionId));
		addRelationIfNotEmpty(roadSectionObjsIsCalled, controllerConfig.relationTypes.isCalled);
	}

	function addRelationToRoadSection(roadSectionObjsArr, relationType) {
		roadSectionObjsArr.forEach(roadSectionObj => {
			roadSectionObj.relationTypes.push(relationType);
			includedRoadSections.push(roadSectionObj);
		});
	}
	// check all added relations on roadSections and assign a determinable undeterminable (ambiguous) or determinable (calls, isCalled, bidirectionalCall) state 
	function assignRoadSectionObjStates() {
		includedRoadSections.forEach((roadSectionProperties) => {
			const relationsArray = roadSectionProperties.relations;

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
			roadSectionProperties.state = state;
		});
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
		includedRoadSections = []
	}

	return {
		initialize: initialize,
	};
}();