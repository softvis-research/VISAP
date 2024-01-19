const createRoadSectionDirectionHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionDirectionMap = new Map();

        /************************
            Public Functions
        ************************/

        function getDirectionsMapForRelatedStartElementRoads(startElementComponent, relatedRoadObjsMap) {
            // TODO: globalRoadSectionDirectionMap.clear()
            
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;

            console.log(globalStartElementComponent.id)

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
                const roadSectionOrderedArr = roadObj.roadSectionArr;
                setDirectionByRoadSectionsAdjacency(roadSectionOrderedArr);
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
                const startRampRoadSectionId = roadObj.roadSectionArr[0];
                setDirectionForStartRampBasedOnStartElement(startRampRoadSectionId);
                let roadSectionOrderedArr = roadObj.roadSectionArr;
                roadSectionOrderedArr = roadSectionOrderedArr.reverse(); // reverse to walk the road backwards, keeping startElement as reference
                setDirectionByRoadSectionsAdjacency(roadSectionOrderedArr);
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
            const direction = determineRelativeElementDirection(startRampMidPos, startElementMidPos);
            addToMapIfKeyNotExists(startRampRoadSectionId, direction)
        }

        function setDirectionByRoadSectionsAdjacency(roadSectionOrderedArr) {
            for (let i = 1; i < roadSectionOrderedArr.length; i++) {
                const refPointDirection = globalRoadSectionDirectionMap.get(roadSectionOrderedArr[i-1]);
                const refPointMidPos = document.getElementById(roadSectionOrderedArr[i - 1]).getAttribute("position");
                const roadSectionMidPos = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const roadSectionDirection = determineRelativeElementDirection(roadSectionMidPos, refPointMidPos, refPointDirection);
                addToMapIfKeyNotExists(roadSectionOrderedArr[i], roadSectionDirection)
            }
        }

        function determineRelativeElementDirection(point, refPoint, refDirection = false) {
            const { x, z } = point;

            const directionMap = {
                east: x < refPoint.x,
                west: x > refPoint.x,
                north: z > refPoint.z,
                south: z < refPoint.z,
            };

            // adjust direction mapping relative to reference direction
            if (refDirection) {
                const onVerticalLine = x === refPoint.x;
                const onHorizontalLine = z === refPoint.z;
                if (onVerticalLine || onHorizontalLine) return refDirection;

                switch (refDirection) {
                    // flip east-west
                    case "north":
                        directionMap.east = x > refPoint.x;
                        directionMap.west = x < refPoint.x;
                        directionMap.north = false;
                        break;
                    case "south":
                        directionMap.east = x < refPoint.x;
                        directionMap.west = x > refPoint.x;
                        directionMap.south = false;
                        break;
                    // flip north-south
                    case "east":
                        directionMap.north = z < refPoint.z;
                        directionMap.south = z > refPoint.z;
                        directionMap.east = false;
                        break;
                    case "west":
                        directionMap.north = z > refPoint.z;
                        directionMap.south = z < refPoint.z;
                        directionMap.west = false;
                        break;
                }
            }

            return Object.keys(directionMap).find(key => directionMap[key]);
        }

        /************************
              Other Helper
        ************************/

        function addToMapIfKeyNotExists(key, value) {
            if (!globalRoadSectionDirectionMap.has(key)) {
                globalRoadSectionDirectionMap.set(key, value);
            }
        }


        return {
            getDirectionsMapForRelatedStartElementRoads,
        };
    })();
};