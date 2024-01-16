const createRoadColorHelper = function (controllerConfig) {
    return (function () {

        let legendHelper;
        let globalStartElementComponent;
        let globalRelatedRoadObjsMap = new Map();

        function initialize() {
            if (controllerConfig.showLegendOnSelect) {
                legendHelper = createLegendHelper(controllerConfig)
                legendHelper.createLegend()
            }
        }

        function highlightRelatedRoadsForStartElement(startElementComponent, relatedObjsMap) {
            globalStartElementComponent = startElementComponent;
            globalRelatedRoadObjsMap = relatedObjsMap;

            handleLegendForAction("select");
            handleRoadsColoring();
        }

        function handleRoadsColoring() {
            determineInvolvedRelationsOfRoadSections();
            mapColorsToRoadSectionRelations();
            assignOffsetsForColorSeparation();
        }

        function determineInvolvedRelationsOfRoadSections() {
            
        }




        function resetRoadsHighlight() {
            handleLegendForAction("unselect");
        }






        function handleLegendForAction(action) {
            if (controllerConfig.showLegendOnSelect) {
                switch(action) {
                    case "select": legendHelper.showLegend(); break;
                    case "unselect": legendHelper.hideLegend(); break;
                }
            }
        }

        return {
            initialize,
            highlightRelatedRoadsForStartElement,
            resetRoadsHighlight,
        };
    })();
};