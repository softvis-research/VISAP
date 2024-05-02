controllers.roadModel = (function () {
	let globalRoadObjMap = new Map();

	function createRoadObjsFromData(roadsDTO) {
		roadsDTO.forEach(roadDTO => {
			const roadSectionObjArr = roadDTO.road_sections.map(roadSectionId => ({ id: roadSectionId }));
			const roadObjProperty = {
				startDistrictId: roadDTO.start_element,
				destDistrictId: roadDTO.destination_element,
				roadSectionObjArr: roadSectionObjArr,
			};
			globalRoadObjMap.set(roadDTO.id, roadObjProperty);
		});
	}

	/************************
			Getter
	************************/
	
	function getRoadObjsForStartDistrictId(startDistrictId) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (roadObj.startDistrictId === startDistrictId) {
				result.set(roadId, roadObj);
			}
		});
		return result;
	}
	
	function getRoadObjsForDestDistrictId(destDistrictId) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (roadObj.destDistrictId === destDistrictId) {
				result.set(roadId, roadObj);
			}
		});
		return result;
	}

	return {
		createRoadObjsFromData,
		getRoadObjsForStartDistrictId,
		getRoadObjsForDestDistrictId,
	};
})();