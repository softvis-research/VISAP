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

        return {
            initialize,
            removeComponentByIdMarking,
            createLegend,
            handleLegendForAction,
        };
    })();
};