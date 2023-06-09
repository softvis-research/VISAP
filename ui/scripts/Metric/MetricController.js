controllers.metricController = (function () {

	const controllerConfig = {
		metrics: [
			metrics.numberOfStatements,
			metrics.dateOfCreation,
			metrics.dateOfLastChange,
			metrics.amountOfResults,
			metrics.amountOfNamspa,
			metrics.amountOfChnhis,
			metrics.amountOfCodlen,
			metrics.amountOfCommam,
			metrics.amountOfDynsta,
			metrics.amountOfEnhmod,
			metrics.amountOfFormty,
			metrics.amountOfNomac,
			metrics.amountOfObjnam,
			metrics.amountOfPraefi,
			metrics.amountOfSlin,
			metrics.amountOfSql,
			metrics.amountOfTodo
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
			{
				name: "View 1",
				viewMappings: [
					{
						metric: { "variant": "amountOfChnhis", "from": 1, "to": 2 },
						mapping: { "variant": "Pulsation", "color": "", "startColor": "", "endColor": "", "transparency": 0, "period": "1000", "scale": "2" }
					},
					{
						metric: { "variant": "amountOfNamspa", "from": 1, "to": 2 },
						mapping: { "variant": "Color", "color": "red", "startColor": "", "endColor": "", "transparency": 0, "period": 0, "scale": 0 }
					},
					{
						metric: { "variant": "amountOfCommam", "from": 1, "to": 2 },
						mapping: { "variant": "Flashing", "color": "orange", "startColor": "", "endColor": "", "transparency": 0, "period": "1000", "scale": 0 }
					},
				]
			},
			{
				name: "View 2",
				viewMappings: [
					{
						metric: { "variant": "amountOfNomac", "from": 0, "to": 0 },
						mapping: { "variant": "Transparency", "color": "", "startColor": "", "endColor": "", "transparency": 0.65, "period": 0, "scale": 0 }
					},
					{
						metric: { "variant": "amountOfNomac", "from": 1, "to": 30 },
						mapping: { "variant": "Flashing", "color": "red", "startColor": "", "endColor": "", "transparency": 0, "period": "1000", "scale": 0 }
					},
					{
						metric: { "variant": "amountOfDynsta", "from": 1, "to": 5 },
						mapping: { "variant": "Pulsation", "color": "", "startColor": "", "endColor": "", "transparency": 0, "period": "1000", "scale": "3" }
					},
					{
						metric: { "variant": "amountOfDynsta", "from": 1, "to": 5 },
						mapping: { "variant": "Transparency", "color": "", "startColor": "", "endColor": "", "transparency": 0.01, "period": 0, "scale": 0 }
					},
				]
			},
			{
				name: "View 3",
				viewMappings: [
					{
						metric: { "variant": "dateOfLastChange", "from": 1546300800000, "to": 1649808000000 },
						mapping: { "variant": "Transparency", "color": "", "startColor": "", "endColor": "", "transparency": 0.7, "period": 0, "scale": 0 }
					},
					{
						metric: { "variant": "amountOfTodo", "from": 1, "to": 5 },
						mapping: { "variant": "Flashing", "color": "red", "startColor": "", "endColor": "", "transparency": 0, "period": "500", "scale": 0 }
					},
					{
						metric: { "variant": "amountOfSlin", "from": 1, "to": 5 },
						mapping: { "variant": "Pulsation", "color": "", "startColor": "", "endColor": "", "transparency": 0, "period": "1000", "scale": "3" }
					},
				]
			},
		],
	};

	let domHelper;

	let layerCounter = 0;
	let layers = [];
	let viewConfig;

	const metricDefault = {
		variant: undefined,
		from: 0,
		to: 0
	}

	const mappingDefault = {
		variant: mappings.color,
		color: "white",
		startColor: "blue",
		endColor: "red",
		transparency: 0.5,
		period: 1000,
		scale: 2
	};


	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
	}

	function activate(rootDiv) {
		domHelper = new DomHelper(rootDiv, controllerConfig);
		domHelper.buildUiHead();

		addLayer();

		$(cssIDs.executeButton).click(executeButtonClicked);
		$(cssIDs.resetButton).click(resetButtonClicked);
		$(cssIDs.addLayerButton).click(addLayer);
		$(cssIDs.downloadViewConfigButton).click(downloadViewConfig);
		$(cssIDs.viewDropDown).on('change', changeView);
	}

	function executeButtonClicked(event) {
		for (let layer of layers) {
			layer.reset();

			layer.readUIData();
		}

		setTimeout(executeMapping, 10);

		if (typeof(viewConfig) === 'undefined') {
			return;
		}

		if (!viewEqualToMetricMappings(viewConfig, layers)) {
			$(cssIDs.viewDropDown).igCombo('clearInput', true);
		}
	}

	function changeView(event) {
		controllerConfig.views.forEach(function (view) {
			if (view.name == $(cssIDs.viewDropDown).val()) {
				viewConfig = view;
			}
		});

		reset();

		viewConfig.viewMappings.forEach(function (metricMapping) {
			addLayer('', metricMapping);
		})

		for (let layer of layers) {
			domHelper.setLayerUI(layer);
		}

		setTimeout(executeMapping, 10);
	}

	function executeMapping() {
		for (let layer of layers) {
			layer.getMatchingEntities();

			layer.doMapping();
		}
	}

	function addLayer(event, metricMapping) {
		const newLayer = new MetricLayer(++layerCounter);

		if (metricMapping !== undefined) {
			newLayer.metric = metricMapping.metric;
			newLayer.mapping = metricMapping.mapping;
		}

		layers.push(newLayer);

		domHelper.buildUiLayer(layerCounter);

		if (layerCounter > 1) {
		}
	}

	function removeLayer(event) {
		if (event !== undefined && $("#" + event.currentTarget.id).prop("disabled")) {
			return;
		}

		layers.pop().reset();
		domHelper.destroyLayerUI(layerCounter--);

		if (layerCounter > 0) {
			$(cssIDs.deleteButton + layerCounter).igButton({
				disabled: false });
		}
	}

	function downloadViewConfig(event) {
		const viewName = prompt("Please enter View name", "View");
		
		if (viewName === null) {
			return;
		}

		let text = '{\n\tname: "' + viewName + '",\n\tviewMappings: [';

		for (let layer of layers) {
			layer.readUIData();
			text += '\n\t\t{\n\t\t\tmetric: ' + JSON.stringify(layer.metric) + ',\n\t\t\tmapping: ' + JSON.stringify(layer.mapping) + '\n\t\t},';
		}

		text = text.slice(0, -1);
		text += '\n\t]\n}'

		downloadObjectAsTxt('viewConfig' + viewName + '.txt', text);
	}

	function downloadObjectAsTxt(filename, text) {
		const pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', filename);
		document.body.appendChild(pom); // required for firefox
		pom.click();
		pom.remove();
	}

	function viewEqualToMetricMappings(view, layers) {
		if (view.viewMappings.length != layers.length) {
			return false;
		}

		for (let layer of layers) {
			if (isEqual(view.viewMappings[layers.indexOf(layer)].metric, layer.metric) && isEqual(view.viewMappings[layers.indexOf(layer)].mapping, layer.mapping)) {
				return true;
			} else {
				return false;
			}
		}
	}

	function isEqual(obj1, obj2) {
		const props1 = Object.getOwnPropertyNames(obj1);
		const props2 = Object.getOwnPropertyNames(obj2);
		if (props1.length != props2.length) {
			return false;
		}
		for (let i = 0; i < props1.length; i++) {
			const [val1, val2] = (obj1[props1[i]], obj2[props1[i]]);
			const areObjects = isObject(val1) && isObject(val2);
			if (areObjects && !isEqual(val1, val2) || !areObjects && val1 !== val2) {
				return false;
			}
		}
		return true;
	}

	function isObject(object) {
		return object != null && typeof object === 'object';
	}

	function resetButtonClicked() {
		$(cssIDs.viewDropDown).igCombo("clearInput");

		reset();

		addLayer();
	}

	function reset() {
		while (layerCounter > 0) {
			removeLayer();
		}
	}


	return {
		initialize: initialize,
		activate: activate,
		reset: reset,

		removeLayer: removeLayer,

		metricDefault: metricDefault,
		mappingDefault: mappingDefault,
	}

})();
