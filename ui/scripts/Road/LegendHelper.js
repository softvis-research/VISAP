const createLegendHelper = function (controllerConfig) {
	return (function (controllerConfig) {

        function createLegend() {
            application.loadCSS("scripts/Road/legend.css");

            const canvas = document.getElementById("canvas");
    
            let legendDivElement = application.createDiv("legend");
            createLegendItem(legendDivElement, "calls", controllerConfig.emphasizeColors.calls);
            createLegendItem(legendDivElement, "isCalled", controllerConfig.emphasizeColors.isCalled);
            createLegendItem(legendDivElement, "bidirectionalCall", controllerConfig.emphasizeColors.bidirectionalCall);
            createLegendItem(legendDivElement, "ambiguous", controllerConfig.emphasizeColors.ambiguous);
    
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
        
            const whiteBox = document.createElement("DIV");
            whiteBox.classList.add("white-box");
        
            const legendText = document.createElement("SPAN");
            legendText.textContent = text;
        
            whiteBox.appendChild(legendText);
            legendItem.appendChild(coloredBox);
            legendItem.appendChild(whiteBox);
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
	})(controllerConfig);
};
