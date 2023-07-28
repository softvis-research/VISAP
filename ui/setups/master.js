const setup = {
	controllers: [
		{
			name: "defaultLogger",

			logActionConsole: false,
			logEventConsole: false
		},
		{
			name: "canvasHoverController",
		},
		{
			name: "metricController",
		},
		{
			name: "canvasSelectController",
		},
		{
			name: "relationController",
			sourceStartAtBorder: false,
			targetEndAtBorder: false,
			showInnerRelations: true,
			curvedConnectors: true,

			connectorColor: { r: 0, g: 0, b: 1 },
		},
	],

	ui: {
		name: "UI0",

		area: {
			name: "top",
			orientation: "horizontal",
			first: {
				size: "80%",
				collapsible: false,
				name: "canvas",
				canvas: {},

				controllers: [
					{ name: "defaultLogger" },
					{ name: "canvasHoverController" },
					{ name: "canvasSelectController" },
					{ name: "relationController" },
				],
			},
			second: {
				size: "20%",
				collapsible: false,
				name: "metrics",
				metrics: {},

				controllers: [
					{ name: "metricController" },
				],
			}
		}
	}
};
