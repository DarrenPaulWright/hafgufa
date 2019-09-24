import { assert } from 'chai';
import displayValue from 'display-value';
import keyCodes from 'keycodes';
import shortid from 'shortid';
import simulant from 'simulant';
import { isArray, isString } from 'type-enforcer';
import { CLICK_EVENT, KEY_UP_EVENT, windowResize } from '../src';

const last = (array) => array[array.length - 1];

const CONSTRUCTOR = Symbol();
const CONTAINER = Symbol();

const addEventListenerOverRides = Symbol();
const getElement = Symbol();

export default class TestUtil {
	constructor(Control, isSvg) {
		const self = this;

		self.allEvents = [];
		self[CONSTRUCTOR] = Control;
		self[addEventListenerOverRides]();
		self.temp = shortid.generate();

		beforeEach(function() {
			self.allEvents.length = 0;
			self[CONTAINER] = isSvg ? document.createElementNS(`http://www.w3.org/2000/svg`, 'svg') : document.createElement('div');
			document.body.appendChild(self[CONTAINER]);
		});

		afterEach(function() {
			const controlType = `Test: ${this.currentTest.fullTitle()}\nControl: ${self.control ? self.control.type : 'undefined'}\n`;
			const eventList = () => self.allEvents
				.map((listener) => {
					const type = listener.element.getAttribute('type');

					return `${listener.element.tagName}${type ? ':' +
						type : ''}[id:${listener.element.getAttribute('id')}]-[classes:${listener.element.classList}]-${listener.name}`;
				})
				.join(',\n');

			if (self.control && self.control.remove) {
				self.control.remove();
			}
			if (self.container) {
				self.container.remove();
			}

			assert.isTrue(
				windowResize.length <= 1,
				`windowResize shouldn't have any callbacks after a test is complete. Be sure you properly remove all controls.\n${controlType}`
			);
			windowResize.discardAll();

			assert.isTrue(
				self.allEvents.length === 0,
				`All events should be removed when a control is removed.\n${controlType}Still has these events:\n${eventList()}\n`
			);
			self.allEvents.length = 0;

			self.control = null;
			document.body.textContent = '';
		});
	}

	[addEventListenerOverRides]() {
		const self = this;
		const isEqual = (a, b) => {
			return a.element === b.element && a.name === b.name && a.handler === b.handler && a.useCapture === b.useCapture;
		};

		if (!Element.prototype._addEventListener) {
			Object.assign(Element.prototype, {
				_addEventListener: Element.prototype.addEventListener,
				addEventListener(name, handler, useCapture) {
					const eventObject = {element: this, name, handler, useCapture};

					this._addEventListener(name, handler, useCapture);

					if (self.allEvents.findIndex((event) => isEqual(event, eventObject)) === -1) {
						self.allEvents.push(eventObject);
					}
				},
				_removeEventListener: Element.prototype.removeEventListener,
				removeEventListener(name, handler, useCapture) {
					const eventObject = {element: this, name, handler, useCapture};
					const eventIndex = self.allEvents.findIndex((event) => isEqual(event, eventObject));

					this._removeEventListener(name, handler, useCapture);

					if (eventIndex !== -1) {
						self.allEvents.splice(eventIndex, 1);
					}
				}
			});
		}
	}

	[getElement](element) {
		return isString(element) ? this.first(element, true) : element;
	}

	get container() {
		return this[CONTAINER];
	}

