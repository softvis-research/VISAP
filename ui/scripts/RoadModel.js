controllers.roadModel = (function () {
	let roadIdStartDestinationElementRelationObjMap = new Map();
	let roadIdRoadSectionObjMap = new Map();

	function createRoadObjsFromData(roadsDataArr) {
		roadsDataArr.forEach(createRoadStartDestinationRelationObjArr);
		roadsDataArr.forEach(createRoadSectionObjArr);
	}

	function createRoadStartDestinationRelationObjArr(roadsDataArr) {
		const roadStartDestinationRelationObj = mapRoadStartDestinationRelationObj(
			roadsDataArr.start_element,
			roadsDataArr.destination_element,
		);
		updateMap(roadIdStartDestinationElementRelationObjMap, roadsDataArr.id, roadStartDestinationRelationObj)
	}

	function createRoadSectionObjArr(roadsDataArr) {
		// assume ordered roadSections to assign its place in road
		for (let placeInOrder = 0; placeInOrder < roadsDataArr.road_sections.length - 1; placeInOrder++) {
			const roadSectionObj = mapRoadSectionObj(
				roadsDataArr.road_sections[placeInOrder],
				placeInOrder,
				placeInOrder = 0 ? true : false, // is startRamp
				placeInOrder = roadsDataArr.road_sections.length - 1 ? true : false, // is endRamp
			);
			updateMap(roadIdRoadSectionObjMap, roadsDataArr.id, roadSectionObj);
		}
	}

	// obj mappers

	function mapRoadStartDestinationRelationObj(startElementId, destinationElementId) {
		return {
			startElementId,
			destinationElementId,
		};
	}

	function mapRoadSectionObj(roadSectionId, placeInOrder, isStartRamp, isEndRamp) {
		return {
			roadSectionId,
			placeInOrder,
			isStartRamp,
			isEndRamp,
			relationTypes: [],
			state: null,
		};
	}

	// getters

	function getRoadSectionObjsForRoadId(roadId) {
		return roadIdRoadSectionObjMap.get(roadId) || [];
	}

	function getAllRoadSectionObjsForRoadIds(roadIds) {
		return roadIds.map(roadId => roadIdRoadSectionObjMap.get(roadId) || []).flat();
	}

	function getRoadSectionObjsForRoadId(roadId) {
		return roadIdRoadSectionObjMap.get(roadId) || [];
	}
	
	function getRoadIdsForStartElementId(startElementId) {
		return getMatchingRoadIds(relationObj => relationObj.startElementId === startElementId);
	}
	
	function getRoadIdsForDestinationElementId(destinationElementId) {
		return getMatchingRoadIds(relationObj => relationObj.destinationElementId === destinationElementId);
	}
	
	function getRoadIdsForStartDestinationElementRelation(elementId1, elementId2) {
		return getMatchingRoadIds(relationObj =>
			(relationObj.startElementId === elementId1 && relationObj.destinationElementId === elementId2) ||
			(relationObj.startElementId === elementId2 && relationObj.destinationElementId === elementId1)
		);
	}

	// helper

	// set up getters for map operations
	function getMatchingRoadIds(predicate) {
		const matchingRoadIds = [];
	
		roadIdStartDestinationElementRelationObjMap.forEach((relationObj, roadId) => {
			if (relationObj && predicate(relationObj)) {
				matchingRoadIds.push(roadId);
			}
		});
	
		return matchingRoadIds;
	}
	
	// handle map updates set-adding objects or arrays to key
	function updateMap(map, key, ...values) {
		if (map.has(key)) {
			map.get(key).push(...values);
		} else {
			map.set(key, values.length === 1 ? [values[0]] : [...values]);
		}
	}

	return {
		createRoadObjsFromData,
		getRoadSectionObjsForRoadId,
		getAllRoadSectionObjsForRoadIds,
		getRoadIdsForStartElementId,
		getRoadIdsForDestinationElementId,
		getRoadIdsForStartDestinationElementRelation,
	};	
})();