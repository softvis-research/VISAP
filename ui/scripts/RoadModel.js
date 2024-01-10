controllers.roadModel = (function () {

	let startElementsDestinationMap = new Map(); //
	let startElementsRoadSectionsMap = new Map();
	let relationshipRoadSectionsMap = new Map();

	// model data from roads.json
	function createRoadRelationsFromRoadsData(roadsDataArray) {

		roadsDataArray.forEach(function (entry) {

			let roadRelation = createRoadRelation(
				entry.id,
				entry.start_element,
				entry.destination_element,
				entry.road_sections,
			);

			// set up startElement -> destinationElements map
			if (startElementsDestinationMap.has(roadRelation.startElementId)) {
				const existingDestinations = startElementsDestinationMap.get(roadRelation.startElementId);
				const updatedDestinations = [...existingDestinations, roadRelation.destinationElementId];
				startElementsDestinationMap.set(roadRelation.startElementId, updatedDestinations);
			} else {
				startElementsDestinationMap.set(roadRelation.startElementId, [roadRelation.destinationElementId]);
			}

			// set up startElement -> roadSections map
			if (startElementsRoadSectionsMap.has(roadRelation.startElementId)) {
				const existingRoadSections = startElementsRoadSectionsMap.get(roadRelation.startElementId);
				const updatedRoadSections = [...existingRoadSections, ...roadRelation.roadSectionsIds];
				startElementsRoadSectionsMap.set(roadRelation.startElementId, updatedRoadSections);
			} else {
				startElementsRoadSectionsMap.set(roadRelation.startElementId, [...roadRelation.roadSectionsIds]);
			}

			// set up startElement + destinationElement (concat ID with @) -> roadSections map
			const key = roadRelation.startElementId + "@" + roadRelation.destinationElementId;
			if (relationshipRoadSectionsMap.has(key)) {
				const existingRoadSections = relationshipRoadSectionsMap.get(key);
				const updatedRoadSections = [...existingRoadSections, ...roadRelation.roadSectionsIds];
				relationshipRoadSectionsMap.set(key, updatedRoadSections);
			} else {
				relationshipRoadSectionsMap.set(key, [...roadRelation.roadSectionsIds]);
			}


			// set up startElement -> roadSections ->
		});
	}

	// object map
	function createRoadRelation(roadRelationId, startElementId, destinationElementId, roadSectionsIds) {
		let roadRelation = {
			roadRelationId,
			startElementId,
			destinationElementId,
			roadSectionsIds,
		}
		return roadRelation;
	}

	// get all roadSections for a startElement
	function getRoadSectionsForStartElement(startElementId) {
		if (startElementsRoadSectionsMap.has(startElementId)) {
			return startElementsRoadSectionsMap.get(startElementId);
		} else {
			return [];
		}
	}

	// get all roadSections for a unique relation between tweo entities (order of ID's doesn't matter)
	function getRoadSectionsOfUniqueRelationship(entityId1, entityId2) {
		const key1 = entityId1 + "@" + entityId2;
		const key2 = entityId2 + "@" + entityId1;

		const roadSections1 = relationshipRoadSectionsMap.get(key1) || [];
		const roadSections2 = relationshipRoadSectionsMap.get(key2) || [];

		const roadSections = [...roadSections1, ...roadSections2];

		return roadSections;
	}

	// get all destinationElements for a startElement
	function getRoadDestinationsForStartElement(startElementId) {
		if (startElementsDestinationMap.has(startElementId)) {
			return startElementsDestinationMap.get(startElementId);
		} else {
			return [];
		}
	}

	// get all startElements for a destinationElement
	function getRoadStartElementsForDestination(destinationElementId) {
		const startElements = [];
		for (const [startElement, destinationElements] of startElementsDestinationMap.entries()) {
			if (destinationElements.includes(destinationElementId)) {
				startElements.push(startElement);
			}
		}
		return startElements;
	}

	return {
		createRoadRelationsFromRoadsData: createRoadRelationsFromRoadsData,
		getRoadSectionsForStartElement: getRoadSectionsForStartElement,
		getRoadDestinationsForStartElement: getRoadDestinationsForStartElement,
		getRoadStartElementsForDestination: getRoadStartElementsForDestination,
		getRoadSectionsOfUniqueRelationship: getRoadSectionsOfUniqueRelationship
	};

})();