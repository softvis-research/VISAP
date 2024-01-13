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
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `createRoadColorHelper - handleRoadSectionStates – ${state} - unknown state, return`
                    return;
                }
                colorRoadSections(roadSection, controllerConfig.roadColors[state])
                offsetRoadSectionsY(roadSection, state)
            });
        }

        // reset all coloring and offset
        function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
                const state = roadSectionProperties.state;
                if (!Object.values(controllerConfig.relationTypes).includes(state)) {
                    text: `createRoadColorHelper - handleRoadSectionStateHandling – ${state} - unknown state, return`
                    return;
                }
                resetColorRoadSections(roadSection)
                resetOffsetRoadSectionsY(roadSection, state)
            });
        }

        function colorRoadSections(roadSection, color) {
            canvasManipulator.changeColorOfEntities([{ id: roadSection }], color, { name: controllerConfig.name });
        }

        function resetColorRoadSections(roadSection) {
            canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: controllerConfig.name });
        }

        function offsetRoadSectionsY(roadSection, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([{ id: roadSection }], {deltaY: offsetY});
        }

        function resetOffsetRoadSectionsY(roadSection, state) {
            offsetY = roadOffsetY[state];
            canvasManipulator.alterPositionOfEntities([{ id: roadSection }], {deltaY: - offsetY}); // apply negative offset
        }

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };
    })();
};