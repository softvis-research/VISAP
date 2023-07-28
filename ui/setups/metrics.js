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
