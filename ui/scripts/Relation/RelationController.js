controllers.relationController = function () {
	// list of entities whose relations to others are being displayed (not including intermediate steps of recursive relations)
	let sourceEntities = new Array();
	// for every source entity (and intermediate of recursive relations), the list of entities it is related to
	let relatedEntitiesMap = new Map();
	// set of all entities that are related to sourceEntities overall, not including the source entities themselves
	let relatedEntitiesSet = new Set();

	let connectors = new Array();
	let relations = new Array();

	let activated = false;

	let relationConnectionHelper;
	let curvedRelationConnectionHelper;

	//true for curved Relations, false for straight Relations
	let curved = new Boolean();

	// config parameters
	const controllerConfig = {
		showConnector: true,
		showHighlight: true,

		showRecursiveRelations: true,
		useMultiSelect: true,

		//connector configs
		fixPositionY: false,
		fixPositionZ: false,
		showInnerRelations: false,
		sourceStartAtParentBorder: false,
		targetEndAtParentBorder: false,
		sourceStartAtBorder: false,
		targetEndAtBorder: false,
		createEndpoints: false,
		connectorColor: { r: 0, g: 0, b: 1 },
		endpointColor: { r: 0, g: 0, b: 0 },
		curvedConnectors: false,

		// highlight configs
		highlightColor: "black",

		relationsByEntityType: {
			"Attribute": ["accessedBy"],
			"Method": ["accesses"],
			"Function": ["accesses"],
			"FunctionModule": ["calls"],
			"Report": ["calls"],
			"FormRoutine": ["calls"],
			"Reference": ["rcData"],
			"View": ["use", "usedBy"],
			"Struct": ["use", "usedBy"],
			"Domain": ["use", "usedBy"],
			"Dataelement": ["use", "usedBy"],
			"Tablebuilding": ["use", "usedBy"],
		},
	}


	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);
		relationConnectionHelper = createRelationConnectionHelper(controllerConfig);
		curvedRelationConnectionHelper = createCurvedRelationConnectionHelper(controllerConfig);

		curved = controllerConfig.curvedConnectors;

		events.selected.on.subscribe(onRelationsChanged);
		events.selected.off.subscribe(onEntityDeselected);
	}

	function activate() {
		activated = true;

		if (relatedEntitiesMap.size != 0) {
			if (controllerConfig.showConnector) {
				createRelatedConnections(relations);
			}
			if (controllerConfig.showHighlight) {
				highlightRelatedEntities(relatedEntitiesSet);
			}
		}
	}

	function deactivate() {
		reset();
		activated = false;
	}

	function reset() {
		if (controllerConfig.showConnector) {
			removeAllConnectors();
		}
		if (controllerConfig.showHighlight) {
			unhighlightAllRelatedEntities();
		}

		// remove relation entities
		relations.forEach(function (relation) {
			model.removeEntity(relation.id);
		});

		sourceEntities = new Array();
		relatedEntitiesMap = new Map();
		relatedEntitiesSet = new Set();
		relations = new Array();
	}

	function onEntityDeselected(applicationEvent) {
		const deselectedEntities = new Set(applicationEvent.entities);
		// all source entities were deselected
		if (sourceEntities.every(entity => deselectedEntities.has(entity))) {
			reset();
			return;
		}
		// there is currently no way to deselect only a subset without filtering it
	}


	async function onRelationsChanged(applicationEvent) {

		events.log.info.publish({ text: "connector - onRelationsChanged" });

		if (controllerConfig.useMultiSelect) {
			sourceEntities = applicationEvent.entities;
		} else {
			sourceEntities.push(applicationEvent.entities[0]);
		}

		events.log.info.publish({ text: "connector - onRelationsChanged - selected Entity - " + applicationEvent.entities[0] });

		await loadAllRelationsOf(sourceEntities);

		if (controllerConfig.showRecursiveRelations) {
			await loadAllRecursiveRelationsOf(sourceEntities);
		}

		events.log.info.publish({ text: "connector - onRelationsChanged - related Entities - " + relatedEntitiesMap.size });

		if (relatedEntitiesMap.size == 0) {
			return;
		}

		if (activated) {
			if (controllerConfig.showHighlight) {
				highlightRelatedEntities(relatedEntitiesSet);
			}

			if (controllerConfig.showConnector) {
				if (curved) {
					//new curved connectors are displayed
					createCurvedRelatedConnections(relations);
				} else {
					//normal straight connectors are displayed
					createRelatedConnections(relations);
				}
			}
		}
	}

	// given a list of entities, return a map depicting all relations originating from them
	async function getRelatedEntities(sourceEntitiesArray) {
		const relatedEntities = new Map();
		let entitiesToLoad = [];
		for (const sourceEntity of sourceEntitiesArray) {
			const unloadedRelatedEntities = getRelatedEntitiesOfSourceEntity(sourceEntity.unloadedRelationships, sourceEntity.type);
			if (unloadedRelatedEntities.length) {
				entitiesToLoad = entitiesToLoad.concat(unloadedRelatedEntities);
			}
		}
		if (entitiesToLoad.length) {
			await neo4jModelLoadController.loadTreesContainingAnyOf(entitiesToLoad);
		}
		for (const sourceEntity of sourceEntitiesArray) {
			relatedEntities.set(sourceEntity, getRelatedEntitiesOfSourceEntity(sourceEntity, sourceEntity.type));
		}
		return relatedEntities;
	}

	// add these new relations to the internal relation state - duplicates will be filtered
	function loadRelations(newRelationMap) {
		const newRelations = [];
		for (const [sourceEntity, allRelatedEntitiesOfSourceEntity] of newRelationMap) {
			const oldRelatedEntities = relatedEntitiesMap.get(sourceEntity);
			const relatedEntitiesOfSourceEntity = new Set(oldRelatedEntities);

			for (const relatedEntity of allRelatedEntitiesOfSourceEntity) {
				if (relatedEntitiesOfSourceEntity.has(relatedEntity)) {
					events.log.info.publish({ text: "connector - onRelationsChanged - multiple relation" });
					break;
				}
				if (!controllerConfig.showInnerRelations) {
					if (isTargetChildOfSourceParent(relatedEntity, sourceEntity)) {
						events.log.info.publish({ text: "connector - onRelationsChanged - inner relation" });
						break;
					}
				}

				const relation = model.createEntity(
					"Relation",
					sourceEntity.id + "--2--" + relatedEntity.id,
					sourceEntity.name + " - " + relatedEntity.name,
					sourceEntity.name + " - " + relatedEntity.name,
					sourceEntity
				);

				relation.source = sourceEntity;
				relation.target = relatedEntity;

				relations.push(relation);
				newRelations.push(relation);

				relatedEntitiesOfSourceEntity.add(relatedEntity);
				relatedEntitiesSet.add(relatedEntity);
			}

			relatedEntitiesMap.set(sourceEntity, Array.from(relatedEntitiesOfSourceEntity));
		}

		return newRelations;
	}

	async function loadAllRelationsOf(sourceEntitiesArray) {
		const newRelatedEntities = await getRelatedEntities(sourceEntitiesArray);
		return loadRelations(newRelatedEntities);
	}

	async function loadAllRelationsTo(targetEntitiesArray) {
		// there is no guarantee that all relations have a matching inverse
		// so we'll have to re-find all relations and filter them down to the ones pointing at the targets
		const newRelatedEntities = await getRelatedEntities(sourceEntities);
		const targetEntitiesSet = new Set(targetEntitiesArray);
		for (const [source, targets] of newRelatedEntities) {
			newRelatedEntities.set(source, targets.filter(target => targetEntitiesSet.has(target)));
		}
		return loadRelations(newRelatedEntities);
	}

	function getRelatedEntitiesOfSourceEntity(sourceEntity, entityType) {
		let relatedEntitiesOfSourceEntity = [];

		const relationsForThisType = controllerConfig.relationsByEntityType[entityType];
		if (relationsForThisType) {
			for (const relation of relationsForThisType) {
				if (sourceEntity[relation]) {
					relatedEntitiesOfSourceEntity.push(...sourceEntity[relation]);
				}
			}
		}

		return relatedEntitiesOfSourceEntity;
	}

	async function loadAllRecursiveRelationsOf(oldSourceEntities) {
		for (const oldSourceEntity of oldSourceEntities) {
			const relatedEntities = relatedEntitiesMap.get(oldSourceEntity);

			if (relatedEntities.length == 0) {
				return;
			}

			newSourceEntities = relatedEntities.filter(relatedEntity => (!relatedEntitiesMap.has(relatedEntity)));

			if (newSourceEntities.length == 0) {
				return;
			}

			await loadAllRelationsOf(newSourceEntities);
			await loadAllRecursiveRelationsOf(newSourceEntities);
		}
	}


	/*************************
			Connection
	*************************/

	function createRelatedConnections(newRelations) {

		newRelations.forEach(function (relation) {
			const sourceEntity = relation.source;
			const relatedEntity = relation.target;

			//create scene element
			const connectorElements = relationConnectionHelper.createConnector(sourceEntity, relatedEntity, relation.id);

			//source or target not rendered -> no connector
			if (!connectorElements) {
				events.log.error.publish({ text: "connector - createRelatedConnections - source or target not rendered" });
				return;
			}

			events.log.info.publish({ text: "connector - createRelatedConnections - create connector" });

			connectorElements.forEach(function (element) {
				connectors.push(element);
			});
		})
	}

	// new function for Curved Relations, similar to the one above
	function createCurvedRelatedConnections(newRelations) {

		newRelations.forEach(function (relation) {
			const sourceEntity = relation.source;
			const relatedEntity = relation.target;

			//create scene element, new helper class
			const curvedConnectorElements = curvedRelationConnectionHelper.createConnector(sourceEntity, relatedEntity, relation.id);

			//source or target not rendered -> no connector
			if (!curvedConnectorElements) {
				events.log.error.publish({ text: "connector - createRelatedConnections - source or target not rendered" });
				return;
			}

			events.log.info.publish({ text: "connector - createRelatedConnections - create connector" });

			curvedConnectorElements.forEach(function (element) {
				connectors.push(element);
			});
		})
	}

	function removeAllConnectors() {

		events.log.info.publish({ text: "connector - removeAllConnectors" });

		if (connectors.length == 0) {
			return;
		}

		//remove scene elements
		connectors.forEach(function (connector) {
			canvasManipulator.removeElement(connector);
		});

		connectors = new Array();
	}


	/************************
			Highlight
	************************/

	function highlightRelatedEntities(newRelatedEntities) {
		if (newRelatedEntities.size == 0) {
			return;
		}

		const visibleEntities = Array.from(newRelatedEntities).filter(entity => !entity.filtered);
		canvasManipulator.highlightEntities(visibleEntities, controllerConfig.highlightColor, { name: "relationController" });
	}

	function unhighlightAllRelatedEntities() {
		if (relatedEntitiesSet.size == 0) {
			return;
		}

		const visibleEntities = Array.from(relatedEntitiesSet).filter(entity => !entity.filtered);
		canvasManipulator.unhighlightEntities(visibleEntities, { name: "relationController" });
	}


	function isTargetChildOfSourceParent(target, source) {

		let targetParent = target.belongsTo;
		const sourceParent = source.belongsTo;

		while (targetParent !== undefined) {

			if (targetParent == sourceParent) {
				return true;
			}

			targetParent = targetParent.belongsTo;
		}

		return false;
	}

	return {
		initialize: initialize,
		reset: reset,
		activate: activate,
		deactivate: deactivate
	};


}();
