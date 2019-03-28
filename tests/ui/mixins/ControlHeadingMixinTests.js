import { assert } from 'chai';
import query from '../../query';
import ControlTests from '../ControlTests';

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

	ControlTests.call(self, Control, testUtil, settings);

	self.icon = () => {
		describe('ControlHeadingAddon .icon', () => {
			it('should show a font-awesome icon as provided', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: 'Test Title',
					headingIcon: TEST_ICON_FA,
					container: window.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.fa-' + TEST_ICON_FA).length, 1);
			});

			it('should NOT have an icon element if icon is set to an empty string', () => {
				window.control = new Control({
					ID: TEST_ID,
					headingIcon: '',
					container: window.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.fa-' + TEST_ICON_FA).length, 0);
			});
		});
	};

	self.title = () => {
		describe('ControlHeadingAddon .title', () => {
			it('should show a title as provided', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					container: window.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelector(TITLE_ELEMENT_CLASS).textContent, TEST_TITLE);
			});

			it('should have an empty title element if the title is set to an empty string', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: '',
					container: window.testContainer,
					localizedStrings: {}
				});

				assert.equal(document.querySelectorAll('.heading').length, 0);
			});
		});
	};

	self.subTitle = () => {
		describe('ControlHeadingAddon .subTitle', () => {
			it('should show a subTitle as provided if a title is also provided', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					subTitle: SUB_TITLE,
					container: window.testContainer,
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
					container: window.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				},
				defaultValue: '',
				testValue: 'Test Error Message',
				secondTestValue: 'Another Error Message'
			});

			it('should NOT show an error message if "error" is not called', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				});

				assert.equal(query.count(ERROR_MESSAGE_ELEMENT_CLASS), 0);
			});

			it('should show an error message when "error" is called', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
					title: TEST_TITLE,
					localizedStrings: {}
				})
					.error(ERROR_MESSAGE);

				assert.equal(query.first(ERROR_MESSAGE_ELEMENT_CLASS).textContent, ERROR_MESSAGE_ICON + ERROR_MESSAGE);
			});

			it('should NOT show an error message when error is set to "" after "error"', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
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
					container: window.testContainer,
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
				window.control = new Control({
					container: window.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 1);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to empty array', () => {
				window.control = new Control({
					container: window.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				window.control.headingButtons([]);

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 0);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to an empty array', () => {
				window.control = new Control({
					container: window.testContainer,
					title: 'Test For Buttons',
					headingButtons: testButton
				});

				window.control.headingButtons([]);

				assert.equal(document.querySelectorAll('.' + TOOLBAR_BASE_CLASS).length, 0);
			});

			it('should NOT have a toolbar in the header if the button option is set to an empty array', () => {
				window.control = new Control({
					container: window.testContainer,
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
					container: window.testContainer
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
					container: window.testContainer,
					canCollapse: true
				},
				defaultValue: false,
				testValue: true
			});
		});
	};
}
