controllers.canvasHoverController = (function () {

	//config parameters
	const controllerConfig = {
		hoverColor: "darkred",
		showQualifiedName: false,
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
        let sections = []; // Wir sammeln die Text-Blöcke und setzen die Linien am Ende automatisch

        // ── 1. Basis-Info (Paket & Name) ──
        let headerText = "";
        if (entity.type === "Reference") {
            headerText += `<b>Reference:</b> ${entity.name}`;
        } else if (entity.type === "Namespace") {
            headerText += `<b>Package:</b> ${entity.name}`;
        } else {
            const packages = entity.allParents.filter(parent => parent.type === "Namespace");
            if (packages.length > 0) {
                headerText += `<b>Package:</b> ${packages[0].name}<br/>`;
            }
            if (entity.type === "Method" && entity.signature) {
                headerText += `<b>${entity.type}:</b> ${entity.signature}`;
            } else {
                headerText += `<b>${entity.type}:</b> ${entity.name}`;
            }
        }
        if (headerText) sections.push(headerText);

        // ── 2. Lebenszyklus (Daten) ──
        // VISAP parst die Daten in echte Date-Objekte. Wir prüfen, ob sie gültig sind.
        let lifeText = "";
        if (entity.dateOfCreation && entity.dateOfCreation.getFullYear() > 1970) {
            lifeText += `<span style="color:#a6adc8">Erstellt:</span> ${entity.dateOfCreation.toLocaleDateString()}<br/>`;
        }
        if (entity.dateOfLastChange && entity.dateOfLastChange.getFullYear() > 1970) {
            lifeText += `<span style="color:#a6adc8">Geändert:</span> ${entity.dateOfLastChange.toLocaleDateString()}`;
        }

        lifeText = lifeText.replace(/<br\/>$/, "");
        if (lifeText) sections.push(lifeText);

        // ── 3. Typ-spezifische Informationen (Metriken & Beziehungen) ──
        let metricText = "";

        // WICHTIG: Wir nutzen jetzt entity.type, das garantiert von VISAP befüllt wird!
        switch (entity.type) {
            case "Class":
            case "Interface":
                if (entity.number_of_methods !== undefined) {
                    metricText += `<span style="color:#a6adc8">Methoden:</span> ${entity.number_of_methods}<br/>`;
                }
                if (entity.number_of_attributes !== undefined) {
                    metricText += `<span style="color:#a6adc8">Attribute:</span> ${entity.number_of_attributes}<br/>`;
                }
                break;

            case "Method":
            case "FunctionModule":
            case "FormRoutine":
            case "Report": // Hier fällt dein Report rein!
                if (entity.number_of_statements !== undefined) {
                    metricText += `<span style="color:#a6adc8">Code-Statements:</span> ${entity.number_of_statements}<br/>`;
                }
                if (entity.cyclomatic_complexity !== undefined) {
                    metricText += `<span style="color:#a6adc8">Komplexität:</span> ${entity.cyclomatic_complexity}<br/>`;
                }

                // Beziehungs-Zähler (Vernetzung im Code)
                if (entity.calls && entity.calls.length > 0) {
                    metricText += `<span style="color:#a6adc8">Ruft auf:</span> ${entity.calls.length} Elemente<br/>`;
                }
                if (entity.calledBy && entity.calledBy.length > 0) {
                    metricText += `<span style="color:#a6adc8">Wird aufgerufen von:</span> ${entity.calledBy.length} Elementen<br/>`;
                }
                break;

            case "Attribute":
                if (entity.accessedBy && entity.accessedBy.length > 0) {
                    metricText += `<span style="color:#a6adc8">Lese-/Schreibzugriffe:</span> ${entity.accessedBy.length}x<br/>`;
                }
                break;
        }

        metricText = metricText.replace(/<br\/>$/, "");
        if (metricText) sections.push(metricText);

        return sections.join('<hr style="margin: 6px 0; border: 0; border-top: 1px solid #45475a;" />');
    }

	return {
		initialize: initialize,
		activate: activate,
		reset: reset,
		handleOnMouseEnter: handleOnMouseEnter,
		handleOnMouseLeave: handleOnMouseLeave
	};
})();
