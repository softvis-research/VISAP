const createRoadSectionDirectionHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionDirectionMap = new Map();

        /************************
            Public Functions
        ************************/

        function getDirectionsMapForRelatedStartElementRoads(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap

            setDirectionsForRoadSectionsCalls();
            setDirectionsForRoadSectionsIsCalled();

            return globalRoadSectionDirectionMap;
        }

        /************************
            Calls RoadSections
        ************************/

        function setDirectionsForRoadSectionsCalls() {
            const roadObjsForStartElement = getRoadObjsForStartElement();
            roadObjsForStartElement.forEach(roadObj => {
                // setting first roadSection per outgoing road as reference direction
                const startRampRoadSectionId = roadObj.roadSectionArr[0];
                setDirectionForStartRampBasedOnStartElement(startRampRoadSectionId);
                setDirectionByRoadSectionsAdjacency(roadObj);
            })
        }

        function getRoadObjsForStartElement() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id); // startElement calls other elements
        }

        /************************
          isCalled RoadSections
        ************************/

        function setDirectionsForRoadSectionsIsCalled() {
            const roadObjsWhereStartElementIsDestination = getRoadObjsWhereStartElementIsDestination();
            roadObjsWhereStartElementIsDestination.forEach(roadObj => {
                // reversing roadSection order here as startElement and its ramps serve as reference
                setDirectionByRoadSectionsAdjacency(roadObj, reverse = true);
            })
        }

        function getRoadObjsWhereStartElementIsDestination() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        /************************
          Directions Operations
        ************************/

        function setDirectionForStartRampBasedOnStartElement(startRampRoadSectionId) {
            const startRampMidPos = document.getElementById(startRampRoadSectionId).getAttribute("position");
            const startElementMidPos = globalStartElementComponent.getAttribute("position");

            const pointDirectionsBools = determineRelativeElementDirection(startRampMidPos, startElementMidPos);
            const trueDirection = Object.keys(pointDirectionsBools)
                .filter(key => pointDirectionsBools[key] && ["east", "west", "north", "south"]
                    .includes(key))[0]; // not considering lining

            addToMapIfKeyNotExists(startRampRoadSectionId, trueDirection, globalRoadSectionDirectionMap)
        }

        function setDirectionByRoadSectionsAdjacency(roadObj, sectionReverse = false) {
            console.log("HERE>")
            let roadSectionOrderedArr = roadObj.roadSectionArr;
            if (sectionReverse) roadSectionOrderedArr = roadSectionOrderedArr.reverse();

            for (let i = 1; i < roadSectionOrderedArr.lenth; i++) {
                const refPointDirection = globalRoadSectionDirectionMap(roadSectionOrderedArr[i-1]);
                const refPointMidPos = document.getElementById(roadSectionOrderedArr[i-1]).getAttribute("position");
                const roadSectionMidPos = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const roadSectionDirection = determineRelativeElementDirection(roadSectionMidPos, refPointMidPos, refPointDirection);
                addToMapIfKeyNotExists(roadSectionOrderedArr[i], roadSectionDirection, globalRoadSectionDirectionMap)
            }
        }

        function determineRelativeElementDirection(point, refPoint, refDirection = false) {
            const { x, z } = point;

            const directionMap = {
                east: x < refPoint.x,
                west: x > refPoint.x,
                north: z > refPoint.z,
                south: z < refPoint.z,
                onVerticalLine: x === refPoint.x,
                onHorizontalLine: z === refPoint.z,
            };

            // adjust direction mapping based on the reference direction
            if (refDirection) {

                if (refDirection === "north") {
                    directionMap.east = x > refPoint.x; // flip east-west
                    directionMap.west = x < refPoint.x;
                    directionMap.north = false;
                } else if (refDirection === "south") {
                    directionMap.east = x < refPoint.x;
                    directionMap.west = x > refPoint.x;
                    directionMap.south = false;
                } else if (refDirection === "east") {
                    directionMap.north = z < refPoint.z; // flip north-south
                    directionMap.south = z > refPoint.z;
                    directionMap.east = false;
                } else if (refDirection === "west") {
                    directionMap.north = z > refPoint.z;
                    directionMap.south = z < refPoint.z;
                    directionMap.west = false;
                }
            }

            return directionMap;
        }

        /************************
              Other Helper
        ************************/

        function addToMapIfKeyNotExists(key, value, map) {
            if (!map.has(key)) {
                map.set(key, value);
            }
        }


        return {
            getDirectionsMapForRelatedStartElementRoads,
        };
    })();
};