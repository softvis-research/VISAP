controllers.roadModel = (function () {
	let roadsArr = [];
	let startOnDestinationsIdMap = new Map();
	let startOnRoadSectionsIdMap = new Map();
	let roadSectionIdsOnStartDestinationKeyMap = new Map();

	function createRoadsFromData(roadsDataArray) {
		roadsDataArray.forEach(createRoad);
	}

	function createRoad(dataEntry) {
		const road = mapRoadObj(
			dataEntry.id,
			dataEntry.start_element,
			dataEntry.destination_element,
			dataEntry.road_sections
		);

		roadsArr.push(road);

		updateMap(startOnDestinationsIdMap, road.startElementId, road.destinationElementId);
		updateMap(startOnRoadSectionsIdMap, road.startElementId, ...road.roadSectionsIds);

		const key = generateKey(road.startElementId, road.destinationElementId);
		updateMap(roadSectionIdsOnStartDestinationKeyMap, key, ...road.roadSectionsIds);
	}

	function mapRoadObj(roadId, startElementId, destinationElementId, roadSectionsIds) {
		return {
			roadId,
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

	function getRoadsForStartElement(startElement) {
		return roadsArr.filter(road => road.startElementId === startElement.id);
	}

	function getRoadsForDestination(destinationElementId) {
		return roadsArr.filter(road => road.destinationElementId === destinationElementId);
	}

	function getRoadSectionIdsOfUniqueRelationship(entityId1, entityId2) {
		const key1 = generateKey(entityId1, entityId2);
		const key2 = generateKey(entityId2, entityId1);

		const roadSections1 = roadSectionIdsOnStartDestinationKeyMap.get(key1) || [];
		const roadSections2 = roadSectionIdsOnStartDestinationKeyMap.get(key2) || [];

		return [...roadSections1, ...roadSections2];
	}

	// "Ramps" are first and last roadSections on a road (facing to startElements or destinationElements)
	function getRampRoadSectionsForStartElement(startElement) {
		const matchingRoads = roadsArr.filter((road) => road.startElement === startElement.id);

		if (matchingRoads.length === 0) {
			return null;
		}

		const firstRoadSections = [];
		const lastRoadSections = [];

		matchingRoads.forEach((road) => {
			const roadSections = road.roadSectionsIds;

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

	function getRoadSectionIdsOfDestinationForOfStartElement(startElement) {
		return startOnDestinationsIdMap.has(startElement.id) ? startOnDestinationsIdMap.get(startElement.id) : [];
	}

	function getRoadStartElementsForDestination(destinationElement) {
		const startElements = [...startOnDestinationsIdMap.keys()]
			.filter(startElement => startOnDestinationsIdMap.get(startElement).includes(destinationElement.id));
		return startElements;
	}

	function getAllRoadSectionIds() {
		let allRoadSections = [];

		roadsArr.forEach(road => {
			allRoadSections.push(...road.roadSectionsIds);
		});

		return allRoadSections;
	}

	return {
		createRoadsFromData,
		getRoadSectionIdsOfDestinationForOfStartElement,
		getRoadStartElementsForDestination,
		getRoadSectionIdsOfUniqueRelationship,
		getRoadsForStartElement,
		getRoadsForDestination,
		getRampRoadSectionsForStartElement,
		getAllRoadSectionIds
	};
})();