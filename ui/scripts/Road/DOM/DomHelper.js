const createDomHelper = function (controllerConfig) {
    return (function () {

        let legendHelper;

        function initialize() {
            // legend ops
            legendHelper = createLegendHelper(controllerConfig);
            legendHelper.initialize();
        }

        function removeComponentByIdMarking(markingStr) {
            const components = document.querySelectorAll(`[id$="${markingStr}"]`);

            components.forEach((c) => {
                const scene = document.querySelector("a-scene");
                scene.removeChild(c);
            });
        }

        function createLegend(legendItems) {
            legendHelper.createLegend(legendItems)
        }

        function handleLegendForAction(action) {
            if (controllerConfig.showLegendOnSelect) {
                switch (action) {
                    case "select": legendHelper.showLegend(); break;
                    case "unselect": legendHelper.hideLegend(); break;
                }
            }
        }

        function handleUnrelatedEntityMonochromacyForAction(action, relatedRoadObjsMap) {
            if (controllerConfig.enableMonochromeForUnrelatedEntities) {

                const unrelatedEntities = getAllUnrelatedEntities(relatedRoadObjsMap);
                console.log(unrelatedEntities)
                
                switch (action) {
                    case "select": canvasManipulator.changeColorOfEntities(unrelatedEntities, "silver", { name: controllerConfig.name }); break;
                    case "unselect": canvasManipulator.resetColorOfEntities(unrelatedEntities, { name: controllerConfig.name }); break;
                }
            }
        }

        function getAllUnrelatedEntities(relatedRoadObjsMap) {
            const allEntities = model.getAllEntities();
            const unrelatedEntities = [];
        
            allEntities.forEach(entity => {
                const entityId = entity.id;
                const belongsToId = entity.belongsTo && entity.belongsTo.id;
                const entityType = entity.type
        
                const isUnrelated = !Array.from(relatedRoadObjsMap.values())
                    .some(({ startElementId, destinationElementId }) =>
                        entityId === startElementId || entityId === destinationElementId ||
                        belongsToId === startElementId || belongsToId === destinationElementId ||
                        entityType === "Namespace"
                    ) 
        
                if (isUnrelated) {
                    unrelatedEntities.push(entity);
                }
            });
        
            return unrelatedEntities;
        }

        return {
            initialize,
            removeComponentByIdMarking,
            createLegend,
            handleLegendForAction,
            handleUnrelatedEntityMonochromacyForAction,
        };
    })();
};