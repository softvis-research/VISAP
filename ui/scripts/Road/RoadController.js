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
		if (controllerConfig.emphasizeMode == "ColoredRoads") {
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
			assignRoadSectionRelativeProperties(startElementId)

			roadColorHelper.handleRoadSectionStates(roadSectionRelativePropertiesMap);

		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
			roadColorHelper.resetRoadSectionStateHandling(roadSectionRelativePropertiesMap, controllerConfig.roadSectionStatesDefinition);
			resetRoadSectionStates()
		}
	}

	function assignRoadSectionRelativeProperties(startElementId) {
		const destinationsOfStart = roadModel.getRoadDestinationsForStartElement(startElementId);
		const startIsDestination = roadModel.getRoadStartElementsForDestination(destinationElementId = startElementId);
		assignAllRoadSectionRelations(startElementId, destinationsOfStart, startIsDestination);
		assignRoadSectionStates();
		assignRoadSectionDirection3D(startElementId);
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
				const existingProperties = roadSectionRelativePropertiesMap.get(roadSection) || {};
				const existingRelations = existingProperties.relations || [];
				const newRelations = [...existingRelations, relationType];
				roadSectionProperties = { ...existingProperties, relations: newRelations };
				roadSectionRelativePropertiesMap.set(roadSection, roadSectionProperties)
			})
		})
	}

	// check all added relations on roadSections and assign a determinable undeterminable (ambiguous) or determinable (calls, isCalled, bidirectionalCall) state 
	function assignRoadSectionStates() {
		console.log("x");
		console.log(roadSectionRelativePropertiesMap);

		roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
			const relationsArray = roadSectionProperties.relations;
			let state;

			// Check if relationsArray is defined before using it
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

				// Update the state property in roadSectionProperties
				roadSectionProperties = { ...roadSectionProperties, state: state };
				roadSectionRelativePropertiesMap.set(roadSection, roadSectionProperties);
			}
		});
	}

	function assignRoadSectionDirection3D(startElementId) {

		roadObjectsCalls = roadModel.getRoadRelationsForStartElement(startElementId)
		roadObjectsCalls.forEach(roadObject => {
			console.log(roadObject.roadSectionsIds)
			calculateAngleBetweenRoadSections(roadObject.roadSectionsIds)
		})


		// roadObjectsIsCalled = roadModel.getRoadRelationsForDestination(startElementId)

	}
	
	function angleToDirection(angleDegrees) {
		if (angleDegrees >= 45 && angleDegrees < 135) {
			return "East";
		} else if (angleDegrees >= 135 && angleDegrees < 225) {
			return "South";
		} else if (angleDegrees >= 225 && angleDegrees < 315) {
			return "West";
		} else {
			return "North";
		}
	}
	
	function calculateAngleBetweenRoadSections(roadSections) {
		const degreesToRadians = degrees => degrees * (Math.PI / 180);
	
		for (let i = 0; i < roadSections.length - 1; i++) {
			const roadSection1 = roadSections[i];
			const center1 = roundCoordinates(canvasManipulator.getCenterOfEntity({ id: roadSection1 }));
			console.log(`Center of RoadSection ${roadSection1}:`, center1);
	
			for (let j = i + 1; j < roadSections.length; j++) {
				const roadSection2 = roadSections[j];
				const center2 = roundCoordinates(canvasManipulator.getCenterOfEntity({ id: roadSection2 }));
				console.log(`Center of RoadSection ${roadSection2}:`, center2);
	
				const deltaX = center2.x - center1.x;
				const deltaZ = center2.z - center1.z;
	
				// Calculate the angle in radians
				let angleRadians = Math.atan2(deltaZ, deltaX);
	
				// Convert angle to degrees
				let angleDegrees = angleRadians * (180 / Math.PI);
	
				// Ensure the angle is positive
				if (angleDegrees < 0) {
					angleDegrees += 360;
				}
	
				console.log(`Angle between RoadSection ${roadSection1} and RoadSection ${roadSection2}: ${angleDegrees} degrees`);
				
				const direction = angleToDirection(angleDegrees);
				console.log(`Direction between RoadSection ${roadSection1} and RoadSection ${roadSection2}: ${direction}`);
			}
		}
	}
	
	
	function roundCoordinates(coordinates) {
		const precision = 10;
		return {
			x: Number(coordinates.x.toFixed(precision)),
			y: Number(coordinates.y.toFixed(precision)),
			z: Number(coordinates.z.toFixed(precision)),
		};
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