const createRoadSectionPropertiesHelper = function (controllerConfig) {
    return (function () {

        let glbStartDistrictComponent;
        let glbStripesOffset = 0.2;
        let glbShrinkPct = 0.7;

        /************************
            Public Functions
        ************************/

        // returns a props map for individual roadSections where startDistrict serves as reference for every attribute
        function getRoadObjSectionPropsArr(startDistrictComponent, relatedRoadObjsMap) {
            glbStartDistrictComponent = startDistrictComponent;
            const roadObjSectionPropsArr = getRoadObjsWithAdjustedRoadSectionOrder(relatedRoadObjsMap);
            addDirectionOfRoadSectionsRelativeToStartDistrict(roadObjSectionPropsArr);
            addRoadSectionAdjustedIntersections(roadObjSectionPropsArr);
            console.log("props after step 2")
            console.log(roadObjSectionPropsArr)
            addDistrictIntersections(roadObjSectionPropsArr);
            console.log("props after step 3")
            console.log(roadObjSectionPropsArr)
            //console.log(roadObjSectionPropsArr)
            return roadObjSectionPropsArr;
        }

       /************************
               Adjusting
       ************************/

        function addDirectionOfRoadSectionsRelativeToStartDistrict(roadObjSectionPropsArr) {
            roadObjSectionPropsArr.forEach(roadObj => {
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

        function addRoadSectionAdjustedIntersections(roadObjSectionPropsArr) {
            roadObjSectionPropsArr.forEach(roadObj => {
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

        function addDistrictIntersections(roadObjSectionPropsArr) {
            roadObjSectionPropsArr.forEach(roadObj => {
                const length = roadObj.roadSectionObjArr.length;
                for (let i = 0; i < length; i++) {
                    roadObj.roadSectionObjArr[i].intersectionWithStartBorder = null;
                    roadObj.roadSectionObjArr[i].intersectionWithEndBorder = null;
                    if (i === 0) {
                        intersectionWithStartBorder = getDistrictIntersection(roadObj.roadSectionObjArr[i], isEnd = false);
                        roadObj.roadSectionObjArr[i].intersectionWithStartBorder = intersectionWithStartBorder;

                    } else if (i === length - 1) {
                        intersectionWithEndBorder = getDistrictIntersection(roadObj.roadSectionObjArr[i], isEnd = true);
                        roadObj.roadSectionObjArr[i].intersectionWithEndBorder = intersectionWithEndBorder;
                    }
                }
            });
        }

        /************************
         Virtual Helper Stripes
        ************************/

        function constructVirtualStripe(roadSectionObj) {
            console.log("the road Section Object in virtual stripes func")
            console.log(roadSectionObj)
            const component = document.getElementById(roadSectionObj.id);
            const width = component.getAttribute("width");
            const depth = component.getAttribute("depth");
            const position = component.getAttribute("position");

            let virtualStripe = { width, depth, position }

            let clone = adjustDimensionsAndPosition(roadSectionObj, virtualStripe);
            // give the clone a direction to place his ramp to district
            clone.direction = roadSectionObj.direction;
            return clone;
        }

        function adjustDimensionsAndPosition(roadSectionObj, virtualStripe, isRight = true) {
            let clone = {}; // Initialize clone as an empty object
            switch (roadSectionObj.direction) {
                case "up": {
                    clone.width = virtualStripe.width * (1 - glbShrinkPct);
                    clone.depth = virtualStripe.depth;
                    clone.position = { ...virtualStripe.position }; // clone position object
                    isRight ? clone.position.x -= glbStripesOffset : clone.position.x += glbStripesOffset
                    break;
                }
                case "down": {
                    clone.width = virtualStripe.width * (1 - glbShrinkPct);
                    clone.depth = virtualStripe.depth;
                    clone.position = { ...virtualStripe.position };
                    isRight ? clone.position.x += glbStripesOffset : clone.position.x -= glbStripesOffset
                    break;
                }
                case "left": {
                    clone.width = virtualStripe.width;
                    clone.depth = virtualStripe.depth * (1 - glbShrinkPct);
                    clone.position = { ...virtualStripe.position }; 
                    isRight ? clone.position.z += glbStripesOffset : clone.position.z -= glbStripesOffset;
                    break;
                }
                case "right": {
                    clone.width = virtualStripe.width;
                    clone.depth = virtualStripe.depth * (1 - glbShrinkPct);
                    clone.position = { ...virtualStripe.position }; 
                    isRight ? clone.position.z -= glbStripesOffset : clone.position.z += glbStripesOffset;
                    break;
                }
            }
            return clone;
        }
        

        /************************
            Direction Helper
        ************************/

        function getDirectionForInitialRoadSection(initialRoadSectionObj) {
            // initial roadSections direction is based on startDistrict position
            // this also included isCalled roads, as their order gets reversed to keep startDistrict as reference
            const initialRoadSectionMidPoint = document.getElementById(initialRoadSectionObj.id).getAttribute("position");
            const startDistrictMidPoint = glbStartDistrictComponent.getAttribute("position");
            const directionMap = {
                right: initialRoadSectionMidPoint.x < startDistrictMidPoint.x,
                left: initialRoadSectionMidPoint.x > startDistrictMidPoint.x,
                up: initialRoadSectionMidPoint.z > startDistrictMidPoint.z,
                down: initialRoadSectionMidPoint.z < startDistrictMidPoint.z,
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
            const virtualStripeOfCurrent = constructVirtualStripe(currentRoadSectionObj);
            const virtualStripeOfRef = constructVirtualStripe(refRoadSectionObj);
            const intersection = calculateRoadSectionIntersectionMidpoint(virtualStripeOfCurrent, virtualStripeOfRef)
            return intersection;
        }

        function calculateRoadSectionIntersectionMidpoint(virtualStripeOfCurrent, virtualStripeOfRef) {
            const currentPos = virtualStripeOfCurrent.position
            const currentWidth = virtualStripeOfCurrent.width
            const currentDepth = virtualStripeOfCurrent.depth

            const refPos = virtualStripeOfRef.position
            const refWidth = virtualStripeOfRef.width
            const refDepth = virtualStripeOfRef.depth

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

        function getDistrictIntersection(roadSectionObj, isEnd) {
            const virtualStripe = constructVirtualStripe(roadSectionObj);
            const virtualDistrictIntersection = calculateDistrictIntersection(virtualStripe, isEnd)
            return virtualDistrictIntersection;
        }

        function calculateDistrictIntersection(virtualStripe, isEnd) {
            const direction = virtualStripe.direction;
            const width = virtualStripe.width;
            const depth = virtualStripe.depth;
            const position = virtualStripe.position;
            let delta;

            switch (direction) {
                case "left": {
                    isEnd ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x + delta,
                        z: position.z,
                    }
                }
                case "right": {
                    isEnd ? delta = width / 2 : delta = - width / 2
                    return {
                        x: position.x - delta,
                        z: position.z,
                    }
                }
                case "down": {
                    isEnd ? delta = depth / 2 : delta = - depth / 2
                    return {
                        x: position.x,
                        z: position.z - delta,
                    }
                }
                case "up": {
                    isEnd ? delta = depth / 2 : delta = - depth / 2
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
            const reversedSectionsForIsCalledRoadObjs = roadObjsInIsCalledRelation.map(roadObj => ({
                ...roadObj,
                roadSectionObjArr: [...roadObj.roadSectionObjArr].reverse(),
            }));
            const roadObjSectionPropsArr = [...roadObjsInCallsRelation, ...reversedSectionsForIsCalledRoadObjs];
            return roadObjSectionPropsArr;
        }

        function getRoadObjsInCallsRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startDistrictId === glbStartDistrictComponent.id); // startDistrict calls other districts
        }

        function getRoadObjsInIsCalledRelation(relatedRoadObjsMap) {
            return Array.from(relatedRoadObjsMap.values())
                .filter(roadObj => roadObj.startDistrictId != glbStartDistrictComponent.id); // startDistrict is called by other districts
        }

        return {
            getRoadObjSectionPropsArr,
        };
    })();
};