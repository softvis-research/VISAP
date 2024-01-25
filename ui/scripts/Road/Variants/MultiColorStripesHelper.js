const createMultiColorStripesHelper = function (controllerConfig) {
    return (function () {
        
        // TODO: Refactor to grab necessary attributes from RoadSectionPropertiesHelper

        let globalDomHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();
        let globalRoadSectionStateMap = new Map();
        const globalScene = document.querySelector("a-scene");


        /************************
            Public Functions
        ************************/

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                globalDomHelper = createDomHelper(controllerConfig);
                globalDomHelper.initialize();
                globalDomHelper.createLegend(
                    [
                        { text: "calls", color: controllerConfig.colorsMultiColorStripes.calls },
                        { text: "isCalled", color: controllerConfig.colorsMultiColorStripes.isCalled },
                        { text: "bidirectionalCall", color: controllerConfig.colorsMultiColorStripes.bidirectionalCall },
                        { text: "undecided", color: controllerConfig.colorsMultiColorStripes.undecided },
                    ]);
            }
        }

        // entry for all logical actions leading to the offered visualization by this variant in GUI
        function startRoadHighlightActionsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            globalDomHelper.handleLegendForAction("select");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("select", globalRelatedRoadObjsMap)
            handleRoadStripsCreation();
        }

        function resetRoadsHighlight() {
            globalDomHelper.handleLegendForAction("unselect");
            globalDomHelper.handleUnrelatedEntityMonochromacyForAction("unselect", globalRelatedRoadObjsMap)
            globalDomHelper.removeComponentByIdMarking("_stripe");
        }

        /************************
           Road Section States
        ************************/

        // setting individual states roadSections based on its inherent relations
        function setRoadSectionStatesMap() {

            function isArrayContainsOnly(arr, value) {
                return arr.length > 0 && arr.every(item => item === value);
            }

            const roadSectionIdsAllRelationsMap = getMapOfAllRelationsOfRoadSections();

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

        // map all inherent relation types states of roadSectios. These can be multiple as different roads can merge
        function getMapOfAllRelationsOfRoadSections() {

            const roadSectionIdsAllRelationsMap = new Map();
            // get both directions
            const destinationOfStartElementIdArr = getDestinationOfStartElementIdArr();
            const startAsDestinationElementIdArr = getStartAsDestinationElementIdArr()
            
            const bidirectionalCallElementIds = destinationOfStartElementIdArr.filter(id => startAsDestinationElementIdArr.includes(id));
            const callsElementIds = destinationOfStartElementIdArr.filter(id => !startAsDestinationElementIdArr.includes(id));
            const isCalledElementIds = startAsDestinationElementIdArr.filter(id => !destinationOfStartElementIdArr.includes(id));

            addRelationsToRoadSectionRelationMap(bidirectionalCallElementIds, "bidirectionalCall", roadSectionIdsAllRelationsMap);
            addRelationsToRoadSectionRelationMap(callsElementIds, "calls", roadSectionIdsAllRelationsMap);
            addRelationsToRoadSectionRelationMap(isCalledElementIds, "isCalled", roadSectionIdsAllRelationsMap);

            return roadSectionIdsAllRelationsMap;
        }

        // start calls other elements
        function getDestinationOfStartElementIdArr() {
             return Array.from(globalRelatedRoadObjsMap.values())
            .filter(roadObj => roadObj.startElementId === globalStartElementComponent.id)
            .map(roadObj => roadObj.destinationElementId);
        }

        // other elements call start
        function getStartAsDestinationElementIdArr() {
            return Array.from(globalRelatedRoadObjsMap.values())
            .filter(roadObj => roadObj.startElementId != globalStartElementComponent.id)
            .map(roadObj => roadObj.startElementId);
        }

        function addRelationsToRoadSectionRelationMap(elementIdArr, relation, roadSectionIdsAllRelationsMap) {
            elementIdArr.forEach(elementId => {
                const roadSectionIds = roadModel.getRoadSectionIdsForUniqueElementIdRelation(elementId, globalStartElementComponent.id)
                roadSectionIds.forEach(roadSectionId => {
                    if (!roadSectionIdsAllRelationsMap.has(roadSectionId)) {
                        roadSectionIdsAllRelationsMap.set(roadSectionId, [relation]);
                    } else {
                        roadSectionIdsAllRelationsMap.get(roadSectionId).push(relation);
                    }
                });
            })
        }

        /************************
                Stripes
        ************************/

        function handleRoadStripsCreation() {
            setRoadSectionStatesMap();
            globalRelatedRoadObjsMap.forEach(roadObj => {
                spawnStripesForRoadObj(roadObj);
                if (controllerConfig.spawnTrafficSigns) spawnTrafficSigns();
            })
        }

        function spawnStripesForRoadObj(roadObj) {
            roadObj.roadSectionArr.forEach(roadSectionId => {
                if (globalRoadSectionStateMap.get(roadSectionId)) {
                    const stripeId = roadSectionId + "_stripe"; // marking string to later handle related components
                    stripeComponent = createStripeComponent(stripeId);
                    setStripeComponentProperties(stripeComponent, roadObj, roadSectionId);
                    globalScene.appendChild(stripeComponent);
                }
            })
        }

        function createStripeComponent(stripeId) {
            const stripeComponent = document.createElement("a-entity");
            stripeComponent.setAttribute("id", stripeId);
            return stripeComponent;
        }

        // setting properties based on roadSection components the stripes will flow above
        function setStripeComponentProperties(stripeComponent, roadObj, roadSectionId) {
            roadSectionComponent = document.getElementById(roadSectionId)

            const originalPosition = roadSectionComponent.getAttribute("position");
            const originalWidth = roadSectionComponent.getAttribute("width");
            const originalDepth = roadSectionComponent.getAttribute("depth");

            const isStartRamp = determineIfRoadSectionIsStartRamp(roadObj, roadSectionId)
            const isEndRamp = determineIfRoadSectionIsEndRamp(roadObj, roadSectionId)

            isStartRamp || isEndRamp ? offsetY = 0.51 : offsetY = 0.50; // small offset for ramps so they lie above undecided colors
            const stripePosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeComponent.setAttribute("position", stripePosition);
            stripeComponent.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.5}; height: 0.1; depth: ${originalDepth - 0.5}`);
            const color = determineColorOfRoadSectionIdByState(roadSectionId)
            stripeComponent.setAttribute("material", `color: ${color}`);
            return stripeComponent;
        }

        // startRamp: first roadSection of a road
        function determineIfRoadSectionIsStartRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[0] === roadSectionId;
        }

        // endRamp = last roadSection of a road
        function determineIfRoadSectionIsEndRamp(roadObj, roadSectionId) {
            return roadObj.roadSectionArr.length > 0 && roadObj.roadSectionArr[roadObj.roadSectionArr.length - 1] === roadSectionId;
        }

        function determineColorOfRoadSectionIdByState(roadSectionId) {
            const state = globalRoadSectionStateMap.get(roadSectionId);
            return controllerConfig.colorsMultiColorStripes[state];
        }

        return {
            initialize,
            startRoadHighlightActionsForStartElement,
            resetRoadsHighlight,
        };
    })();
};