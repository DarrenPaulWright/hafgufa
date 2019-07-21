import { assert } from 'chai';
import { select } from 'd3';
import { forOwn } from 'object-agent';
import { castArray } from 'type-enforcer';
import { CLICK_EVENT } from '../../src/utility/domConstants';

const TEST_ID = 'testID';
const TEST_ID_SUFFIX = 'testIDSuffix';
const extraTests = ['focus', 'onChange'];

export default function ControlTests(Control, testUtil, settings = {}) {
	const self = this;

	const buildSettings = (localSettings) => Object.assign({}, {
		ID: TEST_ID,
		container: window.testContainer,
		localizedStrings: {},
		delay: 0,
		fade: false
	}, settings.extraSettings, localSettings);

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
				window.control = new Control();

				assert.equal(window.testContainer.querySelectorAll('.' + settings.mainCssClass).length, 0);
			});

			if (settings.mainCssClass) {
				it('should have a css class called ' + settings.mainCssClass, () => {
					window.control = new Control(buildSettings());

					assert.equal(window.testContainer.querySelectorAll('.' + settings.mainCssClass).length, 1);
				});
			}
		});
	};

	self.container = () => {
		describe('Control container', () => {
			it('should not have a container value if no container was set', () => {
				window.control = new Control(buildSettings({
					container: null
				}));

				assert.equal(window.testContainer.children.length, 0);
				assert.equal(window.control.container(), undefined);
			});

			it('should have a container element if the container setting was set', () => {
				window.control = new Control(buildSettings());

				assert.isTrue(window.testContainer.children.length >= 1);
				assert.isOk(window.control.container());
			});

			it('should have a container element if the container method was called', () => {
				window.control = new Control(buildSettings({
					container: null
				})).container(window.testContainer);

				assert.equal(window.testContainer.children.length, 1);
				assert.isOk(window.control.container());
			});
		});
	};

	self.element = () => {
		describe('Control main container', () => {
			it('should not have a main element if no container was set', () => {
				window.control = new Control(buildSettings({
					container: null
				}));

				assert.equal(window.testContainer.children.length, 0);
				assert.isOk(window.control.element());
			});

			it('should have a main element if the container was set', () => {
				window.control = new Control(buildSettings());

				assert.isOk(window.testContainer.children.length >= 1);
				assert.isOk(window.control.element());
			});
		});
	};

	self.ID = () => {
		describe('Control .ID', () => {
			testUtil.testMethod({
				methodName: 'ID',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
				},
				defaultValue: '',
				testValue: TEST_ID
			});

			it('should have an element with the id property set if the ID setting was set', () => {
				window.control = new Control(buildSettings());

				assert.equal(document.querySelectorAll('#' + TEST_ID).length, 1);
			});

			it('should have an element with the id property set if the ID method was set', () => {
				window.control = new Control(buildSettings({
					ID: null
				}))
					.ID(TEST_ID);

				assert.equal(document.querySelectorAll('#' + TEST_ID).length, 1);
			});
		});
	};

	self.IDSuffix = () => {
		describe('Control IDSuffix', () => {
			testUtil.testMethod({
				methodName: 'IDSuffix',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
				},
				defaultValue: '',
				testValue: TEST_ID_SUFFIX
			});

			it('shouldnt have an IDSuffix value if no IDSuffix setting or method was set', () => {
				window.control = new Control(buildSettings({
					ID: null,
					IDSuffix: TEST_ID_SUFFIX
				}));

				assert.equal(document.querySelectorAll('#' + TEST_ID_SUFFIX).length, 0);
			});

			it('should have a container element with an id of the control ID and IDSuffix concatenated if both are provided as settings', () => {
				window.control = new Control(buildSettings({
					IDSuffix: TEST_ID_SUFFIX
				}));

				assert.equal(document.querySelectorAll('#' + TEST_ID + TEST_ID_SUFFIX).length, 1);
			});

			it('should have a container element with an id of the control ID and IDSuffix concatenated if the id was set and the IDSuffix method was set', () => {
				window.control = new Control(buildSettings())
					.IDSuffix(TEST_ID_SUFFIX);

				assert.equal(document.querySelectorAll('#' + TEST_ID + TEST_ID_SUFFIX).length, 1);
			});
		});
	};

	self.classes = () => {
		describe('Control classes', () => {
			const TEST_CLASS = 'test-class';

			it('should have a css class on the main element when the classes setting is set', () => {
				window.control = new Control(buildSettings({
					classes: TEST_CLASS
				}));

				assert.equal(document.querySelectorAll('#' + TEST_ID + '.' + TEST_CLASS).length, 1);
			});

			it('should have a css class on the main element when the addClass method is set', () => {
				window.control = new Control(buildSettings())
					.addClass(TEST_CLASS);

				assert.equal(document.querySelectorAll('#' + TEST_ID + '.' + TEST_CLASS).length, 1);
			});

			it('shouldnt have a css class on the main element when the removeClass method is used to remove a previously added class', () => {
				window.control = new Control(buildSettings())
					.addClass(TEST_CLASS)
					.removeClass(TEST_CLASS);

				assert.equal(document.querySelectorAll('#' + TEST_ID + '.' + TEST_CLASS).length, 0);
			});
		});
	};

	self.minWidth = () => {
		describe('Control minWidth', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a minWidth value if no minWidth was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.minWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a minWidth value if the minWidth setting was set', () => {
				window.control = new Control(buildSettings({
					minWidth: TEST_WIDTH
				}));

				assert.equal(window.control.minWidth(), TEST_WIDTH);
			});

			it('should have a minWidth value if the minWidth method was set', () => {
				window.control = new Control(buildSettings())
					.minWidth(TEST_WIDTH);

				assert.equal(window.control.minWidth(), TEST_WIDTH);
			});
		});
	};

	self.width = () => {
		describe('Control width', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a width value if no width was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.width(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width setting was set', () => {
				window.control = new Control(buildSettings({
					width: TEST_WIDTH
				}));

				assert.equal(window.control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a width value if the width method was set', () => {
				window.control = new Control(buildSettings())
					.width(TEST_WIDTH);

				assert.equal(window.control.borderWidth(), parseInt(TEST_WIDTH, 10));
			});
		});
	};

	self.maxWidth = () => {
		describe('Control maxWidth', () => {
			const TEST_WIDTH = '213px';

			it('shouldnt have a maxWidth value if no maxWidth was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.maxWidth(), parseInt(TEST_WIDTH, 10));
			});

			it('should have a maxWidth value if the maxWidth setting was set', () => {
				window.control = new Control(buildSettings({
					maxWidth: TEST_WIDTH
				}));

				assert.equal(window.control.maxWidth(), TEST_WIDTH);
			});

			it('should have a maxWidth value if the maxWidth method was set', () => {
				window.control = new Control(buildSettings())
					.maxWidth(TEST_WIDTH);

				assert.equal(window.control.maxWidth(), TEST_WIDTH);
			});
		});
	};

	self.minHeight = () => {
		describe('Control minHeight', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a minHeight value if no minHeight was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.minHeight(), TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight setting was set', () => {
				window.control = new Control(buildSettings({
					minHeight: TEST_HEIGHT
				}));

				assert.equal(document.querySelector('#' + TEST_ID).style.minHeight, TEST_HEIGHT);
			});

			it('should have a minHeight value if the minHeight method was set', () => {
				window.control = new Control(buildSettings())
					.minHeight(TEST_HEIGHT);

				assert.equal(document.querySelector('#' + TEST_ID).style.minHeight, TEST_HEIGHT);
			});
		});
	};

	self.height = () => {
		describe('Control height', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a height value if no height was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.height(), TEST_HEIGHT);
			});

			it('should have a height value if the height setting was set', () => {
				window.control = new Control(buildSettings({
					height: TEST_HEIGHT
				}));

				assert.equal(window.control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});

			it('should have a height value if the height method was set', () => {
				window.control = new Control(buildSettings())
					.height(TEST_HEIGHT);

				assert.equal(window.control.borderHeight(), parseInt(TEST_HEIGHT, 10));
			});
		});
	};

	self.maxHeight = () => {
		describe('Control maxHeight', () => {
			const TEST_HEIGHT = '200px';

			it('shouldnt have a maxHeight value if no maxHeight was set', () => {
				window.control = new Control(buildSettings());

				assert.notEqual(window.control.maxHeight(), TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight setting was set', () => {
				window.control = new Control(buildSettings({
					maxHeight: TEST_HEIGHT
				}));

				assert.equal(getComputedStyle(document.querySelector('#' + TEST_ID)).maxHeight, TEST_HEIGHT);
			});

			it('should have a maxHeight value if the maxHeight method was set', () => {
				window.control = new Control(buildSettings())
					.maxHeight(TEST_HEIGHT);

				assert.equal(getComputedStyle(document.querySelector('#' + TEST_ID)).maxHeight, TEST_HEIGHT);
			});
		});
	};

	self.isEnabled = () => {
		describe('Control isEnabled', () => {
			const DISABLED_CLASS = 'disabled';

			testUtil.testMethod({
				methodName: 'isEnabled',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
				},
				defaultValue: true,
				testValue: false
			});

			it('should have an element with the disabled css class when the isEnabled setting was set to false', () => {
				window.control = new Control(buildSettings({
					isEnabled: false
				}));

				assert.equal(document.querySelectorAll('#' + TEST_ID + '.' + DISABLED_CLASS).length, 1);
			});

			it('should have an element with the disabled css class when the isEnabled method was set to false', () => {
				window.control = new Control(buildSettings())
					.isEnabled(false);

				assert.equal(document.querySelectorAll('#' + TEST_ID + '.' + DISABLED_CLASS).length, 1);
			});
		});
	};

	self.stopPropagation = () => {
		describe('Control .stopPropagation', () => {
			testUtil.testMethod({
				methodName: 'stopPropagation',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
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

				select(window).on(CLICK_EVENT, containerClick);

				window.control = new Control(buildSettings({
					stopPropagation: stopPropagation
				}));

				window.control.on(CLICK_EVENT, controlClick);

				testUtil.simulateClick(window.control.element());

				select(window).on(CLICK_EVENT, null);
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

				window.control = new Control(buildSettings({
					skipWindowResize: true,
					onResize: function() {
						testItem += 1;
					}
				}));

				testItem2 = testItem;
				window.control.resize(true);

				return testUtil.defer()
					.then(() => {
						assert.isAbove(testItem, testItem2);
					});
			});

			it('should NOT execute an onResize callback when resize is called after onRemove is called', () => {
				let testItem = 1;
				let testItem2;

				window.control = new Control(buildSettings({
					onResize: function() {
						testItem += 1;
					}
				}));

				window.control.remove();
				testItem2 = testItem;
				window.control.resize(true);

				return testUtil.defer()
					.then(() => {
						assert.equal(testItem, testItem2);
					});
			});
		});
	};

	self.onRemove = () => {
		describe('Control onRemove', () => {
			it('should accept an onRemove callback but not execute it', () => {
				let testItem = 1;

				window.control = new Control(buildSettings({
					onRemove: function() {
						testItem = 2;
					}
				}));

				assert.equal(testItem, 1);
			});

			it('should execute onRemove callbacks in order when onRemove is called', () => {
				let testItem = 1;

				window.control = new Control(buildSettings())
					.onRemove(() => {
						testItem = 2;
					})
					.onRemove(() => {
						testItem = 3;
					});

				window.control.remove();

				assert.equal(testItem, 3);
			});

			it('should NOT execute an onRemove callback when remove is called twice', () => {
				let testItem = 1;

				window.control = new Control(buildSettings())
					.onRemove(() => {
						testItem++;
					});

				window.control.remove();
				window.control.remove();

				assert.equal(testItem, 2);
			});
		});
	};

	self.focus = () => {
		describe('Control focus', () => {
			if (!settings.autoFocus) {
				it('should not call the onFocus callback if the control is not focused', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onFocus: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							assert.equal(testItem, 1);
						});
				});
			}

			it('should call the onFocus callback once if .focus is called', () => {
				let testItem = 1;

				window.control = new Control(buildSettings({
					isFocusable: true,
					onFocus: function() {
						testItem += 1;
					}
				}));

				return testUtil.defer()
					.then(() => {
						window.control.isFocused(true);

						assert.equal(testItem, 2);
					});
			});

			if (settings.focusableElement) {
				it('should call the onFocus callback once when a focusable element is focused', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onFocus: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							document.querySelector(settings.focusableElement).focus();

							assert.equal(testItem, 2);
						});
				});

				it('should call the onBlur callback once when a focusable element is blurred', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onBlur: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							document.querySelector(settings.focusableElement).focus();
							document.querySelector(settings.focusableElement).blur();

							return testUtil.defer();
						})
						.then(() => {
							assert.equal(testItem, 2);
						});
				});
			}

			if (settings.focusableSubElement) {
				it('should call the onFocus callback once when a second focusable element is focused', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onBlur: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							document.querySelectorAll(settings.focusableSubElement)[1].focus();
							document.querySelectorAll(settings.focusableSubElement)[1].blur();

							return testUtil.defer();
						})
						.then(() => {
							assert.equal(testItem, 2);
						});
				});

				it('should call the onBlur callback once when a second focusable element is blurred', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onFocus: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							document.querySelectorAll(settings.focusableSubElement)[1].focus();

							return testUtil.defer();
						})
						.then(() => {
							assert.equal(testItem, 2);
						});
				});

				if (settings.focusableElement) {
					it('should NOT call the onBlur callback if the main element is focused and then the subControl is focused', () => {
						let testItem = 1;

						window.control = new Control(buildSettings({
							isFocusable: true,
							onBlur: function() {
								testItem += 1;
							}
						}));

						return testUtil.defer()
							.then(() => {
								document.querySelector(settings.focusableElement).focus();
								document.querySelectorAll(settings.focusableSubElement)[1].focus();

								assert.equal(testItem, 1);
							});
					});

					it('should NOT call the onBlur callback if the subControl is focused and then the main element is focused', () => {
						let testItem = 1;

						window.control = new Control(buildSettings({
							isFocusable: true,
							onBlur: function() {
								testItem += 1;
							}
						}));

						return testUtil.defer()
							.then(() => {
								document.querySelectorAll(settings.focusableSubElement)[1].focus();
								document.querySelector(settings.focusableElement).focus();

								assert.equal(testItem, 1);
							});
					});
				}
			}

			it('should return true when isFocused is called after focused', () => {
				window.control = new Control(buildSettings({
					isFocusable: true
				}));

				return testUtil.defer()
					.then(() => {
						window.control.isFocused(true);

						assert.equal(window.control.isFocused(), true);
					});
			});

			it('should not call the onBlur callback if the control is not focused', () => {
				let testItem = 1;

				window.control = new Control(buildSettings({
					isFocusable: true,
					onBlur: function() {
						testItem += 1;
					}
				}));

				return testUtil.defer()
					.then(() => {
						assert.equal(testItem, 1);
					});
			});

			if (!settings.autoFocus) {
				it('should not call the onBlur callback if .isFocused(false) is called when the control doesn\'t have focus', () => {
					let testItem = 1;

					window.control = new Control(buildSettings({
						isFocusable: true,
						onBlur: function() {
							testItem += 1;
						}
					}));

					return testUtil.defer()
						.then(() => {
							window.control.isFocused(false);

							assert.equal(testItem, 1);
						});
				});
			}

			it('should call the onBlur callback once if .isFocused(true) is called and then .isFocused(false)', () => {
				let testItem = 1;

				window.control = new Control(buildSettings({
					isFocusable: true,
					onBlur: function() {
						testItem += 1;
					}
				}));

				return testUtil.defer()
					.then(() => {
						window.control.isFocused(true).isFocused(false);

						return testUtil.defer();
					})
					.then(() => {
						assert.equal(testItem, 2);
					});
			});

			it('should return false when isFocused is called after focused and blurred', () => {
				window.control = new Control(buildSettings({
					isFocusable: true
				}));

				return testUtil.defer()
					.then(() => {
						window.control.isFocused(true).isFocused(false);

						assert.equal(window.control.isFocused(), false);
					});
			});

			it('should not be focused after the active element is blurred', () => {
				window.control = new Control(buildSettings({
					isFocusable: true
				}));

				return testUtil.defer()
					.then(() => {
						window.control.isFocused(true);
						document.activeElement.blur();

						assert.equal(window.control.isFocused(), false);
					});
			});
		});
	};
}
