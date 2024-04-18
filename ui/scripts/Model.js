controllers.model = (function () {

	const states = ["selected", "marked", "hovered", "filtered", "tmpFiltered", "added", "componentSelected", "loaded"];

	let entitiesById = new Map();
	let eventEntityMap = new Map();
	let entitiesByContainedUnloadedProperty = new Map();

	function initialize() {
		//subscribe for changing status of entities on events
		states.forEach(function (eventName) {
			let event = events[eventName];

			let eventMap = new Map();
			eventEntityMap.set(event, eventMap);

			event.on.subscribe(function (applicationEvent) {
				applicationEvent.entities.forEach(function (entity) {
					entity[event.name] = true;
					eventMap.set(entity.id, entity);
				});
			});

			event.off.subscribe(function (applicationEvent) {
				applicationEvent.entities.forEach(function (entity) {
					entity[event.name] = false;
					eventMap.delete(entity.id);
				});
			});
		});
	}

	function createEntititesFromMetadata(metadataArray, areChildrenLoaded = true) {
		const newElements = [];
		metadataArray.forEach(function (element) {
			if (element.type === undefined) {
				console.log("element.type undefined");
			}

			let entity = createEntity(
				element.type.substring(element.type.indexOf(".") + 1),
				element.id,
				element.name,
				element.qualifiedName,
				element.belongsTo,
			);

			entity.isTransparent = false;

			entity.hasUnloadedChildren = !areChildrenLoaded;

			entity.dateOfCreation = parseDate(element.created);
			entity.dateOfLastChange = parseDate(element.changed);

			switch (entity.type) {
				case "Namespace":
					entity.version = element.version;
					break;

				case "Transaction":
					entity.calls = splitByCommaIfNotEmpty(element.calls);
					entity.calledBy = splitByCommaIfNotEmpty(element.calledBy);
					break;

				case "Interface":
					entity.superTypes = splitByCommaIfNotEmpty(element.subClassOf);
					entity.subTypes = splitByCommaIfNotEmpty(element.superClassOf);
					entity.reaches = splitByCommaIfNotEmpty(element.reaches);
					entity.reachedBy = [];
					break;

				case "Attribute":
					entity.accessedBy = splitByCommaIfNotEmpty(element.accessedBy);
					break;

				case "Method":
					entity.signature = element.signature;

					let pathParts = entity.qualifiedName.split("_");
					let pathString = pathParts[0];
					let path = pathString.split(".");
					path = path.splice(0, path.length - 1);
					let methodSignature = entity.signature.split(" ");
					methodSignature = methodSignature.splice(1, methodSignature.length);

					entity.qualifiedName = "";
					path.forEach(function (pathPart) {
						entity.qualifiedName = entity.qualifiedName + pathPart + ".";
					});
					methodSignature.forEach(function (methodSignaturePart) {
						entity.qualifiedName = entity.qualifiedName + methodSignaturePart + " ";
					});

					entity.qualifiedName = entity.qualifiedName.trim();
					if (entity.qualifiedName.slice(-1) == "." ) {
						entity.qualifiedName = element.qualifiedName;
					}

					entity.calls = splitByCommaIfNotEmpty(element.calls);
					entity.calledBy = splitByCommaIfNotEmpty(element.calledBy);
					entity.accesses = splitByCommaIfNotEmpty(element.accesses);
					break;

				case "FormRoutine":
					entity.calls = splitByCommaIfNotEmpty(element.calls);
					entity.calledBy = splitByCommaIfNotEmpty(element.calledBy);
					break;

				case "Variable":
					entity.accessedBy = splitByCommaIfNotEmpty(element.accessedBy);
					entity.dependsOn = element.dependsOn;
					entity.filename = element.filename;
					break;
				case "View":
				case "Struct":
				case "Domain":
				case "Dataelement":
				case "Tablebuildung":
					entity.use = splitByCommaIfNotEmpty(element.use);
					entity.used = splitByCommaIfNotEmpty(element.used);
					break;
				default:
					break;
			}
			setMetrics(entity, element);
			entitiesById.set(element.id, entity);
			newElements.push(entity);
		});

		setReferencesToEntities(newElements);
		return newElements;
	}

	function setMetrics(entity, element){
	    const metrics = new Set([
	    "number_of_statements","amount_of_slin","number_of_object_references","number_of_exec_statements",
	    "maximum_nesting_depth","cyclomatic_complexity","keyword_named_variables",
	    "number_of_comments","halstead_difficulty","halstead_volume","halstead_effort","number_of_methods",
	    "number_of_interfaces","number_of_attributes","number_of_events","number_of_redefined_methods",
	    "number_of_protected_methods","number_of_public_methods",
	    "number_of_private_attributes","number_of_protected_attributes","number_of_public_attributes"
	    ]);
	    const filteredKeys = Object.keys(element).filter(key => metrics.has(key));
	    filteredKeys.forEach( (key)=>{
	    entity[key] = element[key];
	    });
	}

	function splitByCommaIfNotEmpty(string) {
		if (string) {
			return string.split(',').map(element => element.trim());
		} else {
			return [];
		}
	}

	function parseDate(date) {
		if (!date) return new Date(0);

		date = date.toString();
		// change to YYYY-MM-DD because that's the only one JS can parse by default
		const dateString = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
		return new Date(dateString);
	}

	// removes duplicates by identity, does not guarantee order
	function removeDuplicates(arr) {
		return [...new Set(arr)];
	}

	// maps array of ids to arrray of pairs [id, <entity ref or undefinde>]
	function findEntitiesForIds(idArray) {
		return removeDuplicates(idArray)
			.filter(id => id && typeof id === 'string') // empty and non-string entries are dismissed
			.map(id => [id.trim(), entitiesById.get(id.trim())]);
	}

	function replaceIdsWithReferences(entity, relationName) {
		const idsForRelation = entity[relationName];
		const idsMappedToEntities = findEntitiesForIds(idsForRelation);
		entity[relationName] = [];

		idsMappedToEntities.forEach(pair => {
			const [relationTargetId, relationTargetEntity] = pair;
			if (relationTargetEntity === undefined) {
				// no entity matching the id was found - store it to be replaced later
				if (!(relationName in entity.unloadedRelationships)) {
					entity.unloadedRelationships[relationName] = [relationTargetId];
				} else {
					entity.unloadedRelationships[relationName].push(relationTargetId);
				}

				// store the mapping the other way around as well, so we easily know what to replace when we do load that entity
				const entitiesContainingThis = entitiesByContainedUnloadedProperty.get(relationTargetId);
				const referenceReminder = {
					entity: entity,
					property: relationName
				};
				if (entitiesContainingThis) {
					entitiesContainingThis.push(referenceReminder);
				} else {
					entitiesByContainedUnloadedProperty.set(relationTargetId, [referenceReminder]);
				}
			} else {
				entity[relationName].push(relationTargetEntity);
			}
		});
	}

	function setReferencesToEntities(entities) {
		entities.forEach(function (entity) {

			if (entity.belongsTo === undefined || entity.belongsTo === "root") {
				delete entity.belongsTo;
			} else {
				let parent = entitiesById.get(entity.belongsTo);
				if (parent === undefined) {
					events.log.error.publish({ text: "Parent of " + entity.name + " not defined" });
				} else {
					entity.belongsTo = parent;
					parent.children.push(entity);
				}
			}

			switch (entity.type) {
				case "Class":
					replaceIdsWithReferences(entity, 'superTypes');
					replaceIdsWithReferences(entity, 'subTypes');
					replaceIdsWithReferences(entity, 'antipattern');
					replaceIdsWithReferences(entity, 'reaches');
					entity.reaches.forEach(reachedEntity => reachedEntity.reachedBy.push(entity));
					break;

				case "Attribute":
					replaceIdsWithReferences(entity, 'accessedBy');
					break;

				case "Method":
					replaceIdsWithReferences(entity, 'calls');
					replaceIdsWithReferences(entity, 'calledBy');
					replaceIdsWithReferences(entity, 'accesses');
					break;

				case "Transaction":
					replaceIdsWithReferences(entity, 'calls');
					replaceIdsWithReferences(entity, 'calledBy');
					break;

				case "Report":
					if (entity.belongsTo.type == "Namespace") {
						entity.calls = [];
						entity.calledBy = [];
						return;
					}
				case "FunctionModule":
				case "FormRoutine":
					replaceIdsWithReferences(entity, 'calls');
					replaceIdsWithReferences(entity, 'calledBy');
					break;

				case "Variable":
					replaceIdsWithReferences(entity, 'accessedBy');
					break;

				case "View":
					replaceIdsWithReferences(entity, 'use');
					replaceIdsWithReferences(entity, 'used');
					break;
				case "Struct":
					replaceIdsWithReferences(entity, 'use');
					replaceIdsWithReferences(entity, 'used');
					break;
				case "Domain":
					replaceIdsWithReferences(entity, 'use');
					replaceIdsWithReferences(entity, 'used');
					break;
				case "Dataelement":
					replaceIdsWithReferences(entity, 'use');
					replaceIdsWithReferences(entity, 'used');
					break;
				case "Tablebuilding":
					replaceIdsWithReferences(entity, 'use');
					replaceIdsWithReferences(entity, 'used');
					break;
				default:
					break;
			}

			const entitiesReferencingThis = entitiesByContainedUnloadedProperty.get(entity.id);
			if (entitiesReferencingThis) {
				entitiesReferencingThis.forEach(referenceReminder => {
					const {entity: refEntity, property: refProperty} = referenceReminder;
					// add newly loaded element to property lists it's supposed to be on
					refEntity[refProperty].push(entity);
					// remove it from the list of properties that haven't been loaded yet
					refEntity.unloadedRelationships[refProperty] =
						refEntity.unloadedRelationships[refProperty].filter(id => id !== entity.id);
				});
				entitiesByContainedUnloadedProperty.delete(entity.id);
			}
		});

		entitiesById.forEach(function (entity) {
			entity.allParents = getAllParentsOfEntity(entity);
		});
	}

	function reset() {
		eventEntityMap.forEach(function (entityMap, eventKey) {
			entityMap.forEach(function (entity) {
				entity[eventKey.name] = false;
			});
			entityMap.clear();
		});
	}

	function createEntity(type, id, name, qualifiedName, belongsTo) {
		let entity = {
			type: type,
			id: id,
			name: name,
			qualifiedName: qualifiedName,
			belongsTo: belongsTo,
			children: [],
			allParents: [],
			unloadedRelationships: {}
		};

		states.forEach((stateName) => {
			entity[stateName] = false;
		});

		entitiesById.set(id, entity);

		return entity;
	}

	function removeEntity(id) {
		entitiesById.delete(id);
	}

	function getAllParentsOfEntity(entity) {
		let parents = [];

		if (entity.belongsTo !== undefined && entity.belongsTo !== "") {
			const parent = entity.belongsTo;
			parents.push(parent);

			if (parent !== entity) {
				const parentParents = getAllParentsOfEntity(parent);
				parents = parents.concat(parentParents);
			}
		}

		return parents;
	}

	function getAllChildrenOfEntity(entity) {
		let children = [];

		entity.children.forEach(function(child) {
			children.push(child);
			const grandChildren = getAllChildrenOfEntity(child);
			children = children.concat(grandChildren);
		});

		return children;
	}

	function getAllEntities() {
		return entitiesById;
	}

	function getEntityById(id) {
		return entitiesById.get(id);
	}

	function getEntitiesByState(stateEventObject) {
		return eventEntityMap.get(stateEventObject);
	}

	function getEntitiesByType(type) {
		return entitiesById.filter(entity => entity.type === type);
	}

	return {
		initialize: initialize,
		reset: reset,
		states: states,

		getAllEntities: getAllEntities,
		getEntityById: getEntityById,
		getEntitiesByState: getEntitiesByState,
		getEntitiesByType: getEntitiesByType,
		getAllParentsOfEntity: getAllParentsOfEntity,
		getAllChildrenOfEntity: getAllChildrenOfEntity,

		createEntity: createEntity,
		removeEntity: removeEntity,
		createEntititesFromMetadata: createEntititesFromMetadata,
	};

})();
