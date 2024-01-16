controllers.roadModel = (function () {
	let globalRoadObjMap = new Map();

	function createRoadObjsFromData(roadsDTO) {
		roadsDTO.forEach(roadDTO => {
			const roadObj = mapRoadObjs(
				roadDTO.start_element,
				roadDTO.destination_element,
				roadDTO.road_sections
			);
			globalRoadObjMap.set(roadDTO.id, roadObj);
		})
	}

	function mapRoadObjs(startElementId, destinationElementId, roadSectionsArr) {
		return {
			startElementId,
			destinationElementId,
			roadSectionsArr,
		};
	}

	function getRoadObjsForStartElementId(startElementId) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (roadObj.startElementId === startElementId) {
				result.set(roadId, roadObj);
			}
		});
		return result;
	}

	function getRoadObjsForDestinationElementId(destinationElementId) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (roadObj.destinationElementId === destinationElementId) {
				result.set(roadId, roadObj);
			}
		});
		return result;
	}

	return {
		createRoadObjsFromData,
		getRoadObjsForStartElementId,
		getRoadObjsForDestinationElementId,
	};
})();