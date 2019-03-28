import { assert } from 'chai';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

export default function FormControlTests(Control, testUtil, settings) {
	const self = this;
	const TEST_ID = 'testID';
	const TEST_TITLE = 'Test <br> Title &nbsp;';

	ControlHeadingMixinTests.call(self, Control, testUtil, settings);

	self.isRequired = () => {
		describe('FormControl .isRequired', () => {
			it('should default to false', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
					localizedStrings: {}
				});

				assert.equal(window.control.isRequired(), false);
			});

			it('should have a required class if set to true and a title is provided', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					container: window.testContainer,
					localizedStrings: {}
				})
					.isRequired(true);

				assert.equal(document.querySelectorAll('.required').length, 1);
			});

			it('should be true if it was set to true in the options', () => {
				window.control = new Control({
					ID: TEST_ID,
					title: TEST_TITLE,
					container: window.testContainer,
					isRequired: true,
					localizedStrings: {}
				});

				assert.equal(window.control.isRequired(), true);
			});

			it('should NOT have a required class if set to false', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
					localizedStrings: {}
				})
					.isRequired(false);

				assert.equal(document.querySelectorAll('.required').length, 0);
			});

			it('should be false if it was set to false in the options', () => {
				window.control = new Control({
					ID: TEST_ID,
					container: window.testContainer,
					isRequired: false,
					localizedStrings: {}
				});

				assert.equal(window.control.isRequired(), false);
			});
		});
	};

	self.newline = () => {
		describe('FormControl newline', () => {
			testUtil.testMethod({
				methodName: 'newline',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
				},
				defaultValue: false,
				testValue: true,
				testValueClass: 'newline'
			});
		});
	};

	self.onChange = (settings) => {
		if (settings.onChange) {
			describe('FormControl .onChange (+)', () => {
				it('should NOT call the onChange callback when the value is set via the .value method', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					window.control.onChange(() => {
						testVar++;
					});

					window.control.changeDelay(0);
					window.control.value(settings.onChange.validValue);

					assert.equal(testVar, 0);
				});

				it('should call the onChange callback when the value is set via the .value method and triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					window.control.onChange(() => {
						testVar++;
					});

					window.control.value(settings.onChange.validValue);
					window.control.triggerChange(true);

					assert.equal(testVar, 1);
				});

				it('should call the onChange callback when the value is set via the DOM', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					window.control.onChange(() => {
						testVar++;
					});

					window.control.changeDelay(0);
					settings.onChange.setValueViaDom();

					assert.equal(testVar, 1);
				});

				it('should call the onChange callback when the value is set via the DOM and triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					window.control.onChange(() => {
						testVar++;
					});

					window.control.changeDelay(0);
					settings.onChange.setValueViaDom();
					window.control.triggerChange(true);

					assert.equal(testVar, 2);
				});

				if (!settings.onChange.skipSameValue) {
					it('should NOT call the onChange callback when the value is set via the DOM to the same value', () => {
						let testVar = 0;

						settings.onChange.buildControl();
						window.control.onChange(() => {
							testVar++;
						});

						window.control.changeDelay(0);
						window.control.value(settings.onChange.validValue);
						settings.onChange.setValueViaDom();

						assert.equal(testVar, 1);
					});
				}

				it('should call the onChange callback when triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					window.control.onChange(() => {
						testVar++;
					});

					window.control.triggerChange(true);

					assert.equal(testVar, 1);
				});
			});
		}
	};

	self.changeDelay = () => {
		describe('FormControl .changeDelay', () => {
			testUtil.testMethod({
				methodName: 'changeDelay',
				defaultSettings: {
					container: window.testContainer,
					localizedStrings: {}
				},
				defaultValue: 0,
				testValue: 200
			});
		});
	};

}
