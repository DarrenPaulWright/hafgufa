import { assert } from 'type-enforcer';
import { CssSize, windowResize } from 'type-enforcer-ui';
import { CLICK_EVENT, Container, SvgControl } from '../index.js';
import extendsTestRegister from './extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, SETTINGS, TEST_UTIL } from './ExtendsTestRunner.js';

const TEST_ID = 'testId';
const TEST_ID_SUFFIX = 'testIdSuffix';

export default class ControlTests extends ExtendsTestRunner {
	construct() {
		const self = this;

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
	}

	container() {
		const self = this;
		const getContainer = () => {
			if (self[TEST_UTIL].control instanceof SvgControl) {
				return document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			}

			return document.createElement('div');
		};

		it('should not have a container value if no container was set', () => {
			const initialLength = windowResize.length;

			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				container: null
			}));

			assert.is(self[TEST_UTIL].container.element.children.length, 0);
			assert.is(self[TEST_UTIL].control.container(), null);
			assert.is(windowResize.length, initialLength);
		});

		it('should have a container element if the container setting was set', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

			assert.is(self[TEST_UTIL].container.element.children.length >= 1, true);
			assert.is(self[TEST_UTIL].control.container() instanceof Element, true);
		});

		it('should have a container element if the container method was called', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				container: null
			})).container(self[TEST_UTIL].container);

			assert.is(self[TEST_UTIL].container.element.children.length, 1);
			assert.is(self[TEST_UTIL].control.container() instanceof Element, true);
		});

		it('should add a callback to windowResize', () => {
			const initialLength = windowResize.length;

			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				container: getContainer()
			}));

			assert.is(windowResize.length, initialLength + 1);
		});

		it('should NOT add a callback to windowResize if set in the content setting of a Container', () => {
			const initialLength = windowResize.length;

			self[TEST_UTIL].control = new Container({
				container: getContainer(),
				content: self.buildSettings({
					control: self[CONTROL]
				})
			});

			assert.is(windowResize.length, initialLength + 1);
		});

		it('should NOT add a callback to windowResize if set in the content method of a Container', () => {
			const initialLength = windowResize.length;

			self[TEST_UTIL].control = new Container({
				container: getContainer()
			});

			self[TEST_UTIL].control.content(self.buildSettings({
				control: self[CONTROL]
			}));

			assert.is(windowResize.length, initialLength + 1);
		});
	}

	element() {
		const self = this;

		it('should not have a main element if no container was set', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				container: null
			}));

			assert.is(self[TEST_UTIL].container.element.children.length, 0);
			assert.is(self[TEST_UTIL].control.element instanceof Element, true);
		});

		it('should have a main element if the container was set', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

			assert.atLeast(self[TEST_UTIL].container.element.children.length, 1);
			assert.is(self[TEST_UTIL].control.element instanceof Element, true);
		});
	}

	id() {
		const self = this;

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
	}

	idSuffix() {
		const self = this;

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
	}

	classes() {
		const self = this;

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
	}

	minWidth() {
		const self = this;

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
	}

	width() {
		const self = this;

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
	}

	maxWidth() {
		const self = this;

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
	}

	minHeight() {
		const self = this;

		const TEST_HEIGHT = '200px';

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
	}

	height() {
		const self = this;

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
	}

	maxHeight() {
		const self = this;

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
	}

	isEnabled() {
		const self = this;

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
	}

	stopPropagation() {
		const self = this;

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
	}

	onResize() {
		const self = this;

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
	}

	onRemove() {
		const self = this;

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
	}
}

extendsTestRegister.register('Control', ControlTests);
