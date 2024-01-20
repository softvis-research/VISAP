const createRoadSectionDirectionHelper = function (controllerConfig) {
    return (function () {

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap;
        let globalRoadSectionDirectionMap = new Map();

        /************************
            Public Functions
        ************************/

        function getDirectionsMapForRelatedStartElementRoads(startElementComponent, relatedRoadObjsMap) {
            globalRoadSectionDirectionMap.clear()
            
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
                setDirectionForInitialRoadSection(roadObj.roadSectionArr[0]);
                setDirectionsForOrderedRoadSections(roadObj.roadSectionArr);
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
                // reversing logic keeps startElement perspective for roads leading from elsewhere
                const lastIdx = roadObj.roadSectionArr.length-1;
                setDirectionForInitialRoadSection(roadObj.roadSectionArr[lastIdx]);
                setDirectionsForOrderedRoadSections(roadObj.roadSectionArr.reverse());
            })
        }

        function getRoadObjsWhereStartElementIsDestination() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        /************************
          Directions Operations
        ************************/

        function setDirectionForInitialRoadSection(roadSectionId) {
            const midPoint = document.getElementById(roadSectionId).getAttribute("position");
            const startElementMidPoint = globalStartElementComponent.getAttribute("position");
            const direction = getInitialRoadSectionDirectionRelativeToStartElement(midPoint, startElementMidPoint);
            addToMapIfKeyNotExists(roadSectionId, direction)
        }

        function setDirectionsForOrderedRoadSections(roadSectionOrderedArr) {
            for (let i = 1; i < roadSectionOrderedArr.length; i++) {
                const midPoint = document.getElementById(roadSectionOrderedArr[i]).getAttribute("position");
                const refMidPoint = document.getElementById(roadSectionOrderedArr[i - 1]).getAttribute("position");
                const refDirection = globalRoadSectionDirectionMap.get(roadSectionOrderedArr[i-1]);
                const direction = getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection);
                addToMapIfKeyNotExists(roadSectionOrderedArr[i], direction)
            }
        }

        function getInitialRoadSectionDirectionRelativeToStartElement(midPoint, startElementMidPoint) {
            const { x, z } = midPoint;
            const directionMap = {
                east: x < startElementMidPoint.x,
                west: x > startElementMidPoint.x,
                north: z > startElementMidPoint.z,
                south: z < startElementMidPoint.z,
            };
            return Object.keys(directionMap).find(key => directionMap[key]);
        }

        function getDirectionOfAdjacentRoadSection(midPoint, refMidPoint, refDirection) {
            const { x, z } = midPoint;

            console.log(refDirection)
            
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
        
                default:
                    console.error("Invalid reference direction.");
                    return null;
            }
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