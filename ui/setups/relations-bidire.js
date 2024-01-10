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
			name: "relationController",
			sourceStartAtBorder: false,
			targetEndAtBorder: false,
			showInnerRelations: true,
			curvedConnectors: true,
			crateEndpoints: true,
			enableOutgoingConnectors: true,
			enableIncomingConnectors: true,

			outgoingConnectorColor: { r: 0.5, g: 0.1, b: 0.2 },
			incomingConnectorColor: { r: 0.1, g: 0.6, b: 0.5 },
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
					{ name: "relationController" },
				],
			}
		}
	}
};
