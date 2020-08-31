import displayValue from 'display-value';
import keyCodes from 'keycodes';
import simulant from 'simulant';
import { assert } from 'type-enforcer';
import { isArray, isString, windowResize } from 'type-enforcer-ui';
import { CLICK_EVENT, KEY_UP_EVENT } from '../index.js';
import './ControlTests.js';
import extendsTestRegister from './extendsTestRegister.js';
import './forms/FormControlTests.js';
import './graphs/GraphBaseTests.js';
import './mixins/ControlHeadingMixinTests.js';
import './mixins/FocusMixinTests.js';

const last = (array) => array[array.length - 1];

const CONSTRUCTOR = Symbol();
const CONTAINER = Symbol();

const addEventListenerOverRides = Symbol();
const getElement = Symbol();

export default class TestUtil {
	constructor(Control, isSvg) {
		const self = this;

		self._allEvents = [];
		self[CONSTRUCTOR] = Control;
		self[addEventListenerOverRides]();

		beforeEach(function() {
			self._allEvents.length = 0;
			self[CONTAINER] = isSvg ?
				document.createElementNS('http://www.w3.org/2000/svg', 'svg') :
				document.createElement('div');
			document.body.append(self[CONTAINER]);
		});

		afterEach(function() {
			const controlType = () => `Test: ${this.currentTest.fullTitle()}\nControl: ${self.control ? self.control.type : 'undefined'}\n`;

			const eventList = () => self._allEvents
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

			if (windowResize.length > 1) {
				throw new Error(`windowResize shouldn't have any callbacks after a test is complete. Be sure you properly remove all controls.\n${controlType()}`);
			}
			windowResize.discardAll();

			if (self._allEvents.length !== 0) {
				throw new Error(`All events should be removed when a control is removed.\n${controlType()}Still has these events:\n${eventList()}\n`);
			}
			self._allEvents.length = 0;

			self.control = null;
			document.body.textContent = '';
		});
	}

