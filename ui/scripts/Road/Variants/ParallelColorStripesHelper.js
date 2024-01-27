const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionPropertiesHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionPropsMap = new Map();
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

            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            // position
            const originalPosition = roadSectionComponent.getAttribute("position");
            const { newX, newY, newZ } = getNewPositionForLane(roadSectionId, originalWidth, originalDepth, originalPosition, laneSide,)
            const stripePosition = { x: newX, y: newY, z: newZ };
            stripeComponent.setAttribute("position", stripePosition);

            // geometry
            
            const { newWidth, newDepth } = getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth, laneSide)
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${newWidth}; height: 0.05; depth: ${newDepth}`);

            // color
            const color = getColorForLane(laneSide)
            stripeComponent.setAttribute("color", color);
        }

        function getNewPositionForLane(roadSectionId, originalWidth, originalDepth, originalPosition, laneSide) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);
            const { direction, isEndingInCurve, directionOfSuccessor, directionOfPredecessor } = propertiesObj

            let newX, newY, newZ;

            const overlapAdjustment = getAdjPos(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide)

            if (laneSide === "right") {
                newY = 0.52;
                switch (direction) {
                    case "west": {
                        newX = originalPosition.x;
                        newZ = originalPosition.z + 0.25;
                        break;
                    }
                    case "east": {
                        newX = originalPosition.x;
                        newZ = originalPosition.z - 0.25;
                        break;
                    }
                    case "south": {
                        newX = originalPosition.x + 0.25;
                        newZ = originalPosition.z;
                        break;
                    }
                    case "north": {
                        newX = originalPosition.x - 0.25;
                        newZ = originalPosition.z - overlapAdjustment;
                        break;
                    }
                }
            } else {
                newY = 0.50;
                switch (direction) {
                    case "west": {
                        if (directionOfSuccessor === "south" && directionOfPredecessor === "east") newX = originalPosition.x - overlapCutoff/2;
                        else if (directionOfSuccessor === "south") newX = originalPosition.x - overlapCutoff;
                        else newX = originalPosition.x;
                        newZ = originalPosition.z - 0.25;
                        break;
                    }
                    case "east": {
                        if (directionOfSuccessor === "north" && directionOfPredecessor === "west") newX = originalPosition.x - overlapCutoff/2;
                        else if (directionOfSuccessor === "north") newX = originalPosition.x + overlapCutoff;
                        else newX = originalPosition.x;
                        newZ = originalPosition.z + 0.25;
                        break;
                    }
                    case "south": {
                        newX = originalPosition.x - 0.25;
                        if (directionOfSuccessor === "east" && directionOfPredecessor === "south") newZ = originalPosition.z - overlapCutoff/2;
                        else if (directionOfSuccessor === "east") newZ = originalPosition.z + overlapCutoff;
                        else newZ = originalPosition.z;
                        break;
                    }
                    case "north": {
                        newX = originalPosition.x + 0.25;
                        if (directionOfSuccessor === "west" && directionOfPredecessor === "north") newZ = originalPosition.z - overlapCutoff/2;
                        else if (directionOfSuccessor === "west") newZ = originalPosition.z - overlapCutoff;
                        else newZ = originalPosition.z;
                        break;
                    }
                }
            }

            return { newX, newY, newZ }
        }

        function getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth, laneSide) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);
            const { direction, directionOfSuccessor, directionOfPredecessor } = propertiesObj

            const overlapAdjustment = getAdjDim(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide)

            let newWidth, newDepth;
            if (laneSide === "right") {
                switch (direction) {
                    case "west": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (0.3);
                        break;
                    }
                    case "east": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (0.3);
                        break;
                    }
                    case "south": {
                        newWidth = originalWidth * (0.3);
                        newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                    case "north": {
                        newWidth = originalWidth * (0.3);
                        newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                }
            } else {
                switch (direction) {
                    case "west": {
                        if (directionOfSuccessor === "south" && directionOfPredecessor === "south") newWidth = originalWidth - (1.4*overlapCutoff);
                        else if (directionOfSuccessor === "south") newWidth = originalWidth - overlapCutoff;
                        else newWidth = originalWidth - 0.2;
                        newDepth = originalDepth * (0.3);
                        break;
                    }
                    case "east": {
                        if (directionOfSuccessor === "north" && directionOfPredecessor === "north") newWidth = originalWidth - (1.4*overlapCutoff);
                        else if (directionOfSuccessor === "north") newWidth = originalWidth - overlapCutoff;
                        else newWidth = originalWidth - 0.2;
                        newDepth = originalDepth * (0.3);
                        break;
                    }
                    case "south": {
                        if (directionOfSuccessor === "west" && directionOfPredecessor === "west") newDepth = originalDepth - (1.4* overlapCutoff);
                        else if (directionOfSuccessor === "west") newDepth = originalDepth - overlapCutoff;
                        else newDepth = originalDepth - 0.2;
                        newWidth = originalWidth * (0.3);
                        break;
                    }
                    case "north": {
                        if (directionOfSuccessor === "east" && directionOfPredecessor === "east") newDepth = originalDepth - (1.4*overlapCutoff);
                        else if (directionOfSuccessor === "east") newDepth = originalDepth - overlapCutoff;
                        else newDepth = originalDepth - 0.2;
                        newWidth = originalWidth * (0.3);
                        break;
                    }
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

        function getAdjDim(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            let longSideCutoff;
            if (originalWidth > originalDepth) {
                longSideCutoff = Number(originalDepth) + (Number(originalDepth) * (-0.3));
                shortSideCutoff = Number(originalDepth * 0.3 -0.2)
            } else {
                longSideCutoff = Number(originalWidth) + (Number(originalWidth) * (-0.3));
                shortSideCutoff = Number(originalWidth * 0.3 - 0.2)
            } 

            const dictResult = getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide)
            switch(dictResult) {
                case "0/0": return 0;
                case "-/0": return longSideCutoff;
                case "0/-": return longSideCutoff;
                case "0/--": return longSideCutoff;
                case "--/0": return longSideCutoff;
                case "-/-": return longSideCutoff;
                case "--/-": return longSideCutoff;
                case "--/--": return longSideCutoff;
                case "-/--": return longSideCutoff + shortSideCutoff;
            }
        }

        function getAdjPos(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            let longSideCutoff;
            if (originalWidth > originalDepth) longSideCutoff = Number(originalDepth) + (Number(originalDepth) * (-0.3));
            else longSideCutoff = Number(originalWidth) + (Number(originalWidth) * (-0.3));

            const dictResult = getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide)
            switch(dictResult) {
                case "0/0": return 0;
                case "-/0": return longSideCutoff;
                case "0/-": return longSideCutoff;
                case "0/--": return longSideCutoff;
                case "--/0": return longSideCutoff;
                case "-/-": return longSideCutoff;
                case "--/-": return longSideCutoff;
                case "--/--": return longSideCutoff;
                case "-/--": if (originalWidth > originalDepth) return originalDepth * 0.3; else return originalWidth * 0.3;
            }
        }

        // dir / pre / succ
        function getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            if(directionOfPredecessor === null) directionOfPredecessor = "none";
            if(directionOfSuccessor === null) directionOfSuccessor = "none";

            const crossingRightLaneDict = {
                north: {
                    none: { none: "0/0", east: "0/--", west: "0/-", north: "0/0" },
                    east: { none: "-/0", east: "-/--", west: "-/-", north: "-/0" },
                    west: { none: "--/0", east: "--/--", west: "--/-",  north: "--/0" },
                    north: { none: "0/0", east: "0/--", west: "0/-", north: "0/0" },
                },
                east: {
                    none: { none: "0/0", east: "0/0", south: "0/--", north: "0/-" },
                    east: { none: "0/0", east: "0/0", south: "0/--", north: "0/-" },
                    south: { none: "-/0", east: "-/0", south: "-/--", north: "-/-" },
                    north: { none: "--/0", east: "--/0", south: "--/--", north: "--/-" },
                },
                west: {
                    none: { none: "0/0", west: "0/0", south: "0/--", north: "0/-" },
                    west: { none: "0/0", west: "0/0", south: "0/--", north: "0/-" },
                    south: { none: "-/0", west: "-/0", south: "-/--", north: "-/-" },
                    north: { none: "--/0", west: "--/0", south: "--/--", north: "--/-" },
                },
                south: {
                    none: { none: "0/0", east: "0/-", west: "0/-", south: "0/0"},
                    east: { none: "--/0", east: "--/-", west: "--/--", south: "--/0" },
                    west: { none: "-/0", east: "0/--", west: "-/--", south: "-/0" },
                    south: { none: "0/0", east: "0/-", west: "0/--", south: "0/0" },
                },

            }
            return crossingRightLaneDict[direction][directionOfPredecessor][directionOfSuccessor] || "0/0"
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};