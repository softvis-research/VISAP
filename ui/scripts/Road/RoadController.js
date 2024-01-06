controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
		emphasizeColors: {
            calls: "turquoise",
            isCalled: "green",
            bidirectionalCall: "magenta",
            ambiguous: "white",
        },

		emphasizedRoadOffsetY: 0.05,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],
		supportedRelationExpressions: ["calls", "isCalled", "bidirectional", "ambigous"],


	}

	let legendDivElement;
	let emphasizedRoadSectionStates = new Map();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		// LD TODO: Add logic for guideMode helper initialization here (if we plan to implement multiple modes)

		application.loadCSS("scripts/Road/legend.css");
		createLegend()
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
			startElementId = startElement[0].id
			handleRoadEmphasizingForStartElement(startElementId)
			showLegend() 
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		resetRoadEmphasizing();
	}

	function controlRoadSectionEmphasizingStates(roadSections, roadType) {
        
        // Y offset to dodge overlaps
        const offset = 0.05
        const step = 0.0001
        const emphasizedRoadOffsetY = {
            calls: offset,
            isCalled: offset + step,
            bidirectional: offset + 2*step,
            ambigous: offset + 3*step
        }

        roadSections.forEach(roadSection => {
            canvasManipulator.changeColorOfEntities([{ id: roadSection }], controllerConfig.emphasizeColors[roadType], { name: "roadController" });
            if (!emphasizedRoadSectionStates.has(roadSection)) {
                canvasManipulator.alterPositionOfEntities([{ id: roadSection }], emphasizedRoadOffsetY[roadType]) 
            }
            emphasizedRoadSectionStates.set(roadSection, roadType)
        });
    }

	function handleRoadEmphasizingForStartElement(startElementId) {
		let roadSections = model.getAllRoadSectionsForStartElement(startElementId)
		controlRoadSectionEmphasizingStates(roadSections, "calls");
		const destinationElements = model.getAllRoadStartElementsForDestinationElement(destinationElemenId = startElementId);
		destinationElements.forEach(destinationElement => {
			roadSections = model.getAllRoadSectionsForStartElement(destinationElement)
			controlRoadSectionEmphasizingStates(roadSections, "isCalled")
		})
		roadSections = model.getAllBidirectionalRoadSectionsForStartElement(startElementId);
		controlRoadSectionEmphasizingStates(roadSections, "bidirectionalCall")
	}

	function resetRoadEmphasizing() {
		console.log(emphasizedRoadSectionStates)
		legendDivElement.style.display = 'none';
		emphasizedRoadSectionStates.forEach((_, roadSection) =>  {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
			canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - controllerConfig.emphasizedRoadOffsetY)
		});
		emphasizedRoadSectionStates.clear();
		hideLegend()
	}

	function createLegend() {
        const canvas = document.getElementById("canvas");

        legendDivElement = application.createDiv("legend");
        createLegendItem(legendDivElement, "Calls", controllerConfig.emphasizeColors.calls);
        createLegendItem(legendDivElement, "Is Called", controllerConfig.emphasizeColors.isCalled);
        createLegendItem(legendDivElement, "Bidirectional Call", controllerConfig.emphasizeColors.bidirectionalCall);
        createLegendItem(legendDivElement, "Ambiguous", controllerConfig.emphasizeColors.ambiguous);

        canvas.appendChild(legendDivElement);
		const legendElement = document.getElementById("legend");
        legendElement.style.display = 'none';
        legendVisible = false;
    }

    function createLegendItem(parentElement, text, color) {
        const legendItem = document.createElement("DIV");
        legendItem.classList.add("legend-item");
        legendItem.style.backgroundColor = color;

        const legendText = document.createElement("SPAN");
        legendText.textContent = text;

        legendItem.appendChild(legendText);
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
		initialize: initialize,
	};
}();