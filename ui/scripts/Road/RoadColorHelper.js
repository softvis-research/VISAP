const createRoadColorHelper = function (controllerConfig) {
    return (function (controllerConfig) {
        const colors = {
            ambiguous: "white",
            calls: "turquoise",
            isCalled: "green",
            bidirectionalCall: "magenta",
        }

        const roadOffsetY = {
            ambiguous: 0.005,
            calls: 0.002,
            isCalled: 0.006,
            bidirectionalCall: 0.004,
        }

        function initialize(setupConfig) {
            application.transferConfigParams(setupConfig, controllerConfig);
            legendHelper = createLegendHelper(colors)
            legendHelper.createLegend()
        }

        function handleRoadSectionStates(roadSectionStatesMap, roadSectionStatesDefinition) {
            legendHelper.showLegend()
            roadSectionStatesMap.forEach((state, roadSection) => {
                switch (state) {
                    case roadSectionStatesDefinition.calls:
                        colorRoadSections(roadSection, colors.calls)
                        offsetRoadSectionsY(roadSection, roadOffsetY.calls)
                        break;

                    case roadSectionStatesDefinition.isCalled:
                        colorRoadSections(roadSection, colors.isCalled)
                        offsetRoadSectionsY(roadSection, roadOffsetY.isCalled)
                        break;

                    case roadSectionStatesDefinition.bidirectionalCall:
                        colorRoadSections(roadSection, colors.bidirectionalCall)
                        offsetRoadSectionsY(roadSection, roadOffsetY.bidirectionalCall)
                        break;

                    case roadSectionStatesDefinition.ambiguous:
                        colorRoadSections(roadSection, colors.ambiguous)
                        offsetRoadSectionsY(roadSection, roadOffsetY.ambiguous)
                        break;

                    default:
                        console.log("Unknown state 1");
                }
            });
        }

        function resetRoadSectionStateHandling(roadSectionStatesMap, roadSectionStatesDefinition) {
            legendHelper.hideLegend()
            roadSectionStatesMap.forEach((state, roadSection) => {
                resetColorRoadSections(roadSection)
                switch (state) {
                    case roadSectionStatesDefinition.calls:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.calls)
                        break;

                    case roadSectionStatesDefinition.isCalled:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.isCalled)
                        break;

                    case roadSectionStatesDefinition.bidirectionalCall:
                        resetOffsetRoadSectionsY(roadSection, roadOffsetY.bidirectionalCall)
                        break;

                    case roadSectionStatesDefinition.ambiguous:
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
            canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - offsetY);
        }

        return {
            initialize: initialize,
            handleRoadSectionStates: handleRoadSectionStates,
            resetRoadSectionStateHandling: resetRoadSectionStateHandling,
        };

    })(controllerConfig);
};