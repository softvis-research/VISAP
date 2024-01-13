const createRoadStripesHelper = function (controllerConfig) {
    return (function () {

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        function handleRoadSectionStates(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - handleRoadSectionStates – ${state} - unknown state, return`
                    return;
                }
                const isRamp = roadSectionProperties.isRamp;
                const roadSectionEntity = document.getElementById(roadSectionId)
                createStripe(roadSectionEntity, controllerConfig.roadColors[state], isRamp)
            });
        }

        function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            removeStripes();
        }

        function createStripe(roadSectionEntity, color, isRamp) {

            const originalPosition = roadSectionEntity.getAttribute("position");
            const originalWidth = roadSectionEntity.getAttribute("width");
            const originalDepth = roadSectionEntity.getAttribute("depth");
        
            const stripeEntity = document.createElement("a-entity");
            const newID = roadSectionEntity.id + "_stripe";
            stripeEntity.setAttribute("id", newID);

            isRamp ? offsetY = 0.51 : offsetY = 0.5;
        
            const newPosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeEntity.setAttribute("position", newPosition);
        
            stripeEntity.setAttribute("geometry", `primitive: box; width: ${originalWidth -0.5}; height: 0.1; depth: ${originalDepth -0.5}`);
            stripeEntity.setAttribute("material", `color: ${color}`);
        
            const scene = document.querySelector("a-scene");
            scene.appendChild(stripeEntity);
        }
        
    
        function checkIfRotationIsHorizontally(stripeEntity) {
        
            if (stripeEntity) {
                const width = stripeEntity.getAttribute("width");
                const depth = stripeEntity.getAttribute("depth");
                return width > depth;
            }
        }
        
        function removeStripes() {
            const stripeEntities = document.querySelectorAll('[id$="_stripe"]');

            stripeEntities.forEach((stripeEntity) => {
                const scene = document.querySelector("a-scene");
                scene.removeChild(stripeEntity);
            });
        }


        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};