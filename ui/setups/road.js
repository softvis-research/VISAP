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
			roadHighlightVariant: "ParallelColorStripes",

			colorsParallelColorStripes: {
				calls: "lime",
				isCalled: "magenta",
			},

			stripeProps : {
				stripesOffset: 0.25,
				posY: 0.75,
				sphereRadius: 0.19999,
				tubeRadius: 0.2,
				shrinkPct: 0.7
			}
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