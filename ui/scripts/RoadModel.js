controllers.roadModel = (function () {
	let globalRoadObjMap = new Map();

	function createRoadObjsFromData(roadsDTO) {
		roadsDTO.forEach(roadDTO => {
			const roadSectionObjArr = roadDTO.road_sections.map(roadSectionId => ({ id: roadSectionId }));
			const roadObjProperty = {
				startElementId: roadDTO.start_element,
				destinationElementId: roadDTO.destination_element,
				roadSectionObjArr: roadSectionObjArr,
			};
			globalRoadObjMap.set(roadDTO.id, roadObjProperty);
		});
	}

	/************************
			Getter
	************************/

	function getRoadObjsForStartElementId(startElementId) {
		return getRoadObjsByPredicate(roadObj => roadObj.startElementId === startElementId);
	}

	function getRoadObjsForDestinationElementId(destinationElementId) {
		return getRoadObjsByPredicate(roadObj => roadObj.destinationElementId === destinationElementId);
	}

	function getRoadSectionIdsForStartElementId(startElementId) {
		return Array.from(getRoadObjsByPredicate(roadObj =>
			roadObj.startElementId === startElementId
		).values()).flatMap(roadObj => roadObj.roadSectionObjArr);
	}

	function getRoadSectionIdsForDestinationElementId(destinationElementId) {
		return Array.from(getRoadObjsByPredicate(roadObj =>
			roadObj.destinationElementId === destinationElementId
		).values()).flatMap(roadObj => roadObj.roadSectionObjArr);
	}

	function getRoadSectionIdsForUniqueElementIdRelation(elementIdA, elementIdB) {
		const roadSectionsMatchingAtoB = getRoadObjsByPredicate(roadObj =>
			roadObj.startElementId === elementIdA && roadObj.destinationElementId === elementIdB
		).values();

		const roadSectionsMatchingBtoA = getRoadObjsByPredicate(roadObj =>
			roadObj.startElementId === elementIdB && roadObj.destinationElementId === elementIdA
		).values();

		return [].concat(...roadSectionsMatchingAtoB, ...roadSectionsMatchingBtoA).flatMap(roadObj => roadObj.roadSectionObjArr);
	}

	/************************
			Helper
	************************/

	function getRoadObjsByPredicate(predicate) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (predicate(roadObj)) {
				result.set(roadId, roadObj);
			}
		});
		return result;
	}

	return {
		createRoadObjsFromData,
		getRoadObjsForStartElementId,
		getRoadObjsForDestinationElementId,
		getRoadSectionIdsForStartElementId,
		getRoadSectionIdsForDestinationElementId,
		getRoadSectionIdsForUniqueElementIdRelation
	};
})();