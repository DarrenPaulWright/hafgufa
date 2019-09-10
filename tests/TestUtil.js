import { defer, delay } from 'async-agent';
import { assert } from 'chai';
import displayValue from 'display-value';
import keyCodes from 'keycodes';
import simulant from 'simulant';
import { isArray, isString } from 'type-enforcer';
import { CLICK_EVENT, KEY_UP_EVENT } from '../src/utility/domConstants';
import windowResize from '../src/utility/windowResize';

/**
 * basic tests for a getter/setter method on controls.
 * @function testMethod
 * @arg {Object} Control
 */
export default function TestUtil(Control) {
	const self = this;

	const addEventListenerOverRides = () => {
		const getEventIndex = (eventObject) => {
			let foundIndex = -1;
			let item;

			for (let index = 0; index < window.eventListeners.length; index++) {
				item = window.eventListeners[index];
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
			window.eventListeners = [];

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
					window.eventListeners.push(eventObject);
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
					window.eventListeners.splice(eventIndex, 1);
				}
			};
		}
	};

	const getControlTypeString = function() {
		const type = window.control && window.control.type ? window.control.type : 'undefined';
		return 'Test: ' + this.currentTest.fullTitle() + '\nControl: ' + type + '\n';
	};

	const eventTests = function() {
		const getEventList = () => {
			return window.eventListeners.map((listener) => {
					let output = listener.element.tagName;
					if (listener.element.getAttribute('type')) {
						output += '(type:' + listener.element.getAttribute('type') + ')';
					}
					output += '[id:' + listener.element.getAttribute('id') + ']-';
					output += '[classes:' + listener.element.classList + ']-';
					output += listener.eventName;
					return output;
				})
				.join(',\n');
		};

		assert.equal(window.eventListeners.length, 0, 'All events should be removed when a control is removed.\n' + getControlTypeString.call(this) + 'Still has these events:\n' + getEventList());
		window.eventListeners = [];
	};

	const memoryTests = function() {
		assert.isTrue(windowResize.length <= 1, 'windowResize shouldn\'t have any callbacks after a test is complete. Be sure you properly remove all controls.\n' + getControlTypeString.call(this));

		windowResize.discardAll();
	};

	const getElement = (element) => {
		return isString(element) ? document.querySelector(element) : element;
	};

	addEventListenerOverRides();

	beforeEach(function() {
		window.eventListeners = [];
		window.testContainer = document.createElement('div');
		document.body.appendChild(window.testContainer);
	});

	afterEach(function() {
		if (window.control && window.control.remove) {
			window.control.remove();
		}
		if (window.testContainer) {
			window.testContainer.remove();
		}

		memoryTests.call(this);
		eventTests.call(this);

		window.control = null;
		document.body.textContent = '';
	});

	self.testMethod = (settings) => {
		const buildOptions = () => ({
			...settings.defaultSettings,
			container: window.testContainer
		});

		describe('(testMethod)', () => {
			it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is not set', () => {
				window.control = new Control(buildOptions());

				if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
					assert.isTrue(window.control[settings.methodName]().isSame(settings.defaultValue));
				}
				else {
					assert.deepEqual(window.control[settings.methodName](), settings.defaultValue);
				}
			});

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is set to ' + displayValue(settings.defaultValue), () => {
					const options = buildOptions();
					options[settings.methodName] = settings.defaultValue;

					window.control = new Control(options);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isTrue(window.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(window.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			if (!settings.skipOptions) {
				it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' setting is set to ' + displayValue(settings.testValue), () => {
					const options = buildOptions();
					options[settings.methodName] = settings.testValue;

					window.control = new Control(options);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isTrue(window.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.deepEqual(window.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.defaultValue), () => {
					window.control = new Control(buildOptions())[settings.methodName](settings.defaultValue);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isTrue(window.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(window.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue), () => {
				window.control = new Control(buildOptions())[settings.methodName](settings.testValue);

				if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
					assert.isTrue(window.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(window.control[settings.methodName](), settings.testValue);
				}
			});

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue) + ' twice', () => {
				window.control = new Control(buildOptions());
				window.control[settings.methodName](settings.testValue);
				window.control[settings.methodName](settings.testValue);

				if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
					assert.isTrue(window.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(window.control[settings.methodName](), settings.testValue);
				}
			});

			if (settings.secondTestValue !== undefined) {
				it('should return ' + displayValue(settings.secondTestValue) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					window.control = new Control(buildOptions());
					window.control[settings.methodName](settings.testValue);
					window.control[settings.methodName](settings.secondTestValue);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isTrue(window.control[settings.methodName]().isSame(settings.secondTestValue));
					}
					else {
						assert.deepEqual(window.control[settings.methodName](), settings.secondTestValue);
					}
				});

				it('should NOT return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					window.control = new Control(buildOptions());
					window.control[settings.methodName](settings.testValue);
					window.control[settings.methodName](settings.secondTestValue);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isFalse(window.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.notDeepEqual(window.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.testValueClass !== undefined) {
				if (!isArray(settings.testValueClass)) {
					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName + ' method is NOT set', () => {
						window.control = new Control(buildOptions());

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});

					it('should have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue), () => {
						window.control = new Control(buildOptions());
						window.control[settings.methodName](settings.testValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 1);
					});

					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(settings.testValue) + ' and then to ' + displayValue(settings.defaultValue), () => {
						window.control = new Control(buildOptions());
						window.control[settings.methodName](settings.testValue);
						window.control[settings.methodName](settings.defaultValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});
				}
				else {
					settings.testValueClass.forEach((mainClassOptions) => {
						if (settings.defaultValue !== mainClassOptions.testValue) {
							it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName + ' method is NOT set', () => {
								window.control = new Control(buildOptions());

								assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
							});
						}

						settings.testValueClass.forEach((otherClassOptions) => {
							if (mainClassOptions.class === otherClassOptions.class) {
								it('should have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(mainClassOptions.testValue), () => {
									window.control = new Control(buildOptions());
									window.control[settings.methodName](mainClassOptions.testValue);

									assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 1);
								});

								if (settings.defaultValue !== mainClassOptions.testValue) {
									it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(mainClassOptions.testValue) + ' and then to ' + displayValue(settings.defaultValue), () => {
										window.control = new Control(buildOptions());
										window.control[settings.methodName](mainClassOptions.testValue);
										window.control[settings.methodName](settings.defaultValue);

										assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
									});
								}
							}
							else {
								it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName + ' method is set to ' + displayValue(otherClassOptions.testValue), () => {
									window.control = new Control(buildOptions());
									window.control[settings.methodName](otherClassOptions.testValue);

									assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
								});
							}
						});
					});
				}
			}
		});
	};

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

	self.getComputedTranslateXY = (query) => {
		const style = getComputedStyle(document.querySelector(query));
		const transform = style.transform || style.webkitTransform || style.mozTransform;

		let matrix = transform.match(/^matrix3d\((.+)\)$/);
		if (matrix) {
			return parseFloat(matrix[1].split(', ')[13]);
		}

		const transArr = [];
		matrix = transform.match(/^matrix\((.+)\)$/);
		matrix ? transArr.push(parseFloat(matrix[1].split(', ')[4])) : 0;
		matrix ? transArr.push(parseFloat(matrix[1].split(', ')[5])) : 0;

		return transArr;
	};
}
