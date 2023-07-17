class DomHelper {

	constructor(rootDiv, controllerConfig) {
		this.rootDiv = rootDiv;
		this.controllerConfig = controllerConfig;
		this.defaultIgButtonSettings = {
			theme: "metro",
			width: widgetSize.buttonWidth,
			height: widgetSize.buttonHeight
		}
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

		const uiHeadHtml =
			`<div id="${domIDs.viewControllerHeader}">
				<label id="${domIDs.headerTextNode}">Metric View</label>
				<button id="${domIDs.executeButton}">Execute</button>
				<button id="${domIDs.resetButton}">Reset</button>
				<button id="${domIDs.addLayerButton}">Add Metric Layer</button>
				<button id="${domIDs.downloadViewConfigButton}">Download View Config</button>
				<div id="${domIDs.viewDropDown}" class="${domClasses.metricsDropDown} ${domClasses.viewDropDown}"></div>
			</div>`;

		$(this.rootDiv).append(uiHeadHtml);

		$(cssIDs.viewDropDown).igCombo({
			...this.defaultIgComboSettings,
			height: widgetSize.headerDropDownHeight,
			dataSource: this.controllerConfig.views.map(a => a.name),
		});
		$(cssIDs.downloadViewConfigButton).igButton({ ...this.defaultIgButtonSettings });
		$(cssIDs.executeButton).igButton({ ...this.defaultIgButtonSettings });
		$(cssIDs.resetButton).igButton({ ...this.defaultIgButtonSettings });
		$(cssIDs.addLayerButton).igButton({ ...this.defaultIgButtonSettings });
	}

	buildUiLayer(layerID) {
		this.buildMetricArea(layerID);
		this.buildDeleteButton(layerID);
		this.buildMappingArea(layerID);
	}

	buildMetricArea(layerID) {
		const layerClass = domClasses.layer + layerID;
		const metricHtml =
			`<div id="${domIDs.metricDiv + layerID}" class="${domClasses.metricDiv} ${layerClass}">
				<label id="${domIDs.metricTextNode + layerID}" class="${domClasses.metricTextNode} ${layerClass} ${domClasses.textLabel}">
					Metric
				</label>
				<div id="${domIDs.metricSelectionDropDown + layerID}" class="${domClasses.metricsDropDown} ${layerClass} ${domClasses.metricSelectionDropDown}"></div>

				<label id="${domIDs.metricFromText + layerID}" class="${domClasses.metricTextNode} ${layerClass} ${domClasses.textLabel}">
					From
				</label>
				<input type="number" id="${domIDs.metricFromInput + layerID}" class="${domClasses.metricNumParameter} ${layerClass} ${domClasses.metricNumParameter + layerID}" />
				<div id="${domIDs.metricFromDateInput + layerID}" class="${domClasses.metricDateParameter} ${layerClass} ${domClasses.metricDateParameter + layerID}"></div>

				<label id="${domIDs.metricToText + layerID}" class="${domClasses.metricTextNode} ${layerClass} ${domClasses.textLabel}">
					To
				</label>
				<input type="number" id="${domIDs.metricToInput + layerID}" class="${domClasses.metricNumParameter} ${layerClass} ${domClasses.metricNumParameter + layerID}"/>
				<div id="${domIDs.metricToDateInput + layerID}" class="${domClasses.metricDateParameter} ${layerClass} ${domClasses.metricDateParameter + layerID}"></div>
			</div>`;

		$(this.rootDiv).append(metricHtml);

		$(cssIDs.metricSelectionDropDown + layerID).igCombo({
			...this.defaultIgComboSettings,
			dataSource: this.controllerConfig.metrics,
			placeHolder: "Select Metric"
		});
		$(document).delegate(cssIDs.metricSelectionDropDown + layerID, "igcomboselectionchanged", (evt, ui) => { this.metricSelectionDropDownSelected(layerID) });

		$(cssIDs.metricFromInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });
		$(cssIDs.metricFromDateInput + layerID).igDatePicker({ ...this.defaultIgDatePickerSettings });
		$(cssIDs.metricToInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });
		$(cssIDs.metricToDateInput + layerID).igDatePicker({ ...this.defaultIgDatePickerSettings });

		$(cssIDs.metricFromDateInput + layerID).igDatePicker("hide");
		$(cssIDs.metricToDateInput + layerID).igDatePicker("hide");
	}

	metricSelectionDropDownSelected(layerID) {
		$(cssIDs.metricFromText + layerID).show();
		$(cssIDs.metricToText + layerID).show();

		switch ($(cssIDs.metricSelectionDropDown + layerID).igCombo("value")) {
			case metrics.numberOfStatements:
			case metrics.amountOfResults:
			case metrics.amountOfNamspa:
			case metrics.amountOfChnhis:
			case metrics.amountOfCodlen:
			case metrics.amountOfCommam:
			case metrics.amountOfDynsta:
			case metrics.amountOfEnhmod:
			case metrics.amountOfFormty:
			case metrics.amountOfNomac:
			case metrics.amountOfObjnam:
			case metrics.amountOfPraefi:
			case metrics.amountOfSlin:
			case metrics.amountOfSql:
			case metrics.amountOfTodo:
				$(cssIDs.metricFromDateInput + layerID).igDatePicker("hide");
				$(cssIDs.metricToDateInput + layerID).igDatePicker("hide");
				$(cssIDs.metricFromInput + layerID).igNumericEditor("show");
				$(cssIDs.metricToInput + layerID).igNumericEditor("show");
				break;
			case metrics.dateOfCreation:
			case metrics.dateOfLastChange:
				$(cssIDs.metricFromInput + layerID).igNumericEditor("hide");
				$(cssIDs.metricToInput + layerID).igNumericEditor("hide");
				$(cssIDs.metricFromDateInput + layerID).igDatePicker("show");
				$(cssIDs.metricToDateInput + layerID).igDatePicker("show");
				break;
		}
	}

	buildMappingArea(layerID) {
		const layerClass = domClasses.layer + layerID;
		const mappingParamClass = `${domClasses.mappingParameter} ${domClasses.mappingParameter + layerID}`;
		const mappingHtml =
			`<div id="${domIDs.mappingDiv + layerID}" class="${domClasses.mappingDiv} ${layerClass}">
				<label id="${domIDs.mappingTextNode + layerID}" class="${domClasses.mappingTextNode} ${layerClass} ${domClasses.textLabel}">
					Mapping
				</label>
				<div id="${domIDs.mappingDropDown + layerID}" class="${domClasses.metricsDropDown} ${layerClass} ${domClasses.mappingDropDown}"></div>

				<label id="${domIDs.mappingFromText + layerID}" class="${mappingParamClass} ${layerClass} ${domClasses.textLabel}">
					Mapping - From
				</label>
				<div id="${domIDs.mappingFromInput + layerID}" class="${mappingParamClass} ${layerClass}"></div>

				<label id="${domIDs.mappingToText + layerID}" class="${domClasses.metricTextNode} ${layerClass} ${domClasses.textLabel}">
					Mapping - To
				</label>
				<div id="${domIDs.mappingToInput + layerID}" class="${mappingParamClass} ${layerClass}"></div>

				<div id="${domIDs.mappingColorDropDown + layerID}" class="${domClasses.metricsDropDown} ${mappingParamClass} ${layerClass}"></div>
				<div id="${domIDs.mappingStartColorDropDown + layerID}" class="${domClasses.metricsDropDown} ${mappingParamClass} ${layerClass}"></div>
				<div id="${domIDs.mappingEndColorDropDown + layerID}" class="${domClasses.metricsDropDown} ${mappingParamClass} ${layerClass}"></div>
				<div id="${domIDs.mappingTransparencyInput + layerID}" class="${mappingParamClass} ${layerClass}"></div>

				<label id="${domIDs.mappingPeriodText + layerID}" class="${mappingParamClass} ${layerClass} ${domClasses.textLabel}">
					Period in ms
				</label>
				<div id="${domIDs.mappingPeriodInput + layerID}" class="${mappingParamClass} ${layerClass}"></div>

				<label id="${domIDs.mappingScaleText + layerID}" class="${mappingParamClass} ${layerClass} ${domClasses.textLabel}">
					Scale
				</label>
				<div id="${domIDs.mappingScaleInput + layerID}" class="${mappingParamClass} ${layerClass}"></div>
			</div>`;

		$(this.rootDiv).append(mappingHtml);

		$(cssIDs.mappingDropDown + layerID).igCombo({
			...this.defaultIgComboSettings,
			dataSource: this.controllerConfig.mappings,
			placeHolder: "Select Mapping"
		});

		$(document).delegate(cssIDs.mappingDropDown + layerID, "igcomboselectionchanged", (evt, ui) => { this.mappingDropDownSelected(layerID) });

		$(cssIDs.mappingFromInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });
		$(cssIDs.mappingToInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });

		$(cssIDs.mappingColorDropDown + layerID).igCombo({
			...this.defaultIgComboSettings,
			dataSource: colors,
			placeHolder: "Select Color"
		});
		$(cssIDs.mappingStartColorDropDown + layerID).igCombo({
			...this.defaultIgComboSettings,
			dataSource: colors,
			placeHolder: "Select Start Color"
		});
		$(cssIDs.mappingEndColorDropDown + layerID).igCombo({
			...this.defaultIgComboSettings,
			dataSource: colors,
			placeHolder: "Select End Color"
		});
		$(cssIDs.mappingTransparencyInput + layerID).igNumericEditor({
			width: widgetSize.inputWidthMapping, height: widgetSize.inputHeight,
			min: 0, max: 1,
			inputMode: "simple",
			spinButtons: true
		});

		$(cssIDs.mappingPeriodInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });
		$(cssIDs.mappingScaleInput + layerID).igNumericEditor({ ...this.defaultIgNumInputSettings });

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
		const deleteButton = document.createElement("button");
		deleteButton.id = domIDs.deleteButton + layerID;
		deleteButton.classList.add(domClasses.deleteButton, domClasses.layer + layerID);
		this.rootDiv.appendChild(deleteButton);

		$(cssIDs.deleteButton + layerID).igButton({
			theme: "metro",
			height: widgetSize.deleteButtonHeight,
			width: widgetSize.deleteButtonWidth,
			disabled: false,
			icons: {
				primary: "ui-icon-close",
			}
		});

		$(cssIDs.deleteButton + layerID).click((event) => metricController.removeLayer(event));
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

		this.metricSelectionDropDownSelected(layer.id);
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
		$(cssClasses.layer + layerID).remove();
	}

	resetLayerUI(layerID) {
		$(cssClasses.layer + layerID).find(cssClasses.metricsDropDown).igCombo("clearInput");

		$(cssClasses.metricNumParameter + layerID).igNumericEditor("destroy");
		$(cssClasses.metricDateParameter + layerID).igDatePicker("destroy");

		$(cssClasses.metricParameter + layerID).hide();
		$(cssClasses.mappingParameter + layerID).hide();
	}
}
