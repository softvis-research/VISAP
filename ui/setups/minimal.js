const setup = {
	controllers: [
		{
			name: "defaultLogger",

			logActionConsole: false,
			logEventConsole: false,
		},
		{
			name: 	"canvasHoverController",
		},
	],

	ui: {
		name: "UI0",

		area: {
			name: "top",
			orientation: "horizontal",
			first: {
				resizable: false
			},
			second: {
				size: "100%",
				collapsible: false,
				name: "canvas",
				canvas: { },

				controllers: [
					{ name: "defaultLogger" },
					{ name: "canvasHoverController" },
				],
			}
		}
	}
};
