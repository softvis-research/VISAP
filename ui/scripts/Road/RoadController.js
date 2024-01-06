controllers.roadController = function () {
	const controllerConfig = {
		name: "roadController",
		emphasizeMode: "coloredRoads",
		roadColorCalls: "cyan",
		roadColorIsCalled: "pink",
		roadColorBidirectional: "red",
		roadColorAmbiguous: "white",

		emphasizedRoadOffsetY: 0.05,

		supportedEntityTypes: ["Class", "Report", "FunctionGroup", "Interface"]
	}

	let emphasizedRoadSections = new Set();

	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		// LD TODO: Add logic for guideMode helper initialization here (if we plan to implement multiple modes)
		events.selected.on.subscribe(onEntitySelected);
		events.selected.off.subscribe(onEntityUnselected);
	}

	function onEntitySelected(applicationEvent) {
		const entityType = applicationEvent.entities[0].type;
		if (controllerConfig.supportedEntityTypes.includes(entityType)) {
			startElement = [applicationEvent.entities[0]]
			handleRoadEmphasizingForStartElement(startElement)
			canvasManipulator.highlightEntities(startElement, "red", { name: "roadController" });
		} else {
			return;
		}
	}

	function onEntityUnselected(applicationEvent) {
		canvasManipulator.unhighlightEntities([{ id: applicationEvent.entities[0].id }], { name: "roadController" });
		resetRoadEmphasizing();
	}

	function handleRoadEmphasizingForStartElement(startElement) {
		startElementId = startElement[0].id
		const roadSections = model.getAllRoadSectionsForStartElement(startElementId)
		roadSections.forEach(roadSection => {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], controllerConfig.roadColorCalls, { name: "roadController" });
			if (!emphasizedRoadSections.has(roadSection)) {
				canvasManipulator.alterPositionOfEntities([{ id: roadSection }], controllerConfig.emphasizedRoadOffsetY) // Y offset to dodge overlaps
			}
			emphasizedRoadSections.add(roadSection)
		});


		const destinationElements = model.getAllRoadStartElementsForDestinationElement(destinationElemenId = startElementId);
		destinationElements.forEach(destinationElement => {
			const roadSections = model.getAllRoadSectionsForStartElement(destinationElement)
			roadSections.forEach(roadSection => {
				canvasManipulator.changeColorOfEntities([{ id: roadSection }], controllerConfig.roadColorIsCalled, { name: "roadController" });
				if (!emphasizedRoadSections.has(roadSection)) {
					canvasManipulator.alterPositionOfEntities([{ id: roadSection }], controllerConfig.emphasizedRoadOffsetY) // Y offset to dodge overlaps
				}				
				emphasizedRoadSections.add(roadSection)
			});
		})

		// TEST!
		// TODO: Bring me in shape :o
		const aaa = []

		const xo = model.getAllRoadDestinationElementsForStartElement(startElementId)
		console.log("DESTINATIONS: " + xo)
		xo.forEach(x => {
			let yo = model.getAllRoadDestinationElementsForStartElement(x)
			console.log("DESTINATIONS OF DESTINATION " + yo)
			yo.forEach(y => {
				if(y === startElementId) {
					aaa.push(model.getAllRoadSectionsForStartElement(y))
				}
			})
		})
		console.log(aaa)
		aaa[0].forEach(a => {
			canvasManipulator.changeColorOfEntities([{ id: a }], controllerConfig.roadColorBidirectional, { name: "roadController" });
			if (!emphasizedRoadSections.has(a)) {
				console.log(a)
				canvasManipulator.alterPositionOfEntities([{ id: a }], controllerConfig.emphasizedRoadOffsetY) // Y offset to dodge overlaps
			}				
			emphasizedRoadSections.add(a)
		});
	}

	function resetRoadEmphasizing() {
		emphasizedRoadSections.forEach(roadSection =>  {
			canvasManipulator.changeColorOfEntities([{ id: roadSection }], "black", { name: "roadController" });
			canvasManipulator.alterPositionOfEntities([{ id: roadSection }], - controllerConfig.emphasizedRoadOffsetY)
		});
		emphasizedRoadSections.clear();
	}

	return {
		initialize: initialize,
	};
}();