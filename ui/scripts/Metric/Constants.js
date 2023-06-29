const domIDs = {
	viewControllerHeader: "viewControllerHeader",
	metricDiv: "metricDiv",
	mappingDiv: "mappingDiv",

	downloadViewConfigButton: "downloadViewConfigButton",
	executeButton: "executeButton",
	resetButton: "resetButton",
	addLayerButton: "addLayerButton",

	headerTextNode: "headerTextNode",
	metricTextNode: "metricTextNode",
	mappingTextNode: "mappingTextNode",

	viewDropDown: "viewDropDown",

	metricSelectionDropDown: "metricSelectionDropDown",
	mappingDropDown: "mappingDropDown",

	mappingColorDropDown: "mappingColorDropDown",
	mappingStartColorDropDown: "mappingStartColorDropDown",
	mappingEndColorDropDown: "mappingEndColorDropDown",

	metricFromInput: "metricFromInput",
	metricToInput: "metricToInput",
	metricFromDateInput: "metricFromDateInput",
	metricToDateInput: "metricToDateInput",

	metricFromText: "metricFromText",
	metricToText: "metricToText",

	mappingFromText: "mappingFromText",
	mappingToText: "mappingToText",

	mappingFromInput: "mappingFromInput",
	mappingToInput: "mappingToInput",

	mappingTransparencyInput: "mappingTransparencyInput",
	mappingPeriodInput: "mappingPeriodInput",
	mappingScaleInput: "mappingScaleInput",

	mappingPeriodText: "mappingPeriodText",
	mappingScaleText: "mappingScaleText",

	deleteButton: "deleteButton"
};

const cssIDs = Object.fromEntries(
	Object.entries(domIDs).map(([key, value]) => [key, '#' + value])
);

const domClasses = {
	metricDiv: "metricDiv",
	mappingDiv: "mappingDiv",

	metricTextNode: "metricTextNode",
	mappingTextNode: "mappingTextNode",

	layer: "layer",

	metricNumParameter: "metricNumParameter",
	metricDateParameter: "metricDateParameter",
	mappingParameter: "mappingParameter",

	viewDropDown: "viewDropDown",
	metricsDropDown: "metricsDropDown",
	metricSelectionDropDown: "metricSelectionDropDown",
	mappingDropDown: "mappingDropDown",

	deleteButton: "deleteButton",

	textLabel: "textLabel"
}

const cssClasses = Object.fromEntries(
	Object.entries(domClasses).map(([key, value]) => [key, '.' + value])
);

const metrics = {
	numberOfStatements: "Number of Statements",
	amountOfResults: "Results",
	amountOfNamspa: "Namespaces",
	amountOfChnhis: "Changes",
	amountOfCodlen: "Code Length",
	amountOfCommam: "Comments",
	amountOfDynsta: "Dynamic Statements",
	amountOfEnhmod: "Enhancements",
	amountOfFormty: "Form Types",
	amountOfNomac: "Macro Expansions",
	amountOfObjnam: "Object Names",
	amountOfPraefi: "Prefixes",
	amountOfSlin: "SLIN",
	amountOfSql: "SQL",
	amountOfTodo: "TODO",
	dateOfCreation: "Date of Creation",
	dateOfLastChange: "Date of Last Change"
};

const mappings = {
	color: "Color",
	colorGradient: "Color Gradient",
	transparency: "Transparency",
	pulsation: "Pulsation",
	flashing: "Flashing",
	rotation: "Rotation"
};

const colors = [
	"red",
	"blue",
	"green",
	"black",
	"yellow",
	"orange"
];

const widgetSize = {
	buttonHeight: 45,
	headerDropDownHeight: 45,
	dropDownHeight: 25,
	inputHeight: 25,
	
	dropDownWidth: 180,
	buttonWidth: 125,
	inputWidthMapping: 73,
	inputWidthMetric: 100,
	
	inputDateWidth: 140,
	deleteButtonHeight: 27,
	deleteButtonWidth: "3.6%",
}
