var setup = {
	controllers: [

		{
		    name: 	"defaultLogger",

			logActionConsole	: false,
			logEventConsole		: false
		},
		{
		    name: 	"canvasHoverController",
		},
	],

	uis: [
		{	name: "UI0",

			navigation: {
				//examine, walk, fly, helicopter, lookAt, turntable, game
				type:	"examine",
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
				    ],
				}
			}
		}
	]
};