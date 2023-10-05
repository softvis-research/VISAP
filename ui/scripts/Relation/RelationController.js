controllers.relationController = function () {
	// for clarity and consistency in handling relation array tuples
	// outgoing meaning a relation from this to something else, incoming meaning a relation from somewhere else to this
	const outgoing = 0;
	const incoming = 1;

	// list of entities whose relations to others are being displayed (not including intermediate steps of recursive relations)
	let sourceEntities = new Array();
	// for every source entity (and intermediate of recursive relations), the a tuple of lists with entities it is related to (separated by direction)
	let relatedEntitiesMap = new Map();
	// set of all entities that are related to sourceEntities overall, not including the source entities themselves
	let relatedEntitiesSet = new Set();

	let connectors = new Array();
	let relations = new Array();

	let activated = false;

	let relationConnectionHelper;

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
		reverseConnectorColor: { r: 1, g: 0, b: 0},
		endpointColor: { r: 0, g: 0, b: 0 },
		curvedConnectors: false,

		// highlight configs
		highlightColor: "black",

		// which fields to use for creating outgoing (first element) and incoming relations (second element)
		relationClasses: {
			calls: ["calls", "calledBy"],
			uses: ["use", "usedBy"]
		},
		relationsByEntityType: {
			"Method": "calls",
			"Function": "calls",
			"FunctionModule": "calls",
			"Report": "calls",
			"FormRoutine": "calls",
			"View": "uses",
			"Struct": "uses",
			"Domain": "uses",
			"Dataelement": "uses",
			"Tablebuilding": "uses"
		},
	}


	function initialize(setupConfig) {
		application.transferConfigParams(setupConfig, controllerConfig);

		if (controllerConfig.curvedConnectors) {
			relationConnectionHelper = createCurvedRelationConnectionHelper(controllerConfig);
		} else {
			relationConnectionHelper = createRelationConnectionHelper(controllerConfig);
		}

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

	function onRelationsChanged(applicationEvent) {
		events.log.info.publish({ text: "connector - onRelationsChanged" });

		if (controllerConfig.useMultiSelect) {
			sourceEntities = applicationEvent.entities;
		} else {
			sourceEntities.push(applicationEvent.entities[0]);
		}

		events.log.info.publish({ text: "connector - onRelationsChanged - selected Entity - " + applicationEvent.entities[0] });

		const newRelations = loadAllRelationsOf(sourceEntities);
		if (controllerConfig.showRecursiveRelations) {
			loadAllRecursiveRelationsOf(newRelations);
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
				createRelatedConnections(relations);
			}
		}
	}

	// given a list of entities, return a map depicting all relations originating from them
	function getRelatedEntities(sourceEntitiesArray) {
		const relatedEntities = new Map();
		for (const sourceEntity of sourceEntitiesArray) {
			relatedEntities.set(sourceEntity, getRelatedEntitiesOfSourceEntity(sourceEntity, sourceEntity.type));
		}
		return relatedEntities;
	}

	function createRelation(sourceEntity, relatedEntity, direction) {
		const relationIdConnector = direction === outgoing ? "--2--" : "--fr--";
		const relation = model.createEntity(
			"Relation",
			sourceEntity.id + relationIdConnector + relatedEntity.id,
			sourceEntity.name + " - " + relatedEntity.name,
			sourceEntity.name + " - " + relatedEntity.name,
			sourceEntity
		);
		relation.source = sourceEntity;
		relation.target = relatedEntity;
		relation.direction = direction;

		return relation;
	}

	// add these new relations to the internal relation state - duplicates will be filtered
	function loadRelations(newRelationMap, relationDirection) {
		const filterOutgoing = relationDirection === incoming;
		const filterIncoming = relationDirection === outgoing;

		const newRelations = [];
		for (const [sourceEntity, [relatedEntitiesOutgoing, relatedEntitiesIncoming]] of newRelationMap) {
			// merge into one array for easier traversal
			const newRelatedEntities = Array.prototype.concat(
				filterOutgoing ? [] : relatedEntitiesOutgoing.map(entity => [entity, outgoing]),
				filterIncoming ? [] : relatedEntitiesIncoming.map(entity => [entity, incoming])
			);
			const oldRelatedEntities = relatedEntitiesMap.get(sourceEntity);
			const relatedEntitiesOfSourceEntity = new Set(oldRelatedEntities);

			for (const [relatedEntity, direction] of newRelatedEntities) {
				if (relatedEntitiesOfSourceEntity.has(relatedEntity)) {
					events.log.info.publish({ text: "connector - onRelationsChanged - multiple relation" });
					continue;
				}
				if (!controllerConfig.showInnerRelations) {
					if (isTargetChildOfSourceParent(relatedEntity, sourceEntity)) {
						events.log.info.publish({ text: "connector - onRelationsChanged - inner relation" });
						continue;
					}
				}

				const relation = createRelation(sourceEntity, relatedEntity, direction);

				relations.push(relation);
				newRelations.push(relation);
				relatedEntitiesOfSourceEntity.add(relatedEntity);
				relatedEntitiesSet.add(relatedEntity);
			}

			relatedEntitiesMap.set(sourceEntity, Array.from(relatedEntitiesOfSourceEntity));
		}

		return newRelations;
	}

	function loadAllRelationsOf(sourceEntitiesArray, direction) {
		const newRelatedEntities = getRelatedEntities(sourceEntitiesArray);
		return loadRelations(newRelatedEntities, direction);
	}

	function getRelatedEntitiesOfSourceEntity(sourceEntity, entityType) {
		let relatedEntitiesOfSourceEntity = [[], []];

		const relationsConfig = controllerConfig.relationsByEntityType[entityType];
		const relationsProperties = typeof relationsConfig === 'string' ?
			controllerConfig.relationClasses[relationsConfig] : relationsConfig;
		if (!Array.isArray(relationsProperties)) return relatedEntitiesOfSourceEntity;

		for (const direction of [outgoing, incoming]) {
			const relationProperty = relationsProperties[direction];
			if (relationProperty && typeof relationProperty === 'string' && sourceEntity[relationProperty]) {
				const relatedEntities = sourceEntity[relationProperty];
				relatedEntitiesOfSourceEntity[direction].push(...relatedEntities);
			}
		}

		return relatedEntitiesOfSourceEntity;
	}

	function loadAllRecursiveRelationsOf(previouslyAddedRelations) {
		// filter out relations which point at previously reached entities
		const nonCyclicRelations = previouslyAddedRelations.filter(relation => !(relatedEntitiesMap.has(relation.target)));
		// map out which entities those relations point to, separated by direction
		const newRelatedEntitiesByDirection = nonCyclicRelations.reduce((acc, relation) => {
			acc[relation.direction].push(relation.target);
			return acc;
		}, [[], []]);
		// load relations separately for each set, filtered to match the same direction
		const newRelations = Array.prototype.concat(
			loadAllRelationsOf(newRelatedEntitiesByDirection[outgoing], outgoing),
			loadAllRelationsOf(newRelatedEntitiesByDirection[incoming], incoming)
		);
		// recursively move through descendants
		if (newRelations.length > 0) {
			loadAllRecursiveRelationsOf(newRelations);
		}
	}


	/*************************
			Connection
	*************************/

	function createRelatedConnections(newRelations) {

		newRelations.forEach(function (relation) {
			const sourceEntity = relation.source;
			const relatedEntity = relation.target;
			const options = {
				reversed: relation.direction === incoming
			};
			//create scene element
			const connectorElements = relationConnectionHelper.createConnector(sourceEntity, relatedEntity, relation.id, options);

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
