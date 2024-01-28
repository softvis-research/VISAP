const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionPropertiesHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionPropsMap = new Map();
        let globalScene;
        
        // TODO: Create more globals to adjust base props of stripe component in spot
        const globalStripeShrinkPct = 0.70

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

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartElement(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;

            globalDomHelper.handleLegendForAction("select");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("select", globalRelatedRoadObjsMap);
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
            globalRoadSectionPropsMap = globalRoadSectionPropertiesHelper
                .getPropsMapForRelatedRoadsStartElementPOV(globalStartElementComponent, globalRelatedRoadObjsMap);
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnParallelStripesForRoadSection(roadObj);
            })
        }

        function spawnParallelStripesForRoadSection(roadObj) {
            const stripeComponentArr = createStripeComponentsForRoadObj(roadObj);
            stripeComponentArr.forEach(stripeComponent => {
                const stripeComponentId = stripeComponent.id
                const roadSectionId = stripeComponentId.replace(/_stripe$/, '');

                // stripe props depending on clone roadSection and its place in roadObj
                setStripeComponentProps(stripeComponent, roadSectionId, roadObj); 
                globalScene = document.querySelector("a-scene");
                globalScene.appendChild(stripeComponent);
            })
        }

        // HTML-Component
        function createStripeComponentsForRoadObj(roadObj) {
            const stripeComponentArr = [];
            roadObj.roadSectionArr.forEach(roadSectionId => {
                const roadSectionComponent = document.getElementById(roadSectionId);
                const stripeComponent = roadSectionComponent.cloneNode(true); // clone keeps original props for new component
                const stripeId = `${roadSectionId}_stripe`;
                stripeComponent.setAttribute("id", stripeId);
                // check if necessary properties are set correctly before pushing
                if (hasValidRoadSectionProps(roadSectionId)) stripeComponentArr.push(stripeComponent);
            })
            return stripeComponentArr;
        }

        function setStripeComponentProps(stripeComponent, roadSectionId, roadObj) {
            const roadSectionComponent = document.getElementById(roadSectionId);

            const laneSide = getLaneSideForRoadObj(roadObj); // stripes on left or right lane

            // position
            const originalPosition = roadSectionComponent.getAttribute("position");
            const { newX, newY, newZ } = getNewPositionForLane(roadSectionId, originalPosition, laneSide,)
            const stripePosition = { x: newX, y: newY, z: newZ };
            stripeComponent.setAttribute("position", stripePosition);

            // geometry
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");
            const { newWidth, newDepth } = getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth)
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${newWidth}; height: 0.05; depth: ${newDepth}`);

            // color
            const color = getColorForLane(laneSide)
            stripeComponent.setAttribute("color", color);
        }

        function getNewPositionForLane(roadSectionId, originalPosition, laneSide) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);
            const { direction, isEndingInCurve, directionOfSuccessor } = propertiesObj

            let newX, newY, newZ;
            const baseOffset = 0.25

            if (laneSide === "right") {
                newY = 0.52;
                switch (direction) {
                    case "west": {
                        newX = originalPosition.x; 
                        newZ = originalPosition.z + baseOffset; 
                        break;
                    }
                    case "east": {
                        newX = originalPosition.x; 
                        newZ = originalPosition.z - baseOffset; 
                        break;}
                    case "south": {
                        newX = originalPosition.x + baseOffset; 
                        newZ = originalPosition.z; 
                        break;}
                    case "north": {
                        newX = originalPosition.x - baseOffset; 
                        newZ = originalPosition.z; 
                        break;}
                }
            } else {
                newY = 0.50;
                switch (direction) {
                    case "west": newX = originalPosition.x; newZ = originalPosition.z - baseOffset; break;
                    case "east": newX = originalPosition.x; newZ = originalPosition.z + baseOffset; break;
                    case "south": newX = originalPosition.x - baseOffset; newZ = originalPosition.z; break;
                    case "north": newX = originalPosition.x + baseOffset; newZ = originalPosition.z; break;
                }
            }

            return { newX, newY, newZ }
        }

        function getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);

            const { direction } = propertiesObj
            let newWidth, newDepth;
            switch (direction) {
                case "west": {
                    newWidth = originalWidth  -0.2;
                    newDepth = originalDepth * (1 - globalStripeShrinkPct);
                    break;
                }
                case "east": {
                    newWidth = originalWidth  -0.2;
                    newDepth = originalDepth * (1 - globalStripeShrinkPct);
                    break;
                }
                case "south": {
                    newWidth = originalWidth * (1 - globalStripeShrinkPct);
                    newDepth = originalDepth  -0.2;
                    break;
                }
                case "north": {
                    newWidth = originalWidth * (1 - globalStripeShrinkPct);
                    newDepth = originalDepth  -0.2;
                    break;
                }
            }

            return {
                newWidth,
                newDepth
            }
        }

        function hasValidRoadSectionProps(roadSectionId) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);
            const { direction } = propertiesObj;
            if (!direction) return false;
            return true;
        }

        function getLaneSideForRoadObj(roadObj) {
            if (roadObj.startElementId === globalStartElementComponent.id) return "right";
            return "left"
        }

        function getColorForLane(laneSide) {
            if (laneSide === "right") return controllerConfig.colorsParallelColorStripes.calls;
            else return controllerConfig.colorsParallelColorStripes.isCalled;
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};