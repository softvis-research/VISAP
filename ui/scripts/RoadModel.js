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
				// filter-remove props values from road section arr to dodge chaching issues
				const filteredRoadObj = {
					...roadObj,
					roadSectionObjArr: roadObj.roadSectionObjArr.filter(roadSection => roadSection.id)
				};
				result.set(roadId, filteredRoadObj);
			}
		});
		return result;
	}
	
	function getRoadObjsForDestDistrictId(destDistrictId) {
		const result = new Map();
		globalRoadObjMap.forEach((roadObj, roadId) => {
			if (roadObj.destDistrictId === destDistrictId) {
				const filteredRoadObj = {
					...roadObj,
					roadSectionObjArr: roadObj.roadSectionObjArr.filter(roadSection => roadSection.id)
				};
				result.set(roadId, filteredRoadObj);
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