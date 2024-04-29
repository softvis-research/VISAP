const createLegendHtmlHelper = function (controllerConfig) {
    return (function () {

        let globalVariant;

        function initialize() {
            globalVariant = controllerConfig.roadHighlightVariant;
        }

        function getLegendInnerHtml() {
            console.log(globalVariant)
            if(globalVariant === "MultiColorStripes") {
                return innerText = ""
            };
            if(globalVariant === "ParallelColorStripes") {
                return innerText = `
                <p>
                    <span style="display: inline-block; width: 20px; height: 20px; background-color: 
                    ${controllerConfig.colorsParallelColorStripes.calls}; vertical-align: middle; border: 3px solid black;"></span>
                    <span style="color: black; padding: 5px;">calls</span>
                </p>
                <p>
                    <span style="display: inline-block; width: 20px; height: 20px; background-color: 
                    ${controllerConfig.colorsParallelColorStripes.isCalled}; vertical-align: middle; border: 3px solid black;"></span>
                    <span style="color: black; padding: 5px;">isCalled</span>
                </p>
                `
            } 
            return;
        }

        function getLegendDimPropsObj() {
            if(globalVariant === "MultiColorStripes") {
                return dimProps = {}
            };
            if(globalVariant === "ParallelColorStripes") {
                return dimProps = {
                    width: 100,
                    height: 100,
                }
            }
        }

        return {
            initialize,
            getLegendInnerHtml,
            getLegendDimPropsObj,
        };

    })();
};
