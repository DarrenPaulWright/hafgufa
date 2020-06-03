import { assert } from 'type-enforcer';
import ControlTests from '../ControlTests';

const TEST_ICON_FA = 'trash';
const TEST_TITLE = 'Test Title';
const SUB_TITLE = 'Test Sub Title';
const TITLE_ELEMENT_CLASS = '.heading > .title-container > span';
const SUB_TITLE_ELEMENT_CLASS = '.subtitle';
const ERROR_MESSAGE = 'There was an error!!!';
const ERROR_MESSAGE_ICON = '';
const ERROR_MESSAGE_ELEMENT_CLASS = '.error';

const CONTROL = Symbol();
const TEST_UTIL = Symbol();

export default class ControlHeadingMixinTests extends ControlTests {
	constructor(Control, testUtil, settings = {}) {
		super(Control, testUtil, settings);

		const self = this;

		self[CONTROL] = Control;
		self[TEST_UTIL] = testUtil;
	}

	icon() {
		const self = this;

		describe('ControlHeadingAddon .icon', () => {
			it('should show a font-awesome icon as provided', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: 'Test Title',
					headingIcon: TEST_ICON_FA
				}));

				assert.is(self[TEST_UTIL].count('.fa-' + TEST_ICON_FA), 1);
			});

			it('should NOT have an icon element if icon is set to an empty string', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					headingIcon: ''
				}));

				assert.is(self[TEST_UTIL].count('.fa-' + TEST_ICON_FA), 0);
			});
		});
	}

	title() {
		const self = this;

		describe('ControlHeadingAddon .title', () => {
			it('should show a title as provided', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE
				}));

				assert.is(self[TEST_UTIL].first(TITLE_ELEMENT_CLASS).textContent, TEST_TITLE);
			});

			it('should have an empty title element if the title is set to an empty string', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE
				}));

				const totalHeadings = self[TEST_UTIL].count('.heading');

				self[TEST_UTIL].control.title('');

				assert.is(totalHeadings - self[TEST_UTIL].count('.heading'), 1);
			});
		});
	}

	subTitle() {
		const self = this;

		describe('ControlHeadingAddon .subTitle', () => {
			it('should show a subTitle as provided if a title is also provided', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE,
					subTitle: SUB_TITLE
				}));

				assert.is(self[TEST_UTIL].first(SUB_TITLE_ELEMENT_CLASS).textContent, SUB_TITLE);
			});
		});
	}

	error() {
		const self = this;

		describe('ControlHeadingAddon .error', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'error',
				defaultSettings: {
					container: self[TEST_UTIL].container,
					title: TEST_TITLE
				},
				defaultValue: '',
				testValue: 'Test Error Message',
				secondTestValue: 'Another Error Message'
			});

			it('should NOT show an error message if "error" is not called', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE
				}));

				assert.is(self[TEST_UTIL].count(ERROR_MESSAGE_ELEMENT_CLASS), 0);
			});

			it('should show an error message when "error" is called', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE
				}))
					.error(ERROR_MESSAGE);

				assert.is(
					self[TEST_UTIL].first(ERROR_MESSAGE_ELEMENT_CLASS).textContent,
					ERROR_MESSAGE_ICON + ERROR_MESSAGE
				);
			});

			it('should NOT show an error message when error is set to "" after "error"', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: TEST_TITLE
				}))
					.error(ERROR_MESSAGE)
					.error('');

				assert.is(self[TEST_UTIL].count(ERROR_MESSAGE_ELEMENT_CLASS), 0);
			});
		});
	}

	singleLine() {
		const self = this;

		describe('ControlHeadingAddon .singleLine', () => {
			const SINGLE_LINE_CLASS = 'single-line';

			self[TEST_UTIL].testMethod({
				methodName: 'singleLine',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: false,
				testValue: true,
				testValueClass: SINGLE_LINE_CLASS
			});
		});
	}

	headingButtons() {
		const self = this;

		describe('ControlHeadingAddon .headingButtons', () => {
			const testButton = [{
				icon: 'circle'
			}];
			const TOOLBAR_BASE_CLASS = 'toolbar';

			self[TEST_UTIL].testMethod({
				methodName: 'headingButtons',
				defaultValue: [],
				testValue: testButton,
				secondTestValue: []
			});

			it('should have a toolbar in the header if the button option is set', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: 'Test For Buttons',
					headingButtons: testButton
				}));

				assert.is(self[TEST_UTIL].count('.' + TOOLBAR_BASE_CLASS), 1);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to empty array', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: 'Test For Buttons',
					headingButtons: testButton
				}));

				self[TEST_UTIL].control.headingButtons([]);

				assert.is(self[TEST_UTIL].count('.' + TOOLBAR_BASE_CLASS), 0);
			});

			it('should NOT have a toolbar in the header if the button option is set then set to an empty array', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: 'Test For Buttons',
					headingButtons: testButton
				}));

				self[TEST_UTIL].control.headingButtons([]);

				assert.is(self[TEST_UTIL].count('.' + TOOLBAR_BASE_CLASS), 0);
			});

			it('should NOT have a toolbar in the header if the button option is set to an empty array', () => {
				self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
					title: 'Test For Buttons',
					headingButtons: []
				}));

				assert.is(self[TEST_UTIL].count('.' + TOOLBAR_BASE_CLASS), 0);
			});
		});
	}

	canCollapse() {
		const self = this;

		describe('ControlHeadingAddon .canCollapse', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'canCollapse',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: false,
				testValue: true
			});
		});
	}

	isCollapsed() {
		const self = this;

		describe('ControlHeadingAddon .isCollapsed', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'isCollapsed',
				defaultSettings: {
					container: self[TEST_UTIL].container,
					canCollapse: true
				},
				defaultValue: false,
				testValue: true
			});
		});
	}
}
