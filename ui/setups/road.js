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
			emphasizeMode: "coloredRoads",
			roadColorCalls: { r: 0, g: 0, b: 1 },
			roadColorIsCalled: { r: 1, g: 0, b: 1 },
			roadColorBidirectional: { r: 1, g: 0, b: 1 },
			roadColorAmbiguous: { r: 0, g: 0, b: 0 },

			emphasizedRoadOffsetY: 0.1,

			supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"]


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