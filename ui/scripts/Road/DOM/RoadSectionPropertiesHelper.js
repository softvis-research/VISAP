const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionPropertiesMap = new Map();

        /************************
            Public Functions
        ************************/

        function getPropertiesMapForRelatedStartElementRoads(startElementComponent, relatedRoadObjsMap) {
            resetState();

            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;

            setRoadSectionPropertiesMap();
            console.log(globalRoadSectionPropertiesMap)

            return globalRoadSectionPropertiesMap;
        }

        function createRoadSectionPropertiesObj(p = {}) {
            const roadSectionPropertiesObj = {
                elementOrigin: p.elementOrigin || null,
                isInitialElement: p.isStartRamp || false,
                isFinalElement: p.isEndRamp || false,
                direction: p.direction || null,
                isStartingInCurve: p.isStartingInCurve || false,
                isEndingInCurve: p.isEndingInCurve || false,
                position: p.position || null,
                width: p.width || 0,
                depth: p.depth || 0,
                height: p.height || 0,
            };
            return roadSectionPropertiesObj;
        }

        function setRoadSectionPropertiesMap() {
            addAllRelevantRoadSectionsToMap();
            setPropertiesForInitialRoadSectionsWithStartElementAsOrigin();
            setDirectionsForCommonRoadSectionsWithStartElementAsOrigin();
            setPropertiesForInitialRoadSectionsWithOriginWhichIsNotStartElement()
            setDirectionsForCommonRoadSectionsWithOriginWhichIsNotStartElement();
            setPositionForAllRoadSection();
            setWidthDepthHeightForAllRoadSection();
        }

        function setPositionForAllRoadSection() {
            globalRoadSectionPropertiesMap.forEach((_, roadSectionId) => {
                const roadSectionComponent = document.getElementById(roadSectionId);
                const position = roadSectionComponent.getAttribute("position");
                addToMapIfKeyOrValueNotExists(roadSectionId, {
                    position,
                }, globalRoadSectionPropertiesMap)
            })
        }

        function setWidthDepthHeightForAllRoadSection() {
            globalRoadSectionPropertiesMap.forEach((_, roadSectionId) => {
                const roadSectionComponent = document.getElementById(roadSectionId);
                const width = roadSectionComponent.getAttribute("width");
                const depth = roadSectionComponent.getAttribute("depth");
                const height = roadSectionComponent.getAttribute("height");
                addToMapIfKeyOrValueNotExists(roadSectionId, {
                    width, depth, height
                }, globalRoadSectionPropertiesMap)
            })
        }

        function addAllRelevantRoadSectionsToMap() {
            const roadObjsWithStartElementAsOrigin = getRoadObjsWithStartElementAsOrigin();
            const roadObjsWithOriginWhichIsNotStartElement = getRoadObjsWithOriginWhichIsNotStartElement();

            roadObjsWithStartElementAsOrigin.forEach(roadObj => {
                roadObj.roadSectionArr.forEach(roadSectionId => {
                    const defaultPropertiesObj = createRoadSectionPropertiesObj();
                    addToMapIfKeyOrValueNotExists(roadSectionId, defaultPropertiesObj, globalRoadSectionPropertiesMap);
                })
            })

            roadObjsWithOriginWhichIsNotStartElement.forEach(roadObj => {
                roadObj.roadSectionArr.forEach(roadSectionId => {
                    const defaultPropertiesObj = createRoadSectionPropertiesObj();
                    addToMapIfKeyOrValueNotExists(roadSectionId, defaultPropertiesObj, globalRoadSectionPropertiesMap);
                })
            })
        }

        function setPropertiesForInitialRoadSectionsWithStartElementAsOrigin() {
            const roadObjsWithStartElementAsOrigin = getRoadObjsWithStartElementAsOrigin();
            roadObjsWithStartElementAsOrigin.forEach(roadObj => {
                const initialRoadSectionId = roadObj.roadSectionArr[0];
                const direction = getDirectionForInitialRoadSection(initialRoadSectionId);
                addToMapIfKeyOrValueNotExists(initialRoadSectionId, {
                    elementOrigin: roadObj.startElementId,
                    isInitialElement: true,
                    direction,
                }, globalRoadSectionPropertiesMap)
            })
        }

        function setPropertiesForInitialRoadSectionsWithOriginWhichIsNotStartElement() {
            const roadObjsWithOriginWhichIsNotStartElement = getRoadObjsWithOriginWhichIsNotStartElement();

            roadObjsWithOriginWhichIsNotStartElement.forEach(roadObj => {
                // last roadSection serves as initialElement – as in isCalled-relations, roads get flipped to keep startElement as POV
                const lastIdx = roadObj.roadSectionArr.length - 1;
                const initialRoadSectionId = roadObj.roadSectionArr[lastIdx];
                const direction = getDirectionForInitialRoadSection(initialRoadSectionId);
                addToMapIfKeyOrValueNotExists(initialRoadSectionId, {
                    elementOrigin: roadObj.startElementId,
                    isInitialElement: true,
                    direction,
                }, globalRoadSectionPropertiesMap)
            })
        }

        /************************
            Calls RoadSections
        ************************/

        function setDirectionsForCommonRoadSectionsWithStartElementAsOrigin() {
            const roadObjsWithStartElementAsOrigin = getRoadObjsWithStartElementAsOrigin();
            roadObjsWithStartElementAsOrigin.forEach(roadObj => {
                const directions = getDirectionsForOrderedRoadSections(roadObj.roadSectionArr);
                for (let i = 1; i < roadObj.roadSectionArr.length; i++) {
                    addToMapIfKeyOrValueNotExists(roadObj.roadSectionArr[i], {
                        elementOrigin: roadObj.startElementId,
                        direction: directions[i - 1]
                    }, globalRoadSectionPropertiesMap)
                }
            })
        }

        function setDirectionsForCommonRoadSectionsWithOriginWhichIsNotStartElement() {
            const roadObjsWithOriginWhichIsNotStartElement = getRoadObjsWithOriginWhichIsNotStartElement();
            roadObjsWithOriginWhichIsNotStartElement.forEach(roadObj => {
                // reversing road – as in isCalled-relations, roads get flipped to keep startElement as POV
                const reverseOrderedArr = [...roadObj.roadSectionArr].reverse();
                const directions = getDirectionsForOrderedRoadSections(reverseOrderedArr);
                for (let i = 1; i < roadObj.roadSectionArr.length; i++) {
                    addToMapIfKeyOrValueNotExists(roadObj.roadSectionArr[i], {
                        elementOrigin: roadObj.startElementId,
                        direction: directions[i - 1]
                    }, globalRoadSectionPropertiesMap)
                }
            })
        }

        function getRoadObjsWithStartElementAsOrigin() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id); // startElement calls other elements
        }

        /************************
          isCalled RoadSections
        ************************/

        function getRoadObjsWithOriginWhichIsNotStartElement() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        /************************
          Directions Operations
        ************************/

        function getDirectionForInitialRoadSection(initialRoadSectionId) {
            const midPointOfInitialRoadSection = document.getElementById(initialRoadSectionId).getAttribute("position");
            const startElementMidPoint = globalStartElementComponent.getAttribute("position");

            // keeps undefined if n roadSections share the same midPoint (overlaps), which indicates an inconsistent import
            const directionMap = {
                east: midPointOfInitialRoadSection.x < startElementMidPoint.x,
                west: midPointOfInitialRoadSection.x > startElementMidPoint.x,
                north: midPointOfInitialRoadSection.z > startElementMidPoint.z,
                south: midPointOfInitialRoadSection.z < startElementMidPoint.z,
            };
            const direction = Object.keys(directionMap).find(key => directionMap[key]);
            return direction;
        }

        function getDirectionsForOrderedRoadSections(roadSectionOrderedArr) {
            let directionsArr = [];
            for (let i = 1; i < roadSectionOrderedArr.length; i++) {
                const midPoint = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const refMidPoint = document.getElementById(roadSectionOrderedArr[i - 1]).getAttribute("position");
                const refProperties = globalRoadSectionPropertiesMap.get(roadSectionOrderedArr[i - 1]);
                const refDirection = refProperties.direction
                const direction = getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection);
                directionsArr.push(direction);
            }
            return directionsArr;
        }

        function getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection) {
            const { x, z } = midPoint;

            // imagine a compass turning its needle based on your direction: here, assigned directions depend on reference directions
            switch (refDirection) {
                case "west":
                    if (x > refMidPoint.x && z === refMidPoint.z) return "west";
                    if (x > refMidPoint.x && z > refMidPoint.z) return "north";
                    if (x > refMidPoint.x && z < refMidPoint.z) return "south";
                    break;

                case "east":
                    if (x < refMidPoint.x && z === refMidPoint.z) return "east";
                    if (x < refMidPoint.x && z > refMidPoint.z) return "north";
                    if (x < refMidPoint.x && z < refMidPoint.z) return "south";
                    break;

                case "south":
                    if (x === refMidPoint.x && z < refMidPoint.z) return "south";
                    if (x > refMidPoint.x && z < refMidPoint.z) return "west";
                    if (x < refMidPoint.x && z < refMidPoint.z) return "east";
                    break;

                case "north":
                    if (x === refMidPoint.x && z > refMidPoint.z) return "north";
                    if (x > refMidPoint.x && z > refMidPoint.z) return "west";
                    if (x < refMidPoint.x && z > refMidPoint.z) return "east";
                    break;
            }
        }

        /************************
              Other Helper
        ************************/

        function resetState() {
            globalRoadSectionPropertiesMap.clear();
        }

        function addToMapIfKeyOrValueNotExists(key, value, map) {
            const existingValue = map.get(key);

            if (!existingValue) {
                map.set(key, value);
            } else if (typeof existingValue === 'object' && typeof value === 'object') {
                Object.entries(value).forEach(([objKey, objValue]) => {
                    if (!existingValue.hasOwnProperty(objKey) || !existingValue[objKey]) {
                        existingValue[objKey] = objValue;
                    }
                });
            }
        }

        return {
            getPropertiesMapForRelatedStartElementRoads,
        };
    })();
};