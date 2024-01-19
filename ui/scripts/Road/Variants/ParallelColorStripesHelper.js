const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionDirectionHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionDirectionMap = new Map();
        const globalScene = document.querySelector("a-scene");


        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                globalDomHelper = createDomHelper(controllerConfig);
                globalDomHelper.initialize();
                globalDomHelper.createLegend(
                    [
                        { text: "calls", color: controllerConfig.colorsParallelColorStripes.calls },
                        { text: "isCalled", color: controllerConfig.colorsParallelColorStripes.isCalled },
                    ]);
            }
            globalRoadSectionDirectionHelper = createRoadSectionDirectionHelper();
        }

        function highlightRelatedRoadsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            globalDomHelper.handleLegendForAction("select");
            globalRoadSectionDirectionMap = globalRoadSectionDirectionHelper.getDirectionsMapForRelatedStartElementRoads(globalStartElementComponent, globalRelatedRoadObjsMap);
            console.log(globalRoadSectionDirectionMap)
            // handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            globalDomHelper.handleLegendForAction("unselect");
            globalDomHelper.removeComponentByIdMarking("_stripe");
        }


        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnParallelStripesForRoadObj(roadObj);
                if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns();
            })
        }

        function spawnParallelStripesForRoadObj(roadObj) {
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