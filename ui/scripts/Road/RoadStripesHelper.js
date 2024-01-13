const createRoadStripesHelper = function (controllerConfig) {
    return (function () {

        function initialize() {
            console.log(controllerConfig)
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        // handle roadSection coloring and offset by state
        function handleRoadSectionStates(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - handleRoadSectionStates – ${state} - unknown state, return`
                    return;
                }
                const roadSectionEntity = document.getElementById(roadSectionId)
                console.log(roadSectionEntity)
                createStripe(roadSectionEntity, controllerConfig.roadColors[state])
            });
        }

        function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            removeStripes();
        }

        function createStripe(roadSectionEntity, color) {
            // Get the original position
            entity = document.getElementById(roadSectionEntity.id)
            const originalPosition = entity.getAttribute("position");

            // Clone the entity
            const clonedEntity = entity.cloneNode(true);
            clonedEntity.setAttribute("id", entity.id + "_stripe"); // Change the ID to avoid conflicts

            // Calculate the new position (move it up)
            const newPosition = { x: originalPosition.x, y: originalPosition.y + 1, z: originalPosition.z };

            // Set the cloned entity's position
            clonedEntity.setAttribute("position", newPosition);

            // Add the cloned entity to the scene
            const scene = document.querySelector("a-scene");
            scene.appendChild(clonedEntity);
            colorStripes(clonedEntity, color)
            adjustStripeProportions(clonedEntity)
        }

        function adjustStripeProportions(clonedEntity) {
            const isRotationHorizontal = checkIfRotationIsHorizontally(clonedEntity);
            console.log(isRotationHorizontal)
        
            if (isRotationHorizontal) {
                clonedEntity.setAttribute("depth", (clonedEntity.getAttribute("depth") - 1.5 )); 
                clonedEntity.setAttribute("width", (clonedEntity.getAttribute("width") - 0.5 )); 

            } else {
                clonedEntity.setAttribute("depth", (clonedEntity.getAttribute("depth") - 0.5 )); 
                clonedEntity.setAttribute("width", (clonedEntity.getAttribute("width") - 1.5 )); 
            }
        }

        function colorStripes(clonedEntity, color) {
            canvasManipulator.changeColorOfEntities([ clonedEntity ], color, { name: controllerConfig.name });
        }

        function removeStripes() {
            // Find all entities with "_stripe" at the end of the id
            const stripeEntities = document.querySelectorAll('[id$="_stripe"]');

            // Remove each found entity from the scene
            stripeEntities.forEach((stripeEntity) => {
                const scene = document.querySelector("a-scene");
                scene.removeChild(stripeEntity);
            });
        }

        function checkIfRotationIsHorizontally(roadSectionEntity) {
            
            console.log(roadSectionEntity)
        
            if (roadSectionEntity) {
                const width = roadSectionEntity.getAttribute("width");
                const depth = roadSectionEntity.getAttribute("depth");
                return width > depth;
            }
        }


        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};