	[addEventListenerOverRides]() {
		const self = this;
		const isEqual = (a, b) => {
			return a.element === b.element &&
				a.name === b.name &&
				a.handler === b.handler &&
				a.useCapture === b.useCapture;
		};

		if (!Element.prototype._addEventListener) {
			Object.assign(Element.prototype, {
				_addEventListener: Element.prototype.addEventListener,
				addEventListener(name, handler, useCapture) {
					const eventObject = { element: this, name, handler, useCapture };

					this._addEventListener(name, handler, useCapture);

					if (self._allEvents.findIndex((event) => isEqual(event, eventObject)) === -1) {
						self._allEvents.push(eventObject);
					}
				},
				_removeEventListener: Element.prototype.removeEventListener,
				removeEventListener(name, handler, useCapture) {
					const eventObject = { element: this, name, handler, useCapture };
					const eventIndex = self._allEvents.findIndex((event) => isEqual(event, eventObject));

					this._removeEventListener(name, handler, useCapture);

					if (eventIndex !== -1) {
						self._allEvents.splice(eventIndex, 1);
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

	run(settings = {}) {
		const self = this;
		const testPackages = [];

		const walkPrototype = (constructor, callback) => {
			const proto = Object.getPrototypeOf(constructor);

			if (proto) {
				callback(proto.constructor.name);
				walkPrototype(proto, callback);
			}
		};

		const control = new self[CONSTRUCTOR]();

		walkPrototype(control, (name) => {
			if (!settings.skipTests || !settings.skipTests.includes(name)) {
				const tests = extendsTestRegister.get(name);

				if (tests) {
					testPackages.push(tests);
				}
			}
		});

		control.remove();

		testPackages.reverse()
			.forEach((testPackage) => {
				new testPackage.TestRunner(self[CONSTRUCTOR], self)
					.run(testPackage.name, settings);
			});
	}

	testMethod(settings) {
		const self = this;
		const Control = self[CONSTRUCTOR];
		const buildOptions = () => ({
			...settings.defaultSettings,
			container: this.container
		});

		describe('(testMethod)', () => {
			it(
				'should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is not set',
				() => {
					self.control = new Control(buildOptions());

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.is(self.control[settings.methodName]().isSame(settings.defaultValue), true);
					}
					else {
						assert.equal(self.control[settings.methodName](), settings.defaultValue);
					}
				}
			);

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' setting is set to ' +
					displayValue(settings.defaultValue), () => {
					const options = buildOptions();
					options[settings.methodName] = settings.defaultValue;

					self.control = new Control(options);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.is(self.control[settings.methodName]().isSame(settings.defaultValue), true);
					}
					else {
						assert.equal(self.control[settings.methodName](), settings.defaultValue);
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
						assert.is(self.control[settings.methodName]().isSame(settings.testValue), true);
					}
					else {
						assert.equal(self.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.defaultValue !== undefined) {
				it('should return ' + displayValue(settings.defaultValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.defaultValue), () => {
					self.control = new Control(buildOptions())[settings.methodName](settings.defaultValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.is(self.control[settings.methodName]().isSame(settings.defaultValue), true);
					}
					else {
						assert.equal(self.control[settings.methodName](), settings.defaultValue);
					}
				});
			}

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
				displayValue(settings.testValue), () => {
				self.control = new Control(buildOptions())[settings.methodName](settings.testValue);

				if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
					assert.is(self.control[settings.methodName]().isSame(settings.testValue), true);
				}
				else {
					assert.equal(self.control[settings.methodName](), settings.testValue);
				}
			});

			it('should return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
				displayValue(settings.testValue) + ' twice', () => {
				self.control = new Control(buildOptions());
				self.control[settings.methodName](settings.testValue);
				self.control[settings.methodName](settings.testValue);

				if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
					assert.is(self.control[settings.methodName]().isSame(settings.testValue), true);
				}
				else {
					assert.equal(self.control[settings.methodName](), settings.testValue);
				}
			});

			if (settings.secondTestValue !== undefined) {
				it('should return ' + displayValue(settings.secondTestValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					self.control = new Control(buildOptions());
					self.control[settings.methodName](settings.testValue);
					self.control[settings.methodName](settings.secondTestValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.is(self.control[settings.methodName]().isSame(settings.secondTestValue), true);
					}
					else {
						assert.equal(self.control[settings.methodName](), settings.secondTestValue);
					}
				});

				it('should NOT return ' + displayValue(settings.testValue) + ' when the ' + settings.methodName + ' method is set to ' +
					displayValue(settings.testValue) + ' and then ' + displayValue(settings.secondTestValue), () => {
					self.control = new Control(buildOptions());
					self.control[settings.methodName](settings.testValue);
					self.control[settings.methodName](settings.secondTestValue);

					if (self.control[settings.methodName]() && self.control[settings.methodName]().isSame) {
						assert.is(self.control[settings.methodName]().isSame(settings.testValue), false);
					}
					else {
						assert.notEqual(self.control[settings.methodName](), settings.testValue);
					}
				});
			}

			if (settings.testValueClass !== undefined) {
				if (!isArray(settings.testValueClass)) {
					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is NOT set', () => {
						self.control = new Control(buildOptions());

						assert.is(self.count('body > div > .' + settings.testValueClass), 0);
					});

					it('should have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is set to ' + displayValue(settings.testValue), () => {
						self.control = new Control(buildOptions());
						self.control[settings.methodName](settings.testValue);

						assert.is(self.count('body > div > .' + settings.testValueClass), 1);
					});

					it('should NOT have class ' + displayValue(settings.testValueClass) + ' when the ' + settings.methodName +
						' method is set to ' + displayValue(settings.testValue) + ' and then to ' +
						displayValue(settings.defaultValue), () => {
						self.control = new Control(buildOptions());
						self.control[settings.methodName](settings.testValue);
						self.control[settings.methodName](settings.defaultValue);

						assert.is(self.count('body > div > .' + settings.testValueClass), 0);
					});
				}
				else {
					settings.testValueClass.forEach((mainClassOptions) => {
						if (settings.defaultValue !== mainClassOptions.testValue) {
							it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
								' method is NOT set', () => {
								self.control = new Control(buildOptions());

								assert.is(self.count('body > div > .' + mainClassOptions.class), 0);
							});
						}

						settings.testValueClass.forEach((otherClassOptions) => {
							if (mainClassOptions.class === otherClassOptions.class) {
								it('should have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
									' method is set to ' + displayValue(mainClassOptions.testValue), () => {
									self.control = new Control(buildOptions());
									self.control[settings.methodName](mainClassOptions.testValue);

									assert.is(self.count('body > div > .' + mainClassOptions.class), 1);
								});

								if (settings.defaultValue !== mainClassOptions.testValue) {
									it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' +
										settings.methodName + ' method is set to ' + displayValue(mainClassOptions.testValue) +
										' and then to ' + displayValue(settings.defaultValue), () => {
										self.control = new Control(buildOptions());
										self.control[settings.methodName](mainClassOptions.testValue);
										self.control[settings.methodName](settings.defaultValue);

										assert.is(self.count('body > div > .' + mainClassOptions.class), 0);
									});
								}
							}
							else {
								it('should NOT have class ' + displayValue(mainClassOptions.class) + ' when the ' + settings.methodName +
									' method is set to ' + displayValue(otherClassOptions.testValue), () => {
									self.control = new Control(buildOptions());
									self.control[settings.methodName](otherClassOptions.testValue);

									assert.is(self.count('body > div > .' + mainClassOptions.class), 0);
								});
							}
						});
					});
				}
			}
		});
	}

	simulateClick(element) {
		if (!element) {
			throw new Error('element expected');
		}

		this.trigger(element, CLICK_EVENT);
	}

	trigger(element, eventName) {
		if (!element) {
			throw new Error('element expected');
		}

		simulant.fire(this[getElement](element), eventName);
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
		if (!element) {
			throw new Error('element expected');
		}

		return element.classList.contains(className);
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
