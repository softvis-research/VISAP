controllers.events = (function() {

	let events = {};
	//event to listener map
	let eventMap = new Map();
	//event to model listener map
	let eventModelMap = new Map();

	//***************
	//state events
	//***************

	const modelStates = controllers.model.states;

	for (const stateName of modelStates) {
		let on = {
			name : "on" + stateName.charAt(0).toUpperCase() + stateName.slice(1) + "Event",

			subscribe: function(listener) {
				subscribeEvent(this, listener);
			},

			unsubscribe: function(listener) {
				unsubscribeEvent(this, listener);
			},

			publish: function(applicationEvent) {
				publishStateEvent(this, applicationEvent);
			}
		};

		let off = {
			name : "off" + stateName + "Event",

			subscribe: function(listener) {
				subscribeEvent(this, listener);
			},

			unsubscribe: function(listener) {
				unsubscribeEvent(this, listener);
			},

			publish: function(applicationEvent) {
				publishStateEvent(this, applicationEvent);
			}
		};

		events[stateName] = {
			name: stateName,
			on: on,
			off: off,
			getEntities: function() {
				return model.getEntitiesByState(this);
			}
		};
	};


	//**************
	//log events
	//**************

	const logTypes = [
		"info",
		"warning",
		"error",
		"controller",
		"action",
		"event",
		"manipulation"
	];

	events.log = {};

	for (const logType of logTypes) {
		const log = {
			type: "log" + logType.charAt(0).toUpperCase() + logType.slice(1) + "Event",

			subscribe: function(listener) {
				subscribeEvent(this, listener);
			},

			publish: function(logEvent) {
				// if logging has no listeners, hard write to console
				let eventListenerArray = eventMap.get(this);
				if (eventListenerArray === undefined) {
					if (logEvent.text) {
						console.log("NO LOGGER for " + this.type + " subscribed! - " + logEvent.text);
					} else {
						console.log("NO LOGGER for " + this.type + " subscribed!");
					}
					return;
				}
				publishEvent(this, logEvent);
			}
		};

		events.log[logType] = log;
	}


	//**************
	//UI events
	//**************

	events.ui = {};
	const buttonClick = {
		type: "buttonClickEvent",

		subscribe: function(listener) {
			subscribeEvent(this, listener);
		},

		publish: function(logEvent) {
			publishEvent(this, logEvent);
		}
	};
	events.ui.buttonClick = buttonClick;


	function subscribeEvent(eventType, listener) {
		if (!eventType in events) {
			events.log.error.publish({ text: "event " + eventType.name + " not in events"});
			return;
		}

		let eventListenerArray = eventMap.get(eventType);

		if (eventListenerArray === undefined) {
			eventListenerArray = [];
			eventMap.set(eventType, eventListenerArray);

			eventModelMap.set(eventType, listener);
			return;
		}

		if (listener in eventListenerArray) {
			events.log.warning.publish({ text: "listener already subscribes"});
			return;
		}

		eventListenerArray.push(listener);
	}

	function unsubscribeEvent(eventType, listener) {
		if (!eventType in events) {
			events.log.error.publish({ text: "event " + eventType.name + " not in events"});
			return;
		}

		let eventListenerArray = eventMap.get(eventType);
		if (eventListenerArray === undefined || !listener in eventListenerArray) {
			events.log.warning.publish({ text: "unsubscribe not subscribed listener: " + listener.toString()});
			return;
		}

		eventListenerArray.splice(eventListenerArray.indexOf(listener), 1);
	}

	function publishStateEvent(eventType, applicationEvent) {
		events.log.event.publish({ eventTypeName: eventType.name, applicationEvent: applicationEvent});

		try {
			publishEvent(eventType, applicationEvent);
		} catch(exception) {
			events.log.error.publish({text: `${exception}[${exception.fileName}-${exception.lineNumber}-${exception.columnNumber}]` });
		}
	}

	function publishEvent(eventType, applicationEvent) {
		let eventListenerArray = eventMap.get(eventType);

		if (eventListenerArray === undefined) {
			events.log.warning.publish({ text: "no listener subscribed"});
			return;
		}

		applicationEvent.eventType = eventType;
		applicationEvent.timeStamp = Date.now();

		//publish to listeners
		eventListenerArray.forEach(function(listener) {
			try {
				listener(applicationEvent);
			} catch(exception) {
				events.log.error.publish({text: `${exception}[${exception.fileName}-${exception.lineNumber}-${exception.columnNumber}]` });
			}
		});

		//change state of entity
		eventModelMap.get(eventType)(applicationEvent);
	}

	return events;
})();
