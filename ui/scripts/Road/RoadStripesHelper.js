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
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadLinesHelper - handleRoadSectionStates – ${state} - unknown state, return`
                    return;
                }
                createStripe(roadSection, controllerConfig.roadColors[state])
            });
        }

        function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
                removeStripes();
        }

        function createStripe(roadSectionId, color) {
            // Get the original position
            entity = document.getElementById(roadSectionId)
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
            colorStripes(clonedEntity.id, color)
        }

        function colorStripes(roadSectionId, color) {
            canvasManipulator.changeColorOfEntities([{ id: roadSectionId }], color, { name: controllerConfig.name });
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

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};