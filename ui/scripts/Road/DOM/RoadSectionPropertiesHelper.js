const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionPropertiesMap = new Map();

        /************************
            Public Functions
        ************************/

        function getPropertiesMapForRelatedStartElementRoads(startElementComponent, relatedRoadObjsMap) {
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
            };
            return roadSectionPropertiesObj;
        }

        function setRoadSectionPropertiesMap() {
            resetCurrentMap();
            addAllRelevantRoadSectionsToMap();
            setPropertiesForInitialRoadSectionsWithStartElementAsOrigin();
            setDirectionsForCommonRoadSectionsWithStartElementAsOrigin();
            setPropertiesForInitialRoadSectionsWithOriginWhichIsNotStartElement()
            setDirectionsForCommonRoadSectionsWithOriginWhichIsNotStartElement();
            setIsFinalElementForAllRoadSection();
            setIsEndingInCurveForAllRoadSection();
            setIsStartingInCurveForAllRoadSection();
        }

        function setIsEndingInCurveForAllRoadSection() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let roadSectionArr = roadObj.startElementId != globalStartElementComponent.id
                    ? [...roadObj.roadSectionArr].reverse()
                    : roadObj.roadSectionArr;
                
                    for(let i = 0; i < roadSectionArr.length -1; i ++) {
                        const directionOfCurrent = globalRoadSectionPropertiesMap.get(roadSectionArr[i]);
                        const directionOfSuccessor = globalRoadSectionPropertiesMap.get(roadSectionArr[i + 1]);
                        const isEndingInCurve = directionOfCurrent != directionOfSuccessor;
                        addToMapIfKeyOrValueNotExists(roadSectionArr[i], {
                            isEndingInCurve,
                        }, globalRoadSectionPropertiesMap)
                    }

                    // last roadSection can't end in a curve so it is always false
                    addToMapIfKeyOrValueNotExists(roadSectionArr[roadSectionArr.length - 1], {
                        isEndingInCurve: false,
                    }, globalRoadSectionPropertiesMap)
            });
        }

        function setIsStartingInCurveForAllRoadSection() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let roadSectionArr = roadObj.startElementId != globalStartElementComponent.id
                    ? [...roadObj.roadSectionArr].reverse()
                    : roadObj.roadSectionArr;
                
                    for(let i = 1; i < roadSectionArr.length; i ++) {
                        const directionOfCurrent = globalRoadSectionPropertiesMap.get(roadSectionArr[i]);
                        const directionOfPredecessor = globalRoadSectionPropertiesMap.get(roadSectionArr[i - 1]);
                        const isStartingInCurve = directionOfCurrent != directionOfPredecessor;
                        addToMapIfKeyOrValueNotExists(roadSectionArr[i], {
                            isStartingInCurve,
                        }, globalRoadSectionPropertiesMap)
                    }

                    // first roadSection can't start in a curve so it is always false
                    addToMapIfKeyOrValueNotExists(roadSectionArr[0], {
                        isStartingInCurve: false,
                    }, globalRoadSectionPropertiesMap)
            });
        }

        function setIsFinalElementForAllRoadSection() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                let lastIdx;
                // as startElement is always POV, in isCalled-relations, the first element of this road is the final 
                roadObj.startElementId === globalStartElementComponent.id ?
                    lastIdx = roadObj.roadSectionArr.length - 1
                    : lastIdx = 0
                const finalRoadSectionId = roadObj.roadSectionArr[lastIdx];
                addToMapIfKeyOrValueNotExists(finalRoadSectionId, {
                    isFinalElement: true,
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
                        direction: directions[i]
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
                    addToMapIfKeyOrValueNotExists(reverseOrderedArr[i], {
                        elementOrigin: roadObj.startElementId,
                        direction: directions[i]
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
            directionsArr.push(globalRoadSectionPropertiesMap.get(roadSectionOrderedArr[0]).direction)
            for (let i = 1; i < roadSectionOrderedArr.length; i++) {
                const midPoint = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const refMidPoint = document.getElementById(roadSectionOrderedArr[i - 1]).getAttribute("position");
                const refDirection = directionsArr[i - 1];
                const direction = getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection);
                console.log(direction)
                directionsArr.push(direction);
            }
            return directionsArr;
        }

        function getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection) {
            // imagine a compass turning its needle based on your direction: here, assigned directions depend on reference directions
            switch (refDirection) {
                case "west":
                    if (midPoint.x > refMidPoint.x && midPoint.z === refMidPoint.z) return "west";
                    if (midPoint.x > refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x > refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    break;

                case "east":
                    if (midPoint.x < refMidPoint.x && midPoint.z === refMidPoint.z) return "east";
                    if (midPoint.x < refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x < refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    break;

                case "south":
                    if (midPoint.x === refMidPoint.x && midPoint.z < refMidPoint.z) return "south";
                    if (midPoint.x > refMidPoint.x && midPoint.z < refMidPoint.z) return "west";
                    if (midPoint.x < refMidPoint.x && midPoint.z < refMidPoint.z) return "east";
                    break;

                case "north":
                    if (midPoint.x === refMidPoint.x && midPoint.z > refMidPoint.z) return "north";
                    if (midPoint.x > refMidPoint.x && midPoint.z > refMidPoint.z) return "west";
                    if (midPoint.x < refMidPoint.x && midPoint.z > refMidPoint.z) return "east";
                    break;
            }
        }

        /************************
              Other Helper
        ************************/

        function resetCurrentMap() {
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