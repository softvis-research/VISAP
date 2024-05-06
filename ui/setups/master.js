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
		}
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
