import { assert } from 'chai';
import { forOwn } from 'object-agent';
import { castArray } from 'type-enforcer';
import { WINDOW } from '../../../src/utility/domConstants';
import query from '../../query';
import ControlBaseTests from '../ControlBaseTests';

const TEST_ID = 'testID';
const TEST_ICON_FA = 'trash';
const TEST_TITLE = 'Test Title';
const SUB_TITLE = 'Test Sub Title';
const TITLE_ELEMENT_CLASS = '.heading > .title-container > span';
const SUB_TITLE_ELEMENT_CLASS = '.subtitle';
const ERROR_MESSAGE = 'There was an error!!!';
const ERROR_MESSAGE_ICON = '';
const ERROR_MESSAGE_ELEMENT_CLASS = '.error';

export default function ControlHeadingMixinTests(Control, testUtil, settings = {}) {
	const self = this;
	const controlBaseTests = new ControlBaseTests(Control, testUtil, settings);

	self.run = (exceptions = [], additions) => {
		exceptions = castArray(exceptions);

		controlBaseTests.run(exceptions, additions);

		exceptions.push('run');

		forOwn(self, (runTests, testName) => {
			if (!exceptions.includes(testName)) {
				runTests();
			}
		});
	};

	self.icon = () => {
		describe('ControlHeadingAddon .icon', () => {
			it('should show a font-awesome icon as provided', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					title: 'Test Title',
					headingIcon: TEST_ICON_FA,
					container: WINDOW.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.fa-' + TEST_ICON_FA).length, 1);
			});

			it('should NOT have an icon element if icon is set to an empty string', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					headingIcon: '',
					container: WINDOW.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.fa-' + TEST_ICON_FA).length, 0);
			});
		});
	};

	self.title = () => {
		describe('ControlHeadingAddon .title', () => {
			it('should show a title as provided', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					container: WINDOW.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelector(TITLE_ELEMENT_CLASS).textContent, TEST_TITLE);
			});

			it('should have an empty title element if the title is set to an empty string', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					title: '',
					container: WINDOW.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.heading').length, 0);
			});
		});
	};

	self.subTitle = () => {
		describe('ControlHeadingAddon .subTitle', () => {
			it('should show a subTitle as provided if a title is also provided', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					subTitle: SUB_TITLE,
					container: WINDOW.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelector(SUB_TITLE_ELEMENT_CLASS).textContent, SUB_TITLE);
			});
		});
	};

	self.error = () => {
		describe('ControlHeadingAddon .error', () => {
			testUtil.testMethod({
				methodName: 'error',
				defaultSettings: {
					container: WINDOW.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				},
				defaultValue: '',
				testValue: 'Test Error Message',
				secondTestValue: 'Another Error Message'
			});

			it('should NOT show an error message if "error" is not called', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					container: WINDOW.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				});

				assert.equal(query.count(ERROR_MESSAGE_ELEMENT_CLASS), 0);
			});

			it('should show an error message when "error" is called', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					container: WINDOW.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				})
					.error(ERROR_MESSAGE);

				assert.equal(query.first(ERROR_MESSAGE_ELEMENT_CLASS).textContent, ERROR_MESSAGE_ICON + ERROR_MESSAGE);
			});

			it('should NOT show an error message when error is set to "" after "error"', () => {
				WINDOW.control = new Control({
					ID: TEST_ID,
					container: WINDOW.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				})
					.error(ERROR_MESSAGE)
					.error('');

				assert.equal(query.count(ERROR_MESSAGE_ELEMENT_CLASS), 0);
			});
		});
	};

	self.singleLine = () => {
		describe('ControlHeadingAddon .singleLine', () => {
			const SINGLE_LINE_CLASS = 'single-line';

			testUtil.testMethod({
				methodName: 'singleLine',
				defaultSettings: {
					container: WINDOW.testContainer,
					localizedStrings: {}
				},
				defaultValue: false,
				testValue: true,
				testValueClass: SINGLE_LINE_CLASS
			});
		});
	};

	self.headingButtons = () => {
		describe('ControlHeadingAddon .headingButtons', () => {
			const testButton = [{
				icon: 'circle'
			}];
			const TOOLBAR_BASE_CLASS = 'toolbar';

			testUtil.testMethod({
				methodName: 'headingButtons',
				defaultValue: [],
				testValue: testButton,
				secondTestValue: []
			});

			it('should have a toolbar in the header if the button option is set', () => {
				WINDOW.control = new Control({
					container: WINDOW.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 1);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to empty array', () => {
				WINDOW.control = new Control({
					container: WINDOW.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				WINDOW.control.headingButtons([]);

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 0);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to an empty array', () => {
				WINDOW.control = new Control({
					container: WINDOW.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				WINDOW.control.headingButtons([]);

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 0);
			});

			it('should NOT have a toolbar in the header if the button option is set to an empty array', () => {
				WINDOW.control = new Control({
					container: WINDOW.testContainer,
					title: 'Test For Buttons',
					headingButtons: []
				});

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 0);
			});
		});
	};

	self.canCollapse = () => {
		describe('ControlHeadingAddon .canCollapse', () => {
			testUtil.testMethod({
				methodName: 'canCollapse',
				defaultSettings: {
					container: WINDOW.testContainer
				},
				defaultValue: false,
				testValue: true
			});
		});
	};

	self.isCollapsed = () => {
		describe('ControlHeadingAddon .isCollapsed', () => {
			testUtil.testMethod({
				methodName: 'isCollapsed',
				defaultSettings: {
					container: WINDOW.testContainer,
					canCollapse: true
				},
				defaultValue: false,
				testValue: true
			});
		});
	};
}
