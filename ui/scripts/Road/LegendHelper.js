const createLegendHelper = function (controllerConfig) {
	return (function () {

        function createLegend() {
            application.loadCSS("scripts/Road/legend.css");

            const canvas = document.getElementById("canvas");
    
            let legendDivElement = application.createDiv("legend");
            createLegendItem(legendDivElement, "calls", controllerConfig.roadColors.calls);
            createLegendItem(legendDivElement, "isCalled", controllerConfig.roadColors.isCalled);
            createLegendItem(legendDivElement, "bidirectionalCall", controllerConfig.roadColors.bidirectionalCall);
            createLegendItem(legendDivElement, "ambiguous", controllerConfig.roadColors.ambiguous);
    
            canvas.appendChild(legendDivElement);
            const legendElement = document.getElementById("legend");
            legendElement.style.display = 'none';
            legendVisible = false;
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
			createLegend: createLegend,
            showLegend: showLegend,
            hideLegend: hideLegend,
		};
	})();
};
