const setup = {
	controllers: [
		{
			name: 	"defaultLogger",

			logActionConsole	: false,
			logEventConsole		: false
		},
		{
			name: 	"canvasHoverController",
		},
		{
			name:	"helloWorldController"
		}
	],

	ui: {
		name: "UI0",

		area: {
			name: "top",
			orientation: "horizontal",
			first: {
				size: "25%",
				collapsible: true,
				area: {
					name: "header",
					orientation: "vertical",
					first: {
						size: "20%",
						collapsible: false,
					},
					second: {
						size: "80%",
						controllers: [
							{ name: "helloWorldController" }
						]
					}
				}
			 },
			second: {
				size: "75%",
				collapsible: true,
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
