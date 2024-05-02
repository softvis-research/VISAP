const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let glbRoadSectionPropertiesHelper;
        let glbRelatedRoadObjsMap = new Map();

        let glbStartDistrictComponent;
        let glbStripesOffset = 0.2;
        let glbShrinkPct = 0.7;


        // storing UUIDs from spawned Three Meshes to remove them when district is unselected
        let glbMeshIdArr = [];


        /************************
            Public Functions
        ************************/

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartDistrict(startDistrictComponent, relatedRoadObjsMap) {
            glbStartDistrictComponent = startDistrictComponent;
            glbRelatedRoadObjsMap = relatedRoadObjsMap;
            handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            const scene = document.querySelector('a-scene');
            scene.object3D.remove(...scene.object3D.children.filter(child => glbMeshIdArr.includes(child.uuid)));
            glbMeshIdArr = [];
        }

        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            adjustSectionOrderInRoadObjMap();
            addSectionPropsToRoadObjMap();
            console.log(glbRelatedRoadObjsMap)
            createMeshes();
        }

        function adjustSectionOrderInRoadObjMap() {
            // reverse roadSection order to keep start district as POV
            glbRelatedRoadObjsMap.forEach((roadObj, _) => {
                if (roadObj.startDistrictId !== glbStartDistrictComponent.id) {
                    roadObj.roadSectionObjArr.reverse();
                }
            });
        }

        function addSectionPropsToRoadObjMap() {
            addSectionDirections();
            addSectionCurveIntersections();
            addSectionDistrictIntersections();
        }

        function addSectionDirections() {
            glbRelatedRoadObjsMap.forEach((roadObj, _) => {
                const roadSectionObjArr = roadObj.roadSectionObjArr;

                // first sections direction is relativ to start district
                const initialRoadSectionObject = roadSectionObjArr[0]; 
                const refDirection = getDirectionForInitialRoadSection(initialRoadSectionObject)
                roadObj.roadSectionObjArr[0].direction = refDirection;

                // traverse the road from start to dest district
                for (let i = 1; i < roadObj.roadSectionObjArr.length; i++) {
                    const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                    const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
                    const currentDirection = getDirectionOfAdjacentRoadSections(currentRoadSectionObj, refRoadSectionObj);
                    roadObj.roadSectionObjArr[i].direction = currentDirection;
                }
            });
        }

        function getDirectionForInitialRoadSection(initialRoadSectionObject) {
            const initialSectionMidPoint = document.getElementById(initialRoadSectionObject.id).getAttribute("position");
            const startDistrictMidPoint = glbStartDistrictComponent.getAttribute("position");
            const directionMap = {
                right: initialSectionMidPoint.x < startDistrictMidPoint.x,
                left: initialSectionMidPoint.x > startDistrictMidPoint.x,
                up: initialSectionMidPoint.z > startDistrictMidPoint.z,
                down: initialSectionMidPoint.z < startDistrictMidPoint.z,
            };
            const refDirection = Object.keys(directionMap).find(key => directionMap[key]);
            return refDirection;
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

        function addSectionCurveIntersections() {
            glbRelatedRoadObjsMap.forEach((roadObj, _) => {
                arrLen = roadObj.roadSectionObjArr.length;
                if (arrLen = 1) roadObj.roadSectionObjArr[0].intersection = null;
                else {
                    for (let i = 1; i < arrLen; i++) {
                        const currentRoadSectionObj = roadObj.roadSectionObjArr[i];
                        const refRoadSectionObj = roadObj.roadSectionObjArr[i - 1];
        
                        if (currentRoadSectionObj.direction != refRoadSectionObj.direction) {
                            // a curve, adding intersection coordinates
                            currentRoadSectionObj.intersection, refRoadSectionObj.intersection
                                = getRoadSectionIntersection(roadObj, currentRoadSectionObj, refRoadSectionObj)
                        } else refRoadSectionObj.intersection = null;
                        const lastRoadSection = roadObj.roadSectionObjArr[arrLen - 1];
                        lastRoadSection.intersection = null;
                    }
                }
            });
        }

        function getRoadSectionIntersection(roadObj, currentRoadSectionObj, refRoadSectionObj) {
            // construct two virtual stripes adjusted proportions
            const virtualStripeOfCurrent = constructVirtualStripe(roadObj, currentRoadSectionObj);
            const virtualStripeOfRef = constructVirtualStripe(roadObj, refRoadSectionObj);

            // intersect these stripes to get curve midpoints 
            const intersection = calculateIntersectionMidpointOfTwoStripes(virtualStripeOfCurrent, virtualStripeOfRef)
            return intersection;
        }

        function constructVirtualStripe(roadObj, roadSectionObj) {
            // set pos flag for called/isCalled (left/right stripe)
            let isRight = true
            if(roadObj.startDistrictId != glbStartDistrictComponent.id) isRight = false;

            const component = document.getElementById(roadSectionObj.id);
            const width = component.getAttribute("width");
            const depth = component.getAttribute("depth");
            const position = component.getAttribute("position");
            const direction = roadSectionObj.direction;

            let virtualStripe = { width, depth, position, direction }

            // shrink and offset virtual stripe
            switch (virtualStripe.direction) {
                case "up": {
                    virtualStripe.width = virtualStripe.width * (1 - glbShrinkPct);
                    isRight ? virtualStripe.position.x -= glbStripesOffset : virtualStripe.position.x += glbStripesOffset
                    break;
                }
                case "down": {
                    virtualStripe.width = virtualStripe.width * (1 - glbShrinkPct);
                    isRight ? virtualStripe.position.x += glbStripesOffset : virtualStripe.position.x -= glbStripesOffset
                    break;
                }
                case "left": {
                    virtualStripe.depth = virtualStripe.depth * (1 - glbShrinkPct);
                    isRight ? virtualStripe.position.z += glbStripesOffset : virtualStripe.position.z -= glbStripesOffset;
                    break;
                }
                case "right": {
                    virtualStripe.depth = virtualStripe.depth * (1 - glbShrinkPct);
                    isRight ? virtualStripe.position.z -= glbStripesOffset : virtualStripe.position.z += glbStripesOffset;
                    break;
                }
            }
            return virtualStripe;
        }

        function calculateIntersectionMidpointOfTwoStripes(virtualStripeOfCurrent, virtualStripeOfRef) {
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

            // calculate midpoint of intersection region
            const intersectionMidpointX = (intersectionLeftX + intersectionRightX) / 2;
            const intersectionMidpointZ = (intersectionTopZ + intersectionBottomZ) / 2;
            const intersectionMidpoint = { x: intersectionMidpointX, z: intersectionMidpointZ };

            return intersectionMidpoint;
        }

        function addSectionDistrictIntersections() {
            glbRelatedRoadObjsMap.forEach((roadObj, _) => {
                const arrLen = roadObj.roadSectionObjArr.length;
                for (let i = 0; i < arrLen; i++) {
                    roadObj.roadSectionObjArr[i].intersectionWithStartBorder = null;
                    roadObj.roadSectionObjArr[i].intersectionWithEndBorder = null;
                    if (i === 0) {
                        intersectionWithStartBorder = getDistrictIntersection(roadObj, roadObj.roadSectionObjArr[i], isEnd = false);
                        roadObj.roadSectionObjArr[i].intersectionWithStartBorder = intersectionWithStartBorder;

                    } else if (i === arrLen - 1) {
                        intersectionWithEndBorder = getDistrictIntersection(roadObj, roadObj.roadSectionObjArr[i], isEnd = true);
                        roadObj.roadSectionObjArr[i].intersectionWithEndBorder = intersectionWithEndBorder;
                    }
                }
            });
        }

        function getDistrictIntersection(roadObj, roadSectionObj, isEnd) {
            const virtualStripe = constructVirtualStripe(roadObj, roadSectionObj);
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

        function createMeshes() {

        }

        




        //     roadObjSectionPropsArr = glbRoadSectionPropertiesHelper.getRoadObjSectionPropsArr(glbStartDistrictComponent, glbRelatedRoadObjsMap);
        //     roadObjSectionPropsArr.forEach(roadObj => {
        //         const laneSide = getLaneSideForRoadObj(roadObj);

                


        //         if (laneSide === "right") {
        //             drawSpheresOnMidpoints(roadObj, laneSide);
        //             drawTubesBetweenIntersections(roadObj, laneSide);
        //             drawSpheresOnRamps(roadObj, laneSide);
        //             drawTubesToStartEndElement(roadObj, laneSide)
        //         } else {
        //             drawSpheresOnMidpoints(roadObj, laneSide);
        //             drawTubesBetweenIntersections(roadObj, laneSide);
        //             drawSpheresOnRamps(roadObj, laneSide);
        //             drawTubesToStartEndElement(roadObj, laneSide)
        //         }

        //     })
        // }

        // function drawSpheresOnMidpoints(roadObj, laneSide) {
        //     const scene = document.querySelector('a-scene');
        //     const sphereRadius = 0.2;

        //     roadObj.roadSectionObjArr.forEach(roadSectionObj => {
        //         if (roadSectionObj.intersection != null) {
        //             const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        //             const material = new THREE.MeshBasicMaterial({ color: "lime" });
        //             const sphere = new THREE.Mesh(geometry, material);

        //             sphere.position.set(roadSectionObj.intersection.x, 1, roadSectionObj.intersection.z)
        //             glbMeshIdArr.push(sphere.uuid)
        //             scene.object3D.add(sphere);
        //         }
        //     })
        // }

        // function drawSpheresOnRamps(roadObj, laneSide) {
        //     const scene = document.querySelector('a-scene');
        //     const sphereRadius = 0.2;
        
        //     roadObj.roadSectionObjArr.forEach(roadSectionObj => {
        
        //         function drawSphere(intersection, color) {
        //             const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
        //             const material = new THREE.MeshBasicMaterial({ color });
        //             const sphere = new THREE.Mesh(geometry, material);
        //             sphere.position.set(intersection.x, 1, intersection.z);
        //             glbMeshIdArr.push(sphere.uuid);
        //             scene.object3D.add(sphere);
        //         }
        
        //         if (roadSectionObj.intersectionWithStartBorder != null) {
        //             drawSphere(roadSectionObj.intersectionWithStartBorder, "cyan");
        //         }
        
        //         if (roadSectionObj.intersectionWithEndBorder != null) {
        //             drawSphere(roadSectionObj.intersectionWithEndBorder, "green");
        //         }
        //     });
        // }

        // function drawTubesBetweenIntersections(roadObj, laneSide) {
        //     const scene = document.querySelector('a-scene');
        //     const tubeRadius = 0.2;
        //     const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

        //     const intersections = roadObj.roadSectionObjArr.filter(roadSectionObj => roadSectionObj.intersection != null)

        //     for (let i = 1; i < intersections.length; i++) {
        //         const startIntersection = intersections[i - 1].intersection;
        //         const endIntersection = intersections[i].intersection;

        //         const lineCurve = new THREE.LineCurve3(
        //             new THREE.Vector3(startIntersection.x, 1, startIntersection.z),
        //             new THREE.Vector3(endIntersection.x, 1, endIntersection.z)
        //         );

        //         const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
        //         const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
        //         glbMeshIdArr.push(tubeMesh.uuid)
        //         scene.object3D.add(tubeMesh);
        //     }
        // }

        // function drawTubesToStartEndElement(roadObj, laneSide) {
        //     const scene = document.querySelector('a-scene');
        //     const tubeRadius = 0.2;
        //     const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

        //     const lastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
        //     const startElement = roadObj.roadSectionObjArr[0];

        //     if (startElement.intersection && startElement.intersectionWithStartBorder) {
        //         const startLineCurve = new THREE.LineCurve3(
        //             new THREE.Vector3(startElement.intersectionWithStartBorder.x, 1, startElement.intersectionWithStartBorder.z),
        //             new THREE.Vector3(startElement.intersection.x, 1, startElement.intersection.z)
        //         );

        //         const startTubeGeometry = new THREE.TubeGeometry(startLineCurve, 64, tubeRadius, 8, false);
        //         const startTubeMesh = new THREE.Mesh(startTubeGeometry, tubeMaterial);
        //         glbMeshIdArr.push(startTubeMesh.uuid)
        //         scene.object3D.add(startTubeMesh);
        //     }
        //     if (lastElement.intersectionWithEndBorder) {
        //         if (roadObj.roadSectionObjArr.length === 1) predecessorOfLastElement = roadObj.roadSectionObjArr[0]
        //         else predecessorOfLastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 2]
        //         const endLineCurve = new THREE.LineCurve3(
        //             new THREE.Vector3(lastElement.intersectionWithEndBorder.x, 1, lastElement.intersectionWithEndBorder.z),
        //             new THREE.Vector3(predecessorOfLastElement.intersection.x, 1, predecessorOfLastElement.intersection.z)
        //         );
        //         const endTubeGeometry = new THREE.TubeGeometry(endLineCurve, 64, tubeRadius, 8, false);
        //         const endTubeMesh = new THREE.Mesh(endTubeGeometry, tubeMaterial);
        //         glbMeshIdArr.push(endTubeMesh.uuid)
        //         scene.object3D.add(endTubeMesh);
        //     }
        // }

        // function getLaneSideForRoadObj(roadObj) {
        //     if (roadObj.startElementId === glbStartDistrictComponent.id) return "right";
        //     return "left"
        // }

        // function getColorForLane(laneSide) {
        //     if (laneSide === "right") return controllerConfig.colorsParallelColorStripes.calls;
        //     else return controllerConfig.colorsParallelColorStripes.isCalled;
        // }

        return {
            startRoadHighlightActionsForStartDistrict,
            resetRoadsHighlight,
        };
    })();
};