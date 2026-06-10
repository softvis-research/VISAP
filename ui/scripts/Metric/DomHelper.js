class DomHelper {

    constructor(rootDiv, controllerConfig) {
        this.rootDiv = rootDiv;
        this.controllerConfig = controllerConfig;
        this.defaultIgButtonSettings = {
            theme: "metro",
            width: widgetSize.buttonWidth,
            height: widgetSize.buttonHeight
        };
        this.defaultIgComboSettings = {
            width: widgetSize.dropDownWidth,
            height: widgetSize.dropDownHeight,
            dropDownVerticalAlignment: "top",
            autoDropDownHeight: true,
            autoItemsHeight: true
        };
        this.defaultIgDatePickerSettings = {
            formatString: "yyyy-MM-dd",
            value: null,
            dropDownVerticalAlignment: "top",
            width: widgetSize.inputDateWidth,
            height: widgetSize.inputHeight
        };
        this.defaultIgNumInputSettings = {
            placeHolder: "0",
            width: widgetSize.inputWidthMetric,
            height: widgetSize.inputHeight,
            minLength: 1
        };
    }

    buildUiHead() {
        application.loadCSS("scripts/Metric/metricBox.css");

        var uiHeadHtml =
            '<div id="' + domIDs.viewControllerHeader + '">' +
            '<button id="metricToggleBtn" title="Ein-/Ausklappen">&#9660;</button>' +
            '<label id="' + domIDs.headerTextNode + '">Metrik Controller</label>' +
            '<button id="metricHelpBtn" title="Hilfe">?</button>' +
            '<div id="' + domIDs.viewDropDown + '" class="' + domClasses.metricsDropDown + ' ' + domClasses.viewDropDown + '"></div>' +
            '<button id="' + domIDs.downloadViewConfigButton + '">Config</button>' +
            '<button id="' + domIDs.addLayerButton + '">+ Layer</button>' +
            '<button id="' + domIDs.executeButton + '">Start</button>' +
            '<button id="' + domIDs.resetButton + '" title="Parameter zur\u00fccksetzen">&#x21BA;</button>' +
            '<label class="metric-dim-label" title="Nicht relevante Elemente bei Navigation transparent machen">' +
            '<input type="checkbox" id="metricDimBackground" checked>' +
            ' Dim' +
            '</label>' +
            '</div>' +
            '<div id="metricLayerBody"></div>';

        $(this.rootDiv).append(uiHeadHtml);

        var self = this;
        document.getElementById("metricToggleBtn").addEventListener("click", function() {
            var body = document.getElementById("metricLayerBody");
            var btn  = document.getElementById("metricToggleBtn");
            var isOpen = body.classList.toggle("metric-open");
            btn.innerHTML = isOpen ? "&#9650;" : "&#9660;";
            document.body.classList.toggle("metric-expanded", isOpen);

            // Dem VISAP-Splitter sagen, dass er sich zusammenschieben soll!
            var $splitter = $("#metricControllerDiv").closest(".ui-igsplitter");
            if ($splitter.length > 0) {
                if (isOpen) {
                    // Aufklappen: Alte Größe wiederherstellen (oder 250px als Standard)
                    $splitter.igSplitter("setSecondPanelSize", self.lastSplitterSize || 250);
                } else {
                    // Einklappen: Aktuelle Größe speichern (falls der Nutzer sie gezogen hat)
                    var currentSize = $("#metricControllerDiv").parent().height();
                    if (currentSize > 60) {
                        self.lastSplitterSize = currentSize;
                    }
                    // Panel auf exakt 44px (Höhe des Headers) zusammenschrumpfen
                    $splitter.igSplitter("setSecondPanelSize", 50);
                }
            }
        });

        TooltipController.register("metricTooltip", "metricHelpBtn", "metricController");

        document.getElementById("metricDimBackground").addEventListener("change", function() {
            metricController.applyDimming(this.checked);
        });

        $(cssIDs.viewDropDown).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            height: widgetSize.headerDropDownHeight,
            dataSource: this.controllerConfig.views.map(function(a) { return a.name; })
        }));

        var body = document.getElementById("metricLayerBody");
        body.classList.add("metric-open");
        document.getElementById("metricToggleBtn").innerHTML = "&#9650;";
        document.body.classList.add("metric-expanded");

        this.rootDiv = document.getElementById("metricLayerBody");
    }

    buildUiLayer(layerID) {
        var wrapper = document.createElement("div");
        wrapper.id = "metricLayerRow" + layerID;
        wrapper.className = "metricLayerRow " + domClasses.layer + layerID;
        this.rootDiv.appendChild(wrapper);

        var originalRoot = this.rootDiv;
        this.rootDiv = wrapper;

        this.buildMetricArea(layerID);
        this.buildDeleteButton(layerID);
        this.buildMappingArea(layerID);

        this.rootDiv = originalRoot;
    }

    buildMetricArea(layerID) {
        var layerClass = domClasses.layer + layerID;
        var metricHtml =
            '<div id="' + domIDs.metricDiv + layerID + '" class="' + domClasses.metricDiv + ' ' + layerClass + '">' +
            '<div class="sectionLabel">Metrik</div>' +
            '<label id="' + domIDs.metricTextNode + layerID + '" class="' + domClasses.metricTextNode + ' ' + layerClass + ' ' + domClasses.textLabel + '" style="display:none">Metrik</label>' +
            '<div id="' + domIDs.metricSelectionDropDown + layerID + '" class="' + domClasses.metricsDropDown + ' ' + layerClass + ' ' + domClasses.metricSelectionDropDown + '"></div>' +
            '<div class="metricRangeRow">' +
            '<div class="rangeField">' +
            '<input type="number" id="' + domIDs.metricFromInput + layerID + '" class="' + domClasses.metricNumParameter + ' ' + layerClass + ' ' + domClasses.metricNumParameter + layerID + '" />' +
            '<div id="' + domIDs.metricFromDateInput + layerID + '" class="' + domClasses.metricDateParameter + ' ' + layerClass + ' ' + domClasses.metricDateParameter + layerID + '"></div>' +
            '<span class="rangeLabel">Start</span>' +
            '</div>' +
            '<span class="rangeSeparator">&ndash;</span>' +
            '<div class="rangeField">' +
            '<input type="number" id="' + domIDs.metricToInput + layerID + '" class="' + domClasses.metricNumParameter + ' ' + layerClass + ' ' + domClasses.metricNumParameter + layerID + '" />' +
            '<div id="' + domIDs.metricToDateInput + layerID + '" class="' + domClasses.metricDateParameter + ' ' + layerClass + ' ' + domClasses.metricDateParameter + layerID + '"></div>' +
            '<span class="rangeLabel">End</span>' +
            '</div>' +
            '</div>' +
            '<label id="' + domIDs.metricFromText + layerID + '" class="' + domClasses.metricTextNode + ' ' + layerClass + ' ' + domClasses.textLabel + '" style="display:none"></label>' +
            '<label id="' + domIDs.metricToText + layerID + '" class="' + domClasses.metricTextNode + ' ' + layerClass + ' ' + domClasses.textLabel + '" style="display:none"></label>' +
            '</div>';

        $(this.rootDiv).append(metricHtml);

        $(cssIDs.metricSelectionDropDown + layerID).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            dataSource: this.controllerConfig.metrics,
            placeHolder: "Select Metric"
        }));

        // WICHTIG: True übergeben, da diese Änderung manuell vom Nutzer kommt (Default-Werte eintragen!)
        $(document).delegate(cssIDs.metricSelectionDropDown + layerID, "igcomboselectionchanged", function(evt, ui) {
            this.metricSelectionDropDownSelected(layerID, true);
        }.bind(this));

        $(cssIDs.metricFromInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));
        $(cssIDs.metricFromDateInput + layerID).igDatePicker(Object.assign({}, this.defaultIgDatePickerSettings));
        $(cssIDs.metricToInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));
        $(cssIDs.metricToDateInput + layerID).igDatePicker(Object.assign({}, this.defaultIgDatePickerSettings));

        $(cssIDs.metricFromDateInput + layerID).igDatePicker("hide");
        $(cssIDs.metricToDateInput + layerID).igDatePicker("hide");
    }

    // AUTO-FILL LOGIK: Setzt Min/Max-Werte ein, wenn eine Metrik gewählt wird
    metricSelectionDropDownSelected(layerID, updateValuesToDefault = false) {
        $(cssIDs.metricFromText + layerID).show();
        $(cssIDs.metricToText + layerID).show();

        const selectedLabel = $(cssIDs.metricSelectionDropDown + layerID).igCombo("value");
        const metricVariant = Object.keys(metrics).find(key => metrics[key] === selectedLabel);

        let bounds = null;
        if (updateValuesToDefault && metricVariant && typeof metricController !== "undefined" && metricController.getMetricBounds) {
            bounds = metricController.getMetricBounds(metricVariant);
        }

        switch (selectedLabel) {
            case metrics.dateOfCreation:
            case metrics.dateOfLastChange:
                $(cssIDs.metricFromInput + layerID).igNumericEditor("hide");
                $(cssIDs.metricToInput + layerID).igNumericEditor("hide");
                $(cssIDs.metricFromDateInput + layerID).igDatePicker("show");
                $(cssIDs.metricToDateInput + layerID).igDatePicker("show");

                if (bounds) {
                    $(cssIDs.metricFromDateInput + layerID).igDatePicker("value", new Date(bounds.min));
                    $(cssIDs.metricToDateInput + layerID).igDatePicker("value", new Date(bounds.max));
                }
                break;
            default:
                $(cssIDs.metricFromDateInput + layerID).igDatePicker("hide");
                $(cssIDs.metricToDateInput + layerID).igDatePicker("hide");
                $(cssIDs.metricFromInput + layerID).igNumericEditor("show");
                $(cssIDs.metricToInput + layerID).igNumericEditor("show");

                if (bounds) {
                    $(cssIDs.metricFromInput + layerID).igNumericEditor("value", bounds.min);
                    $(cssIDs.metricToInput + layerID).igNumericEditor("value", bounds.max);
                }
                break;
        }
    }

    buildMappingArea(layerID) {
        var layerClass = domClasses.layer + layerID;
        var mappingParamClass = domClasses.mappingParameter + ' ' + domClasses.mappingParameter + layerID;
        var mappingHtml =
            '<div id="' + domIDs.mappingDiv + layerID + '" class="' + domClasses.mappingDiv + ' ' + layerClass + '">' +
            '<div class="sectionLabel">Mapping</div>' +
            '<label id="' + domIDs.mappingTextNode + layerID + '" class="' + domClasses.mappingTextNode + ' ' + layerClass + ' ' + domClasses.textLabel + '" style="display:none">Mapping</label>' +
            '<div id="' + domIDs.mappingDropDown + layerID + '" class="' + domClasses.metricsDropDown + ' ' + layerClass + ' ' + domClasses.mappingDropDown + '"></div>' +
            '<label id="' + domIDs.mappingFromText + layerID + '" class="' + mappingParamClass + ' ' + layerClass + ' ' + domClasses.textLabel + '">Mapping - From</label>' +
            '<div id="' + domIDs.mappingFromInput + layerID + '" class="' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<label id="' + domIDs.mappingToText + layerID + '" class="' + domClasses.metricTextNode + ' ' + layerClass + ' ' + domClasses.textLabel + '">Mapping - To</label>' +
            '<div id="' + domIDs.mappingToInput + layerID + '" class="' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<div id="' + domIDs.mappingColorDropDown + layerID + '" class="' + domClasses.metricsDropDown + ' ' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<div id="' + domIDs.mappingStartColorDropDown + layerID + '" class="' + domClasses.metricsDropDown + ' ' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<div id="' + domIDs.mappingEndColorDropDown + layerID + '" class="' + domClasses.metricsDropDown + ' ' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<div id="' + domIDs.mappingTransparencyInput + layerID + '" class="' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<label id="' + domIDs.mappingPeriodText + layerID + '" class="' + mappingParamClass + ' ' + layerClass + ' ' + domClasses.textLabel + '">Period in ms</label>' +
            '<div id="' + domIDs.mappingPeriodInput + layerID + '" class="' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '<label id="' + domIDs.mappingScaleText + layerID + '" class="' + mappingParamClass + ' ' + layerClass + ' ' + domClasses.textLabel + '">Scale</label>' +
            '<div id="' + domIDs.mappingScaleInput + layerID + '" class="' + mappingParamClass + ' ' + layerClass + '"></div>' +
            '</div>';

        $(this.rootDiv).append(mappingHtml);

        $(cssIDs.mappingDropDown + layerID).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            dataSource: this.controllerConfig.mappings,
            placeHolder: "Select Mapping"
        }));
        $(document).delegate(cssIDs.mappingDropDown + layerID, "igcomboselectionchanged", function(evt, ui) {
            this.mappingDropDownSelected(layerID);
        }.bind(this));

        $(cssIDs.mappingFromInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));
        $(cssIDs.mappingToInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));

        $(cssIDs.mappingColorDropDown + layerID).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            dataSource: colors, placeHolder: "Select Color"
        }));
        $(cssIDs.mappingStartColorDropDown + layerID).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            dataSource: colors, placeHolder: "Select Start Color"
        }));
        $(cssIDs.mappingEndColorDropDown + layerID).igCombo(Object.assign({}, this.defaultIgComboSettings, {
            dataSource: colors, placeHolder: "Select End Color"
        }));
        $(cssIDs.mappingTransparencyInput + layerID).igNumericEditor({
            width: widgetSize.inputWidthMapping,
            height: widgetSize.inputHeight,
            min: 0, max: 1,
            inputMode: "simple",
            spinButtons: true
        });

        $(cssIDs.mappingPeriodInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));
        $(cssIDs.mappingScaleInput + layerID).igNumericEditor(Object.assign({}, this.defaultIgNumInputSettings));

        $(cssIDs.mappingFromInput + layerID).igNumericEditor("hide");
        $(cssIDs.mappingToInput + layerID).igNumericEditor("hide");
        $(cssIDs.mappingScaleInput + layerID).igNumericEditor("hide");
        $(cssIDs.mappingPeriodInput + layerID).igNumericEditor("hide");
        $(cssIDs.mappingTransparencyInput + layerID).igNumericEditor("hide");
        $(cssClasses.mappingParameter + layerID).hide();
    }

    mappingDropDownSelected(layerID) {
        $(cssClasses.mappingParameter + layerID).hide();

        switch ($(cssIDs.mappingDropDown + layerID).igCombo("value")) {
            case mappings.color:
                $(cssIDs.mappingColorDropDown + layerID).show();
                break;
            case mappings.colorGradient:
                $(cssIDs.mappingStartColorDropDown + layerID).show();
                $(cssIDs.mappingEndColorDropDown + layerID).show();
                break;
            case mappings.transparency:
                $(cssIDs.mappingTransparencyInput + layerID).show();
                break;
            case mappings.pulsation:
                $(cssIDs.mappingPeriodText + layerID).show();
                $(cssIDs.mappingPeriodInput + layerID).show();
                $(cssIDs.mappingScaleText + layerID).show();
                $(cssIDs.mappingScaleInput + layerID).show();
                break;
            case mappings.flashing:
                $(cssIDs.mappingPeriodText + layerID).show();
                $(cssIDs.mappingPeriodInput + layerID).show();
                $(cssIDs.mappingColorDropDown + layerID).show();
                break;
            case mappings.rotation:
                $(cssIDs.mappingPeriodText + layerID).show();
                $(cssIDs.mappingPeriodInput + layerID).show();
                break;
        }
    }

    buildDeleteButton(layerID) {
        var deleteButton = document.createElement("button");
        deleteButton.id = domIDs.deleteButton + layerID;
        deleteButton.classList.add(domClasses.deleteButton, domClasses.layer + layerID);
        deleteButton.innerHTML = "&#x2715;";
        deleteButton.title = "Layer entfernen";

        if (layerID === 1) {
            deleteButton.disabled = true;
            deleteButton.classList.add("ui-state-disabled");
        }

        this.rootDiv.appendChild(deleteButton);

        deleteButton.addEventListener("click", function(event) {
            metricController.removeLayer(event);
        });
    }

    setLayerUI(layer) {
        $(cssIDs.metricSelectionDropDown + layer.id).igCombo("value", metrics[layer.metric.variant]);

        switch (metrics[layer.metric.variant]) {
            case metrics.dateOfCreation:
            case metrics.dateOfLastChange:
                $(cssIDs.metricFromDateInput + layer.id).igDatePicker("value", new Date(layer.metric.from));
                $(cssIDs.metricToDateInput + layer.id).igDatePicker("value", new Date(layer.metric.to));
                break;
            default:
                $(cssIDs.metricFromInput + layer.id).igNumericEditor("value", layer.metric.from);
                $(cssIDs.metricToInput + layer.id).igNumericEditor("value", layer.metric.to);
                break;
        }

        // WICHTIG: False übergeben! Damit bestehende View-Configs nicht überschrieben werden.
        this.metricSelectionDropDownSelected(layer.id, false);

        $(cssIDs.mappingDropDown + layer.id).igCombo("value", layer.mapping.variant);

        switch (layer.mapping.variant) {
            case mappings.color:
                $(cssIDs.mappingColorDropDown + layer.id).igCombo("value", layer.mapping.color);
                break;
            case mappings.colorGradient:
                $(cssIDs.mappingStartColorDropDown + layer.id).igCombo("value", layer.mapping.startColor);
                $(cssIDs.mappingEndColorDropDown + layer.id).igCombo("value", layer.mapping.endColor);
                break;
            case mappings.transparency:
                $(cssIDs.mappingTransparencyInput + layer.id).igNumericEditor("value", layer.mapping.transparency);
                break;
            case mappings.pulsation:
                $(cssIDs.mappingPeriodInput + layer.id).igNumericEditor("value", layer.mapping.period);
                $(cssIDs.mappingScaleInput + layer.id).igNumericEditor("value", layer.mapping.scale);
                break;
            case mappings.flashing:
                $(cssIDs.mappingPeriodInput + layer.id).igNumericEditor("value", layer.mapping.period);
                $(cssIDs.mappingColorDropDown + layer.id).igCombo("value", layer.mapping.color);
                break;
            case mappings.rotation:
                $(cssIDs.mappingPeriodInput + layer.id).igNumericEditor("value", layer.mapping.period);
                break;
        }

        this.mappingDropDownSelected(layer.id);
    }

    destroyLayerUI(layerID) {
        this.resetLayerUI(layerID);
        var wrapper = document.getElementById("metricLayerRow" + layerID);
        if (wrapper) {
            wrapper.parentNode.removeChild(wrapper);
        } else {
            $(cssClasses.layer + layerID).remove();
        }
    }

    resetLayerUI(layerID) {
        $(cssClasses.layer + layerID).find(cssClasses.metricsDropDown).igCombo("clearInput");
        $(cssClasses.metricNumParameter + layerID).igNumericEditor("destroy");
        $(cssClasses.metricDateParameter + layerID).igDatePicker("destroy");
        $(cssClasses.metricParameter + layerID).hide();
        $(cssClasses.mappingParameter + layerID).hide();
    }
}