controllers.roadModel = (function () {
	let roadObjects = [];
	let startElementsDestinationMap = new Map();
	let startElementsRoadSectionsMap = new Map();
	let relationshipRoadSectionsMap = new Map();

	function createRoadObjectsFromData(roadsDataArray) {
		roadsDataArray.forEach(createRoadObjectFromEntry);
	}

	function createRoadObjectFromEntry(entry) {
		const roadRelation = createRoadRelation(
			entry.id,
			entry.start_element,
			entry.destination_element,
			entry.road_sections
		);

		roadObjects.push(roadRelation);

		updateMap(startElementsDestinationMap, roadRelation.startElementId, roadRelation.destinationElementId);
		updateMap(startElementsRoadSectionsMap, roadRelation.startElementId, ...roadRelation.roadSectionsIds);

		const key = generateKey(roadRelation.startElementId, roadRelation.destinationElementId);
		updateMap(relationshipRoadSectionsMap, key, ...roadRelation.roadSectionsIds);
	}

	function createRoadRelation(roadRelationId, startElementId, destinationElementId, roadSectionsIds) {
		return {
			roadRelationId,
			startElementId,
			destinationElementId,
			roadSectionsIds,
		};
	}

	function updateMap(map, key, ...values) {
		if (map.has(key)) {
			map.get(key).push(...values);
		} else {
			map.set(key, [...values]);
		}
	}

	function generateKey(entityId1, entityId2) {
		return entityId1 < entityId2 ? `${entityId1}@${entityId2}` : `${entityId2}@${entityId1}`;
	}

	function getRoadSectionsForElement(elementId, map) {
		return map.has(elementId) ? map.get(elementId) : [];
	}

	function getRoadObjectsForStartElement(startElementId) {
		return roadObjects.filter(roadRelation => roadRelation.startElementId === startElementId);
	}

	function getRoadObjectsForDestination(destinationElementId) {
		return roadObjects.filter(roadRelation => roadRelation.destinationElementId === destinationElementId);
	}

	function getRoadSectionsOfUniqueRelationship(entityId1, entityId2) {
		const key1 = generateKey(entityId1, entityId2);
		const key2 = generateKey(entityId2, entityId1);

		const roadSections1 = relationshipRoadSectionsMap.get(key1) || [];
		const roadSections2 = relationshipRoadSectionsMap.get(key2) || [];

		return [...roadSections1, ...roadSections2];
	}

	// get ramps = first and last roadSections (facing to startElements or destinationElements)
	function getRampRoadSectionsForStartElement(startElementId) {
		const matchingRoadObjects = roadObjects.filter((roadRelation) => roadRelation.startElementId === startElementId);

		if (matchingRoadObjects.length === 0) {
			return null;
		}

		const firstRoadSections = [];
		const lastRoadSections = [];

		matchingRoadObjects.forEach((roadRelation) => {
			const roadSections = roadRelation.roadSectionsIds;

			if (roadSections.length > 0) {
				firstRoadSections.push(roadSections[0]);
				lastRoadSections.push(roadSections[roadSections.length - 1]);
			}
		});

		return {
			firstRoadSections,
			lastRoadSections,
		};
	}

	function getRoadDestinationsForStartElement(startElementId) {
		return getRoadSectionsForElement(startElementId, startElementsDestinationMap);
	}

	function getRoadStartElementsForDestination(destinationElementId) {
		const startElements = [...startElementsDestinationMap.keys()]
			.filter(startElement => startElementsDestinationMap.get(startElement).includes(destinationElementId));
		return startElements;
	}

	function getAllRoadSections() {
		// Create an array to store all road sections
		let allRoadSections = [];
	
		// Iterate through roadObjects and collect road sections
		roadObjects.forEach(roadRelation => {
			allRoadSections.push(...roadRelation.roadSectionsIds);
		});
	
		return allRoadSections;
	}

	return {
		createRoadObjectsFromData,
		getRoadDestinationsForStartElement,
		getRoadStartElementsForDestination,
		getRoadSectionsOfUniqueRelationship,
		getRoadObjectsForStartElement,
		getRoadObjectsForDestination,
		getRampRoadSectionsForStartElement,
		getAllRoadSections
	};
})();