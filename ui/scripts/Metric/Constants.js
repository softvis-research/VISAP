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
	number_of_statements: "Number of Statements",
	amount_of_slin: "SLIN",
	number_of_object_references: "Number of References",
	number_of_exec_statements: "Number of executable statements",
	maximum_nesting_depth: "Maximum nesting depth",
	cyclomatic_complexity: "Cyclomatic complexity",
	keyword_named_variables: "Keyword named variables",
	number_of_comments: "Number of comments",
	halstead_difficulty: "Halstead difficulty",
	halstead_volume: "Halstead volume",
	halstead_effort: "Halstead effort",
	number_of_methods: "Number of methods",
	number_of_interfaces: "Number of interfaces",
	number_of_attributes: "Number of attributes",
	number_of_events: "Number of events",
	number_of_public_methods: "Number of public methods",
	number_of_redefined_methods: "Number of redefined methods",
	number_of_protected_methods: "Number of protected methods",
	number_of_public_attributes: "Number of public attributes",
	number_of_private_attributes: "Number of private attributes",
	number_of_protected_attributes: "number of protected attributes",

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
