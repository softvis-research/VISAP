// const createRoadLinesHelper = function (controllerConfig) {
//     return (function () {

//         function initialize() {
//             console.log(controllerConfig)
//             if (controllerConfig.showLegendOnSelect) {
//                 legendHelper = createLegendHelper(controllerConfig)
//                 legendHelper.createLegend()
//             }
//         }

//         // handle roadSection coloring and offset by state
//         function handleRoadSectionStates(roadSectionRelativePropertiesMap) {
//             console.log(roadSectionRelativePropertiesMap)
//             if (controllerConfig.showLegendOnSelect) legendHelper.showLegend()
//             roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
//                 const state = roadSectionProperties.state;
//                 if (!Object.values(myObject).includes(state)) {
//                     text: `createRoadLinesHelper - handleRoadSectionStates – ${roadSectionProperties.state} - unknown state, return`
//                     return;
//                 }
//                 spawnLinesOverRoads(roadSection, roadSectionProperties.roadColors[state])
//             });
//         }

//         // reset all coloring and offset
//         function resetRoadSectionStateHandling(roadSectionRelativePropertiesMap) {
//             if (controllerConfig.showLegendOnSelect) legendHelper.hideLegend()
//             roadSectionRelativePropertiesMap.forEach((roadSectionProperties, roadSection) => {
//                 resetColorRoadSections(roadSection)
//                 const state = roadSectionProperties.state
//                 switch (state) {
//                     case controllerConfig.relationTypes.calls:
//                         resetOffsetRoadSectionsY(roadSection, roadOffsetY.calls)
//                         break;

//                     case controllerConfig.relationTypes.isCalled:
//                         resetOffsetRoadSectionsY(roadSection, roadOffsetY.isCalled)
//                         break;

//                     case controllerConfig.relationTypes.bidirectionalCall:
//                         resetOffsetRoadSectionsY(roadSection, roadOffsetY.bidirectionalCall)
//                         break;

//                     case controllerConfig.relationTypes.ambiguous:
//                         resetOffsetRoadSectionsY(roadSection, roadOffsetY.ambiguous)
//                         break;

//                     default:
//                         console.log("Unknown state");
//                 }
//             });
//         }

//         function colorRoadSections(roadSection, color) {
//             canvasManipulator.changeColorOfEntities([{ id: roadSection }], color, { name: controllerConfig.name });
//         }

//         function resetColorRoadSections(roadSection) {
//             canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: controllerConfig.name });
//         }

//         function offsetRoadSectionsY(roadSection, offsetY) {
//             canvasManipulator.alterPositionOfEntities([{ id: roadSection }], offsetY);
//         }

//         function resetOffsetRoadSectionsY(roadSection, offsetY) {
//             canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - offsetY); // apply negative offset
//         }

//         return {
//             initialize: initialize,
//             handleRoadSectionStates: handleRoadSectionStates,
//             resetRoadSectionStateHandling: resetRoadSectionStateHandling,
//         };

//     })();
// };