const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let domHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionDirectionMap = new Map();
        const globalScene = document.querySelector("a-scene");


        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                domHelper = createDomHelper(controllerConfig);
                domHelper.initialize();
                domHelper.createLegend(
                    [
                        { text: "calls", color: controllerConfig.colorsParallelColorStripes.calls },
                        { text: "isCalled", color: controllerConfig.colorsParallelColorStripes.isCalled },
                    ]);
            }
        }

        function highlightRelatedRoadsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            domHelper.handleLegendForAction("select");
            setRoadSectionDirectionMap();
            handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            domHelper.handleLegendForAction("unselect");
            domHelper.removeComponentByIdMarking("_stripe");
        }

        /************************
         Road Section Directions
        ************************/

        function setRoadSectionDirectionMap() {
            setDirectionForRoadSectionsCalls();
            setDirectionForRoadSectionsIsCalled();
        }

        function setDirectionForRoadSectionsCalls() {
            const roadObjsForGlobalStartElement = getRoadObjsForGlobalStartElement();
            roadObjsForGlobalStartElement.forEach(roadObj => {
                setDirectionForStartRamp(roadObj);
            })
        }

        // start calls other elements
        function getRoadObjsForGlobalStartElement() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id);
        }

        function setDirectionForRoadSectionsIsCalled() {
            const roadObjsWhereGlobalStartElementIsDestination = getRoadObjsWhereGlobalStartElementIsDestination();
            roadObjsWhereGlobalStartElementIsDestination.forEach(roadObj => {
                //
            })
        }

        // other elements call start
        function getRoadObjsWhereGlobalStartElementIsDestination() {
            return Array.from(globalRelatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id);
        }

        function setDirectionForStartRamp(roadObj) {
            const startRampId = roadObj.roadSectionArr[0];
            console.log(startRampId);
            const startRampMidPos = document.getElementById(startRampId).getAttribute("position");
            const startElementMidPos = globalStartElementComponent.getAttribute("position");

            const pointDirectionsBools = determinePointDirectionRefXZ(startRampMidPos, startElementMidPos);
            const trueDirection = Object.keys(pointDirectionsBools)
                .filter(key => pointDirectionsBools[key] && ["east", "west", "north", "south"]
                    .includes(key))[0];

            globalRoadSectionDirectionMap.set(startRampId, trueDirection);
            console.log(globalRoadSectionDirectionMap);
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
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnStripesForRoadObj(roadObj);
                if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns();
            })
        }

        function spawnStripesForRoadObj(roadObj) {
            roadObj.roadSectionArr.forEach(roadSectionId => {
                if (globalRoadSectionStateMap.get(roadSectionId)) {
                    const stripeId = roadSectionId + "_stripe"; // marking string to later handle related components
                    stripeComponent = createStripeComponent(stripeId);
                    setStripeComponentProperties(stripeComponent, roadObj, roadSectionId);
                    globalScene.appendChild(stripeComponent);
                }
            })
        }

        function createStripeComponent(stripeId) {
            const stripeComponent = document.createElement("a-entity");
            stripeComponent.setAttribute("id", stripeId);
            return stripeComponent;
        }

        // setting properties based on roadSection components the stripes will flow above
        function setStripeComponentProperties(stripeComponent, roadObj, roadSectionId) {
            roadSectionComponent = document.getElementById(roadSectionId)

            const originalPosition = roadSectionComponent.getAttribute("position");
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            const isStartRamp = determineIfRoadSectionIsStartRamp(roadObj, roadSectionId)
            const isEndRamp = determineIfRoadSectionIsEndRamp(roadObj, roadSectionId)

            isStartRamp || isEndRamp ? offsetY = 0.51 : offsetY = 0.50; // small offset for ramps so they lie above undecided colors
            const stripePosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeComponent.setAttribute("position", stripePosition);
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.5}; height: 0.1; depth: ${originalDepth - 0.5}`);
            const color = determineColorOfRoadSectionIdByState(roadSectionId)
            stripeComponent.setAttribute("material", `color: ${color}`);
            return stripeComponent;
        }

        return {
            initialize,
            highlightRelatedRoadsForStartElement,
            resetRoadsHighlight,
        };
    })();
};