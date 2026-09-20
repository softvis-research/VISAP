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

	// Aktuell im Navigator fokussiertes Element – für dieses wird die Info dauerhaft angezeigt
	let selectionEntity = null;
	let selectionTrackingRequest = null;
	let lastSelectionPosition = { left: null, top: null };

	function activate() {
		actionController.actions.mouse.hover.subscribe(handleOnMouseEnter);
		actionController.actions.mouse.unhover.subscribe(handleOnMouseLeave);

		createTooltipContainer();
		createSelectionTooltipContainer();

		events.hovered.on.subscribe(onEntityHover);
		events.hovered.off.subscribe(onEntityUnhover);
	}

	function reset() {
		hideInfo();

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

	// Eigener Container für die dauerhaft eingeblendete Info des ausgewählten Elements.
	// Liegt am body (position: fixed), damit er unabhängig vom Canvas-Layout positioniert werden kann.
	function createSelectionTooltipContainer() {
		if (document.getElementById("selectionTooltip")) {
			return;
		}

		const selectionTooltipDivElement = application.createDiv("selectionTooltip");

		const header = document.createElement("DIV");
		header.id = "selectionTooltipHeader";
		header.textContent = "Ausgewähltes Element";
		selectionTooltipDivElement.appendChild(header);

		createParagraphAsChildOf(selectionTooltipDivElement, "selectionTooltipName");
		document.body.appendChild(selectionTooltipDivElement);
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

	// ── Info für das aktuell ausgewählte Element (Suche & Metrik) ─────────────
	/**
	 * Zeigt dieselben Informationen wie der Hover-Tooltip dauerhaft für das
	 * Element an, das gerade im Navigator fokussiert ist. So sieht der Nutzer
	 * die Details sofort, ohne das Element erst mit der Maus treffen zu müssen.
	 */
	function showInfoForEntity(entity) {
		if (entity === undefined || entity === null) {
			hideInfo();
			return;
		}

		const selectionTooltip = document.getElementById("selectionTooltip");
		if (!selectionTooltip) {
			return;
		}

		$("#selectionTooltipName").html(getTooltipName(entity));
		selectionTooltip.style.display = "block";

		selectionEntity = entity;
		lastSelectionPosition = { left: null, top: null };
		positionSelectionTooltip();
		startSelectionTracking();
	}

	function hideInfo() {
		selectionEntity = null;

		if (selectionTrackingRequest !== null) {
			cancelAnimationFrame(selectionTrackingRequest);
			selectionTrackingRequest = null;
		}

		const selectionTooltip = document.getElementById("selectionTooltip");
		if (selectionTooltip) {
			selectionTooltip.style.display = "none";
		}
	}

	// Die Kamera bewegt sich (Flug zum Element, Drehen, Zoomen) – die Info bleibt am Element kleben
	function startSelectionTracking() {
		if (selectionTrackingRequest !== null) {
			return;
		}

		const step = function () {
			selectionTrackingRequest = null;
			if (selectionEntity === null) {
				return;
			}
			positionSelectionTooltip();
			selectionTrackingRequest = requestAnimationFrame(step);
		};

		selectionTrackingRequest = requestAnimationFrame(step);
	}

	function positionSelectionTooltip() {
		const selectionTooltip = document.getElementById("selectionTooltip");
		if (!selectionTooltip || selectionEntity === null) {
			return;
		}

		const margin = 12;
		const width = selectionTooltip.offsetWidth || 240;
		const height = selectionTooltip.offsetHeight || 140;
		const screenPosition = projectEntityToScreen(selectionEntity);

		let left;
		let top;

		if (screenPosition === null) {
			// Element gerade nicht projizierbar (z.B. hinter der Kamera) – Info an fester Stelle zeigen
			left = window.innerWidth - width - margin;
			top = margin;
		} else {
			left = screenPosition.x + 28;
			top = screenPosition.y + 28;
		}

		left = Math.min(Math.max(left, margin), Math.max(window.innerWidth - width - margin, margin));
		top = Math.min(Math.max(top, margin), Math.max(window.innerHeight - height - margin, margin));

		// Nur schreiben, wenn sich wirklich etwas geändert hat – spart Layout-Arbeit pro Frame
		if (lastSelectionPosition.left === left && lastSelectionPosition.top === top) {
			return;
		}

		lastSelectionPosition = { left: left, top: top };
		selectionTooltip.style.left = left + "px";
		selectionTooltip.style.top = top + "px";
	}

	function projectEntityToScreen(entity) {
		try {
			const sceneElement = application.getCanvas() || document.querySelector("a-scene");
			if (!sceneElement || !sceneElement.camera || !sceneElement.canvas) {
				return null;
			}

			const projected = canvasManipulator.getCenterOfEntity(entity).clone().project(sceneElement.camera);
			if (projected.z > 1) {
				return null;
			}

			const canvasRect = sceneElement.canvas.getBoundingClientRect();
			return {
				x: canvasRect.left + (projected.x * 0.5 + 0.5) * canvasRect.width,
				y: canvasRect.top + (-projected.y * 0.5 + 0.5) * canvasRect.height
			};
		} catch (e) {
			// Entity hat möglicherweise noch kein Mesh
			return null;
		}
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

        // ── 4. Aktive Metrik-Layer ──
        if (typeof metricController !== "undefined" && typeof metrics !== "undefined") {
            const activeLayers = metricController.getActiveLayers();
            if (activeLayers.length > 0) {
                let activeMetricText = "";
                activeLayers.forEach(function(layer) {
                    const variant = layer.metric.variant;
                    const displayName = metrics[variant] || variant;
                    let value = entity[variant];
                    if (value === undefined || value === null) return;

                    const isDate = (variant === "dateOfCreation" || variant === "dateOfLastChange");
                    if (isDate) {
                        value = (value instanceof Date)
                            ? value.toLocaleDateString()
                            : new Date(value).toLocaleDateString();
                    }

                    activeMetricText += `<span style="color:#a6adc8">${displayName}:</span> ${value}<br/>`;
                });
                activeMetricText = activeMetricText.replace(/<br\/>$/, "");
                if (activeMetricText) sections.push(activeMetricText);
            }
        }

        return sections.join('<hr style="margin: 6px 0; border: 0; border-top: 1px solid #45475a;" />');
    }

	return {
		initialize: initialize,
		activate: activate,
		reset: reset,
		handleOnMouseEnter: handleOnMouseEnter,
		handleOnMouseLeave: handleOnMouseLeave,
		showInfoForEntity: showInfoForEntity,
		hideInfo: hideInfo
	};
})();
