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
				calls: "lime",
				isCalled: "magenta",
			},

			showLegendOnSelect: true,
			enableMonochromeForUnrelatedEntities: false,
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