import { assert } from 'chai';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests';

export default function FormControlTests(Control, testUtil, settings) {
	const self = this;
	const TEST_ID = 'testId';
	const TEST_TITLE = 'Test <br> Title &nbsp;';

	ControlHeadingMixinTests.call(self, Control, testUtil, settings);

	self.isRequired = () => {
		describe('FormControl .isRequired', () => {
			it('should default to false', () => {
				testUtil.control = new Control({
					id: TEST_ID,
					container: testUtil.container
				});

				assert.equal(testUtil.control.isRequired(), false);
			});

			it('should have a required class if set to true and a title is provided', () => {
				testUtil.control = new Control({
					id: TEST_ID,
					title: TEST_TITLE,
					container: testUtil.container
				})
					.isRequired(true);

				assert.equal(document.querySelectorAll('.required').length, 1);
			});

			it('should be true if it was set to true in the options', () => {
				testUtil.control = new Control({
					id: TEST_ID,
					title: TEST_TITLE,
					container: testUtil.container,
					isRequired: true
				});

				assert.equal(testUtil.control.isRequired(), true);
			});

			it('should NOT have a required class if set to false', () => {
				testUtil.control = new Control({
					id: TEST_ID,
					container: testUtil.container
				})
					.isRequired(false);

				assert.equal(document.querySelectorAll('.required').length, 0);
			});

			it('should be false if it was set to false in the options', () => {
				testUtil.control = new Control({
					id: TEST_ID,
					container: testUtil.container,
					isRequired: false
				});

				assert.equal(testUtil.control.isRequired(), false);
			});
		});
	};

	self.newline = () => {
		describe('FormControl newline', () => {
			testUtil.testMethod({
				methodName: 'newline',
				defaultSettings: {
					container: testUtil.container
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
					testUtil.control.onChange(() => {
						testVar++;
					});

					testUtil.control.changeDelay(0);
					testUtil.control.value(settings.onChange.validValue);

					assert.equal(testVar, 0);
				});

				it('should call the onChange callback when the value is set via the .value method and triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					testUtil.control.onChange(() => {
						testVar++;
					});

					testUtil.control.value(settings.onChange.validValue);
					testUtil.control.triggerChange(true);

					assert.equal(testVar, 1);
				});

				it('should call the onChange callback when the value is set via the DOM', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					testUtil.control.onChange(() => {
						testVar++;
					});

					testUtil.control.changeDelay(0);
					settings.onChange.setValueViaDom();

					assert.equal(testVar, 1);
				});

				it('should call the onChange callback when the value is set via the DOM and triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					testUtil.control.onChange(() => {
						testVar++;
					});

					testUtil.control.changeDelay(0);
					settings.onChange.setValueViaDom();
					testUtil.control.triggerChange(true);

					assert.equal(testVar, 2);
				});

				if (!settings.onChange.skipSameValue) {
					it('should NOT call the onChange callback when the value is set via the DOM to the same value', () => {
						let testVar = 0;

						settings.onChange.buildControl();
						testUtil.control.onChange(() => {
							testVar++;
						});

						testUtil.control.changeDelay(0);
						testUtil.control.value(settings.onChange.validValue);
						settings.onChange.setValueViaDom();

						assert.equal(testVar, 1);
					});
				}

				it('should call the onChange callback when triggerChange is called', () => {
					let testVar = 0;

					settings.onChange.buildControl();
					testUtil.control.onChange(() => {
						testVar++;
					});

					testUtil.control.triggerChange(true);

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
					container: testUtil.container
				},
				defaultValue: 0,
				testValue: 200
			});
		});
	};

}
