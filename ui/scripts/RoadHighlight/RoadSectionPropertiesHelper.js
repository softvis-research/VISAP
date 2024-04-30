const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let glbStartElementComponent;
        let glbStripesOffset;
        let glbShrinkPct;

        /************************
            Public Functions
        ************************/

        // returns a props map for individual roadSections where startElement serves as reference for every attribute
        function getRoadObjSectionPropsArr(startElementComponent, relatedRoadObjsMap, stripesOffset = 0.25, shrinkPct = 0.7) {
            glbStartElementComponent = startElementComponent;
            glbShrinkPct = shrinkPct;
            glbStripesOffset = stripesOffset;
            const roadObjAdjustedArr = getRoadObjAdjustedArr(relatedRoadObjsMap);
            console.log(roadObjAdjustedArr)
            return roadObjAdjustedArr;
        }

       /************************
               Adjusting
       ************************/

        function getRoadObjAdjustedArr(relatedRoadObjsMap) {
            let roadObjAdjustedArr = getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap);
            addDirectionOfRoadSectionsRelativeToStartElement(roadObjAdjustedArr);
            addRoadSectionAdjustedIntersections(roadObjAdjustedArr);
            addDistrictIntersections(roadObjAdjustedArr);
            console.log(roadObjAdjustedArr)
            return roadObjAdjustedArr;
        }

        function addDirectionOfRoadSectionsRelativeToStartElement(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                const refRoadSectionObj = roadObj.roadSectionObjArr[0];
                const refDirection = getDirectionForInitialRoadSection(refRoadSectionObj);
                roadObj.roadSectionObjArr[0].direction = refDirection;
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    const currentDirection = getDirectionOfAdjacentRoadSections(currentRoadSectionObj, refRoadSectionObj);
                    roadObj.roadSectionObjArr[i].direction = currentDirection;
                }
            })
        }

        function addRoadSectionAdjustedIntersections(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    // a curve
                    if (currentRoadSectionObj.direction != refRoadSectionObj.direction) {
                        currentRoadSectionObj.intersection, refRoadSectionObj.intersection
                            = getRoadSectionIntersection(currentRoadSectionObj, refRoadSectionObj)
                    } else refRoadSectionObj.intersection = null;
                }
                const lastRoadSection = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
                lastRoadSection.intersection = null;
            })
        }

        function addDistrictIntersections(roadObjAdjustedArr) {
            roadObjAdjustedArr.forEach(roadObj => {
                const length = roadObj.roadSectionObjArr.length;
                for (let i = 0; i < length; i++) {
                    let intersectionWithStartBorder = null;
                    let intersectionWithEndBorder = null;
                    if (i === 0) intersectionWithStartBorder = getDistrictIntersection(roadObj.roadSectionObjArr[i], isFinal = false);
                    if (i === length - 1) intersectionWithEndBorder = getDistrictIntersection(roadObj.roadSectionObjArr[i], isFinal = true);

                    roadObj.roadSectionObjArr[i].intersectionWithStartBorder = intersectionWithStartBorder;
                    roadObj.roadSectionObjArr[i].intersectionWithEndBorder = intersectionWithEndBorder;
                }
            });
        }

        /************************
         Virtual Helper Stripes
        ************************/

        function constructVirtualHelperStripe(roadSectionObj) {
            const component = document.getElementById(roadSectionObj.id);
            const width = component.getAttribute("width");
            const depth = component.getAttribute("depth");
            const position = component.getAttribute("position");

            let virtualHelperStripe = {
                width, depth, position
            }

            let clone = adjustDimensionsAndPosition(roadSectionObj, virtualHelperStripe);
            // give the clone a direction to place his ramp to district
            clone.direction = roadSectionObj.direction;
            return clone;
        }

        function adjustDimensionsAndPosition(roadSectionObj, virtualHelperStripe) {
            let clone = {}; // Initialize clone as an empty object
            switch (roadSectionObj.direction) {
                case "up": {
                    clone.width = virtualHelperStripe.width * (1 - glbShrinkPct);
                    clone.depth = virtualHelperStripe.depth;
                    clone.position = { ...virtualHelperStripe.position }; // clone position object
                    clone.position.x -= glbStripesOffset;
                    break;
                }
                case "down": {
                    clone.width = virtualHelperStripe.width * (1 - glbShrinkPct);
                    clone.depth = virtualHelperStripe.depth;
                    clone.position = { ...virtualHelperStripe.position };
                    clone.position.x += glbStripesOffset;
                    break;
                }
                case "left": {
                    clone.width = virtualHelperStripe.width;
                    clone.depth = virtualHelperStripe.depth * (1 - glbShrinkPct);
                    clone.position = { ...virtualHelperStripe.position }; 
                    clone.position.z += glbStripesOffset;
                    break;
                }
                case "right": {
                    clone.width = virtualHelperStripe.width;
                    clone.depth = virtualHelperStripe.depth * (1 - glbShrinkPct);
                    clone.position = { ...virtualHelperStripe.position }; 
                    clone.position.z -= glbStripesOffset;
                    break;
                }
            }
            return clone;
        }
        

        /************************
            Direction Helper
        ************************/

        function getDirectionForInitialRoadSection(initialRoadSectionObj) {
            // initial roadSections direction is based on startElement position
            // this also included isCalled roads, as their order gets reversed to keep startElement as reference
            const initialRoadSectionMidPoint = document.getElementById(initialRoadSectionObj.id).getAttribute("position");
            const startElementMidPoint = glbStartElementComponent.getAttribute("position");
            const directionMap = {
                right: initialRoadSectionMidPoint.x < startElementMidPoint.x,
                left: initialRoadSectionMidPoint.x > startElementMidPoint.x,
                up: initialRoadSectionMidPoint.z > startElementMidPoint.z,
                down: initialRoadSectionMidPoint.z < startElementMidPoint.z,
            };
            const direction = Object.keys(directionMap).find(key => directionMap[key]);
            return direction;
        }

        function getDirectionOfAdjacentRoadSections(currentRoadSectionObj, refRoadSectionObj) {
            const refDirection = refRoadSectionObj.direction;
            const currentMidPoint = document.getElementById(currentRoadSectionObj.id).getAttribute("position");
            const refMidPoint = document.getElementById(refRoadSectionObj.id).getAttribute("position");
            // imagine a compass turning its needle based on your direction: here, assigned directions depend on reference directions
            switch (refDirection) {
                case "left":
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z === refMidPoint.z) return "left";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "up";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "down";
                    break;

                case "right":
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z === refMidPoint.z) return "right";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "up";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "down";
                    break;

                case "down":
                    if (currentMidPoint.x === refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "down";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "left";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z < refMidPoint.z) return "right";
                    break;

                case "up":
                    if (currentMidPoint.x === refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "up";
                    if (currentMidPoint.x > refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "left";
                    if (currentMidPoint.x < refMidPoint.x && currentMidPoint.z > refMidPoint.z) return "right";
                    break;
            }
        }

        /************************
           Intersection Helper
        ************************/

        function getRoadSectionIntersection(currentRoadSectionObj, refRoadSectionObj) {
            const virtualHelperStripeOfCurrent = constructVirtualHelperStripe(currentRoadSectionObj);
            const virtualHelperStripeOfRef = constructVirtualHelperStripe(refRoadSectionObj);
            const virtualRoadSectionIntersection = calculateRoadSectionIntersectionMidpoint(virtualHelperStripeOfCurrent, virtualHelperStripeOfRef)
            return virtualRoadSectionIntersection;
        }

        function calculateRoadSectionIntersectionMidpoint(virtualHelperStripeOfCurrent, virtualHelperStripeOfRef) {
            const currentPos = virtualHelperStripeOfCurrent.position
            const currentWidth = virtualHelperStripeOfCurrent.width
            const currentDepth = virtualHelperStripeOfCurrent.depth

            const refPos = virtualHelperStripeOfRef.position
            const refWidth = virtualHelperStripeOfRef.width
            const refDepth = virtualHelperStripeOfRef.depth

            // calculate extents of rectangles in both directions
            const currentLeftX = currentPos.x - currentWidth / 2;
            const currentRightX = currentPos.x + currentWidth / 2;
            const currentTopZ = currentPos.z - currentDepth / 2;
            const currentBottomZ = currentPos.z + currentDepth / 2;

            const refLeftX = refPos.x - refWidth / 2;
            const refRightX = refPos.x + refWidth / 2;
            const refTopZ = refPos.z - refDepth / 2;
            const refBottomZ = refPos.z + refDepth / 2;

            // calculate intersection region
            const intersectionLeftX = Math.max(currentLeftX, refLeftX);
            const intersectionRightX = Math.min(currentRightX, refRightX);
            const intersectionTopZ = Math.max(currentTopZ, refTopZ);
            const intersectionBottomZ = Math.min(currentBottomZ, refBottomZ);

            // Calculate midpoint of intersection region
            const intersectionMidpointX = (intersectionLeftX + intersectionRightX) / 2;
            const intersectionMidpointZ = (intersectionTopZ + intersectionBottomZ) / 2;
            const intersectionMidpoint = { x: intersectionMidpointX, z: intersectionMidpointZ };

            return intersectionMidpoint;
        }

        function getDistrictIntersection(roadSectionObj, isFinal) {
            const virtualHelperStripe = constructVirtualHelperStripe(roadSectionObj);
            const virtualDistrictIntersection = calculateDistrictIntersection(virtualHelperStripe, isFinal)
            return virtualDistrictIntersection;
        }

        function calculateDistrictIntersection(virtualHelperStripe, isFinal) {
            const direction = virtualHelperStripe.direction;
            const width = virtualHelperStripe.width;
            const depth = virtualHelperStripe.depth;
            const position = virtualHelperStripe.position;
            let delta;

            switch (direction) {
                case "left": {
                    isFinal ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x + delta,
                        z: position.z,
                    }
                }
                case "right": {
                    isFinal ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x - delta,
                        z: position.z,
                    }
                }
                case "down": {
                    isFinal ? delta = depth / 2 : delta = - depth / 2
                    return {
                        x: position.x,
                        z: position.z - delta,
                    }
                }
                case "up": {
                    isFinal ? delta = depth / 2 : delta = - depth / 2
                    return {
                        x: position.x,
                        z: position.z + delta,
                    }
                }
            }
        }

        /************************
              Other Helper
        ************************/

        function getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap) {
            const roadObjsInCallsRelation = getRoadObjsInCallsRelation(relatedRoadObjsMap);
            const roadObjsInIsCalledRelation = getRoadObjsInIsCalledRelation(relatedRoadObjsMap);
            const reversedIsCalledRoadObjs = roadObjsInIsCalledRelation.map(roadObj => ({
                ...roadObj,
                roadSectionObjArr: [...roadObj.roadSectionObjArr].reverse(),
            }));
            const roadObjAdjustedArr = [...roadObjsInCallsRelation, ...reversedIsCalledRoadObjs];
            return roadObjAdjustedArr;
        }

        function getRoadObjsInCallsRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId === glbStartElementComponent.id); // startElement calls other elements
        }

        function getRoadObjsInIsCalledRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startElementId != glbStartElementComponent.id); // startElement is called by other elements
        }

        return {
            getRoadObjSectionPropsArr,
        };
    })();
};