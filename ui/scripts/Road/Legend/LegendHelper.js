const createLegendHelper = function (controllerConfig) {
    return (function () {

        function initialize() {
            application.loadCSS("scripts/Road/Legend/legend.css");
        }

        function createLegend(legendItems) {
            const canvas = document.getElementById("canvas");
            let legendDivElement = application.createDiv("legend");

            createLegendHeader(legendDivElement, "RELATIONS", "red")


            legendItems.forEach(item => {
                createLegendItem(legendDivElement, item.text, item.color);
            });


            canvas.appendChild(legendDivElement);
            const legendElement = document.getElementById("legend");
            legendElement.style.display = 'none';
            legendVisible = false;
        }

        function createLegendHeader(parentElement, text, color) {
            const legendItem = document.createElement("DIV");
            legendItem.classList.add("legend-header");

            const textBox = document.createElement("DIV");
            textBox.classList.add("text-box-header");

            const legendText = document.createElement("SPAN");
            legendText.textContent = text;

            textBox.appendChild(legendText);
            legendItem.appendChild(textBox);
            parentElement.appendChild(legendItem);
        }

        function createLegendItem(parentElement, text, color) {
            const legendItem = document.createElement("DIV");
            legendItem.classList.add("legend-item");

            const coloredBox = document.createElement("DIV");
            coloredBox.classList.add("colored-box");
            coloredBox.style.backgroundColor = color;

            const textBox = document.createElement("DIV");
            textBox.classList.add("text-box");

            const legendText = document.createElement("SPAN");
            legendText.textContent = text;

            textBox.appendChild(legendText);
            legendItem.appendChild(coloredBox);
            legendItem.appendChild(textBox);
            parentElement.appendChild(legendItem);
        }

        function showLegend() {
            const legendElement = document.getElementById("legend");
            legendElement.style.display = 'block';
            legendVisible = true;
        }

        function hideLegend() {
            const legendElement = document.getElementById("legend");
            legendElement.style.display = 'none';
            legendVisible = false;
        }

        return {
            initialize,
            createLegend,
            showLegend,
            hideLegend,
        };
    })();
};
