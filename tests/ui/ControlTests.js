import { wait } from 'async-agent';
import { assert } from 'chai';
import { forOwn } from 'object-agent';
import { castArray } from 'type-enforcer';
import { CLICK_EVENT, Container, windowResize } from '../../src';

const TEST_ID = 'testId';
const TEST_ID_SUFFIX = 'testIdSuffix';
const extraTests = ['focus', 'onChange'];

export default function ControlTests(Control, testUtil, settings = {}) {
	const self = this;

	const buildSettings = (localSettings) => {
		return {
			id: TEST_ID,
			container: testUtil.container,
			delay: 0,
			fade: false,
			...settings.extraSettings,
			...localSettings
		};
	};

	self.run = (exceptions, additions, extraSettings = {}) => {
		exceptions = castArray(exceptions);
		additions = castArray(additions);

		exceptions.push('run');

		forOwn(self, (runTests, testName) => {
			const exclude = exceptions.includes(testName);
			const include = additions.includes(testName);
			const extra = extraTests.includes(testName);

			if ((!exclude && !extra) || (include && extra)) {
				runTests();
			}
		});

		forOwn(extraSettings, (value, key) => {
			if (self[key]) {
				self[key](extraSettings);
			}
		});
	};

	self.construct = () => {
		describe('Control initialize', () => {
			it('without settings', () => {
				testUtil.control = new Control();

				assert.equal(testUtil.count('.' + settings.mainCssClass), 0);
			});

			if (settings.mainCssClass) {
				it(`should have a css class called ${settings.mainCssClass}`, () => {
					testUtil.control = new Control(buildSettings());

					assert.equal(testUtil.count('.' + settings.mainCssClass), 1);
				});
			}
		});
	};

	self.container = () => {
		describe('Control container', () => {
			it('should not have a container value if no container was set', () => {
				const initialLength = windowResize.length;

				testUtil.control = new Control(buildSettings({
					container: null
				}));

				assert.equal(testUtil.container.children.length, 0);
				assert.equal(testUtil.control.container(), undefined);
				assert.equal(windowResize.length, initialLength);
			});

			it('should have a container element if the container setting was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.isTrue(testUtil.container.children.length >= 1);
				assert.isOk(testUtil.control.container());
			});

			it('should have a container element if the container method was called', () => {
				testUtil.control = new Control(buildSettings({
					container: null
				})).container(testUtil.container);

				assert.equal(testUtil.container.children.length, 1);
				assert.isOk(testUtil.control.container());
			});

			it('should add a callback to windowResize', () => {
				const initialLength = windowResize.length;

				testUtil.control = new Control(buildSettings({
					container: testUtil.container
				}));

				assert.equal(windowResize.length, initialLength + 1);
			});

			it('should NOT add a callback to windowResize if set in the content setting of a Container', () => {
				const initialLength = windowResize.length;

				testUtil.control = new Container({
					container: testUtil.container,
					content: buildSettings({
						control: Control
					})
				});

				assert.equal(windowResize.length, initialLength + 1);
			});

			it('should NOT add a callback to windowResize if set in the content method of a Container', () => {
				const initialLength = windowResize.length;

				testUtil.control = new Container({
					container: testUtil.container
				});

				testUtil.control.content(buildSettings({
					control: Control
				}));

				assert.equal(windowResize.length, initialLength + 1);
			});
		});
	};

	self.element = () => {
		describe('Control main container', () => {
			it('should not have a main element if no container was set', () => {
				testUtil.control = new Control(buildSettings({
					container: null
				}));

				assert.equal(testUtil.container.children.length, 0);
				assert.isOk(testUtil.control.element());
			});

			it('should have a main element if the container was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.isOk(testUtil.container.children.length >= 1);
				assert.isOk(testUtil.control.element());
			});
		});
	};

	self.id = () => {
		describe('Control .id', () => {
			testUtil.testMethod({
				methodName: 'id',
				defaultSettings: {
					container: testUtil.container
				},
				defaultValue: '',
				testValue: TEST_ID
			});

			it('should have an element with the id property set if the id setting was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.equal(testUtil.count('#' + TEST_ID, true), 1);
			});

			it('should have an element with the id property set if the id method was set', () => {
				testUtil.control = new Control(buildSettings({
					id: null
				}))
					.id(TEST_ID);

				assert.equal(testUtil.count('#' + TEST_ID, true), 1);
			});
		});
	};

	self.idSuffix = () => {
		describe('Control idSuffix', () => {
			testUtil.testMethod({
				methodName: 'idSuffix',
				defaultSettings: {
					container: testUtil.container
				},
				defaultValue: '',
				testValue: TEST_ID_SUFFIX
			});

			it('shouldnt have an idSuffix value if no idSuffix setting or method was set', () => {
				testUtil.control = new Control(buildSettings({
					id: null,
					idSuffix: TEST_ID_SUFFIX
				}));

				assert.equal(testUtil.count('#' + TEST_ID_SUFFIX, true), 0);
			});

			it('should have a container element with an id of the control id and idSuffix concatenated if both are provided as settings', () => {
				testUtil.control = new Control(buildSettings({
					idSuffix: TEST_ID_SUFFIX
				}));

				assert.equal(testUtil.count('#' + TEST_ID + TEST_ID_SUFFIX, true), 1);
			});

			it('should have a container element with an id of the control id and idSuffix concatenated if the id was set and the idSuffix method was set', () => {
				testUtil.control = new Control(buildSettings())
					.idSuffix(TEST_ID_SUFFIX);

				assert.equal(testUtil.count('#' + TEST_ID + TEST_ID_SUFFIX, true), 1);
			});
		});
	};

	self.classes = () => {
		describe('Control classes', () => {
			const TEST_CLASS = 'test-class';

			it('should have a css class on the main element when the classes setting is set', () => {
				testUtil.control = new Control(buildSettings({
					classes: TEST_CLASS
				}));

				assert.equal(testUtil.count('#' + TEST_ID + '.' + TEST_CLASS, true), 1);
			});

			it('should have a css class on the main element when the addClass method is set', () => {
				testUtil.control = new Control(buildSettings())
					.addClass(TEST_CLASS);

				assert.equal(testUtil.count('#' + TEST_ID + '.' + TEST_CLASS, true), 1);
			});

			it('shouldnt have a css class on the main element when the removeClass method is used to remove a previously added class', () => {
				testUtil.control = new Control(buildSettings())
					.addClass(TEST_CLASS)
					.removeClass(TEST_CLASS);

				assert.equal(testUtil.count('#' + TEST_ID + '.' + TEST_CLASS, true), 0);
			});
		});
	};

	self.minWidth = () => {
		describe('Control minWidth', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a minWidth value if no minWidth was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.minWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a minWidth value if the minWidth setting was set', () => {
				testUtil.control = new Control(buildSettings({
					minWidth: TEST_WIDTH
				}));

				assert.equal(testUtil.control.minWidth(), TEST_WIDTH);
			});

			it('should have a minWidth value if the minWidth method was set', () => {
				testUtil.control = new Control(buildSettings())
					.minWidth(TEST_WIDTH);

				assert.equal(testUtil.control.minWidth(), TEST_WIDTH);
			});
		});
	};

	self.width = () => {
		describe('Control width', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a width value if no width was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.width(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width setting was set', () => {
				testUtil.control = new Control(buildSettings({
					width: TEST_WIDTH
				}));

				assert.equal(testUtil.control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width method was set', () => {
				testUtil.control = new Control(buildSettings())
					.width(TEST_WIDTH);

				assert.equal(testUtil.control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});
		});
	};

	self.maxWidth = () => {
		describe('Control maxWidth', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a maxWidth value if no maxWidth was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.maxWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a maxWidth value if the maxWidth setting was set', () => {
				testUtil.control = new Control(buildSettings({
					maxWidth: TEST_WIDTH
				}));

				assert.equal(testUtil.control.maxWidth(), TEST_WIDTH);
			});

			it('should have a maxWidth value if the maxWidth method was set', () => {
				testUtil.control = new Control(buildSettings())
					.maxWidth(TEST_WIDTH);

				assert.equal(testUtil.control.maxWidth(), TEST_WIDTH);
			});
		});
	};

	self.minHeight = () => {
		describe('Control minHeight', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a minHeight value if no minHeight was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.minHeight(), TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight setting was set', () => {
				testUtil.control = new Control(buildSettings({
					minHeight: TEST_HEIGHT
				}));

				assert.equal(testUtil.first('#' + TEST_ID, true).style.minHeight, TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight method was set', () => {
				testUtil.control = new Control(buildSettings())
					.minHeight(TEST_HEIGHT);

				assert.equal(testUtil.first('#' + TEST_ID, true).style.minHeight, TEST_HEIGHT);
			});
		});
	};

	self.height = () => {
		describe('Control height', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a height value if no height was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.height(), TEST_HEIGHT);
			});

			it('should have a height value if the height setting was set', () => {
				testUtil.control = new Control(buildSettings({
					height: TEST_HEIGHT
				}));

				assert.equal(testUtil.control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});

			it('should have a height value if the height method was set', () => {
				testUtil.control = new Control(buildSettings())
					.height(TEST_HEIGHT);

				assert.equal(testUtil.control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});
		});
	};

	self.maxHeight = () => {
		describe('Control maxHeight', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a maxHeight value if no maxHeight was set', () => {
				testUtil.control = new Control(buildSettings());

				assert.notEqual(testUtil.control.maxHeight(), TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight setting was set', () => {
				testUtil.control = new Control(buildSettings({
					maxHeight: TEST_HEIGHT
				}));

				assert.equal(getComputedStyle(testUtil.first('#' + TEST_ID, true)).maxHeight, TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight method was set', () => {
				testUtil.control = new Control(buildSettings())
					.maxHeight(TEST_HEIGHT);

				assert.equal(getComputedStyle(testUtil.first('#' + TEST_ID, true)).maxHeight, TEST_HEIGHT);
			});
		});
	};

	self.isEnabled = () => {
		describe('Control isEnabled', () => {
			const DISABLED_CLASS = 'disabled';

			testUtil.testMethod({
				methodName: 'isEnabled',
				defaultSettings: {
					container: testUtil.container
				},
				defaultValue: true,
				testValue: false
			});

			it('should have an element with the disabled css class when the isEnabled setting was set to false', () => {
				testUtil.control = new Control(buildSettings({
					isEnabled: false
				}));

				assert.equal(testUtil.count('#' + TEST_ID + '.' + DISABLED_CLASS, true), 1);
			});

			it('should have an element with the disabled css class when the isEnabled method was set to false', () => {
				testUtil.control = new Control(buildSettings())
					.isEnabled(false);

				assert.equal(testUtil.count('#' + TEST_ID + '.' + DISABLED_CLASS, true), 1);
			});
		});
	};

	self.stopPropagation = () => {
		describe('Control .stopPropagation', () => {
			testUtil.testMethod({
				methodName: 'stopPropagation',
				defaultSettings: {
					container: testUtil.container
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

				testUtil.control = new Control(buildSettings({
					stopPropagation: stopPropagation
				}));

				testUtil.control.on(CLICK_EVENT, controlClick);

				testUtil.simulateClick(testUtil.control.element());

				window.removeEventListener(CLICK_EVENT, containerClick);
			};

			it('should NOT prevent the propagation of an event if false', () => {
				propagationTest(false);

				assert.equal(testItem, 11);
			});

			it('should prevent the propagation of an event if true', () => {
				propagationTest(true);

				assert.equal(testItem, 10);
			});
		});
	};

	self.onResize = () => {
		describe('Control .onResize', () => {
			it('should execute an onResize callback when resize is called', () => {
				let testItem = 1;
				let testItem2;

				testUtil.control = new Control(buildSettings({
					skipWindowResize: true,
					onResize() {
						testItem += 1;
					}
				}));

				testItem2 = testItem;
				testUtil.control.resize(true);

				assert.isAbove(testItem, testItem2);
			});

			it('should NOT execute an onResize callback when resize is called after onRemove is called', () => {
				let testItem = 1;
				let testItem2;

				testUtil.control = new Control(buildSettings({
					onResize() {
						testItem += 1;
					}
				}));

				testUtil.control.remove();
				testItem2 = testItem;
				testUtil.control.resize(true);

				assert.equal(testItem, testItem2);
			});
		});
	};

	self.onRemove = () => {
		describe('Control onRemove', () => {
			it('should accept an onRemove callback but not execute it', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings({
					onRemove() {
						testItem = 2;
					}
				}));

				assert.equal(testItem, 1);
			});

			it('should execute onRemove callbacks in order when onRemove is called', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings())
					.onRemove(() => {
						testItem = 2;
					})
					.onRemove(() => {
						testItem = 3;
					});

				testUtil.control.remove();

				assert.equal(testItem, 3);
			});

			it('should NOT execute an onRemove callback when remove is called twice', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings())
					.onRemove(() => {
						testItem++;
					});

				testUtil.control.remove();
				testUtil.control.remove();

				assert.equal(testItem, 2);
			});
		});
	};

	self.focus = () => {
		describe('Control focus', () => {
			if (!settings.autoFocus) {
				it('should not call the onFocus callback if the control is not focused', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					assert.equal(testItem, 1);
				});
			}

			it('should call the onFocus callback once if .focus is called', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings({
					isFocusable: true,
					onFocus() {
						testItem += 1;
					}
				}));

				testUtil.control.isFocused(true);

				assert.equal(testItem, 2);
			});

			if (settings.focusableElement) {
				it('should call the onFocus callback once when a focusable element is focused', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					testUtil.first(settings.focusableElement).focus();

					assert.equal(testItem, 2);
				});

				it('should call the onBlur callback once when a focusable element is blurred', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					const element = testUtil.first(settings.focusableElement);
					element.focus();
					element.blur();

					return wait(1)
						.then(() => {
							assert.equal(testItem, 2);
						});
				});
			}

			if (settings.focusableSubElement) {
				it('should call the onFocus callback once when a second focusable element is focused', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					testUtil.nth(settings.focusableSubElement, 1).focus();
					testUtil.nth(settings.focusableSubElement, 1).blur();

					return wait(1)
						.then(() => {
							assert.equal(testItem, 2);
						});
				});

				it('should call the onBlur callback once when a second focusable element is blurred', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onFocus() {
							testItem += 1;
						}
					}));

					testUtil.nth(settings.focusableSubElement, 1).focus();

					return wait(1)
						.then(() => {
							assert.equal(testItem, 2);
						});
				});

				if (settings.focusableElement) {
					it('should NOT call the onBlur callback if the main element is focused and then the subControl is focused', () => {
						let testItem = 1;

						testUtil.control = new Control(buildSettings({
							isFocusable: true,
							onBlur() {
								testItem += 1;
							}
						}));

						testUtil.first(settings.focusableElement).focus();
						testUtil.nth(settings.focusableSubElement, 1).focus();

						assert.equal(testItem, 1);
					});

					it('should NOT call the onBlur callback if the subControl is focused and then the main element is focused', () => {
						let testItem = 1;

						testUtil.control = new Control(buildSettings({
							isFocusable: true,
							onBlur() {
								testItem += 1;
							}
						}));

						testUtil.nth(settings.focusableSubElement, 1).focus();
						testUtil.first(settings.focusableElement).focus();

						assert.equal(testItem, 1);
					});
				}
			}

			it('should return true when isFocused is called after focused', () => {
				testUtil.control = new Control(buildSettings({
					isFocusable: true
				}));

				testUtil.control.isFocused(true);

				assert.equal(testUtil.control.isFocused(), true);
			});

			it('should not call the onBlur callback if the control is not focused', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings({
					isFocusable: true,
					onBlur() {
						testItem += 1;
					}
				}));

				assert.equal(testItem, 1);
			});

			if (!settings.autoFocus) {
				it('should not call the onBlur callback if .isFocused(false) is called when the control doesn\'t have focus', () => {
					let testItem = 1;

					testUtil.control = new Control(buildSettings({
						isFocusable: true,
						onBlur() {
							testItem += 1;
						}
					}));

					testUtil.control.isFocused(false);

					assert.equal(testItem, 1);
				});
			}

			it('should call the onBlur callback once if .isFocused(true) is called and then .isFocused(false)', () => {
				let testItem = 1;

				testUtil.control = new Control(buildSettings({
					isFocusable: true,
					onBlur() {
						testItem += 1;
					}
				}));

				testUtil.control.isFocused(true).isFocused(false);

				return wait(1)
					.then(() => {
						assert.equal(testItem, 2);
					});
			});

			it('should return false when isFocused is called after focused and blurred', () => {
				testUtil.control = new Control(buildSettings({
					isFocusable: true
				}));

				testUtil.control.isFocused(true).isFocused(false);

				assert.equal(testUtil.control.isFocused(), false);
			});

			it('should not be focused after the active element is blurred', () => {
				testUtil.control = new Control(buildSettings({
					isFocusable: true
				}));

				testUtil.control.isFocused(true);
				document.activeElement.blur();

				assert.equal(testUtil.control.isFocused(), false);
			});
		});
	};
}
