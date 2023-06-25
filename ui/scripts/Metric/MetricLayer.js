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

	readUIData() {
		this.metric.variant = ($(cssIDs.metricDropDown + this.id).val() == "" ? metricController.metricDefault.variant : $(cssIDs.metricDropDown + this.id).val());

		switch (this.metric.variant) {
			case metrics.dateOfCreation:
			case metrics.dateOfLastChange:
				this.metric.from = $(cssIDs.metricFromDateInput + this.id).val() === "" ? (new Date(0)).getTime() : (new Date($(cssIDs.metricFromDateInput + this.id).val())).getTime();
				this.metric.to = $(cssIDs.metricToDateInput + this.id).val() === "" ? (new Date()).getTime() : (new Date($(cssIDs.metricToDateInput + this.id).val())).getTime();
				break;
			default:
				this.metric.from = $(cssIDs.metricFromInput + this.id).val() === "" ? Number.NEGATIVE_INFINITY : Number($(cssIDs.metricFromInput + this.id).val());
				this.metric.to = $(cssIDs.metricToInput + this.id).val() === "" ? Number.POSITIVE_INFINITY : Number($(cssIDs.metricToInput + this.id).val());
				break;
		}

		this.mapping.variant = ($(cssIDs.mappingDropDown + this.id).val() == "" ? metricController.mappingDefault.variant : $(cssIDs.mappingDropDown + this.id).val());

		switch (this.mapping.variant) {
			case mappings.color:
				this.mapping.color = ($(cssIDs.mappingColorDropDown + this.id).val() == "" ? metricController.mappingDefault.color : $(cssIDs.mappingColorDropDown + this.id).val());
				break;

			case mappings.colorGradient:
				this.mapping.startColor = ($(cssIDs.mappingStartColorDropDown + this.id).val() == "" ? metricController.mappingDefault.startColor : $(cssIDs.mappingStartColorDropDown + this.id).val());
				this.mapping.endColor = ($(cssIDs.mappingEndColorDropDown + this.id).val() == "" ? metricController.mappingDefault.endColor : $(cssIDs.mappingEndColorDropDown + this.id).val());
				break;

			case mappings.transparency:
				this.mapping.transparency = ($(cssIDs.mappingTransparencyInput + this.id).val() == "" ? metricController.mappingDefault.transparency : $(cssIDs.mappingTransparencyInput + this.id).val());
				break;

			case mappings.pulsation:
				this.mapping.period = ($(cssIDs.mappingPeriodInput + this.id).val() == "" ? metricController.mappingDefault.period : $(cssIDs.mappingPeriodInput + this.id).val());
				this.mapping.scale = ($(cssIDs.mappingScaleInput + this.id).val() == "" ? metricController.mappingDefault.scale : $(cssIDs.mappingScaleInput + this.id).val());
				break;

			case mappings.flashing:
				this.mapping.period = ($(cssIDs.mappingPeriodInput + this.id).val() == "" ? metricController.mappingDefault.period : $(cssIDs.mappingPeriodInput + this.id).val());
				this.mapping.color = ($(cssIDs.mappingColorDropDown + this.id).val() == "" ? metricController.mappingDefault.color : $(cssIDs.mappingColorDropDown + this.id).val());
				break;

			case mappings.rotation:
				this.mapping.period = ($(cssIDs.mappingPeriodInput + this.id).val() == "" ? metricController.mappingDefault.period : $(cssIDs.mappingPeriodInput + this.id).val());
				break;
		}
	}

	getMatchingEntities() {
		model.getAllEntities().forEach((entity) => {
			if (entity[this.metric.variant] === undefined) {
				return;
			}

			if (this.metric.from <= entity[this.metric.variant]
				&& entity[this.metric.variant] <= this.metric.to) {
				this.entities.push(entity);
				this.entityMetricMap.set(entity.id, entity[this.metric.variant])
			}
		})
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
		let minValue;
		let maxValue;

		this.entityMetricMap.forEach(function (metricValue) {
			if (minValue >= metricValue || minValue == undefined) {
				minValue = metricValue;
			}
			if (maxValue <= metricValue || maxValue == undefined) {
				maxValue = metricValue;
			}
		})

		const colorGradient = new ColorGradient(this.mapping.startColor, this.mapping.endColor, minValue, maxValue);

		this.entities.forEach(function (entity) {
			const gradientColor = colorGradient.calculateGradientColor(this.entityMetricMap.get(entity.id));
			canvasManipulator.changeColorOfEntities([entity], gradientColor.r + " " + gradientColor.g + " " + gradientColor.b, { name: "metricController - layer " + this.id });
		}, this)

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
