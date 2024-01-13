const createRoadColorHelper = function (controllerConfig) {
    return (function () {

        function initialize() {
            console.log(controllerConfig)
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        // handle roadSection coloring and offset by state
        function handleRoadSectionEmphasizing(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - handleRoadSectionEmphasizing – ${state} - unknown state, return`
                    return;
                }
                const roadSectionEntity = document.getElementById(roadSectionId)
                const isRamp = roadSectionProperties.isRamp;
                colorRoadSections(roadSectionEntity, controllerConfig.roadColors[state])
                offsetRoadSectionsY(roadSectionEntity, state, isRamp)
            });
        }

        // reset all coloring and offset
        function resetRoadSectionEmphasizing(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - resetRoadSectionEmphasizing – ${state} - unknown state, return`
                    return;
                }
                roadSectionEntity = document.getElementById(roadSectionId)
                resetColorRoadSections(roadSectionEntity)
                resetOffsetRoadSectionsY(roadSectionEntity, state)
            });
        }

        function colorRoadSections(roadSectionEntity, color) {
            canvasManipulator.changeColorOfEntities([ roadSectionEntity ], color, { name: controllerConfig.name });
        }

        function resetColorRoadSections(roadSectionEntity) {
            canvasManipulator.changeColorOfEntities([ roadSectionEntity ], "black", { name: controllerConfig.name });
        }

        function offsetRoadSectionsY(roadSectionEntity, state, isRamp) {
            isRamp? offsetY = 0.05 : offsetY = 0.04
            canvasManipulator.alterPositionOfEntities([ roadSectionEntity ], {deltaY: offsetY});
        }

        function resetOffsetRoadSectionsY(roadSectionEntity, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([ roadSectionEntity ], {deltaY: - offsetY}); // apply negative offset
        }

        return {
            initialize,
            handleRoadSectionEmphasizing,
            resetRoadSectionEmphasizing,
        };
    })();
};