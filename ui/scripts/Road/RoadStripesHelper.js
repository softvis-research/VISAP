const createRoadStripesHelper = function (controllerConfig) {
    return (function () {

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        function handleRoadSectionEmphasizing(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - handleRoadSectionStates – ${state} - unknown state, return`
                    return;
                }
                const isRamp = roadSectionProperties.isRamp;
                const roadSectionEntity = document.getElementById(roadSectionId)
                createStripe(roadSectionEntity, isRamp, state)
                
                // spawn traffic signs on ramps
                if (controllerConfig.spawnTrafficSigns && isRamp && state !== controllerConfig.relationTypes.ambiguous) {
                    createTrafficSign(roadSectionEntity, state);
                }
            });
        }

        function resetRoadSectionEmphasizing() {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            resetTrafficSigns()
            removeStripes();
        }
       
        function createStripe(roadSectionEntity, isRamp, state) {
            const originalPosition = roadSectionEntity.getAttribute("position");
            const originalWidth = roadSectionEntity.getAttribute("width");
            const originalDepth = roadSectionEntity.getAttribute("depth");
            
            const stripeEntity = document.createElement("a-entity");
            const stripeID = roadSectionEntity.id + "_stripe";
            stripeEntity.setAttribute("id", stripeID);
            
            isRamp ? offsetY = 0.51 : offsetY = 0.5;
            const stripePosition = { x: originalPosition.x, y: originalPosition.y + offsetY, z: originalPosition.z };
            stripeEntity.setAttribute("position", stripePosition);
            
            stripeEntity.setAttribute("geometry", `primitive: box; width: ${originalWidth - 0.5}; height: 0.1; depth: ${originalDepth - 0.5}`);
            stripeEntity.setAttribute("material", `color: ${controllerConfig.roadColors[state]}`);
            
            const scene = document.querySelector("a-scene");
            scene.appendChild(stripeEntity);
        }

        function createTrafficSign(roadSectionEntity, state) {
            const color = controllerConfig.roadColors[state]
            const offsetY = 0.51
            const originalPosition = roadSectionEntity.getAttribute("position");
            
            const signEntity = document.createElement("a-entity");
            const signID = roadSectionEntity.id + "_sign";
            signEntity.setAttribute("id", signID);
            
            const signOffsetY = 1.2;
            const signPosition = { x: originalPosition.x, y: originalPosition.y + offsetY + signOffsetY, z: originalPosition.z };
            signEntity.setAttribute("position", signPosition);
            
            // use standard mesh primitives for the traffic sign
            signEntity.setAttribute("geometry", "primitive: box; width: 0.9; height: 0.1; depth: 0.9");
            signEntity.setAttribute("material", `color: ${color}`);
            
            // rotate the traffic sign
            signEntity.setAttribute("rotation", { x: 45, y: 45, z: 90 });
            
            const scene = document.querySelector("a-scene");
            scene.appendChild(signEntity);
        
            // create a cylinder as the foot of the traffic sign
            const footEntity = document.createElement("a-cylinder");
            const footID = roadSectionEntity.id + "_foot";
            footEntity.setAttribute("id", footID);
            
            const footPosition = { x: originalPosition.x, y: originalPosition.y + offsetY + 0.6, z: originalPosition.z };
            footEntity.setAttribute("position", footPosition);
            
            footEntity.setAttribute("radius", 0.1);
            footEntity.setAttribute("height", 1);
            footEntity.setAttribute("material", "color: silver");
        
            scene.appendChild(footEntity);
        }
        
        function resetTrafficSigns() {
            const signEntities = document.querySelectorAll('[id$="_sign"]');
            const footEntities = document.querySelectorAll('[id$="_foot"]');

            signEntities.forEach((signEntity) => {
                const scene = document.querySelector("a-scene");
                scene.removeChild(signEntity);
            });

            footEntities.forEach((footEntity) => {
                const scene = document.querySelector("a-scene");
                scene.removeChild(footEntity);
            });
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
            handleRoadSectionEmphasizing,
            resetRoadSectionEmphasizing,
        };
    })();
};