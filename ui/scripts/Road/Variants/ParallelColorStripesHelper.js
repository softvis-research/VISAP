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
                const roadSectionComponent = document.getElementById(roadSectionId);
            
                const stripeComponent = roadSectionComponent.cloneNode(true); // clone to keep properties of original
                stripeComponent.setAttribute("id", stripeId);
                const roadSectionSpecialProperties = getSpecialPropertiesOfRoadSection(roadObj, roadSectionId);
                setStripeComponentProperties(stripeComponent, roadSectionId, roadSectionSpecialProperties);
    
                globalScene = document.querySelector("a-scene");
                globalScene.appendChild(stripeComponent);
            });
        }

        function getSpecialPropertiesOfRoadSection(roadObj, roadSectionId) {
            const isRightLane = roadObj.startElementId === globalStartElementComponent.id ? true : false;

            let isStartRamp;
            if (roadSectionId) isStartRamp = roadObj.roadSectionArr[0] === roadSectionId ? true : false;
            else isStartRamp = [...roadObj.roadSectionArr].reverse()[0] === roadSectionId ? true : false;

            let isEndRamp; 
            if (roadSectionId) isEndRamp = roadObj.roadSectionArr[roadObj.roadSectionArr.length-1] === roadSectionId ? true : false;
            else isEndRamp = [...roadObj.roadSectionArr].reverse()[roadObj.roadSectionArr.length-1] === roadSectionId ? true : false;
            
            return {
                isRightLane,
                isStartRamp,
                isEndRamp
            }
        }

        function setStripeComponentProperties(stripeComponent, roadSectionId, roadSectionSpecialProperties) {
            const roadSectionComponent = document.getElementById(roadSectionId)

            // position
            const originalPosition = roadSectionComponent.getAttribute("position");
            const { offsetX, offsetY, offsetZ } = getOffsetForLane(roadSectionId, roadSectionSpecialProperties.isRightLane)
            const stripePosition = { x: originalPosition.x + offsetX, y: originalPosition.y + offsetY, z: originalPosition.z + offsetZ };
            stripeComponent.setAttribute("position", stripePosition);

            // geometry
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.7}; height: 0.05; depth: ${originalDepth - 0.7}`);

            // color
            const color = getColorForLane(roadSectionSpecialProperties.isRightLane)
            stripeComponent.setAttribute("color", color);

            return stripeComponent;
        }

        function getOffsetForLane(roadSectionId, isRightLane) {
            
            const direction = globalRoadSectionDirectionMap.get(roadSectionId);

            let offsetX;
            let offsetY;
            let offsetZ;

            const baseOffset = 0.25

            if (isRightLane) {
                offsetY = 0.52;
                switch (direction) {
                    case "west": offsetX = 0; offsetZ = baseOffset; break;
                    case "east": offsetX = baseOffset; offsetZ = - baseOffset; break;
                    case "south": offsetX = baseOffset; offsetZ = 0; break;
                    case "north": offsetX = - baseOffset; offsetZ = - baseOffset; break;
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

        function getNewWidthDepthForLane(roadSectionId, isRightLane){
            const direction = globalRoadSectionDirectionMap.get(roadSectionId);
            let width;
            let depth;

            if (isRightLane) {
                switch (direction) {
                    case "west": offsetX = 0; offsetZ = baseOffset; break;
                    case "east": offsetX = 0; offsetZ = - baseOffset; break;
                    case "south": offsetX = baseOffset; offsetZ = baseOffset; break;
                    case "north": offsetX = - baseOffset; offsetZ = 0; break;
                }
            } else {
                switch (direction) {
                    case "west": offsetX = 0; offsetZ = - baseOffset; break;
                    case "east": offsetX = 0; offsetZ = baseOffset; break;
                    case "south": offsetX = - baseOffset; offsetZ = - baseOffset; break;
                    case "north": offsetX = baseOffset; offsetZ = - baseOffset; break;
                }
            }
            return {
                width,
                depth
            }
        }

        function getColorForLane(isRightLane) {
            if (isRightLane) return controllerConfig.colorsParallelColorStripes.calls;
            return controllerConfig.colorsParallelColorStripes.isCalled;
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};