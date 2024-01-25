const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionPropertiesHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionPropertiesMap = new Map();
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
            globalRoadSectionPropertiesHelper = createRoadSectionPropertiesHelper();
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
            globalDomHelper.removeComponentByIdMarking("_stripe_right");
            globalDomHelper.removeComponentByIdMarking("_stripe_left");
        }

        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            globalRoadSectionPropertiesMap = globalRoadSectionPropertiesHelper
                .getPropertiesMapForRelatedStartElementRoads(globalStartElementComponent, globalRelatedRoadObjsMap);
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnParallelStripesForRoadSection(roadObj);
            })
        }

        function spawnParallelStripesForRoadSection(roadObj) {
            roadObj.roadSectionArr.forEach(roadSectionId => {
                const stripeComponent = createStripeComponent(roadObj, roadSectionId)
                setStripeComponentProperties(stripeComponent, roadObj, roadSectionId);
                globalScene = document.querySelector("a-scene");
                globalScene.appendChild(stripeComponent);
            })
        }

        function createStripeComponent(roadObj, roadSectionId) {
            const roadSectionComponent = document.getElementById(roadSectionId);
            const stripeComponent = roadSectionComponent.cloneNode(true); // clone to keep properties of original
            const laneSide = getLaneSideForRoadSection(roadObj);
            const stripeId = `${roadSectionId}_stripe_${laneSide}`; // marking string to later handle related components
            stripeComponent.setAttribute("id", stripeId);
            return stripeComponent;
        }

        function getLaneSideForRoadSection(roadObj) {
            if (roadObj.startElementId === globalStartElementComponent.id) return "right";
            return "left"
        }

        function setStripeComponentProperties(stripeComponent, roadObj, roadSectionId) {
            const roadSectionPropertiesObj = globalRoadSectionPropertiesMap.get(roadSectionId);
            const roadSectionComponent = document.getElementById(roadSectionId)

            // position
            const laneSide = getLaneSideForRoadSection(roadObj);
            const originalPosition = roadSectionComponent.getAttribute("position");
            const { offsetX, offsetY, offsetZ } = getOffsetForLane(roadSectionId, laneSide)
            const stripePosition = { x: originalPosition.x + offsetX, y: originalPosition.y + offsetY, z: originalPosition.z + offsetZ };
            stripeComponent.setAttribute("position", stripePosition);

            // geometry
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            const shrinkPct = 0.70
            const { newWidth, newDepth } = getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth, shrinkPct)
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${newWidth}; height: 0.05; depth: ${newDepth}`);

            // color
            const color = getColorForLane(laneSide)
            stripeComponent.setAttribute("color", color);

            return stripeComponent;
        }

        function getOffsetForLane(roadSectionId, laneSide) {

            const { direction } = globalRoadSectionPropertiesMap.get(roadSectionId);

            let offsetX;
            let offsetY;
            let offsetZ;

            const baseOffset = 0.25

            if (laneSide === "right") {
                offsetY = 0.52;
                switch (direction) {
                    case "west": offsetX = 0; offsetZ = baseOffset; break;
                    case "east": offsetX = 0; offsetZ = - baseOffset; break;
                    case "south": offsetX = baseOffset; offsetZ = 0; break;
                    case "north": offsetX = - baseOffset; offsetZ = 0; break;
                }
            } else {
                offsetY = 0.50;
                switch (direction) {
                    case "west": offsetX = 0; offsetZ = - baseOffset; break;
                    case "east": offsetX = 0; offsetZ = baseOffset; break;
                    case "south": offsetX = - baseOffset; offsetZ = 0; break;
                    case "north": offsetX = baseOffset; offsetZ = 0; break;
                }
            }
            return {
                offsetX,
                offsetY,
                offsetZ
            }
        }

        function getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth, shrinkPct) {
            const { direction } = globalRoadSectionPropertiesMap.get(roadSectionId);
            let newWidth;
            let newDepth;
            switch (direction) {
                case "west": newWidth = originalWidth; newDepth = originalDepth * (1 - shrinkPct); break;
                case "east": newWidth = originalWidth; newDepth = originalDepth * (1 - shrinkPct); break;
                case "south": newWidth = originalWidth * (1 - shrinkPct); newDepth = originalDepth; break;
                case "north": newWidth = originalWidth * (1 - shrinkPct); newDepth = originalDepth; break;
            }

            return {
                newWidth,
                newDepth
            }
        }

        function getColorForLane(laneSide) {
            if (laneSide === "right") return controllerConfig.colorsParallelColorStripes.calls;
            return controllerConfig.colorsParallelColorStripes.isCalled;
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};