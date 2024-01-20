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
			roadHighlightVariant: "ParallelColorStripes", // choose MultiColorStripes, ParallelColorStripes, ...
			
			colorsMultiColorStripes: {
				undecided: "silver",
				calls: "turquoise",
				isCalled: "orange",
				bidirectionalCall: "magenta",
			},

			colorsParallelColorStripes: {
				calls: "blue",
				isCalled: "red",
			},

			// NOTE: don't set them in any other way by now. They need to be re-implemented.
			showLegendOnSelect: true,
			// enableTransparency: true,
			// enableRoadVanishing: false,
			// spawnTrafficSigns: false,
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