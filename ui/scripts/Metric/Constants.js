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

// Kurzbeschreibung je Metrik, angezeigt beim Hovern in der Metrik-Auswahl.
// Schlüssel ist der Anzeigename, weil die Combo nur den Text kennt.
const metricDescriptions = {
	[metrics.dateOfCreation]: "Datum, an dem das Objekt angelegt wurde.",
	[metrics.dateOfLastChange]: "Datum der letzten Änderung am Objekt.",
	[metrics.number_of_statements]: "Anzahl aller Anweisungen im Quellcode.",
	[metrics.amount_of_slin]: "Anzahl der Meldungen (Fehler, Warnungen, Hinweise) der erweiterten Programmprüfung (SLIN).",
	[metrics.number_of_object_references]: "Anzahl der Referenzen auf andere Objekte im Quellcode.",
	[metrics.number_of_exec_statements]: "Anzahl der ausführbaren Anweisungen – ohne Deklarationen und Kommentare.",
	[metrics.maximum_nesting_depth]: "Tiefste Verschachtelung von Kontrollstrukturen (IF, LOOP, …) im Quellcode.",
	[metrics.cyclomatic_complexity]: "McCabe-Metrik: Anzahl der unabhängigen Ausführungspfade. Hoher Wert = schwer zu testen.",
	[metrics.keyword_named_variables]: "Anzahl der Variablen, die wie ein ABAP-Schlüsselwort benannt sind.",
	[metrics.number_of_comments]: "Anzahl der Kommentare im Quellcode.",
	[metrics.halstead_difficulty]: "Halstead: Schwierigkeit bzw. Fehlerneigung, abgeleitet aus Operatoren und Operanden.",
	[metrics.halstead_volume]: "Halstead: Programmgröße, abgeleitet aus Operatoren und Operanden.",
	[metrics.halstead_effort]: "Halstead: geschätzter Implementierungsaufwand (Schwierigkeit × Volumen).",
	[metrics.number_of_methods]: "Anzahl der Methoden einer Klasse.",
	[metrics.number_of_interfaces]: "Anzahl der von einer Klasse implementierten Interfaces.",
	[metrics.number_of_attributes]: "Anzahl der Attribute eines Quellcode-Distrikts.",
	[metrics.number_of_events]: "Anzahl der definierten Events.",
	[metrics.number_of_public_methods]: "Anzahl der Methoden einer Klasse im öffentlichen Bereich (PUBLIC).",
	[metrics.number_of_redefined_methods]: "Anzahl der bei der Vererbung neu definierten (redefinierten) Methoden.",
	[metrics.number_of_protected_methods]: "Anzahl der Methoden einer Klasse im geschützten Bereich (PROTECTED).",
	[metrics.number_of_public_attributes]: "Anzahl der Attribute einer Klasse im öffentlichen Bereich (PUBLIC).",
	[metrics.number_of_private_attributes]: "Anzahl der Attribute einer Klasse im privaten Bereich (PRIVATE).",
	[metrics.number_of_protected_attributes]: "Anzahl der Attribute einer Klasse im geschützten Bereich (PROTECTED)."
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
