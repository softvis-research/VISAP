class DomHelper {

	constructor(rootDiv, controllerConfig) {
		this.rootDiv = rootDiv;
		this.controllerConfig = controllerConfig;
		this.colors = [
			"red",
			"blue",
			"green",
			"black",
			"yellow",
			"orange"
		];

	}

	buildUiHead() {
		let cssLink = document.createElement("link");
		cssLink.type = "text/css";
		cssLink.rel = "stylesheet";
		cssLink.href = "scripts/Metric/metricBox.css";
		document.getElementsByTagName("head")[0].appendChild(cssLink);


		const viewControllerHeaderDiv = document.createElement("div");
		viewControllerHeaderDiv.id = domIDs.viewControllerHeader;


		const headerTextNode = document.createElement("label");
		headerTextNode.id = domIDs.headerTextNode;
		headerTextNode.textContent = "Metric View";
		viewControllerHeaderDiv.appendChild(headerTextNode);


		const executeButtonDiv = document.createElement("div");
		executeButtonDiv.id = domIDs.executeButton;
		executeButtonDiv.innerHTML = '<i class="fa-solid fa-play"></i>';
		viewControllerHeaderDiv.appendChild(executeButtonDiv);


		const resetButtonDiv = document.createElement("div");
		resetButtonDiv.id = domIDs.resetButton;
		resetButtonDiv.textContent = "Reset";
		viewControllerHeaderDiv.appendChild(resetButtonDiv);


		const addLayerButtonDiv = document.createElement("div");
		addLayerButtonDiv.id = domIDs.addLayerButton;
		addLayerButtonDiv.textContent = "Add Metric-Layer";
		viewControllerHeaderDiv.appendChild(addLayerButtonDiv);


		const downloadViewConfigButtonDiv = document.createElement("button");
		downloadViewConfigButtonDiv.id = domIDs.downloadViewConfigButton;
		downloadViewConfigButtonDiv.textContent = "Download View Config";
		viewControllerHeaderDiv.appendChild(downloadViewConfigButtonDiv);


		const viewDropDownDiv = document.createElement("div");
		viewDropDownDiv.id = domIDs.viewDropDown;
		viewDropDownDiv.classList.add(domClasses.viewDropDown);
		viewControllerHeaderDiv.appendChild(viewDropDownDiv);

		this.rootDiv.appendChild(viewControllerHeaderDiv);


		$(cssIDs.viewDropDown).igCombo({
			dataSource: this.controllerConfig.views.map(a => a.name),
			placeHolder: "Select View",
			width: widgetSize.dropDownWidth, height: widgetSize.headerDropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});
		$(cssIDs.downloadViewConfigButton).igButton({ theme: "metro", width: widgetSize.buttonWidth });
		$(cssIDs.executeButton).igButton({ theme: "metro", width: widgetSize.buttonWidth });
		$(cssIDs.resetButton).igButton({ theme: "metro", width: widgetSize.buttonWidth });
		$(cssIDs.addLayerButton).igButton({ theme: "metro", width: widgetSize.buttonWidth });
	}

	buildUiLayer(layerID) {
		this.buildMetricArea(layerID);
		this.buildDeleteButton(layerID);
		this.buildMappingArea(layerID);
	}

	buildMetricArea(layerID) {
		const metricDiv = document.createElement("div");
		metricDiv.id = domIDs.metricDiv + layerID;
		metricDiv.classList.add(domClasses.metricDiv, domClasses.layer + layerID);

		const metricTextNode = document.createElement("label");
		metricTextNode.id = domIDs.metricTextNode + layerID;
		metricTextNode.classList.add(domClasses.metricTextNode, domClasses.layer + layerID, domClasses.textLabel);
		metricTextNode.textContent = "Metric";
		metricDiv.appendChild(metricTextNode);

		const metricDropDownDiv = document.createElement("div");
		metricDropDownDiv.id = domIDs.metricDropDown + layerID;
		metricDropDownDiv.classList.add(domClasses.metricDropDown, domClasses.layer + layerID);
		metricDiv.appendChild(metricDropDownDiv);

		const metricFromTextNode = document.createElement("label");
		metricFromTextNode.id = domIDs.metricFromText + layerID;
		metricFromTextNode.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		metricFromTextNode.textContent = "From";
		metricDiv.appendChild(metricFromTextNode);

		const metricFromInput = document.createElement("input");
		metricFromInput.type = "number";
		metricFromInput.id = domIDs.metricFromInput + layerID;
		metricFromInput.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID);
		metricDiv.appendChild(metricFromInput);

		const metricFromDateInput = document.createElement("div");
		metricFromDateInput.id = domIDs.metricFromDateInput + layerID;
		metricFromDateInput.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID);
		metricDiv.appendChild(metricFromDateInput);

		const metricToTextNode = document.createElement("label");
		metricToTextNode.id = domIDs.metricToText + layerID;
		metricToTextNode.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		metricToTextNode.textContent = "To";
		metricDiv.appendChild(metricToTextNode);

		const metricToInput = document.createElement("input");
		metricToInput.type = "number";
		metricToInput.id = domIDs.metricToInput + layerID;
		metricToInput.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID);
		metricDiv.appendChild(metricToInput);

		const metricToDateInput = document.createElement("div");
		metricToDateInput.id = domIDs.metricToDateInput + layerID;
		metricToDateInput.classList.add(domClasses.metricParameter, domClasses.metricParameter + layerID, domClasses.layer + layerID);
		metricDiv.appendChild(metricToDateInput);

		this.rootDiv.appendChild(metricDiv);

		$(cssIDs.metricDropDown + layerID).igCombo({
			dataSource: this.controllerConfig.metrics,
			placeHolder: "Select Metric",
			width: widgetSize.dropDownWidth, height: widgetSize.dropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});
		$(cssIDs.metricDropDown + layerID).on("change", () => { this.metricDropDownSelected(layerID) });
		$(cssIDs.metricFromInput + layerID).igNumericEditor({ placeHolder: "Value", width: widgetSize.inputWidthMetric, height: widgetSize.inputHeight, minLength: 1 });
		$(cssIDs.metricFromDateInput + layerID).igDatePicker({
			placeHolder: "YYYY-MM-DD",
			formatString: "yyyy-MM-dd",
			value: null,
			dropDownVerticalAlignment: "top",
			width: widgetSize.inputWidthMetric
		});
		$(cssIDs.metricToInput + layerID).igNumericEditor({ placeHolder: "Value", width: widgetSize.inputWidthMetric, height: widgetSize.inputHeight, minLength: 1 });

		$(cssIDs.metricToDateInput + layerID).igDatePicker({
			placeHolder: "YYYY-MM-DD",
			formatString: "yyyy-MM-dd",
			value: null,
			dropDownVerticalAlignment: "top",
			width: widgetSize.inputWidthMetric
		});
	}

	metricDropDownSelected(layerID) {
		$(cssIDs.metricFromText + layerID).show();
		$(cssIDs.metricToText + layerID).show();

		switch ($(cssIDs.metricDropDown + layerID).val()) {
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
				$(cssIDs.metricFromDateInput + layerID).hide();
				$(cssIDs.metricToDateInput + layerID).hide();
				$(cssIDs.metricFromInput + layerID).show();
				$(cssIDs.metricToInput + layerID).show();
				break;
			case metrics.dateOfCreation:
			case metrics.dateOfLastChange:
				$(cssIDs.metricFromInput + layerID).hide();
				$(cssIDs.metricToInput + layerID).hide();
				$(cssIDs.metricFromDateInput + layerID).show();
				$(cssIDs.metricToDateInput + layerID).show();
				break;
		}
	}

	buildMappingArea(layerID) {
		const mappingDiv = document.createElement("div");
		mappingDiv.id = domIDs.mappingDiv + layerID;
		mappingDiv.classList.add(domClasses.mappingDiv, domClasses.layer + layerID);

		const mappingTextNode = document.createElement("label");
		mappingTextNode.id = domIDs.mappingTextNode + layerID;
		mappingTextNode.classList.add(domClasses.mappingTextNode, domClasses.layer + layerID, domClasses.textLabel);
		mappingTextNode.textContent = "Mapping";
		mappingDiv.appendChild(mappingTextNode);

		const mappingDropDownDiv = document.createElement("div");
		mappingDropDownDiv.id = domIDs.mappingDropDown + layerID;
		mappingDropDownDiv.classList.add(domClasses.mappingDropDown, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingDropDownDiv);

		const mappingFromTextNode = document.createElement("label");
		mappingFromTextNode.id = domIDs.mappingFromText + layerID;
		mappingFromTextNode.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		mappingFromTextNode.textContent = "Mapping - From";
		mappingDiv.appendChild(mappingFromTextNode);

		const mappingFromInput = document.createElement("input");
		mappingFromInput.type = "text";
		mappingFromInput.id = domIDs.mappingFromInput + layerID;
		mappingFromInput.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingFromInput);

		const mappingToTextNode = document.createElement("label");
		mappingToTextNode.id = domIDs.mappingToText + layerID;
		mappingToTextNode.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		mappingToTextNode.textContent = "Mapping - To";
		mappingDiv.appendChild(mappingToTextNode);

		const mappingToInput = document.createElement("input");
		mappingToInput.type = "text";
		mappingToInput.id = domIDs.mappingToInput + layerID;
		mappingToInput.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingToInput);

		const mappingColorDropDownDiv = document.createElement("div");
		mappingColorDropDownDiv.id = domIDs.mappingColorDropDown + layerID;
		mappingColorDropDownDiv.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingColorDropDownDiv);

		const mappingStartColorDropDownDiv = document.createElement("div");
		mappingStartColorDropDownDiv.id = domIDs.mappingStartColorDropDown + layerID;
		mappingStartColorDropDownDiv.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingStartColorDropDownDiv);

		const mappingEndColorDropDownDiv = document.createElement("div");
		mappingEndColorDropDownDiv.id = domIDs.mappingEndColorDropDown + layerID;
		mappingEndColorDropDownDiv.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingEndColorDropDownDiv);

		const transparencyInputDiv = document.createElement("div");
		transparencyInputDiv.id = domIDs.mappingTransparencyInput + layerID;
		transparencyInputDiv.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(transparencyInputDiv);

		const mappingPeriodTextNode = document.createElement("label");
		mappingPeriodTextNode.id = domIDs.mappingPeriodText + layerID;
		mappingPeriodTextNode.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		mappingPeriodTextNode.textContent = "Period in ms";
		mappingDiv.appendChild(mappingPeriodTextNode);

		const mappingPeriodInput = document.createElement("input");
		mappingPeriodInput.type = "number";
		mappingPeriodInput.id = domIDs.mappingPeriodInput + layerID;
		mappingPeriodInput.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingPeriodInput);

		const mappingScaleTextNode = document.createElement("label");
		mappingScaleTextNode.id = domIDs.mappingScaleText + layerID;
		mappingScaleTextNode.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID, domClasses.textLabel);
		mappingScaleTextNode.textContent = "Scale";
		mappingDiv.appendChild(mappingScaleTextNode);

		const mappingScaleInput = document.createElement("input");
		mappingScaleInput.type = "number";
		mappingScaleInput.id = domIDs.mappingScaleInput + layerID;
		mappingScaleInput.classList.add(domClasses.mappingParameter, domClasses.mappingParameter + layerID, domClasses.layer + layerID);
		mappingDiv.appendChild(mappingScaleInput);

		this.rootDiv.appendChild(mappingDiv);

		$(cssIDs.mappingDropDown + layerID).igCombo({
			dataSource: this.controllerConfig.mappings,
			placeHolder: "Select Mapping",
			width: widgetSize.dropDownWidth, height: widgetSize.dropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});
		$(cssIDs.mappingDropDown + layerID).on("change", () => { this.mappingDropDownSelected(layerID) });

		$(cssIDs.mappingFromInput + layerID).igNumericEditor({
			value: -10.0,
			minValue: -12.4,
			maxValue: 12.4
		});

		$(cssIDs.mappingToInput + layerID).igNumericEditor({ placeHolder: "Value", width: widgetSize.inputWidthMapping, height: widgetSize.inputHeight, minLength: 1 });

		$(cssIDs.mappingColorDropDown + layerID).igCombo({
			dataSource: colors,
			placeHolder: "Select Color",
			width: widgetSize.dropDownWidth, height: widgetSize.dropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});

		$(cssIDs.mappingStartColorDropDown + layerID).igCombo({
			dataSource: colors,
			placeHolder: "Select Start Color",
			width: widgetSize.dropDownWidth, height: widgetSize.dropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});

		$(cssIDs.mappingEndColorDropDown + layerID).igCombo({
			dataSource: colors,
			placeHolder: "Select End Color",
			width: widgetSize.dropDownWidth, height: widgetSize.dropDownHeight,
			dropDownVerticalAlignment: "top",
			autoDropDownHeight: true,
			autoItemsHeight: true
		});

		$(cssIDs.mappingTransparencyInput + layerID).igNumericEditor({
			width: widgetSize.inputWidthMapping, height: widgetSize.inputHeight,
			min: 0, max: 1,
			inputMode: "simple",
			spinButtons: true
		});

		$(cssIDs.mappingPeriodInput + layerID).igNumericEditor({ width: widgetSize.inputWidthMapping, height: widgetSize.inputHeight, minLength: 1 });

		$(cssIDs.mappingScaleInput + layerID).igNumericEditor({ width: widgetSize.inputWidthMapping, height: widgetSize.inputHeight, minLength: 1 });
	}

	mappingDropDownSelected(layerID) {
		$(cssClasses.mappingParameter + layerID).hide();

		switch ($(cssIDs.mappingDropDown + layerID).val()) {
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
		$(cssIDs.metricDropDown + layer.id).val(layer.metric.variant);

		switch (layer.metric.variant) {
			case metrics.dateOfCreation:
			case metrics.dateOfLastChange:
				$(cssIDs.metricFromDateInput + layer.id).igDatePicker('setDate', new Date(layer.metric.from));
				$(cssIDs.metricToDateInput + layer.id).igDatePicker('setDate', new Date(layer.metric.to));
				break;
			default:
				$(cssIDs.metricFromInput + layer.id).val(layer.metric.from);
				$(cssIDs.metricToInput + layer.id).val(layer.metric.to);
				break;
		}

		this.metricDropDownSelected(layer.id);
		$(cssIDs.mappingDropDown + layer.id).val(layer.mapping.variant);

		switch (layer.mapping.variant) {
			case mappings.color:
				$(cssIDs.mappingColorDropDown + layer.id).val(layer.mapping.color);
				break;

			case mappings.colorGradient:
				$(cssIDs.mappingStartColorDropDown + layer.id).val(layer.mapping.startColor);
				$(cssIDs.mappingEndColorDropDown + layer.id).val(layer.mapping.endColor);
				break;

			case mappings.transparency:
				$(cssIDs.mappingTransparencyInput + layer.id).val(layer.mapping.transparency);
				break;

			case mappings.pulsation:
				$(cssIDs.mappingPeriodInput + layer.id).val(layer.mapping.period);
				$(cssIDs.mappingScaleInput + layer.id).val(layer.mapping.scale);
				break;

			case mappings.flashing:
				$(cssIDs.mappingPeriodInput + layer.id).val(layer.mapping.period);
				$(cssIDs.mappingColorDropDown + layer.id).val(layer.mapping.color);
				break;

			case mappings.rotation:
				$(cssIDs.mappingPeriodInput + layer.id).val(layer.mapping.period);
				break;
		}

		this.mappingDropDownSelected(layer.id);
	}

	destroyLayerUI(layerID) {
		this.resetLayerUI(layerID);
		$(cssClasses.layer + layerID).remove();
	}

	resetLayerUI(layerID) {
		$(cssIDs.metricDropDown + layerID).igCombo("clearInput");
		$(cssIDs.mappingDropDown + layerID).igCombo("clearInput");

		$(cssClasses.metricParameter + layerID).igNumericEditor("destroy");
		$(cssClasses.metricParameter + layerID).igDatePicker("destroy");

		$(cssClasses.mappingParameter + layerID).igCombo("clearInput");

		$(cssIDs.mappingColorDropDown + layerID).igCombo("clearInput");

		$(cssClasses.metricParameter + layerID).hide();
		$(cssClasses.mappingParameter + layerID).hide();
	}
}