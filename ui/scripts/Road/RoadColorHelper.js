const createRoadColorHelper = function (controllerConfig) {
    return (function () {

        // set an offset to handle stacked sections
        const roadOffsetY = {
            ambiguous: 0.005,
            calls: 0.002,
            isCalled: 0.006,
            bidirectionalCall: 0.004,
        }

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
                roadSectionEntity = document.getElementById(roadSectionId)
                colorRoadSections(roadSectionEntity, controllerConfig.roadColors[state])
                offsetRoadSectionsY(roadSectionEntity, state)
            });
        }

        // reset all coloring and offset
        function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSectionId) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `RoadColorHelper - handleRoadSectionStateHandling – ${state} - unknown state, return`
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

        function offsetRoadSectionsY(roadSectionEntity, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([ roadSectionEntity ], {deltaY: offsetY});
        }

        function resetOffsetRoadSectionsY(roadSectionEntity, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([ roadSectionEntity ], {deltaY: - offsetY}); // apply negative offset
        }

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};