var canvasHoverController = (function () {

	//config parameters
	const controllerConfig = {
		hoverColor: "darkred",
		showQualifiedName: false,
		showVersion: false,
	};


	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		application.loadCSS("scripts/CanvasHover/ho.css");
	}

	function activate() {
		actionController.actions.mouse.hover.subscribe(handleOnMouseEnter);
		actionController.actions.mouse.unhover.subscribe(handleOnMouseLeave);

		createTooltipContainer();

		events.hovered.on.subscribe(onEntityHover);
		events.hovered.off.subscribe(onEntityUnhover);
	}

	function reset() {
		const hoveredEntities = events.hovered.getEntities();

		hoveredEntities.forEach(function (hoveredEntity) {
			const unHoverEvent = {
				sender: canvasHoverController,
				entities: [hoveredEntity]
			};

			events.hovered.off.publish(unHoverEvent);
		});
	}

	function createTooltipContainer() {
		const canvas = document.getElementById("canvas");

		const tooltipDivElement = application.createDiv("tooltip");
		createParagraphAsChildOf(tooltipDivElement, "tooltipName");
		if (controllerConfig.showQualifiedName) {
			createParagraphAsChildOf(tooltipDivElement, "tooltipQualifiedName");
		}
		if (controllerConfig.showVersion) {
			createParagraphAsChildOf(tooltipDivElement, "tooltipVersion");
		}
		canvas.appendChild(tooltipDivElement);
	}

	function createParagraphAsChildOf(parentElement, paragraphId) {
		const paragraph = document.createElement("P");
		paragraph.id = paragraphId;
		parentElement.appendChild(paragraph);
		return paragraph;
	}

	function handleOnMouseEnter(eventObject) {
		const entity = model.getEntityById(eventObject.target.id);
		if (entity === undefined) {
			return;
		}

		const applicationEvent = {
			sender: canvasHoverController,
			entities: [entity],
			posX: eventObject.layerX,
			posY: eventObject.layerY
		};
		events.hovered.on.publish(applicationEvent);
	}

	function handleOnMouseLeave(eventObject) {
		const entity = model.getEntityById(eventObject.target.id);
		if (entity === undefined) {
			return;
		}

		const applicationEvent = {
			sender: canvasHoverController,
			entities: [entity]
		};
		events.hovered.off.publish(applicationEvent);
	}

	function onEntityHover(applicationEvent) {
		const entity = applicationEvent.entities[0];

		if (entity === undefined) {
			events.log.error.publish({ text: "Entity is not defined" });
		}
		if (entity.isTransparent) {
			return;
		}

		let entityIsVisible = document.getElementById(entity.id).getAttribute('visible');
		if (!entityIsVisible) {
			return;
		}
		if (entity.type === "text") {
			return;
		}

		canvasManipulator.changeColorOfEntities([entity], controllerConfig.hoverColor, { name: "canvasHoverController" });

		$("#tooltipName").html(getTooltipName(entity));

		if (controllerConfig.showQualifiedName) {
			$("#tooltipQualifiedName").text(entity.qualifiedName);
		}
		if(controllerConfig.showVersion) {
			$("#tooltipVersion").text("Version: " + entity.version);
		}

		const tooltip = $("#tooltip");
		tooltip.css("top", applicationEvent.posY + 50 + "px");
		tooltip.css("left", applicationEvent.posX + 50 + "px");
		tooltip.css("display", "block");
	}

	function onEntityUnhover(applicationEvent) {
		const entity = applicationEvent.entities[0];
		canvasManipulator.resetColorOfEntities([entity], { name: "canvasHoverController" });

		$("#tooltip").css("display", "none");
	}

	function getTooltipName(entity) {
		if(entity.type === "Reference"){
			return `Reference: ${entity.name}`;
		} else if (entity.type === "Namespace") {
			return `Package: ${entity.name}`;
		} else {
			const packages = entity.allParents.filter(parent => parent.type === "Namespace");
			if (packages.length === 0) {
				return `${entity.type}: ${entity.name}`;
			}

			const namespace = packages[0].name;
			if (entity.type === "Method" && entity.signature != "") {
				return `Package: ${namespace}<br/>${entity.type}: ${entity.signature}`;
			}
			return `Package: ${namespace}<br/>${entity.type}: ${entity.name}`;
		}
	}

	return {
		initialize: initialize,
		activate: activate,
		reset: reset,
		handleOnMouseEnter: handleOnMouseEnter,
		handleOnMouseLeave: handleOnMouseLeave
	};
})();
