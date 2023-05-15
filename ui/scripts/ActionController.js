controllers.actionController = (function () {


//*********************************
//	Constants
//*********************************

	const MOUSE_BUTTON_LEFT = 1;
	const MOUSE_BUTTON_RIGHT = 2;
	const MOUSE_BUTTON_MIDDLE = 3;


//*********************************
//	Variables
//*********************************

	const defaultTickTime = 1;

	// for passing the targeted entity into the non-AFrame mousedown event
	let hoveredEntity = null;
	// for passing the last clicked mouse button into the AFrame mouseup event
	let latestMouseButtonPressed = null;
	// for passing the cursor location to the non-AFrame mouseenter/mouseleave events
	let cursorX = 0;
	let cursorY = 0;

	const actions = {
		mouse: {
			key: [],
			down: createActionObject("mouseKeyDown"),
			up: createActionObject("mouseKeyUp"),
			during: createActionObject("mouseKeyDuring"),
			move: createActionObject("mouseMove"),
			doubleClick: createActionObject("mouseDoubleClick"),
			scroll: createActionObject("mouseScroll"),
			hover: createActionObject("mouseHover"),
			unhover: createActionObject("mouseUnhover"),
		},
		keyboard: {
			key: []
		}
	};

	let mouseMovedEvent = {};

	//create mouse action object for every key
	for (let i = 0; i < 5; i = i + 1) {
		actions.mouse.key.push({
			pressed: false,
			bubbles: false,
			startTime: 0,
			lastTick: 0,
			down: createActionObject("mouseKeyDown"),
			during: createActionObject("mouseKeyDuring"),
			up: createActionObject("mouseKeyUp")
		});
	}

	//create key action object for every key
	for (let i = 0; i < 200; i = i + 1) {
		actions.keyboard.key.push({
			pressed: false,
			bubbles: false,
			startTime: 0,
			lastTick: 0,
			down: createActionObject("keyboardKeyDown"),
			during: createActionObject("keyboardKeyDuring"),
			up: createActionObject("keyboardKeyUp")
		});
	}

	function createActionObject(type) {
		const tickTimePerListener = new Map();

		return {
			type: type,
			actionListeners: [],
			tickTimePerListener: tickTimePerListener,
			subscribe: function (listener, tickTime) {
				subscribeAction(this, listener, tickTime);
			},
			unsubscribe: function (listener) {
				unsubscribeAction(this, listener);
			}
		};
	}


//*********************************
//	Initialization
//*********************************


	function initialize() {
		const canvas = application.getCanvas();

		AFRAME.registerComponent('mouselistener', {
			init: function () {
				this.el.addEventListener("mouseup", function (eventObject) {
					if (eventObject.target.id != canvasId) {
						eventObject.component = hoveredEntity;
						eventObject.which = latestMouseButtonPressed;
						upAction(actions.mouse.key[getMouseButton(eventObject)], eventObject);
						upAction(actions.mouse, eventObject);
					}
				});
				this.el.addEventListener("mousedown", function (eventObject) {
					// AFrame mouse events don't contain information on the pressed button in 1.0.4
					// the below will ignore the custom AFrame event (triggered first) and capture the default MouseEvent
					if (eventObject.which != null) {
						eventObject.component = hoveredEntity;
						latestMouseButtonPressed = eventObject.which;

						downAction(actions.mouse.key[getMouseButton(eventObject)], eventObject);
						downAction(actions.mouse, eventObject);

						eventObject.stopPropagation();
					}
				});
				this.el.addEventListener("mouseenter", function (eventObject) {
					const component = document.getElementById(eventObject.target.id);
					if (component != null) {
						hoveredEntity = component;
					}
					if (eventObject.target.id != canvasId) {
						eventObject.layerX = cursorX;
						eventObject.layerY = cursorY;
						hoverAction(actions.mouse, eventObject);
					}

					if (!actions.mouse.bubbles) {
						eventObject.stopPropagation();
					}
				});
				this.el.addEventListener("mouseleave", function (eventObject) {
					if (eventObject.target.id != canvasId) {
						eventObject.layerX = cursorX;
						eventObject.layerY = cursorY;
						unhoverAction(actions.mouse, eventObject);
					}
					hoveredEntity = canvas;

					if (!actions.mouse.bubbles) {
						eventObject.stopPropagation();
					}
				});
				//  interrupts mousedown events somehow
				this.el.addEventListener("mousemove", function (eventObject) {
					moveAction(actions.mouse.move, eventObject);
					cursorX = eventObject.layerX;
					cursorY = eventObject.layerY;

					// don't stop propagation so splitter drag events still work
				});
				this.el.addEventListener("dblclick", function (eventObject) {
					eventObject.component = hoveredEntity;

					doubleClickAction(actions.mouse.doubleClick, eventObject);

					if (!actions.mouse.doubleClick.bubbles) {
						eventObject.stopPropagation();
					}
				});
				this.el.addEventListener("wheel", function (eventObject) {
					eventObject.component = hoveredEntity;

					scrollAction(actions.mouse.scroll, eventObject);

					if (!actions.mouse.scroll.bubbles) {
						eventObject.stopPropagation();
					}
				});
				this.el.addEventListener("keydown", function (eventObject) {

					downAction(actions.keyboard.key[eventObject.which], eventObject);

					if (!actions.keyboard.key[eventObject.which].bubbles) {
						eventObject.stopPropagation();
					}
				});
				this.el.addEventListener("keyup", function (eventObject) {

					upAction(actions.keyboard.key[eventObject.which], eventObject);

					if (!actions.keyboard.key[eventObject.which].bubbles) {
						eventObject.stopPropagation();
					}
				});
			}
		});

		canvas.setAttribute("mouselistener", "");
	}


//*********************************
//	Helper
//*********************************

	function getMouseButton(eventObject) {

		if (eventObject.which) {
			switch (eventObject.which) {
				case 1:
					return MOUSE_BUTTON_LEFT;
				case 3:
					return MOUSE_BUTTON_RIGHT;
				case 2:
					return MOUSE_BUTTON_MIDDLE;
				default:
					events.log.error.publish({text: "mousebutton " + eventObject.button + " not implemented"});
					return;
			}
		}

		if (eventObject.button) {
			switch (eventObject.button) {
				case 1:
					return MOUSE_BUTTON_LEFT;
				case 2:
					return MOUSE_BUTTON_RIGHT;
				case 4:
					return MOUSE_BUTTON_MIDDLE;
				default:
					events.log.error.publish({text: "mousebutton " + eventObject.button + " not implemented"});
					return;
			}
		}
	}

//*********************************
//	Subscribe / Unsubscribe
//*********************************

	function subscribeAction(actionObject, listener, tickTime) {

		const actionListenerArray = actionObject.actionListeners;

		if (listener in actionListenerArray) {
			events.log.error.publish({text: "listener allready subscribes"});
			return;
		}

		actionListenerArray.push(listener);

		if (tickTime) {
			actionObject.tickTimePerListener.set(listener, tickTime);
		} else {
			actionObject.tickTimePerListener.set(listener, defaultTickTime);
		}
	}

	function unsubscribeAction(actionObject, listener) {

		const actionListenerArray = actionObject.actionListeners;

		if (!listener in actionListenerArray) {
			events.log.error.publish({text: "listener not subscribed"});
			return;
		}

		actionListenerArray.splice(actionListenerArray.indexOf(listener), 1);
	}


//*********************************
//	Actions
//*********************************

	function downAction(action, eventObject) {
		events.log.action.publish({actionObject: action.down, eventObject: eventObject});

		action.pressed = true;
		action.startTime = Date.now();
		action.lastTick = Date.now();

		if (eventObject.component != null && eventObject.component.id != canvasId) {
			eventObject.entity = model.getEntityById(eventObject.component.id);
		}

		const downListeners = action.down.actionListeners;
		if (!downListeners) return;
		downListeners.forEach(function (downListener) {
			try {
				downListener(eventObject, action.startTime);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});

		const duringListeners = action.during.actionListeners;
		if (!duringListeners) return;
		duringListeners.forEach(function (duringListener) {
			const tickTime = action.during.tickTimePerListener.get(duringListener);
			setTimeout(function () {
				duringAction(action, duringListener, tickTime);
			}, tickTime);
		});
	}

	function duringAction(action, duringListener, tickTime) {

		if (!action.pressed) {
			return;
		}

		events.log.action.publish({actionObject: action.during, eventObject: {}});

		const timestamp = Date.now();
		const timeSinceStart = timestamp - action.startTime;
		const timeSinceLastTick = timestamp - action.lastTick;
		action.lastTick = timestamp;

		try {
			duringListener(mouseMovedEvent, timestamp, timeSinceStart, timeSinceLastTick);
		} catch (err) {
			events.log.error.publish({text: err.message});
		}

		setTimeout(function () {
			duringAction(action, duringListener, tickTime);
		}, tickTime);
	}

	function upAction(action, eventObject) {

		events.log.action.publish({actionObject: action.up, eventObject: eventObject});

		action.pressed = false;

		const timestamp = Date.now();

		const upListeners = action.up.actionListeners;
		if (!upListeners) return;
		upListeners.forEach(function (upListener) {
			try {
				upListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}

	function hoverAction(action, eventObject) {

		events.log.action.publish({actionObject: action.hover, eventObject: eventObject});

		const timestamp = Date.now();

		// add entity to event object for the listeners' benefit
		if (eventObject.component && eventObject.component.id != canvasId) {
			eventObject.entity = model.getEntityById(eventObject.component.id);
		}

		const hoverListeners = action.hover.actionListeners;
		if (!hoverListeners) return;
		hoverListeners.forEach(function (hoverListener) {
			try {
				hoverListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}

	function unhoverAction(action, eventObject) {

		events.log.action.publish({actionObject: action.unhover, eventObject: eventObject});

		action.pressed = false;

		const timestamp = Date.now();

		const unhoverListeners = action.unhover.actionListeners;
		if (!unhoverListeners) return;
		unhoverListeners.forEach(function (unhoverListener) {
			try {
				unhoverListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}

	function moveAction(action, eventObject) {

		events.log.action.publish({actionObject: action, eventObject: eventObject});

		mouseMovedEvent = eventObject;

		const timestamp = Date.now();

		const moveListeners = action.actionListeners;
		if (!moveListeners) return;
		moveListeners.forEach(function (moveListener) {
			try {
				moveListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}

	function doubleClickAction(action, eventObject) {
		events.log.action.publish({actionObject: action, eventObject: eventObject});

		const timestamp = Date.now();

		const doubleClickListeners = action.actionListeners;
		if (!doubleClickListeners) return;
		doubleClickListeners.forEach(function (doubleClickListener) {
			try {
				doubleClickListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}

	function scrollAction(action, eventObject) {

		events.log.action.publish({actionObject: action, eventObject: eventObject});

		// add entity to event object for the listeners' benefit
		if (hoveredEntity != null) {
			eventObject.entity = hoveredEntity;
		}

		const timestamp = Date.now();

		const scrollListeners = action.actionListeners;
		if (!scrollListeners) return;
		scrollListeners.forEach(function (scrollListener) {
			try {
				scrollListener(eventObject, timestamp);
			} catch (err) {
				events.log.error.publish({text: err.message});
			}
		});
	}


	return {
		initialize: initialize,
		actions: actions
	};
})();
