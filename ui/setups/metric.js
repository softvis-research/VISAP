var setup = {
    controllers: [
        {
            name: "defaultLogger",
            logActionConsole: false,
            logEventConsole: false,
        },
        {
            name: "canvasHoverController",
        },
        {
            name: "metricController",
        },
    ],

    ui: {
        name: "UI0",

        navigation: {
            type: "examine",
        },
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
                ],
            },
            second: {
                size: "20%",
                name: "metric",
                controllers: [
                    { name: "metricController" },
                ],
            },
        },
    },
};
