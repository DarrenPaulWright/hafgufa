import { wait } from 'async-agent';
import { forOwn } from 'object-agent';
import { assert, isFunction } from 'type-enforcer';
import { castArray, CssSize, windowResize } from 'type-enforcer-ui';
import { CLICK_EVENT, Container } from '../index.js';

const TEST_ID = 'testId';
const TEST_ID_SUFFIX = 'testIdSuffix';
const mainExceptions = ['run', 'buildSettings'];
const extraTests = ['focus', 'onChange'];

const CONTROL = Symbol();
const TEST_UTIL = Symbol();
const SETTINGS = Symbol();

/**
 * @param object
 * @param callback
 */
function forIn(object, callback) {
	const allProps = ['constructor', '__defineGetter__', '__defineSetter__'];
	let proto = Object.getPrototypeOf(object);

	while (proto) {
		Object.getOwnPropertyNames(proto)
			.forEach((key) => {
				if (isFunction(proto[key]) && !allProps.includes(key)) {
					allProps.push(key);
					callback(key);
				}
			});

		proto = Object.getPrototypeOf(proto);
	}
}

export default class ControlTests {
	constructor(Control, testUtil, settings = {}) {
		const self = this;

		self[CONTROL] = Control;
		self[TEST_UTIL] = testUtil;
		self[SETTINGS] = settings;
	}

	buildSettings(localSettings) {
		const self = this;

		return {
			id: TEST_ID,
			container: self[TEST_UTIL].container,
			delay: 0,
			fade: false,
			...self[SETTINGS].extraSettings,
			...localSettings
		};
	}

	run(exceptions, additions, extraSettings = {}) {
		const self = this;

		exceptions = castArray(exceptions).concat(mainExceptions);
		additions = castArray(additions);

		forIn(self, (method) => {
			const exclude = exceptions.includes(method);
			const include = additions.includes(method);
			const extra = extraTests.includes(method);

			if ((!exclude && !extra) || (include && extra)) {
				self[method]();
			}
		});

		forOwn(extraSettings, (value, key) => {
			if (self[key]) {
				self[key](extraSettings);
			}
		});
	}

	construct() {
		const self = this;

		describe('Control initialize', () => {
			it('without settings', () => {
				self[TEST_UTIL].control = new self[CONTROL]();

				assert.is(self[TEST_UTIL].count('.' + self[SETTINGS].mainCssClass), 0);
			});

			if (self[SETTINGS].mainCssClass) {
				it(`should have a css class called ${self[SETTINGS].mainCssClass}`, () => {
					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

					assert.is(self[TEST_UTIL].count('.' + self[SETTINGS].mainCssClass), 1);
				});
			}
		});
	}

	container() {
		const self = this;

		describe('Control container', () => {
			it('should not have a container value if no container was set', () => {
				const initialLength = windowResize.length;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					container: null
				}));

				assert.is(self[TEST_UTIL].container.children.length, 0);
				assert.is(self[TEST_UTIL].control.container(), null);
				assert.is(windowResize.length, initialLength);
			});

