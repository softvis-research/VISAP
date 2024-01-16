controllers.roadModel = (function () {
	let roadObjArr = []

	function createRoadObjsFromData(roadsDTO) {
		roadsDTO.forEach(roadDTO => {
			const roadObj = mapRoadObjs(
				roadDTO.start_element,
				roadDTO.destination_element,
				roadDTO.road_sections
			);
			roadObjArr.push(roadObj);
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
		return roadObjArr.filter(roadObj => roadObj.startElementId === startElementId);
	}
	
	function getRoadObjsForDestinationElementId(destinationElementId) {
		return roadObjArr.filter(roadObj => roadObj.destinationElementId === destinationElementId);
	}

	return {
		createRoadObjsFromData,
		getRoadObjsForStartElementId,
		getRoadObjsForDestinationElementId,
	};
})();