controllers.roadModel = (function () {

	let roadRelationsStartElementsDestinationMap = new Map(); //
	let roadRelationsStartElementsRoadSectionsMap = new Map();
	let roadRelationsUniqueRoadSectionsMap = new Map();

	// model data from roads.json
	function createRoadRelationsFromRoadsData(roadsDataArray) {
		const roadRelations = [];

		roadsDataArray.forEach(function (entry) {

			let roadRelation = createRoadRelation(
				entry.id,
				entry.start_element,
				entry.destination_element,
				entry.road_sections,
			);

			// set up startElement -> destinationElements map; duplicates removed
			if (roadRelationsStartElementsDestinationMap.has(roadRelation.startElementId)) {
				const existingDestinations = roadRelationsStartElementsDestinationMap.get(roadRelation.startElementId);
				const updatedDestinations = removeDuplicates([...existingDestinations, roadRelation.destinationElementId]);
				roadRelationsStartElementsDestinationMap.set(roadRelation.startElementId, updatedDestinations);
			} else {
				roadRelationsStartElementsDestinationMap.set(roadRelation.startElementId, [roadRelation.destinationElementId]);
			}

			// set up startElement -> roadSections map; duplicates removed
			if (roadRelationsStartElementsRoadSectionsMap.has(roadRelation.startElementId)) {
				const existingRoadSections = roadRelationsStartElementsRoadSectionsMap.get(roadRelation.startElementId);
				const updatedRoadSections = removeDuplicates([...existingRoadSections, ...roadRelation.roadSectionsIds]);
				roadRelationsStartElementsRoadSectionsMap.set(roadRelation.startElementId, updatedRoadSections);
			} else {
				roadRelationsStartElementsRoadSectionsMap.set(roadRelation.startElementId, removeDuplicates([...roadRelation.roadSectionsIds]));
			}

			// set up startElement + destinationElement (concat ID with @) -> roadSections map; duplicates removed
			const key = roadRelation.startElementId + "@" + roadRelation.destinationElementId;
			if (roadRelationsUniqueRoadSectionsMap.has(key)) {
				const existingRoadSections = roadRelationsUniqueRoadSectionsMap.get(key);
				const updatedRoadSections = removeDuplicates([...existingRoadSections, ...roadRelation.roadSectionsIds]);
				roadRelationsUniqueRoadSectionsMap.set(key, updatedRoadSections);
			} else {
				roadRelationsUniqueRoadSectionsMap.set(key, removeDuplicates([...roadRelation.roadSectionsIds]));
			}

			roadRelations.push(roadRelation);
		});
		return roadRelations;
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
		if (roadRelationsStartElementsRoadSectionsMap.has(startElementId)) {
			return roadRelationsStartElementsRoadSectionsMap.get(startElementId);
		} else {
			return [];
		}
	}

	// get all roadSections for a unique relation between tweo entities (order of ID's doesn't matter)
	function getRoadSectionsForUniqiueRelation(entityId1, entityId2) {
		const key1 = entityId1 + "@" + entityId2;
		const key2 = entityId2 + "@" + entityId1;

		const roadSections1 = roadRelationsUniqueRoadSectionsMap.get(key1) || [];
		const roadSections2 = roadRelationsUniqueRoadSectionsMap.get(key2) || [];

		const roadSections = [...roadSections1, ...roadSections2];

		return roadSections;
	}

	// get all destinationElements for a startElement
	function getRoadDestinationsForStartElement(startElementId) {
		if (roadRelationsStartElementsDestinationMap.has(startElementId)) {
			return roadRelationsStartElementsDestinationMap.get(startElementId);
		} else {
			return [];
		}
	}

	// get all startElements for a destinationElement
	function getRoadStartElementsForDestination(destinationElementId) {
		const startElements = [];
		for (const [startElement, destinationElements] of roadRelationsStartElementsDestinationMap.entries()) {
			if (destinationElements.includes(destinationElementId)) {
				startElements.push(startElement);
			}
		}
		return startElements;
	}

	// removes duplicates by identity, does not guarantee order
	function removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	return {
		// roads
		createRoadRelationsFromRoadsData: createRoadRelationsFromRoadsData,
		getRoadSectionsForStartElement: getRoadSectionsForStartElement,
		getRoadDestinationsForStartElement: getRoadDestinationsForStartElement,
		getRoadStartElementsForDestination: getRoadStartElementsForDestination,
		getRoadSectionsForUniqiueRelation: getRoadSectionsForUniqiueRelation
	};

})();