			it('should have a container element if the container setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.is(self[TEST_UTIL].container.children.length >= 1, true);
				assert.is(self[TEST_UTIL].control.container() instanceof Element, true);
			});

			it('should have a container element if the container method was called', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					container: null
				})).container(self[TEST_UTIL].container);

				assert.is(self[TEST_UTIL].container.children.length, 1);
				assert.is(self[TEST_UTIL].control.container() instanceof Element, true);
			});

			it('should add a callback to windowResize', () => {
				const initialLength = windowResize.length;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					container: self[TEST_UTIL].container
				}));

				assert.is(windowResize.length, initialLength + 1);
			});

			it('should NOT add a callback to windowResize if set in the content setting of a Container', () => {
				const initialLength = windowResize.length;

				self[TEST_UTIL].control = new Container({
					container: self[TEST_UTIL].container,
					content: self.buildSettings({
						control: self[CONTROL]
					})
				});

				assert.is(windowResize.length, initialLength + 1);
			});

			it('should NOT add a callback to windowResize if set in the content method of a Container', () => {
				const initialLength = windowResize.length;

				self[TEST_UTIL].control = new Container({
					container: self[TEST_UTIL].container
				});

				self[TEST_UTIL].control.content(self.buildSettings({
					control: self[CONTROL]
				}));

				assert.is(windowResize.length, initialLength + 1);
			});
		});
	}

	element() {
		const self = this;

		describe('Control main container', () => {
			it('should not have a main element if no container was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					container: null
				}));

				assert.is(self[TEST_UTIL].container.children.length, 0);
				assert.is(self[TEST_UTIL].control.element instanceof Element, true);
			});

			it('should have a main element if the container was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.atLeast(self[TEST_UTIL].container.children.length, 1);
				assert.is(self[TEST_UTIL].control.element instanceof Element, true);
			});
		});
	}

	id() {
		const self = this;

		describe('Control .id', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'id',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: '',
				testValue: TEST_ID
			});

			it('should have an element with the id property set if the id setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.is(self[TEST_UTIL].count('#' + TEST_ID, true), 1);
			});

			it('should have an element with the id property set if the id method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					id: null
				}))
					.id(TEST_ID);

				assert.is(self[TEST_UTIL].count('#' + TEST_ID, true), 1);
			});
		});
	}

	idSuffix() {
		const self = this;

		describe('Control idSuffix', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'idSuffix',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: '',
				testValue: TEST_ID_SUFFIX
			});

			it('shouldnt have an idSuffix value if no idSuffix setting or method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					id: null,
					idSuffix: TEST_ID_SUFFIX
				}));

				assert.is(self[TEST_UTIL].count('#' + TEST_ID_SUFFIX, true), 0);
			});

			it(
				'should have a container element with an id of the control id and idSuffix concatenated if both are provided as settings',
				() => {
					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						idSuffix: TEST_ID_SUFFIX
					}));

					assert.is(self[TEST_UTIL].count('#' + TEST_ID + TEST_ID_SUFFIX, true), 1);
				}
			);

			it(
				'should have a container element with an id of the control id and idSuffix concatenated if the id was set and the idSuffix method was set',
				() => {
					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
						.idSuffix(TEST_ID_SUFFIX);

					assert.is(self[TEST_UTIL].count('#' + TEST_ID + TEST_ID_SUFFIX, true), 1);
				}
			);
		});
	}

	classes() {
		const self = this;

		describe('Control classes', () => {
			const TEST_CLASS = 'test-class';

			it('should have a css class on the main element when the classes setting is set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					classes: TEST_CLASS
				}));

				assert.is(self[TEST_UTIL].count('#' + TEST_ID + '.' + TEST_CLASS, true), 1);
			});

			it('should have a css class on the main element when the addClass method is set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.addClass(TEST_CLASS);

				assert.is(self[TEST_UTIL].count('#' + TEST_ID + '.' + TEST_CLASS, true), 1);
			});

			it(
				'shouldnt have a css class on the main element when the removeClass method is used to remove a previously added class',
				() => {
					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
						.addClass(TEST_CLASS)
						.removeClass(TEST_CLASS);

					assert.is(self[TEST_UTIL].count('#' + TEST_ID + '.' + TEST_CLASS, true), 0);
				}
			);
		});
	}

	minWidth() {
		const self = this;

		describe('Control minWidth', () => {
			const TEST_WIDTH = new CssSize('213px');

			it('shouldnt have a minWidth value if no minWidth was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notIs(self[TEST_UTIL].control.minWidth(), TEST_WIDTH);
			});

			it('should have a minWidth value if the minWidth setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					minWidth: TEST_WIDTH
				}));

				assert.is(self[TEST_UTIL].control.minWidth(), TEST_WIDTH);
			});

			it('should have a minWidth value if the minWidth method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.minWidth(TEST_WIDTH);

				assert.is(self[TEST_UTIL].control.minWidth(), TEST_WIDTH);
			});
		});
	}

	width() {
		const self = this;

		describe('Control width', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a width value if no width was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notEqual(self[TEST_UTIL].control.width(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					width: TEST_WIDTH
				}));

				assert.is(self[TEST_UTIL].control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.width(TEST_WIDTH);

				assert.is(self[TEST_UTIL].control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});
		});
	}

	maxWidth() {
		const self = this;

		describe('Control maxWidth', () => {
			const TEST_WIDTH = new CssSize('213px');

			it('shouldnt have a maxWidth value if no maxWidth was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notIs(self[TEST_UTIL].control.maxWidth(), TEST_WIDTH);
			});

			it('should have a maxWidth value if the maxWidth setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					maxWidth: TEST_WIDTH
				}));

				assert.is(self[TEST_UTIL].control.maxWidth(), TEST_WIDTH);
			});

			it('should have a maxWidth value if the maxWidth method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.maxWidth(TEST_WIDTH);

				assert.is(self[TEST_UTIL].control.maxWidth(), TEST_WIDTH);
			});
		});
	}

	minHeight() {
		const self = this;

		describe('Control minHeight', () => {
			const TEST_HEIGHT = '200px';
			// const TEST_HEIGHT = new CssSize('200px');

			it('shouldnt have a minHeight value if no minHeight was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notEqual(self[TEST_UTIL].control.minHeight(), TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					minHeight: TEST_HEIGHT
				}));

				assert.is(self[TEST_UTIL].first('#' + TEST_ID, true).style.minHeight, TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.minHeight(TEST_HEIGHT);

				assert.is(self[TEST_UTIL].first('#' + TEST_ID, true).style.minHeight, TEST_HEIGHT);
			});
		});
	}

	height() {
		const self = this;

		describe('Control height', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a height value if no height was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notEqual(self[TEST_UTIL].control.height(), TEST_HEIGHT);
			});

			it('should have a height value if the height setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					height: TEST_HEIGHT
				}));

				assert.is(self[TEST_UTIL].control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});

			it('should have a height value if the height method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.height(TEST_HEIGHT);

				assert.is(self[TEST_UTIL].control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});
		});
	}

	maxHeight() {
		const self = this;

		describe('Control maxHeight', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a maxHeight value if no maxHeight was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

				assert.notEqual(self[TEST_UTIL].control.maxHeight(), TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight setting was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					maxHeight: TEST_HEIGHT
				}));

				assert.is(getComputedStyle(self[TEST_UTIL].first('#' + TEST_ID, true)).maxHeight, TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight method was set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.maxHeight(TEST_HEIGHT);

				assert.is(getComputedStyle(self[TEST_UTIL].first('#' + TEST_ID, true)).maxHeight, TEST_HEIGHT);
			});
		});
	}

	isEnabled() {
		const self = this;

		describe('Control isEnabled', () => {
			const DISABLED_CLASS = 'disabled';

			self[TEST_UTIL].testMethod({
				methodName: 'isEnabled',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: true,
				testValue: false
			});

			it('should have an element with the disabled css class when the isEnabled setting was set to false', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isEnabled: false
				}));

				assert.is(self[TEST_UTIL].count('#' + TEST_ID + '.' + DISABLED_CLASS, true), 1);
			});

			it('should have an element with the disabled css class when the isEnabled method was set to false', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.isEnabled(false);

				assert.is(self[TEST_UTIL].count('#' + TEST_ID + '.' + DISABLED_CLASS, true), 1);
			});
		});
	}

	stopPropagation() {
		const self = this;

		describe('Control .stopPropagation', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'stopPropagation',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: false,
				testValue: true
			});

			let testItem = 1;
			const propagationTest = (stopPropagation) => {
				const containerClick = () => {
					testItem++;
				};
				const controlClick = () => {
					testItem += 10;
				};

				testItem = 0;

				window.addEventListener(CLICK_EVENT, containerClick);

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					stopPropagation
				}));

				self[TEST_UTIL].control.on(CLICK_EVENT, controlClick);

				self[TEST_UTIL].simulateClick(self[TEST_UTIL].control.element);

				window.removeEventListener(CLICK_EVENT, containerClick);
			};

			it('should NOT prevent the propagation of an event if false', () => {
				propagationTest(false);

				assert.is(testItem, 11);
			});

			it('should prevent the propagation of an event if true', () => {
				propagationTest(true);

				assert.is(testItem, 10);
			});
		});
	}

	onResize() {
		const self = this;

		describe('Control .onResize', () => {
			it('should execute an onResize callback when resize is called', () => {
				let testItem = 1;
				let testItem2;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					skipWindowResize: true,
					onResize() {
						testItem += 1;
					}
				}));

				testItem2 = testItem;
				self[TEST_UTIL].control.resize(true);

				assert.moreThan(testItem, testItem2);
			});

			it('should NOT execute an onResize callback when resize is called after onRemove is called', () => {
				let testItem = 1;
				let testItem2;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					onResize() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].control.remove();
				testItem2 = testItem;
				self[TEST_UTIL].control.resize(true);

				assert.is(testItem, testItem2);
			});
		});
	}

	onRemove() {
		const self = this;

		describe('Control onRemove', () => {
			it('should accept an onRemove callback but not execute it', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					onRemove() {
						testItem = 2;
					}
				}));

				assert.is(testItem, 1);
			});

			it('should execute onRemove callbacks in order when onRemove is called', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.onRemove(() => {
						testItem = 2;
					})
					.onRemove(() => {
						testItem = 3;
					});

				self[TEST_UTIL].control.remove();

				assert.is(testItem, 3);
			});

			it('should NOT execute an onRemove callback when remove is called twice', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
					.onRemove(() => {
						testItem++;
					});

				self[TEST_UTIL].control.remove();
				self[TEST_UTIL].control.remove();

				assert.is(testItem, 2);
			});
		});
	}

	focus() {
		const self = this;

		describe('Control focus', () => {
			if (!self[SETTINGS].autoFocus) {
				it('should not call the onFocus callback if the control is not focused', () => {
					let testItem = 1;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					assert.is(testItem, 1);
				});
			}

			it('should call the onFocus callback once if .focus is called', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].control.isFocused(true);

				assert.is(testItem, 2);
			});

			if (self[SETTINGS].focusableElement) {
				it('should call the onFocus callback once when a focusable element is focused', () => {
					let testItem = 1;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();

					assert.is(testItem, 2);
				});

				it('should call the onBlur callback once when a focusable element is blurred', () => {
					let testItem = 1;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					const element = self[TEST_UTIL].first(self[SETTINGS].focusableElement);
					element.focus();
					element.blur();

					return wait(1)
						.then(() => {
							assert.is(testItem, 2);
						});
				});
			}

			if (self[SETTINGS].focusableSubElement) {
				it('should call the onFocus callback once when a second focusable element is focused', () => {
					let testItem = 1;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();
					self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).blur();

					return wait(1)
						.then(() => {
							assert.is(testItem, 2);
						});
				});

				it('should call the onBlur callback once when a second focusable element is blurred', () => {
					let testItem = 1;

					self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();

					return wait(1)
						.then(() => {
							assert.is(testItem, 2);
						});
				});

				if (self[SETTINGS].focusableElement) {
					it(
						'should NOT call the onBlur callback if the main element is focused and then the subControl is focused',
						() => {
							let testItem = 1;

							self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
								isFocusable: true,
								onBlur() {
									testItem += 1;
								}
							}));

							self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();
							self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();

							assert.is(testItem, 1);
						}
					);

					it(
						'should NOT call the onBlur callback if the subControl is focused and then the main element is focused',
						() => {
							let testItem = 1;

							self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
								isFocusable: true,
								onBlur() {
									testItem += 1;
								}
							}));

							self[TEST_UTIL].nth(self[SETTINGS].focusableSubElement, 1).focus();
							self[TEST_UTIL].first(self[SETTINGS].focusableElement).focus();

							assert.is(testItem, 1);
						}
					);
				}
			}

			it('should return true when isFocused is called after focused', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true
				}));

				self[TEST_UTIL].control.isFocused(true);

				assert.is(self[TEST_UTIL].control.isFocused(), true);
			});

			it('should not call the onBlur callback if the control is not focused', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onBlur() {
						testItem += 1;
					}
				}));

				assert.is(testItem, 1);
			});

			if (!self[SETTINGS].autoFocus) {
				it(
					'should not call the onBlur callback if .isFocused(false) is called when the control doesn\'t have focus',
					() => {
						let testItem = 1;

						self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
							isFocusable: true,
							onBlur() {
								testItem += 1;
							}
						}));

						self[TEST_UTIL].control.isFocused(false);

						assert.is(testItem, 1);
					}
				);
			}

			it('should call the onBlur callback once if .isFocused(true) is called and then .isFocused(false)', () => {
				let testItem = 1;

				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true,
					onBlur() {
						testItem += 1;
					}
				}));

				self[TEST_UTIL].control.isFocused(true).isFocused(false);

				return wait(1)
					.then(() => {
						assert.is(testItem, 2);
					});
			});

			it('should return false when isFocused is called after focused and blurred', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true
				}));

				self[TEST_UTIL].control.isFocused(true).isFocused(false);

				assert.is(self[TEST_UTIL].control.isFocused(), false);
			});

			it('should not be focused after the active element is blurred', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					isFocusable: true
				}));

				self[TEST_UTIL].control.isFocused(true);
				document.activeElement.blur();

				assert.is(self[TEST_UTIL].control.isFocused(), false);
			});
		});
	}
}
