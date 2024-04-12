controllers.roadModel = (function () {
	let globalRoadObjMap = new Map();

	function createRoadObjsFromData(roadsDTO) {
		roadsDTO.forEach(roadDTO => {
			const roadObjProperty = {
				startElementId: roadDTO.start_element,
				destinationElementId: roadDTO.destination_element,
				roadSectionArr: roadDTO.road_sections,
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
		).values()).flatMap(roadObj => roadObj.roadSectionArr);
	}

	function getRoadSectionIdsForDestinationElementId(destinationElementId) {
		return Array.from(getRoadObjsByPredicate(roadObj =>
			roadObj.destinationElementId === destinationElementId
		).values()).flatMap(roadObj => roadObj.roadSectionArr);
	}

	function getRoadSectionIdsForUniqueElementIdRelation(elementIdA, elementIdB) {
		const roadSectionsMatchingAtoB = getRoadObjsByPredicate(roadObj =>
			roadObj.startElementId === elementIdA && roadObj.destinationElementId === elementIdB
		).values();

		const roadSectionsMatchingBtoA = getRoadObjsByPredicate(roadObj =>
			roadObj.startElementId === elementIdB && roadObj.destinationElementId === elementIdA
		).values();

		return [].concat(...roadSectionsMatchingAtoB, ...roadSectionsMatchingBtoA).flatMap(roadObj => roadObj.roadSectionArr);
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
