const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let globalDomHelper;
        let globalRoadSectionPropertiesHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionPropsMap = new Map();
        let globalScene;

        const globalStripeOffsetRoadCenter = 0.25;
        const globalStripeSizePct = 0.3;

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
            const { direction, directionOfSuccessor, directionOfPredecessor, isInitialElement, isFinalElement } = propertiesObj

            let newX, newY, newZ;

            const overlapAdjustment = getAdjPos(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide)

            if (laneSide === "right") {
                newY = 0.52;
                switch (direction) {
                    case "west": {
                        newX = originalPosition.x - overlapAdjustment;
                        newZ = originalPosition.z + globalStripeOffsetRoadCenter;
                        break;
                    }
                    case "east": {
                        newX = originalPosition.x - overlapAdjustment;
                        newZ = originalPosition.z - globalStripeOffsetRoadCenter;
                        break;
                    }
                    case "south": {
                        newX = originalPosition.x + globalStripeOffsetRoadCenter;
                        newZ = originalPosition.z - overlapAdjustment;;
                        break;
                    }
                    case "north": {
                        newX = originalPosition.x - globalStripeOffsetRoadCenter;
                        newZ = originalPosition.z - overlapAdjustment;
                        break;
                    }
                }
            } else {
                newY = 0.50;
                switch (direction) {
                    case "west": {
                        newX = originalPosition.x - overlapAdjustment;
                        newZ = originalPosition.z - globalStripeOffsetRoadCenter;
                        break;
                    }
                    case "east": {
                        newX = originalPosition.x - overlapAdjustment;
                        newZ = originalPosition.z + globalStripeOffsetRoadCenter;
                        break;
                    }
                    case "south": {
                        newX = originalPosition.x - globalStripeOffsetRoadCenter;
                        if (isFinalElement) newZ = originalPosition.z - overlapAdjustment;
                        else newZ = originalPosition.z - overlapAdjustment;
                        break;
                    }
                    case "north": {
                        newX = originalPosition.x + globalStripeOffsetRoadCenter;
                        if (isInitialElement || isFinalElement) newZ = originalPosition.z 
                        else newZ = originalPosition.z - overlapAdjustment;
                        break;
                    }
                }
            }

            return { newX, newY, newZ }
        }

        function getNewWidthDepthForLane(roadSectionId, originalWidth, originalDepth, laneSide) {
            const propertiesObj = globalRoadSectionPropsMap.get(roadSectionId);
            const { direction, directionOfSuccessor, directionOfPredecessor, isInitialElement, isFinalElement } = propertiesObj


            const overlapAdjustment = getAdjDim(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide)

            let newWidth, newDepth;
            if (laneSide === "right") {
                switch (direction) {
                    case "west": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (globalStripeSizePct);
                        break;
                    }
                    case "east": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (globalStripeSizePct);
                        break;
                    }
                    case "south": {
                        newWidth = originalWidth * (globalStripeSizePct);
                        newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                    case "north": {
                        newWidth = originalWidth * (globalStripeSizePct);
                        newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                }
            } else {
                switch (direction) {
                    case "west": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (globalStripeSizePct);
                        break;
                    }
                    case "east": {
                        newWidth = originalWidth - overlapAdjustment;
                        newDepth = originalDepth * (globalStripeSizePct);
                        break;
                    }
                    case "south": {
                        newWidth = originalWidth * (globalStripeSizePct);
                        if (isFinalElement) newDepth = originalDepth - overlapAdjustment;
                        else newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                    case "north": {
                        newWidth = originalWidth * (globalStripeSizePct);
                        if (isInitialElement || isFinalElement) newDepth = originalDepth
                        else newDepth = originalDepth - overlapAdjustment;
                        break;
                    }
                }
            }
                
            return {
                newWidth,
                newDepth
            }
        }


        function getAdjDim(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            const longSideCutoff = getLongSideCutoff(originalWidth, originalDepth);
            const shortSideCutoff = getShortSideCutoff(originalWidth, originalDepth);
            const dictResult = getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide)
            switch(dictResult) {
                case "0/0"  : return 0;
                case "-/0"  :
                case "0/-"  : return shortSideCutoff;
                case "0/--" :
                case "--/0" : return longSideCutoff;
                case "-/-"  : return shortSideCutoff * 2;
                case "--/-" :
                case "-/--" : return longSideCutoff + shortSideCutoff;
                case "--/--": return longSideCutoff * 2;
            }
        }

        function getAdjPos(originalWidth, originalDepth, direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            const longSideCutoff = getLongSideCutoff(originalWidth, originalDepth);
            const shortSideCutoff = getShortSideCutoff(originalWidth, originalDepth);
            const dictResult = getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide)
            switch(dictResult) {
                case "0/0"  :
                case "-/-"  :
                case "--/--":   return 0;
                case "-/0"  :   return shortSideCutoff;
                case "0/-"  :   return shortSideCutoff;
                case "0/--" :   return longSideCutoff/2
                case "--/0" :   return longSideCutoff/2
                case "--/-" :   return longSideCutoff/2 - shortSideCutoff
                case "-/--" :   return longSideCutoff/2 - shortSideCutoff
            }
        }

        function getLongSideCutoff(originalWidth, originalDepth) {
            if (originalWidth > originalDepth) return Number(originalDepth) + (Number(originalDepth) * (-globalStripeSizePct));
            else return Number(originalWidth) + (Number(originalWidth) * (-globalStripeSizePct));
        }

        function getShortSideCutoff(originalWidth, originalDepth) {
            if (originalWidth > originalDepth) return Number(originalDepth * globalStripeSizePct - globalStripeOffsetRoadCenter)
            else return Number(originalWidth * globalStripeSizePct - globalStripeOffsetRoadCenter)
        }

        function getPosSizeAdjustmentForCrossingsDict(direction, directionOfPredecessor, directionOfSuccessor, laneSide) {
            if(directionOfPredecessor === null) directionOfPredecessor = "none";
            if(directionOfSuccessor === null) directionOfSuccessor = "none";
            
            // obj: direction->predecessor->successor
            // 0: no adjustment; --: long side adjustment; -: short side adjustment
            // sign before slash: adjustment in predecessor direction; sign after slash: adjustment in successor direction
            const crossingRightLaneDict = {
                north: {
                    none : { none: "0/0",  east: "0/--",  west: "0/-",  north: "0/0"   },
                    east : { none: "-/0",  east: "-/--",  west: "-/-",  north: "-/0"   },
                    west : { none: "--/0", east: "--/--", west: "--/-", north: "--/0"  },
                    north: { none: "0/0",  east: "0/--",  west: "0/-",  north: "0/0"   },
                },
                east: {
                    none : { none: "0/0",  east: "0/0",  south: "0/--",  north: "0/-"  },
                    east : { none: "0/0",  east: "0/0",  south: "0/--",  north: "0/-"  },
                    south: { none: "-/0",  east: "-/0",  south: "-/--",  north: "-/-"  },
                    north: { none: "--/0", east: "--/0", south: "--/--", north: "--/-" },
                },
                west: {
                    none : { none: "0/0",  west: "0/0",  south: "0/--",  north: "0/-"  },
                    west : { none: "0/0",  west: "0/0",  south: "0/--",  north: "0/-"  },
                    south: { none: "-/0",  west: "0/--", south: "-/--",  north: "-/-"  },
                    north: { none: "--/0", west: "--/0", south: "--/--", north: "--/-" },
                },
                south: {
                    none : { none: "0/0",  east: "0/-",  west: "0/--",  south: "0/0"   },
                    east : { none: "--/0", east: "--/-", west: "--/--", south: "--/0"  },
                    west : { none: "-/0",  east: "0/--", west: "-/--",  south: "-/0"   },
                    south: { none: "0/0",  east: "0/-",  west: "0/--",  south: "0/0"   },
                },

            }

            let result = crossingRightLaneDict[direction][directionOfPredecessor][directionOfSuccessor] 
            if (laneSide != "right") {
                // reversing logic for left stripes
                switch(result) {
                        case "-/-"  : return "--/--";
                        case "--/--": return "-/-"  ;
                        case "-/0"  : return "0/-"  ;
                        case "0/-"  : return "-/0"  ;
                        case "0/--" : return "--/0" ;
                        case "--/0" : return "0/--" ;
                        case "--/-" : return "-/--" ;
                        case "-/--" : return "--/-" ;
                }
            }
            return result || "0/0"
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