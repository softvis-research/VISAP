class MetricLayer {
	constructor(id) {
		this.id = id;

		this.entities = [];

		this.entityMetricMap = new Map();

		this.metric = {
			variant: "",
			from: "",
			to: ""
		}

		this.mapping = {
			variant: "",
			color: "",
			startColor: "",
			endColor: "",
			transparency: 0,
			period: 0,
			scale: 0
		};
	}

	getComboInput(genericCssId, defaultValue) {
		const selectedValue = $(genericCssId + this.id).igCombo("value");
		return selectedValue || defaultValue;
	}

	getDateInput(genericCssId, defaultDate) {
		const selectedValue = $(genericCssId + this.id).igDatePicker("value");
		const date = selectedValue ? new Date(selectedValue) : defaultDate;
		return date.getTime();
	}

	getNumericInput(genericCssId, defaultValue) {
		const selectedValue = $(genericCssId + this.id).igNumericEditor("value");
		return selectedValue !== "" ? Number(selectedValue) : defaultValue;
	}

	readUIData() {
		const selectedVariantString = this.getComboInput(cssIDs.metricSelectionDropDown, metricController.metricDefault.variant);
		this.metric.variant = Object.keys(metrics).find(key => metrics[key] === selectedVariantString);

		switch (selectedVariantString) {
			case metrics.dateOfCreation:
			case metrics.dateOfLastChange:
				this.metric.from = this.getDateInput(cssIDs.metricFromDateInput, new Date(0));
				this.metric.to = this.getDateInput(cssIDs.metricToDateInput, new Date());
				break;
			default:
				this.metric.from = this.getNumericInput(cssIDs.metricFromInput, Number.NEGATIVE_INFINITY);
				this.metric.to = this.getNumericInput(cssIDs.metricToInput, Number.POSITIVE_INFINITY);
				break;
		}

		this.mapping.variant = this.getComboInput(cssIDs.mappingDropDown, metricController.mappingDefault.variant);

		switch (this.mapping.variant) {
			case mappings.color:
				this.mapping.color = this.getComboInput(cssIDs.mappingColorDropDown, metricController.mappingDefault.color);
				break;
			case mappings.colorGradient:
				this.mapping.startColor = this.getComboInput(cssIDs.mappingStartColorDropDown, metricController.mappingDefault.startColor);
				this.mapping.endColor = this.getComboInput(cssIDs.mappingEndColorDropDown, metricController.mappingDefault.endColor);
				break;
			case mappings.transparency:
				this.mapping.transparency = this.getNumericInput(cssIDs.mappingTransparencyInput, metricController.mappingDefault.transparency);
				break;
			case mappings.pulsation:
				this.mapping.period = this.getNumericInput(cssIDs.mappingPeriodInput, metricController.mappingDefault.period);
				this.mapping.scale = this.getNumericInput(cssIDs.mappingScaleInput, metricController.mappingDefault.scale);
				break;
			case mappings.flashing:
				this.mapping.period = this.getNumericInput(cssIDs.mappingPeriodInput, metricController.mappingDefault.period);
				this.mapping.color = this.getComboInput(cssIDs.mappingColorDropDown, metricController.mappingDefault.color);
				break;
			case mappings.rotation:
				this.mapping.period = this.getNumericInput(cssIDs.mappingPeriodInput, metricController.mappingDefault.period);
				break;
		}
	}

	getMatchingEntities() {
		model.getAllEntities().forEach((entity) => {
			const metricProperty = entity[this.metric.variant];
			if (metricProperty === undefined) {
				return;
			}

			if (this.metric.from <= metricProperty && metricProperty <= this.metric.to) {
				this.entities.push(entity);
				this.entityMetricMap.set(entity.id, metricProperty)
			}
		});
	}

	doMapping() {
		switch (this.mapping.variant) {
			default:
			case mappings.color:
				canvasManipulator.changeColorOfEntities(this.entities, this.mapping.color, { name: "metricController - layer " + this.id });
				break;
			case mappings.colorGradient:
				this.setColorGradient();
				break;
			case mappings.transparency:
				canvasManipulator.changeTransparencyOfEntities(this.entities, this.mapping.transparency, { name: "metricController - layer " + this.id });
				break;
			case mappings.pulsation:
				canvasManipulator.startAnimation({ animation: "Expanding", entities: this.entities, period: this.mapping.period, scale: this.mapping.scale });
				break;
			case mappings.flashing:
				canvasManipulator.startAnimation({ animation: "Flashing", entities: this.entities, period: this.mapping.period, flashingColor: this.mapping.color });
				break;
			case mappings.rotation:
				canvasManipulator.startAnimation({ animation: "Rotation", entities: this.entities, period: this.mapping.period });
				break;
		}
	}

	setColorGradient() {
		if (this.entityMetricMap.size === 0) return;

		let minValue = Number.POSITIVE_INFINITY;
		let maxValue = Number.NEGATIVE_INFINITY;
		for (const metricValue of this.entityMetricMap.values()) {
			minValue = metricValue < minValue ? metricValue : minValue;
			maxValue = metricValue > maxValue ? metricValue : maxValue;
		}

		const colorGradient = new ColorGradient(this.mapping.startColor, this.mapping.endColor, minValue, maxValue);

		this.entities.forEach((entity) => {
			const gradientColor = colorGradient.calculateGradientColor(this.entityMetricMap.get(entity.id));
			canvasManipulator.changeColorOfEntities([entity], gradientColor.r + " " + gradientColor.g + " " + gradientColor.b, { name: "metricController - layer " + this.id });
		});
	}

	reset() {
		if (this.mapping !== undefined) {
			switch (this.mapping.variant) {
				case mappings.color:
				case mappings.colorGradient:
					canvasManipulator.resetColorOfEntities(this.entities, { name: "metricController - layer " + this.id });
					break;
				case mappings.transparency:
					canvasManipulator.resetTransparencyOfEntities(this.entities, { name: "metricController - layer " + this.id });
					break;
				case mappings.pulsation:
					canvasManipulator.stopAnimation({ animation: "Expanding", entities: this.entities });
					break;
				case mappings.flashing:
					canvasManipulator.stopAnimation({ animation: "Flashing", entities: this.entities });
					break;
				case mappings.rotation:
					canvasManipulator.stopAnimation({ animation: "Rotation", entities: this.entities });
					break;
			}
		}

		this.entities = [];
		this.entityMetricMap = new Map();
		this.metric = {
			variant: "",
			from: "",
			to: ""
		};
		this.mapping = {
			variant: "",
			color: "",
			startColor: "",
			endColor: "",
			transparency: 0,
			period: 0,
			scale: 0
		};
	}

}
