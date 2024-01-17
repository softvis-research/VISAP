const createMultiColorStripesHelper = function (controllerConfig) {
    return (function () {

        let legendHelper;

        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();

        let globalRoadSectionStateMap = new Map();

        const globalScene = document.querySelector("a-scene");

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        function highlightRelatedRoadsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            handleLegendForAction("select");
            handleRoadStripsCreation();
        }

        function handleRoadStripsCreation() {
            setRoadSectionStatesMap();
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnStripesForRoadObj(roadObj);
                if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns();
            })
        }

        function setRoadSectionStatesMap() {

            function isArrayContainsOnly(arr, value) {
                return arr.length > 0 && arr.every(item => item === value);
            }

            const roadSectionIdsAllRelationsMap = getMapOfAllRelationsOfRoadSections();
            console.log(roadSectionIdsAllRelationsMap);

            roadSectionIdsAllRelationsMap.forEach((relationsArr, roadSectionId) => {
                let state;

                switch (true) {
                    case isArrayContainsOnly(relationsArr, "calls"):
                        state = "calls";
                        break;
                    case isArrayContainsOnly(relationsArr, "isCalled"):
                        state = "isCalled";
                        break;
                    case isArrayContainsOnly(relationsArr, "bidirectionalCall"):
                        state = "bidirectionalCall";
                        break;
                    default:
                        state = "undecided";
                }
                globalRoadSectionStateMap.set(roadSectionId, state);
            });
        }

        function getMapOfAllRelationsOfRoadSections() {

            function addRelationIfNotEmpty(roadSectionIds, relation, resultMap) {
                roadSectionIds.forEach(id => {
                    if (!resultMap.has(id)) {
                        resultMap.set(id, [relation]);
                    } else {
                        resultMap.get(id).push(relation);
                    }
                });
            }

            const roadSectionIdsAllRelationsMap = new Map();

            const destinationsOfStartRoadSectionIds = roadModel.getRoadSectionIdsForStartElementId(globalStartElementComponent.id);
            const startAsDestinationRoadSectionIds = roadModel.getRoadSectionIdsForDestinationElementId(globalStartElementComponent.id);

            console.log(destinationsOfStartRoadSectionIds)
            console.log(startAsDestinationRoadSectionIds)

            const bidirectionalCallRoadSectionIds = destinationsOfStartRoadSectionIds.filter(id => startAsDestinationRoadSectionIds.includes(id));
            const callsRoadSectionIds = destinationsOfStartRoadSectionIds.filter(id => !startAsDestinationRoadSectionIds.includes(id));
            const isCalledRoadSectionIds = startAsDestinationRoadSectionIds.filter(id => !destinationsOfStartRoadSectionIds.includes(id));

            addRelationIfNotEmpty(bidirectionalCallRoadSectionIds, "bidirectionalCall", roadSectionIdsAllRelationsMap);
            console.log(bidirectionalCallRoadSectionIds)
            addRelationIfNotEmpty(callsRoadSectionIds, "calls", roadSectionIdsAllRelationsMap);
            console.log(callsRoadSectionIds)
            addRelationIfNotEmpty(isCalledRoadSectionIds, "isCalled", roadSectionIdsAllRelationsMap);
            console.log(isCalledRoadSectionIds)

            return roadSectionIdsAllRelationsMap;
        }

        function spawnStripesForRoadObj(roadObj) {

            function createStripeComponent(stripeId) {
                const stripeComponent = document.createElement("a-entity");
                stripeComponent.setAttribute("id", stripeId);
                return stripeComponent;
            }

            roadObj.roadSectionArr.forEach(roadSectionId => {
                if (globalRoadSectionStateMap.get(roadSectionId)) {
                    const stripeId = roadSectionId + "_stripe";
                    stripeComponent = createStripeComponent(stripeId);
                    setStripeComponentProperties(stripeComponent, roadObj, roadSectionId);
                    globalScene.appendChild(stripeComponent);
                }
            })
        }

        function setStripeComponentProperties(stripeComponent, roadObj, roadSectionId) {
            roadSectionComponent = document.getElementById(roadSectionId)

            const originalPosition = roadSectionComponent.getAttribute("position");
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            const isStartRamp = determineIfRoadSectionIsStartRamp(roadObj, roadSectionId)
            const isEndRamp = determineIfRoadSectionIsEndRamp(roadObj, roadSectionId)

            isStartRamp || isEndRamp ? offsetY = 0.51 : offsetY = 0.5;
            const stripePosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeComponent.setAttribute("position", stripePosition);
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.5}; height: 0.1; depth: ${originalDepth - 0.5}`);
            const color = determineColorOfRoadSectionIdByState(roadSectionId)
            stripeComponent.setAttribute("material", `color: ${color}`);
            return stripeComponent;
        }

        function determineIfRoadSectionIsStartRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[0] === roadSectionId;
        }

        function determineIfRoadSectionIsEndRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[roadObj.roadSectionArr.length - 1] === roadSectionId;
        }

        function determineColorOfRoadSectionIdByState(roadSectionId) {
            const state = globalRoadSectionStateMap.get(roadSectionId);
            return controllerConfig.colorsMultiColorStripes[state];
        }

        function resetRoadsHighlight() {
            handleLegendForAction("unselect");
        }

        function handleLegendForAction(action) {
            if (controllerConfig.showLegendOnSelect) {
                switch (action) {
                    case "select": legendHelper.showLegend(); break;
                    case "unselect": legendHelper.hideLegend(); break;
                }
            }
        }

        // helpers

        return {
            initialize,
            highlightRelatedRoadsForStartElement,
            resetRoadsHighlight,
        };
    })();
};