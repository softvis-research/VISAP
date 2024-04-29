const createParallelColorStripesHelper = function (controllerConfig) {
    return (function () {

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
            if (controllerConfig.showLegendOnSelect) globalLegendHtmlHelper = createLegendHtmlHelper(controllerConfig)
            globalRoadSectionPropertiesHelper = createRoadSectionPropertiesHelper();
        }

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartElement(startElementComponent, relatedRoadObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedRoadObjsMap;
            handleParallelStripsCreation();
        }

        function resetRoadsHighlight() {
            const scene = document.querySelector('a-scene');
            scene.object3D.remove(...scene.object3D.children.filter(child => child instanceof THREE.Mesh));

            // Remove tubes
            scene.object3D.remove(...scene.object3D.children.filter(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.TubeGeometry));
        }

        /************************
                Stripes
        ************************/

        function handleParallelStripsCreation() {
            roadObjSectionPropertiesArr = globalRoadSectionPropertiesHelper
                .getRoadObjSectionPropertiesArr(globalStartElementComponent, globalRelatedRoadObjsMap);
            roadObjSectionPropertiesArr.forEach(roadObj => {
                const laneSide = getLaneSideForRoadObj(roadObj);
                console.log(laneSide)

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

                    const offset = getOffsetMapping(laneSide, roadSectionObj);
                    sphere.position.set(roadSectionObj.intersection.x + offset.x, 1, roadSectionObj.intersection.z + offset.z)
                    scene.object3D.add(sphere);
                }
            })
        }

        function drawSpheresOnRamps(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const sphereRadius = 0.2;
            roadObj.roadSectionObjArr.forEach(roadSectionObj => {
                const offset = getOffsetMapping(laneSide, roadSectionObj);

                if (roadSectionObj.intersectionWithStartBorder != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "cyan" });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(roadSectionObj.intersectionWithStartBorder.x + offset.x, 1, roadSectionObj.intersectionWithStartBorder.z + offset.z);
                    scene.object3D.add(sphere);
                }

                if (roadSectionObj.intersectionWithEndBorder != null) {
                    const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
                    const material = new THREE.MeshBasicMaterial({ color: "green" });
                    const sphere = new THREE.Mesh(geometry, material);
                    sphere.position.set(roadSectionObj.intersectionWithEndBorder.x + offset.x, 1, roadSectionObj.intersectionWithEndBorder.z + offset.z);
                    scene.object3D.add(sphere);
                }
            })
        }

        function drawTubesBetweenIntersections(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.2;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const intersections = roadObj.roadSectionObjArr.filter(roadSectionObj => roadSectionObj.intersection != null)

            for (let i = 1; i < intersections.length; i++) {
                const startIntersection = intersections[i - 1].intersection;
                const endIntersection = intersections[i].intersection;

                const offsetStart = getOffsetMapping(laneSide, intersections[i - 1]);
                const offsetEnd = getOffsetMapping(laneSide, intersections[i]);

                const lineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startIntersection.x + offsetStart.x, 1, startIntersection.z + offsetStart.z),
                    new THREE.Vector3(endIntersection.x + offsetEnd.x, 1, endIntersection.z + offsetEnd.z)
                );

                const tubeGeometry = new THREE.TubeGeometry(lineCurve, 64, tubeRadius, 8, false);
                const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
                scene.object3D.add(tubeMesh);
            }
        }

        function drawTubesToStartEndElement(roadObj, laneSide) {
            const scene = document.querySelector('a-scene');
            const tubeRadius = 0.2;
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: "red" });

            const lastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 1];
            const startElement = roadObj.roadSectionObjArr[0];

            const offsetStart = getOffsetMapping(laneSide, startElement);
            const offsetEnd = getOffsetMapping(laneSide, lastElement);


            if (startElement.intersection && startElement.intersectionWithStartBorder) {
                const startLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(startElement.intersectionWithStartBorder.x + offsetStart.x, 1, startElement.intersectionWithStartBorder.z + offsetStart.z),
                    new THREE.Vector3(startElement.intersection.x + offsetStart.x, 1, startElement.intersection.z + offsetStart.z)
                );

                const startTubeGeometry = new THREE.TubeGeometry(startLineCurve, 64, tubeRadius, 8, false);
                const startTubeMesh = new THREE.Mesh(startTubeGeometry, tubeMaterial);
                scene.object3D.add(startTubeMesh);
            }
            if (lastElement.intersectionWithEndBorder) {
                predecessorOfLastElement = roadObj.roadSectionObjArr[roadObj.roadSectionObjArr.length - 2]
                const endLineCurve = new THREE.LineCurve3(
                    new THREE.Vector3(lastElement.intersectionWithEndBorder.x + offsetEnd.x, 1, lastElement.intersectionWithEndBorder.z + offsetEnd.z),
                    new THREE.Vector3(predecessorOfLastElement.intersection.x + offsetEnd.x, 1, predecessorOfLastElement.intersection.z + offsetEnd.z)
                );
                const endTubeGeometry = new THREE.TubeGeometry(endLineCurve, 64, tubeRadius, 8, false);
                const endTubeMesh = new THREE.Mesh(endTubeGeometry, tubeMaterial);
                scene.object3D.add(endTubeMesh);
            }
        }


        function getOffsetMapping(laneSide, roadSectionObj) {
            const direction = roadSectionObj.direction;
            const predecessorDirection = roadSectionObj.predecessorDirection;
            const successorDirection = roadSectionObj.successorDirection;
            let x = 0;
            let z = 0;

            return { x, z };
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