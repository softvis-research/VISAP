const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionDirectionHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionDirectionMap = new Map();
        let globalScene;

        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                globalScene = document.querySelector("a-scene");
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


        function startRoadHighlightActionsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            globalDomHelper.handleLegendForAction("select");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("select", globalRelatedRoadObjsMap)
            handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            globalDomHelper.handleLegendForAction("unselect");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("unselect", globalRelatedRoadObjsMap)
            globalDomHelper.removeComponentByIdMarking("_stripe");
        }

        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            globalRoadSectionDirectionMap = globalRoadSectionDirectionHelper
                .getDirectionsMapForRelatedStartElementRoads(globalStartElementComponent, globalRelatedRoadObjsMap);
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnParallelStripesForRoadObj(roadObj);
                // if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns(roadObj);
            })
        }

        function spawnParallelStripesForRoadObj(roadObj) {
            roadObj.roadSectionArr.forEach(roadSectionId => {
                const stripeId = roadSectionId + "_stripe"; // marking string to later handle related components
                let stripeComponent = createStripeComponent(stripeId);

                roadObj.startElementId === globalStartElementComponent.id ? isRightLane = true : isRightLane = false;
                stripeComponent = setStripeComponentProperties(stripeComponent, roadSectionId, isRightLane);
                globalScene = document.querySelector("a-scene");
                globalScene.appendChild(stripeComponent);
            })
        }

        function createStripeComponent(stripeId) {
            const stripeComponent = document.createElement("a-entity");
            stripeComponent.setAttribute("id", stripeId);
            return stripeComponent;
        }

        function setStripeComponentProperties(stripeComponent, roadSectionId, isRightLane) {
            const roadSectionComponent = document.getElementById(roadSectionId)

            const originalPosition = roadSectionComponent.getAttribute("position");
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");
            let offsetY;
            let color;
            if (isRightLane) {
                offsetY = 0.50;
                color = controllerConfig.colorsParallelColorStripes.calls;
            } else {
                offsetY = 0.55;
                color = controllerConfig.colorsParallelColorStripes.isCalled;
            }

            let { offsetX, offsetZ } = getXZOffsetForLane(roadSectionId, isRightLane, 0.2)

            const stripePosition = { x: originalPosition.x + offsetX, y: originalPosition.y + offsetY, z: originalPosition.z + offsetZ };
            stripeComponent.setAttribute("position", stripePosition);
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.8}; height: 0.1; depth: ${originalDepth - 0.8}`);
            stripeComponent.setAttribute("material", `color: ${color}`);
            return stripeComponent;
        }

        function getXZOffsetForLane(roadSectionId, isRightLane, baseOffset) {

            const direction = globalRoadSectionDirectionMap.get(roadSectionId);
            let offsetX = baseOffset;
            let offsetZ = baseOffset;
            switch (direction) {
                case "west":
                    if (!isRightLane) {
                        offsetX = 0
                        offsetZ = - baseOffset;
                    } else {
                        offsetX = 0
                    }
                    break;
                case "east":
                    if (isRightLane) {
                        offsetX = 0;
                        offsetZ = - baseOffset
                    } else {
                        offsetX = 0
                    }
                    break;

                case "south":
                    if (!isRightLane) {
                        offsetX = - baseOffset
                        offsetZ = 0;
                    } else {
                        offsetZ = - baseOffset
                    }
                    break;

                case "north":
                    if (isRightLane) {
                        offsetX = - baseOffset
                        offsetZ = 0;
                    } else {
                        offsetZ = - baseOffset
                    }
                    break;
            }

            return {
                offsetX,
                offsetZ
            }
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};