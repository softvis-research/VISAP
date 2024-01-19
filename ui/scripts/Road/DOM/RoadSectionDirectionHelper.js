const createRoadSectionDirectionHelper = function (controllerConfig) {
    return (function () {

        let globalRoadSectionDirectionMap;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();

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
                setDirectionForStartRampBasedOnStartElement(roadObj); // setting first roadSection per outgoing road as reference direction
                // setDirectionForAdjacentRoadSections(roadObj);
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
                //
            })
        }

        function getRoadObjsWhereStartElementIsDestination() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id); // startElement is called by other elements
        }

        /************************
          Directions Operations
        ************************/

        function setDirectionForStartRampBasedOnStartElement(roadObj) {
            const startRampRoadSectionId = roadObj.roadSectionArr[0];
            console.log(startRampRoadSectionId);
            const startRampMidPos = document.getElementById(startRampRoadSectionId).getAttribute("position");
            const startElementMidPos = globalStartElementComponent.getAttribute("position");

            const pointDirectionsBools = determinePointDirectionRefXZ(startRampMidPos, startElementMidPos);
            const trueDirection = Object.keys(pointDirectionsBools)
                .filter(key => pointDirectionsBools[key] && ["east", "west", "north", "south"]
                    .includes(key))[0];

            addToMapIfKeyNotExists(startRampRoadSectionId, trueDirection, globalRoadSectionDirectionMap)
        }

        function determinePointDirectionRefXZ(point, refPoint) {
            const { x, z } = point;

            return {
                east: x < refPoint.x,
                west: x > refPoint.x,
                north: z > refPoint.z,
                south: z < refPoint.z,
                onVerticalLine: x === refPoint.x,
                onHorizontalLine: z === refPoint.z,
            };
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