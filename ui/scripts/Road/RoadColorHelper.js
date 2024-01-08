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
            if(controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        // handle roadSection coloring and offset by state
        function handleRoadSectionStates(roadSectionStatesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
            roadSectionStatesMap.forEach((state, roadSection) => {
                switch (state) {
                    case controllerConfig.relationTypes.calls:
                        colorRoadSections(roadSection, controllerConfig.roadColors.calls)
                        offsetRoadSectionsY(roadSection, roadOffsetY.calls)
                        break;

                    case controllerConfig.relationTypes.isCalled:
                        colorRoadSections(roadSection, controllerConfig.roadColors.isCalled)
                        offsetRoadSectionsY(roadSection, roadOffsetY.isCalled)
                        break;

                    case controllerConfig.relationTypes.bidirectionalCall:
                        colorRoadSections(roadSection, controllerConfig.roadColors.bidirectionalCall)
                        offsetRoadSectionsY(roadSection, roadOffsetY.bidirectionalCall)
                        break;

                    case controllerConfig.relationTypes.ambiguous:
                        colorRoadSections(roadSection, controllerConfig.roadColors.ambiguous)
                        offsetRoadSectionsY(roadSection, roadOffsetY.ambiguous)
                        break;
                }
            });
        }

        // reset all coloring and offset
        function resetRoadSectionStateHandling(roadSectionStatesMap) {
            if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
            roadSectionStatesMap.forEach((state, roadSection) => {
                resetColorRoadSections(roadSection)
                switch (state) {
                    case controllerConfig.relationTypes.calls:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.calls)
                        break;

                    case controllerConfig.relationTypes.isCalled:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.isCalled)
                        break;

                    case controllerConfig.relationTypes.bidirectionalCall:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.bidirectionalCall)
                        break;

                    case controllerConfig.relationTypes.ambiguous:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.ambiguous)
                        break;

                    default:
                        console.log("Unknown state");
                }
            });
        }

        function colorRoadSections(roadSection, color) {
            canvasManipulator.changeColorOfEntities([{ id: roadSection }], color, { name: "roadController" });
        }

        function resetColorRoadSections(roadSection) {
            canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
        }

        function offsetRoadSectionsY(roadSection, offsetY) {
            canvasManipulator.alterPositionOfEntities([{ id: roadSection }], offsetY);
        }

        function resetOffsetRoadSectionsY(roadSection, offsetY) {
            canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - offsetY); // apply negative offset
        }

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };

    })();
};