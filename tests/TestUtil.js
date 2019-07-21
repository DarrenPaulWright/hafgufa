import { defer, delay } from 'async-agent';
import { assert } from 'chai';
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

	const getControlTypeString = () => {
		const type = window.control && window.control.type ? window.control.type() : 'undefined';
		return 'Control: ' + type + '\n';
	};

	const eventTests = () => {
		const getEventList = () => {
			let output = '';

			for (let index = 0; index < window.eventListeners.length; index++) {
				if (index > 0) {
					output += ',\n';
				}
				output += window.eventListeners[index].element.tagName;
				if (window.eventListeners[index].element.getAttribute('type')) {
					output += '(type:' + window.eventListeners[index].element.getAttribute('type') + ')';
				}
				output += '[id:' + window.eventListeners[index].element.getAttribute('id') + ']-';
				output += window.eventListeners[index].eventName;
			}

			return output;
		};

		assert.equal(window.eventListeners.length, 0, 'All events should be removed when a control is removed.\n' + getControlTypeString() + 'Has:\n' + getEventList());
		window.eventListeners = [];
	};

	const memoryTests = () => {
		assert.isTrue(windowResize.getTotalCallbacks() <= 1, 'windowResize shouldn\'t have any callbacks after a test is complete. Be sure you properly remove all controls.\n' + getControlTypeString());

		windowResize.discardAll();
	};

	const getElement = (element) => {
		if (isString(element)) {
			element = document.querySelector(element);
		}
		return element;
	};

	addEventListenerOverRides();

	beforeEach(() => {
		window.eventListeners = [];
		window.testContainer = document.createElement('div');
		document.body.appendChild(window.testContainer);
	});

	afterEach(() => {
		if (window.control && window.control.remove) {
			window.control.remove();
		}
		if (window.testContainer) {
			window.testContainer.remove();
		}

		memoryTests();
		eventTests();

		window.control = null;
		document.body.textContent = '';
	});

	self.testMethod = (settings) => {
		const buildOptions = () => Object.assign({}, settings.defaultSettings, {
			container: window.testContainer
		});

		describe('(testMethod)', () => {
			it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' setting is not set', () => {
				window.control = new Control(buildOptions());

				if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
					assert.isTrue(window.control[settings.methodName]().isSame(settings.defaultValue));
				}
				else {
					assert.deepEqual(window.control[settings.methodName](), settings.defaultValue);
				}
			});

			if (settings.defaultValue !== undefined) {
				it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' setting is set to "' + settings.defaultValue + '"', () => {
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
				it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' setting is set to "' + settings.testValue + '"', () => {
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
				it('should return "' + settings.defaultValue + '" when the ' + settings.methodName + ' method is set to "' + settings.defaultValue + '"', () => {
					window.control = new Control(buildOptions())[settings.methodName](settings.defaultValue);

					if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
						assert.isTrue(window.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(window.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '"', () => {
				window.control = new Control(buildOptions())[settings.methodName](settings.testValue);

				if (window.control[settings.methodName]() && window.control[settings.methodName]().isSame) {
					assert.isTrue(window.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(window.control[settings.methodName](), settings.testValue);
				}
			});

			it('should return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" twice', () => {
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
				it('should return "' + settings.secondTestValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then "' + settings.secondTestValue + '"', () => {
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

				it('should NOT return "' + settings.testValue + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then "' + settings.secondTestValue + '"', () => {
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
					it('should NOT have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is NOT set', () => {
						window.control = new Control(buildOptions());

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});

					it('should have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '"', () => {
						window.control = new Control(buildOptions());
						window.control[settings.methodName](settings.testValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 1);
					});

					it('should NOT have class "' + settings.testValueClass + '" when the ' + settings.methodName + ' method is set to "' + settings.testValue + '" and then to "' + settings.defaultValue + '"', () => {
						window.control = new Control(buildOptions());
						window.control[settings.methodName](settings.testValue);
						window.control[settings.methodName](settings.defaultValue);

						assert.equal(document.querySelectorAll('body > div > .' + settings.testValueClass).length, 0);
					});
				}
				else {
					settings.testValueClass.forEach((mainClassOptions) => {
						if (settings.defaultValue !== mainClassOptions.testValue) {
							it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is NOT set', () => {
								window.control = new Control(buildOptions());

								assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
							});
						}

						settings.testValueClass.forEach((otherClassOptions) => {
							if (mainClassOptions.class === otherClassOptions.class) {
								it('should have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + mainClassOptions.testValue + '"', () => {
									window.control = new Control(buildOptions());
									window.control[settings.methodName](mainClassOptions.testValue);

									assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 1);
								});

								if (settings.defaultValue !== mainClassOptions.testValue) {
									it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + mainClassOptions.testValue + '" and then to "' + settings.defaultValue + '"', () => {
										window.control = new Control(buildOptions());
										window.control[settings.methodName](mainClassOptions.testValue);
										window.control[settings.methodName](settings.defaultValue);

										assert.equal(document.querySelectorAll('body > div > .' + mainClassOptions.class).length, 0);
									});
								}
							}
							else {
								it('should NOT have class "' + mainClassOptions.class + '" when the ' + settings.methodName + ' method is set to "' + otherClassOptions.testValue + '"', () => {
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
		let mat = transform.match(/^matrix3d\((.+)\)$/);

		if (mat) {
			return parseFloat(mat[1].split(', ')[13]);
		}

		const transArr = [];
		mat = transform.match(/^matrix\((.+)\)$/);
		mat ? transArr.push(parseFloat(mat[1].split(', ')[4])) : 0;
		mat ? transArr.push(parseFloat(mat[1].split(', ')[5])) : 0;

		return transArr;
	};
}
