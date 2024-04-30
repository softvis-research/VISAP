const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

        let glbRoadSectionPropertiesHelper;
        let glbstartDistrictComponent;
        let glbRelatedRoadObjsMap = new Map();

        // storing UUIDs from spawned Three Meshes to remove them when district is unselected
        let glbMeshIdArr = [];


        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) glbLegendHtmlHelper = createLegendHtmlHelper(controllerConfig)
            glbRoadSectionPropertiesHelper = createRoadSectionPropertiesHelper();
        }

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartDistrict(startDistrictComponent, relatedRoadObjsMap) {
            glbstartDistrictComponent = startDistrictComponent;
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
            roadObjSectionPropertiesArr = glbRoadSectionPropertiesHelper
                .getRoadObjSectionPropsArr(glbstartDistrictComponent, glbRelatedRoadObjsMap);
            roadObjSectionPropertiesArr.forEach(roadObj => {
                const laneSide = getLaneSideForRoadObj(roadObj);


                if (laneSide === "right") {
                    drawSpheresOnMidpoints(roadObj, laneSide);
                    drawTubesBetweenIntersections(roadObj, laneSide);
                    drawSpheresOnRamps(roadObj, laneSide);
                    drawTubesToStartEndElement(roadObj, laneSide)
                } else {
                    drawSpheresOnMidpoints(roadObj, laneSide);
                    drawTubesBetweenIntersections(roadObj, laneSide);
                    drawSpheresOnRamps(roadObj, laneSide);
                    drawTubesToStartEndElement(roadObj, laneSide)
                }

            })
        }

        function drawSpheresOnMidpoints(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;

            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                if (roadSectionObj.intersection != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "lime" });
                    const sphere = new THREE.Mesh(geometry, material);

                    sphere.position.set(roadSectionObj.intersection.x, 1, roadSectionObj.intersection.z)
                    glbMeshIdArr.push(sphere.uuid)
                    scene.object3D.add(sphere);
                }
            })
        }

        function drawSpheresOnRamps(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;
        
            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
        
                function drawSphere(intersection, color) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(intersection.x, 1, intersection.z);
                    glbMeshIdArr.push(sphere.uuid);
                    scene.object3D.add(sphere);
                }
        
                if (roadSectionObj.intersectionWithStartBorder != null) {
                    drawSphere(roadSectionObj.intersectionWithStartBorder, "cyan");
                }
        
                if (roadSectionObj.intersectionWithEndBorder != null) {
                    drawSphere(roadSectionObj.intersectionWithEndBorder, "green");
                }
            });
        }

        function drawTubesBetweenIntersections(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.2;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const intersections = roadObj.roadSectionObjArr.filter(roadSectionObj => roadSectionObj.intersection != null)

            for (let i = 1; i < intersections.length; i++) {
                const startIntersection = intersections[i - 1].intersection;
                const endIntersection = intersections[i].intersection;

                const lineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startIntersection.x, 1, startIntersection.z),
                    new THREE.Vector3(endIntersection.x, 1, endIntersection.z)
                );

                const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
                const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                glbMeshIdArr.push(tubeMesh.uuid)
                scene.object3D.add(tubeMesh);
            }
        }

        function drawTubesToStartEndElement(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.2;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const lastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
            const startElement = roadObj.roadSectionObjArr[0];

            if (startElement.intersection && startElement.intersectionWithStartBorder) {
                const startLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startElement.intersectionWithStartBorder.x, 1, startElement.intersectionWithStartBorder.z),
                    new THREE.Vector3(startElement.intersection.x, 1, startElement.intersection.z)
                );

                const startTubeGeometry = new THREE.TubeGeometry(startLineCurve, 64, tubeRadius, 8, false);
                const startTubeMesh = new THREE.Mesh(startTubeGeometry, tubeMaterial);
                glbMeshIdArr.push(startTubeMesh.uuid)
                scene.object3D.add(startTubeMesh);
            }
            if (lastElement.intersectionWithEndBorder) {
                if (roadObj.roadSectionObjArr.length === 1) predecessorOfLastElement = roadObj.roadSectionObjArr[0]
                else predecessorOfLastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 2]
                const endLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(lastElement.intersectionWithEndBorder.x, 1, lastElement.intersectionWithEndBorder.z),
                    new THREE.Vector3(predecessorOfLastElement.intersection.x, 1, predecessorOfLastElement.intersection.z)
                );
                const endTubeGeometry = new THREE.TubeGeometry(endLineCurve, 64, tubeRadius, 8, false);
                const endTubeMesh = new THREE.Mesh(endTubeGeometry, tubeMaterial);
                glbMeshIdArr.push(endTubeMesh.uuid)
                scene.object3D.add(endTubeMesh);
            }
        }

        function getLaneSideForRoadObj(roadObj) {
            if (roadObj.startElementId === glbstartDistrictComponent.id) return "right";
            return "left"
        }

        function getColorForLane(laneSide) {
            if (laneSide === "right") return controllerConfig.colorsParallelColorStripes.calls;
            else return controllerConfig.colorsParallelColorStripes.isCalled;
        }

        return {
            initialize,
            startRoadHighlightActionsForStartDistrict,
            resetRoadsHighlight,
        };
    })();
};