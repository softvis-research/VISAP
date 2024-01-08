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
			name: "canvasSelectController",
		},
		{
			name: "roadController",
			supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"],
			emphasizeMode: "ColoredRoads",
			roadColors: {
				ambiguous: "white",
				calls: "turquoise",
				isCalled: "orange",
				bidirectionalCall: "magenta",
			},
			showLegendOnSelect: true,
		},
	],

	ui: {
		name: "UI0",

		area: {
			name: "top",
			orientation: "horizontal",
			first: {},
			second: {
				size: "100%",
				collapsible: false,
				name: "canvas",
				canvas: {},

				controllers: [
					{ name: "defaultLogger" },
					{ name: "canvasHoverController" },
					{ name: "canvasSelectController" },
					{ name: "roadController" },
				],
			}
		}
	}
};