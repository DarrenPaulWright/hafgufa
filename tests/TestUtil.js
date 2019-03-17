import { assert } from 'chai';
import { defer, delay } from 'async-agent';
import { isArray } from 'type-enforcer';
import simulant from 'simulant';
import { CLICK_EVENT, KEY_UP_EVENT, WINDOW } from '../src/utility/domConstants';
import keyCodes from 'keyCodes';
import windowResize from '../src/utility/windowResize';

/**
 * basic tests for a getter/setter method on controls.
 * @function testMethod
 * @param {Object} Control
 */
export default function TestUtil(Control) {
	const self = this;

	const addEventListenerOverRides = () => {
		const getEventIndex = (eventObject) => {
			let foundIndex = -1;
			let item;

			for (let index = 0; index < WINDOW.eventListeners.length; index++) {
				item = WINDOW.eventListeners[index];
				if (item.element === eventObject.element &&
					item.eventName === eventObject.eventName &&
					item.handler === eventObject.handler &&
					item.useCapture === eventObject.useCapture) {
					foundIndex = index;
					break;
				}
			}

			return foundIndex;
		};

		if (!Element.prototype._addEventListener) {
			WINDOW.eventListeners = [];

			Element.prototype._addEventListener = Element.prototype.addEventListener;
			Element.prototype.addEventListener = function(eventName, handler, useCapture) {
				const eventObject = {
					element: this,
					eventName: eventName,
					handler: handler,
					useCapture: useCapture
				};

				this._addEventListener(eventName, handler, useCapture);

				if (getEventIndex(eventObject) === -1) {
					WINDOW.eventListeners.push(eventObject);
				}
			};

			Element.prototype._removeEventListener = Element.prototype.removeEventListener;
			Element.prototype.removeEventListener = function(eventName, handler, useCapture) {
				const eventObject = {
					element: this,
					eventName: eventName,
					handler: handler,
					useCapture: useCapture
				};
				const eventIndex = getEventIndex(eventObject);

				this._removeEventListener(eventName, handler, useCapture);

				if (eventIndex !== -1) {
					WINDOW.eventListeners.splice(eventIndex, 1);
				}
			};
		}
	};

	const getControlTypeString = () => {
		const type = WINDOW.control && WINDOW.control.type ? WINDOW.control.type() : 'undefined';
		return 'Control: ' + type + '\n';
	};

	const eventTests = () => {
		const getEventList = () => {
			let output = '';

			for (let index = 0; index < WINDOW.eventListeners.length; index++) {
				if (index > 0) {
					output += ',\n';
				}
				output += WINDOW.eventListeners[index].element.tagName;
				if (WINDOW.eventListeners[index].element.getAttribute('type')) {
					output += '(type:' + WINDOW.eventListeners[index].element.getAttribute('type') + ')';
				}
				output += '[id:' + WINDOW.eventListeners[index].element.getAttribute('id') + ']-';
				output += WINDOW.eventListeners[index].eventName;
			}

			return output;
		};

		assert.equal(WINDOW.eventListeners.length, 0, 'All events should be removed when a control is removed.\n' + getControlTypeString() + 'Has:\n' + getEventList());
		WINDOW.eventListeners = [];
	};

	const memoryTests = () => {
		assert.isTrue(windowResize.getTotalCallbacks() <= 1, 'windowResize shouldn\'t have any callbacks after a test is complete. Be sure you properly remove all controls.\n' + getControlTypeString());

		windowResize.discardAll();
	};

	const getElement = (element) => {
		if (typeof element === 'string') {
			element = document.querySelector(element);
		}
		return element;
	};

	addEventListenerOverRides();

	beforeEach(() => {
		WINDOW.eventListeners = [];
		WINDOW.testContainer = document.createElement('div');
		document.body.appendChild(WINDOW.testContainer);
	});

	afterEach(() => {
		if (WINDOW.control && WINDOW.control.remove) {
			WINDOW.control.remove();
		}
		if (WINDOW.testContainer) {
			WINDOW.testContainer.remove();
		}

		memoryTests();
		eventTests();

		WINDOW.control = null;
		document.body.textContent = '';
	});

	self.testMethod = (settings) => {
		const buildOptions = () => Object.assign({}, settings.defaultSettings, {
			container: WINDOW.testContainer
		});

		describe('(testMethod)', () => {
			it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' setting is not set', () => {
				WINDOW.control = new Control(buildOptions());

				if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
					assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.defaultValue));
				}
				else {
					assert.deepEqual(WINDOW.control[settings.methodName](), settings.defaultValue);
				}
			});

			if (settings.defaultValue !== undefined) {
				it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' setting is set to "' + settings.defaultValue + '"', () => {
					const options = buildOptions();
					options[settings.methodName] = settings.defaultValue;

					WINDOW.control = new Control(options);

					if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
						assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(WINDOW.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			if (!settings.skipOptions) {
				it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' setting is set to "' + settings.testValue + '"', () => {
					const options = buildOptions();
					options[settings.methodName] = settings.testValue;

					WINDOW.control = new Control(options);

					if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
						assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.deepEqual(WINDOW.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.defaultValue !== undefined) {
				it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' method is set to "' + settings.defaultValue + '"', () => {
					WINDOW.control = new Control(buildOptions())[settings.methodName](settings.defaultValue);

					if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
						assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(WINDOW.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '"', () => {
				WINDOW.control = new Control(buildOptions())[settings.methodName](settings.testValue);

				if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
					assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(WINDOW.control[settings.methodName](), settings.testValue);
				}
			});

			it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" twice', () => {
				WINDOW.control = new Control(buildOptions());
				WINDOW.control[settings.methodName](settings.testValue);
				WINDOW.control[settings.methodName](settings.testValue);

				if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
					assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(WINDOW.control[settings.methodName](), settings.testValue);
				}
			});

			if (settings.secondTestValue !== undefined) {
				it('should return "' + settings.secondTestValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then "' + settings.secondTestValue + '"', () => {
					WINDOW.control = new Control(buildOptions());
					WINDOW.control[settings.methodName](settings.testValue);
					WINDOW.control[settings.methodName](settings.secondTestValue);

					if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
						assert.isTrue(WINDOW.control[settings.methodName]().isSame(settings.secondTestValue));
					}
					else {
						assert.deepEqual(WINDOW.control[settings.methodName](), settings.secondTestValue);
					}
				});

				it('should NOT return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then "' + settings.secondTestValue + '"', () => {
					WINDOW.control = new Control(buildOptions());
					WINDOW.control[settings.methodName](settings.testValue);
					WINDOW.control[settings.methodName](settings.secondTestValue);

					if (WINDOW.control[settings.methodName]() && WINDOW.control[settings.methodName]().isSame) {
						assert.isFalse(WINDOW.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.notDeepEqual(WINDOW.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.testValueClass !== undefined) {
				if (!isArray(settings.testValueClass)) {
					it('should NOT have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is NOT set', () => {
						WINDOW.control = new Control(buildOptions());

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});

					it('should have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '"', () => {
						WINDOW.control = new Control(buildOptions());
						WINDOW.control[settings.methodName](settings.testValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 1);
					});

					it('should NOT have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then to "' + settings.defaultValue + '"', () => {
						WINDOW.control = new Control(buildOptions());
						WINDOW.control[settings.methodName](settings.testValue);
						WINDOW.control[settings.methodName](settings.defaultValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});
				}
				else {
					settings.testValueClass.forEach((mainClassOptions) => {
						if (settings.defaultValue !== mainClassOptions.testValue) {
							it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is NOT set', () => {
								WINDOW.control = new Control(buildOptions());

								assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
							});
						}

						settings.testValueClass.forEach((otherClassOptions) => {
							if (mainClassOptions.class === otherClassOptions.class) {
								it('should have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + mainClassOptions.testValue + '"', () => {
									WINDOW.control = new Control(buildOptions());
									WINDOW.control[settings.methodName](mainClassOptions.testValue);

									assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 1);
								});

								if (settings.defaultValue !== mainClassOptions.testValue) {
									it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + mainClassOptions.testValue + '" and then to "' + settings.defaultValue + '"', () => {
										WINDOW.control = new Control(buildOptions());
										WINDOW.control[settings.methodName](mainClassOptions.testValue);
										WINDOW.control[settings.methodName](settings.defaultValue);

										assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
									});
								}
							}
							else {
								it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + otherClassOptions.testValue + '"', () => {
									WINDOW.control = new Control(buildOptions());
									WINDOW.control[settings.methodName](otherClassOptions.testValue);

									assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
								});
							}
						});
					});
				}
			}
		});
	};

	self.getCacheMock = (onChangeCallback) => ({
		store: function() {
			return {
				get: function() {
					return new Promise((resolve) => {
						resolve();
					});
				},
				onChange: function() {
					if (onChangeCallback) {
						onChangeCallback();
					}
				},
				offChange: function() {
				}
			};
		},

		onStatusChange: function() {
			return 1;
		},

		offStatusChange: function() {
		},

		onWarning: function() {
			return 1;
		},

		offWarning: function() {
		},

		warnings: function() {
			return [];
		},

		onError: function() {
			return 1;
		},

		offError: function() {
		},

		errors: function() {
			return [];
		}
	});

	self.simulateClick = (element) => {
		self.trigger(element, CLICK_EVENT);
	};

	self.trigger = (element, eventName) => {
		if (element) {
			simulant.fire(getElement(element), eventName);
		}
	};

	self.simulateKeyEvent = (element, keyCode, eventName) => {
		if (element) {
			simulant.fire(getElement(element), (eventName || 'keypress'), {
				keyCode: keyCode || keyCodes('enter')
			});
		}
	};

	self.getTextInput = () => document.querySelector('input[type=text]');

	self.hitEnter = () => {
		self.simulateKeyEvent(self.getTextInput(), keyCodes('enter'), KEY_UP_EVENT);
	};

	self.typeText = (text) => {
		self.getTextInput().value = text;
	};

	self.emptyFunction = () => {
	};

	self.emptyPromise = () => new Promise((resolve) => {
		resolve();
	});

	self.returnInputPromise = (input) => new Promise((resolve) => {
		resolve(input);
	});

	self.defer = () => new Promise((resolve) => {
		defer(resolve);
	});

	self.delay = (duration = 0) => new Promise((resolve) => {
		delay(resolve, duration);
	});
}
