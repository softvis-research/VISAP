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
                colorRoadSections(roadSectionId, controllerConfig.roadColors[state])
                offsetRoadSectionsY(roadSectionId, state)
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
                resetColorRoadSections(roadSectionId)
                resetOffsetRoadSectionsY(roadSectionId, state)
            });
        }

        function colorRoadSections(roadSectionId, color) {
            canvasManipulator.changeColorOfEntities([{ id: roadSectionId }], color, { name: controllerConfig.name });
        }

        function resetColorRoadSections(roadSectionId) {
            canvasManipulator.changeColorOfEntities([{ id: roadSectionId }], "black", { name: controllerConfig.name });
        }

        function offsetRoadSectionsY(roadSectionId, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([{ id: roadSectionId }], {deltaY: offsetY});
        }

        function resetOffsetRoadSectionsY(roadSectionId, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([{ id: roadSectionId }], {deltaY: - offsetY}); // apply negative offset
        }

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};