	testMethod(settings) {
		const self = this;
		const Control = self[CONSTRUCTOR];
		const buildOptions = () => ({
			...settings.defaultSettings,
			container: this.container
		});

		describe('(testMethod)', () => {
			it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is not set', () => {
				self.control = new Control(buildOptions());

				if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
					assert.isTrue(self.control[settings.methodName]().isSame(settings.defaultValue));
				}
				else {
					assert.deepEqual(self.control[settings.methodName](), settings.defaultValue);
				}
			});

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is set to ' +
					displayValue(settings.defaultValue), () => {
					const options = buildOptions();
					options[settings.methodName] = settings.defaultValue;

					self.control = new Control(options);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.isTrue(self.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(self.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			if (!settings.skipOptions) {
				it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' setting is set to ' +
					displayValue(settings.testValue), () => {
					const options = buildOptions();
					options[settings.methodName] = settings.testValue;

					self.control = new Control(options);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.isTrue(self.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.deepEqual(self.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.defaultValue), () => {
					self.control = new Control(buildOptions())[settings.methodName](settings.defaultValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.isTrue(self.control[settings.methodName]().isSame(settings.defaultValue));
					}
					else {
						assert.deepEqual(self.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
				displayValue(settings.testValue), () => {
				self.control = new Control(buildOptions())[settings.methodName](settings.testValue);

				if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
					assert.isTrue(self.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(self.control[settings.methodName](), settings.testValue);
				}
			});

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
				displayValue(settings.testValue) + ' twice', () => {
				self.control = new Control(buildOptions());
				self.control[settings.methodName](settings.testValue);
				self.control[settings.methodName](settings.testValue);

				if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
					assert.isTrue(self.control[settings.methodName]().isSame(settings.testValue));
				}
				else {
					assert.deepEqual(self.control[settings.methodName](), settings.testValue);
				}
			});

			if (settings.secondTestValue !== undefined) {
				it('should return ' + displayValue(settings.secondTestValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					self.control = new Control(buildOptions());
					self.control[settings.methodName](settings.testValue);
					self.control[settings.methodName](settings.secondTestValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.isTrue(self.control[settings.methodName]().isSame(settings.secondTestValue));
					}
					else {
						assert.deepEqual(self.control[settings.methodName](), settings.secondTestValue);
					}
				});

				it('should NOT return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					self.control = new Control(buildOptions());
					self.control[settings.methodName](settings.testValue);
					self.control[settings.methodName](settings.secondTestValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.isFalse(self.control[settings.methodName]().isSame(settings.testValue));
					}
					else {
						assert.notDeepEqual(self.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.testValueClass !== undefined) {
				if (!isArray(settings.testValueClass)) {
					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is NOT set', () => {
						self.control = new Control(buildOptions());

						assert.equal(self.count('body > div > .' + settings.testValueClass), 0);
					});

					it('should have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is set to ' + displayValue(settings.testValue), () => {
						self.control = new Control(buildOptions());
						self.control[settings.methodName](settings.testValue);

						assert.equal(self.count('body > div > .' + settings.testValueClass), 1);
					});

					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is set to ' + displayValue(settings.testValue) + ' and then to ' +
						displayValue(settings.defaultValue), () => {
						self.control = new Control(buildOptions());
						self.control[settings.methodName](settings.testValue);
						self.control[settings.methodName](settings.defaultValue);

						assert.equal(self.count('body > div > .' + settings.testValueClass), 0);
					});
				}
				else {
					settings.testValueClass.forEach((mainClassOptions) => {
						if (settings.defaultValue !== mainClassOptions.testValue) {
							it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
								' method is NOT set', () => {
								self.control = new Control(buildOptions());

								assert.equal(self.count('body > div > .' + mainClassOptions.class), 0);
							});
						}

						settings.testValueClass.forEach((otherClassOptions) => {
							if (mainClassOptions.class === otherClassOptions.class) {
								it('should have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
									' method is set to ' + displayValue(mainClassOptions.testValue), () => {
									self.control = new Control(buildOptions());
									self.control[settings.methodName](mainClassOptions.testValue);

									assert.equal(self.count('body > div > .' + mainClassOptions.class), 1);
								});

								if (settings.defaultValue !== mainClassOptions.testValue) {
									it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' +
										settings.methodName + ' method is set to ' + displayValue(mainClassOptions.testValue) +
										' and then to ' + displayValue(settings.defaultValue), () => {
										self.control = new Control(buildOptions());
										self.control[settings.methodName](mainClassOptions.testValue);
										self.control[settings.methodName](settings.defaultValue);

										assert.equal(self.count('body > div > .' + mainClassOptions.class), 0);
									});
								}
							}
							else {
								it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
									' method is set to ' + displayValue(otherClassOptions.testValue), () => {
									self.control = new Control(buildOptions());
									self.control[settings.methodName](otherClassOptions.testValue);

									assert.equal(self.count('body > div > .' + mainClassOptions.class), 0);
								});
							}
						});
					});
				}
			}
		});
	}

	simulateClick(element) {
		this.trigger(element, CLICK_EVENT);
	}

	trigger(element, eventName) {
		if (element) {
			simulant.fire(this[getElement](element), eventName);
		}
	}

	simulateKeyEvent(element, keyCode, eventName) {
		if (element) {
			simulant.fire(this[getElement](element), (eventName || 'keypress'), {
				keyCode: keyCode || keyCodes('enter')
			});
		}
	}

	getTextInput() {
		return this.first('input[type=text]');
	}

	hitEnter() {
		this.simulateKeyEvent(this.getTextInput(), keyCodes('enter'), KEY_UP_EVENT);
	}

	typeText(text) {
		this.getTextInput().value = text;
	}

	getComputedTranslateXY(selector) {
		const style = getComputedStyle(this.first(selector, true));
		const transform = style.transform || style.webkitTransform || style.mozTransform;

		let matrix = transform.match(/^matrix3d\((.+)\)$/);
		if (matrix) {
			return parseFloat(matrix[1].split(', ')[13]);
		}

		matrix = transform.match(/^matrix\((.+)\)$/);
		if (matrix) {
			matrix = matrix[1].split(', ');
			return [parseFloat(matrix[4]), parseFloat(matrix[5])];
		}

		return [];
	}

	hasClass(element, className) {
		const BASE_PREFIX = '(\\s|^)';
		const BASE_SUFFIX = '(\\s|$)';

		if (element) {
			if (element.classList) {
				return element.classList.contains(className);
			}
			else {
				return new RegExp(BASE_PREFIX + className + BASE_SUFFIX).test(element.className);
			}
		}
	}

	first(selector, isGlobal) {
		return isGlobal ? document.querySelector(selector) : this[CONTAINER].querySelector(selector);
	}

	all(selector, isGlobal) {
		return isGlobal ? document.querySelectorAll(selector) : this[CONTAINER].querySelectorAll(selector);
	}

	last(selector, isGlobal) {
		return last(this.all(selector, isGlobal));
	}

	count(selector, isGlobal) {
		return this.all(selector, isGlobal).length;
	}

	nth(selector, n, isGlobal) {
		return this.all(selector, isGlobal)[n];
	}

	nthChild(selector, n, isGlobal) {
		return this.first(selector, isGlobal).children[n];
	}
}
