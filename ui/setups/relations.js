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
            name: "relationController",
            sourceStartAtBorder: false,
            targetEndAtBorder: false,
            showInnerRelations: true,      

            connectorColor: { r: 0, g: 0, b: 1 },
        },
	],

	ui: {
		name: "UI0",

		navigation: {
			//examine, walk, fly, helicopter, lookAt, turntable, game
			type: "examine",
			//speed: 10
		},
		area: {
			name: "top",
			orientation: "horizontal",
			first: { },
			second: {
				size: "100%",
				collapsible: false,
				name: "canvas",
				canvas: { },

				controllers: [
					{ name: "defaultLogger" },
					{ name: "canvasHoverController" },
                    { name: "relationController" },
				],
			}
		}
	}
};