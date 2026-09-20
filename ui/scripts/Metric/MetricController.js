controllers.metricController = (function () {
    const controllerConfig = {
        metrics: [
            metrics.dateOfCreation,
            metrics.dateOfLastChange,
            metrics.number_of_statements,
            metrics.amount_of_slin,
            metrics.number_of_object_references,
            metrics.number_of_exec_statements,
            metrics.maximum_nesting_depth,
            metrics.cyclomatic_complexity,
            metrics.keyword_named_variables,
            metrics.number_of_comments,
            metrics.halstead_difficulty,
            metrics.halstead_volume,
            metrics.halstead_effort,
            metrics.number_of_methods,
            metrics.number_of_interfaces,
            metrics.number_of_attributes,
            metrics.number_of_events,
            metrics.number_of_public_methods,
            metrics.number_of_redefined_methods,
            metrics.number_of_protected_methods,
            metrics.number_of_public_attributes,
            metrics.number_of_private_attributes,
            metrics.number_of_protected_attributes,
        ],
        mappings: [
            mappings.color,
            mappings.colorGradient,
            mappings.transparency,
            mappings.pulsation,
            mappings.flashing,
            mappings.rotation,
        ],
        views: [
            { name: "View 1", viewMappings: [] },
            { name: "View 2", viewMappings: [] },
            { name: "View 3", viewMappings: [] },
        ],
    };

    let domHelper;
    let layerCounter = 0;
    let layers = [];
    let viewConfig;

    // Alle Transparenz-/Farbeffekte der Navigation laufen unter diesem Namen
    const navigatorEffect = { name: "MetricNavigatorFocus" };

    let lastUnmatched = [];
    let lastInactive = [];
    let lastActive = [];
    // Merkt sich, ob der Hintergrund aktuell gedimmt ist, damit die Transparenz
    // nicht doppelt aufgetragen wird (jedes Auftragen landet auf einem Stack).
    let dimApplied = false;

    const metricDefault = { variant: undefined, from: 0, to: 0 };
    const mappingDefault = {
        variant: mappings.color,
        color: "white",
        startColor: "blue",
        endColor: "red",
        transparency: 0.5,
        period: 1000,
        scale: 2,
    };

    function initialize(setupConfig) {
        application.transferConfigParams(setupConfig, controllerConfig);
    }

    function activate(rootDiv) {
        domHelper = new DomHelper(rootDiv, controllerConfig);
        domHelper.buildUiHead();

        $(cssIDs.executeButton).click(() => executeButtonClicked());
        $(cssIDs.resetButton).click(() => resetButtonClicked());
        $(cssIDs.addLayerButton).click(() => addLayer());
        $(cssIDs.downloadViewConfigButton).click(() => downloadViewConfig());
        $(document).delegate(cssIDs.viewDropDown, "igcomboselectionchanged", () => changeView());

        // Der Dim-Schalter wird von Suche und Metrik Controller geteilt
        DimSettings.subscribe(applyDimming);

        // Wait for model data, then filter empty metrics and build the first layer
        var initInterval = setInterval(function() {
            try {
                if (typeof model !== "undefined" && typeof model.getAllEntities === "function") {
                    const entityMap = model.getAllEntities();
                    if (entityMap && entityMap.size > 0) {
                        clearInterval(initInterval);
                        filterAvailableMetrics();
                        addLayer();
                    }
                }
            } catch (e) {}
        }, 300);
    }

    function filterAvailableMetrics() {
        if (typeof model === "undefined" || typeof model.getAllEntities !== "function") return;
        const entityMap = model.getAllEntities();
        if (!entityMap || entityMap.size === 0) return;

        controllerConfig.metrics = controllerConfig.metrics.filter(function(metricLabel) {
            const metricKey = Object.keys(metrics).find(function(k) { return metrics[k] === metricLabel; });
            if (!metricKey) return true;
            const bounds = getMetricBounds(metricKey);
            return !bounds || bounds.min !== 0 || bounds.max !== 0;
        });
    }

    // ── Info-Box zum aktiven Treffer (identisch zur Hover-Information) ────────
    function showEntityInfo(entity) {
        if (typeof canvasHoverController !== "undefined" && typeof canvasHoverController.showInfoForEntity === "function") {
            canvasHoverController.showInfoForEntity(entity);
        }
    }

    function hideEntityInfo() {
        if (typeof canvasHoverController !== "undefined" && typeof canvasHoverController.hideInfo === "function") {
            canvasHoverController.hideInfo();
        }
    }

    function clearNavigatorFocus() {
        hideEntityInfo();

        if (typeof canvasManipulator !== "undefined") {
            if (lastUnmatched.length > 0) canvasManipulator.resetTransparencyOfEntities(lastUnmatched, navigatorEffect);
            if (lastInactive.length > 0) {
                canvasManipulator.resetColorOfEntities(lastInactive, navigatorEffect);
                canvasManipulator.resetTransparencyOfEntities(lastInactive, navigatorEffect);
            }
            if (lastActive.length > 0) {
                canvasManipulator.resetColorOfEntities(lastActive, navigatorEffect);
                canvasManipulator.resetTransparencyOfEntities(lastActive, navigatorEffect);
            }
        }

        if (typeof events !== "undefined" && events.selected && lastActive.length > 0) {
            events.selected.off.publish({ entities: lastActive });
        }

        lastUnmatched = [];
        lastInactive = [];
        lastActive = [];
        dimApplied = false;
    }

    // 🔴 NEU: Berechnet dynamisch den kleinsten und größten Wert einer Metrik aus den Model-Daten
    function getMetricBounds(metricVariant) {
        if (!metricVariant) return null;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        let isDate = (metricVariant === "dateOfCreation" || metricVariant === "dateOfLastChange");

        if (typeof model !== "undefined" && typeof model.getAllEntities === "function") {
            const entitiesMap = model.getAllEntities();
            for (const entity of entitiesMap.values()) {
                let val = entity[metricVariant];
                if (val !== undefined && val !== null) {
                    if (isDate) {
                        val = (val instanceof Date) ? val.getTime() : new Date(val).getTime();
                    }
                    if (typeof val === "number" && !isNaN(val)) {
                        if (val < min) min = val;
                        if (val > max) max = val;
                    }
                }
            }
        }

        // Fallback, falls die Metrik bei keinem Element existiert
        if (min === Number.POSITIVE_INFINITY) min = 0;
        if (max === Number.NEGATIVE_INFINITY) max = 0;

        return { min: min, max: max, isDate: isDate };
    }

    function executeButtonClicked() {
        clearNavigatorFocus();

        for (const layer of layers) {
            layer.reset();
            layer.readUIData();

            // 🔴 NEU: Strenge Validierung, bevor das Mapping ausgeführt wird!
            if (!layer.metric.variant) {
                alert(`Fehler in Layer ${layer.id}: Bitte wähle eine Metrik aus!`);
                return; // Bricht den Start ab
            }

            const bounds = getMetricBounds(layer.metric.variant);
            if (bounds) {
                if (layer.metric.from > layer.metric.to) {
                    alert(`Fehler in Layer ${layer.id}: Der Startwert darf nicht größer als der Endwert sein!`);
                    return;
                }

                // Prüft, ob der User absichtlich Werte außerhalb des Gültigkeitsbereichs eingetippt hat
                if (layer.metric.from < bounds.min || layer.metric.to > bounds.max) {
                    let minStr = bounds.isDate ? new Date(bounds.min).toLocaleDateString() : bounds.min;
                    let maxStr = bounds.isDate ? new Date(bounds.max).toLocaleDateString() : bounds.max;
                    alert(`Fehler in Layer ${layer.id}:\nDer erlaubte Bereich für "${metrics[layer.metric.variant]}" liegt zwischen ${minStr} und ${maxStr}.`);
                    return;
                }
            }
        }

        if (viewConfig && !viewEqualToMetricMappings(viewConfig, layers)) {
            $(cssIDs.viewDropDown).igCombo("clearInput", true);
        }

        executeMappingOnRender();
    }

    function changeView() {
        const selectedView = $(cssIDs.viewDropDown).igCombo("value");
        const newViewConfig = controllerConfig.views.find((view) => view.name === selectedView);
        if (!newViewConfig) {
            events.log.error.publish({ text: `MetricController - view ${selectedView} not found` });
        } else {
            viewConfig = newViewConfig;
        }

        reset();

        viewConfig.viewMappings.forEach(function (metricMapping) {
            addLayer(metricMapping);
        });

        for (const layer of layers) {
            domHelper.setLayerUI(layer);
        }

        executeMappingOnRender();
    }

    function executeMapping() {
        let allMatchedEntities = [];

        for (const layer of layers) {
            layer.getMatchingEntities();
            layer.doMapping();
            allMatchedEntities = allMatchedEntities.concat(layer.entities);
        }

        const uniqueEntities = [...new Set(allMatchedEntities)];

        if (typeof NavigatorController !== "undefined") {
            if (uniqueEntities.length > 0) {
                let allEnts = [];
                if (typeof model !== "undefined" && typeof model.getAllEntities === "function") {
                    let entityMap = model.getAllEntities();
                    if (entityMap) allEnts = Array.from(entityMap.values());
                }

                // Non-matched EINMAL berechnen – Set für O(1)-Lookup statt O(n) indexOf
                const matchedSet = new Set(uniqueEntities.map(e => e.id));
                lastUnmatched = allEnts.filter(e => !matchedSet.has(e.id));

                // Hintergrund EINMAL dimmen – nicht bei jedem Navigator-Schritt
                if (typeof canvasManipulator !== "undefined") {
                    dimApplied = DimSettings.isEnabled();
                    if (dimApplied) {
                        canvasManipulator.changeTransparencyOfEntities(lastUnmatched, DimSettings.transparency.background, navigatorEffect);
                    }
                }

                NavigatorController.load(uniqueEntities, function(activeEntity, allResults) {
                    if (typeof canvasManipulator !== "undefined") {
                        // Nur die Elemente zurücksetzen, die sich vom letzten Schritt geändert haben
                        if (lastInactive.length > 0) {
                            canvasManipulator.resetColorOfEntities(lastInactive, navigatorEffect);
                            canvasManipulator.resetTransparencyOfEntities(lastInactive, navigatorEffect);
                        }
                        if (lastActive.length > 0) {
                            canvasManipulator.resetColorOfEntities(lastActive, navigatorEffect);
                            canvasManipulator.resetTransparencyOfEntities(lastActive, navigatorEffect);
                        }

                        lastInactive = allResults.filter(e => e.id !== activeEntity.id);
                        lastActive = [activeEntity];

                        canvasManipulator.changeColorOfEntities(lastInactive, "orange", navigatorEffect);
                        canvasManipulator.changeColorOfEntities(lastActive, "red", navigatorEffect);

                        // Bei ausgeschaltetem Dim bleibt die Szene komplett deckend –
                        // die Treffer werden dann nur über die Farbe hervorgehoben
                        if (DimSettings.isEnabled()) {
                            canvasManipulator.changeTransparencyOfEntities(lastInactive, DimSettings.transparency.inactiveHit, navigatorEffect);
                            canvasManipulator.changeTransparencyOfEntities(lastActive, DimSettings.transparency.activeHit, navigatorEffect);
                        }

                        canvasManipulator.flyToEntity(activeEntity);
                    }

                    // Die Hover-Information des aktiven Treffers direkt einblenden
                    showEntityInfo(activeEntity);

                    if (typeof events !== "undefined" && events.selected) {
                        events.selected.on.publish({ entities: [activeEntity] });
                    }
                });
            } else {
                hideEntityInfo();
                NavigatorController.hide();
            }
        }
    }

    async function executeMappingOnRender() {
        await canvasManipulator.waitForRenderOfElement(application.getCanvas());
        executeMapping();
    }

    function addLayer(metricMapping) {
        const newLayer = new MetricLayer(++layerCounter);

        if (metricMapping !== undefined) {
            newLayer.metric = metricMapping.metric;
            newLayer.mapping = metricMapping.mapping;
        }

        layers.push(newLayer);
        domHelper.buildUiLayer(layerCounter);

        if (layerCounter > 1) {
            $(cssIDs.deleteButton + (layerCounter - 1)).prop("disabled", true);
            $(cssIDs.deleteButton + (layerCounter - 1)).addClass("ui-state-disabled");
        }
    }

    function removeLayer(event) {
        if (event !== undefined && event.currentTarget.disabled) return;
        if (event !== undefined && layerCounter <= 1) return;

        layers.pop().reset();
        domHelper.destroyLayerUI(layerCounter--);

        if (layerCounter > 1) {
            var btn = document.getElementById(domIDs.deleteButton + layerCounter);
            if (btn) {
                btn.disabled = false;
                btn.classList.remove("ui-state-disabled");
            }
        }
    }

    function downloadViewConfig() {
        const viewName = prompt("Please enter View name", "View");
        if (viewName === null) return;

        let text = '{\n\tname: "' + viewName + '",\n\tviewMappings: [';
        for (const layer of layers) {
            layer.readUIData();
            text += "\n\t\t{\n\t\t\tmetric: " + JSON.stringify(layer.metric) + ",\n\t\t\tmapping: " + JSON.stringify(layer.mapping) + "\n\t\t},";
        }
        text = text.slice(0, -1);
        text += "\n\t]\n}";
        downloadObjectAsTxt("viewConfig" + viewName + ".txt", text);
    }

    function downloadObjectAsTxt(filename, text) {
        const pom = document.createElement("a");
        pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
        pom.setAttribute("download", filename);
        document.body.appendChild(pom);
        pom.click();
        pom.remove();
    }

    function viewEqualToMetricMappings(view, layers) {
        if (view.viewMappings.length != layers.length) return false;
        return layers.every((layer, index) =>
            isEqual(view.viewMappings[index].metric, layer.metric) &&
            isEqual(view.viewMappings[index].mapping, layer.mapping),
        );
    }

    function isEqual(obj1, obj2) {
        if (isObject(obj1) && isObject(obj2)) {
            return (
                Object.keys(obj1).length === Object.keys(obj2).length &&
                Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && isEqual(obj1[key], obj2[key]))
            );
        } else {
            return obj1 === obj2;
        }
    }

    function isObject(object) {
        return object != null && typeof object === "object";
    }

    function resetButtonClicked() {
        $(cssIDs.viewDropDown).igCombo("clearInput");

        reset();
        clearNavigatorFocus();

        if (typeof NavigatorController !== "undefined") {
            NavigatorController.hide();
        }

        addLayer();
    }

    function reset() {
        while (layerCounter > 0) {
            removeLayer();
        }
    }

    /**
     * Schaltet die Transparenz der Navigation komplett ein oder aus:
     * Hintergrund, inaktive Treffer und aktiver Treffer.
     * Ausgeschaltet heißt wirklich "keine Transparenz" – nicht nur ein blasserer Hintergrund.
     */
    function applyDimming(shouldDim) {
        if (typeof canvasManipulator === "undefined") return;
        if (shouldDim === dimApplied) return;

        const groups = [
            { entities: lastUnmatched, transparency: DimSettings.transparency.background },
            { entities: lastInactive, transparency: DimSettings.transparency.inactiveHit },
            { entities: lastActive, transparency: DimSettings.transparency.activeHit }
        ];

        groups.forEach(function (group) {
            if (group.entities.length === 0) return;
            if (shouldDim) {
                canvasManipulator.changeTransparencyOfEntities(group.entities, group.transparency, navigatorEffect);
            } else {
                canvasManipulator.resetTransparencyOfEntities(group.entities, navigatorEffect);
            }
        });

        dimApplied = shouldDim;
    }

    function getActiveLayers() {
        return layers.filter(function(l) { return l.metric && l.metric.variant; });
    }

    return {
        initialize: initialize,
        activate: activate,
        reset: reset,
        removeLayer: removeLayer,
        getMetricBounds: getMetricBounds,
        applyDimming: applyDimming,
        getActiveLayers: getActiveLayers,
        metricDefault: metricDefault,
        mappingDefault: mappingDefault,
    };
})();