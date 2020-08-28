import { assert } from 'type-enforcer';
import extendsTestRegister from '../extendsTestRegister.js';
import ExtendsTestRunner, { CONTROL, TEST_UTIL } from '../ExtendsTestRunner.js';

const TEST_TITLE = 'Test <br> Title &nbsp;';

export default class FormControlTests extends ExtendsTestRunner {
	isRequired() {
		const self = this;

		it('should default to false', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings());

			assert.is(self[TEST_UTIL].control.isRequired(), false);
		});

		it('should have a required class if set to true and a title is provided', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				title: TEST_TITLE
			}))
				.isRequired(true);

			assert.is(self[TEST_UTIL].count('.required'), 1);
		});

		it('should be true if it was set to true in the options', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				title: TEST_TITLE,
				isRequired: true
			}));

			assert.is(self[TEST_UTIL].control.isRequired(), true);
		});

		it('should NOT have a required class if set to false', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings())
				.isRequired(false);

			assert.is(self[TEST_UTIL].count('.required'), 0);
		});

		it('should be false if it was set to false in the options', () => {
			self[TEST_UTIL].control = new self[CONTROL](self.buildSettings({
				isRequired: false
			}));

			assert.is(self[TEST_UTIL].control.isRequired(), false);
		});
	}

	newline() {
		const self = this;

		self[TEST_UTIL].testMethod({
			methodName: 'newline',
			defaultSettings: {
				container: self[TEST_UTIL].container
			},
			defaultValue: false,
			testValue: true,
			testValueClass: 'newline'
		});
	}

	onChange(settings) {
		const self = this;

		it('should NOT call the callback when the value is set via the .value method', () => {
			let testValue = 0;

			settings.buildControl();
			self[TEST_UTIL].control.onChange(() => {
				testValue++;
			});

			self[TEST_UTIL].control.changeDelay(0);
			self[TEST_UTIL].control.value(settings.validValue);

			assert.is(testValue, 0);
		});

		it(
			'should call the callback when the value is set via the .value method and triggerChange is called',
			() => {
				let testValue = 0;

				settings.buildControl();
				self[TEST_UTIL].control.onChange(() => {
					testValue++;
				});

				self[TEST_UTIL].control.value(settings.validValue);
				self[TEST_UTIL].control.triggerChange(true);

				assert.is(testValue, 1);
			}
		);

		it('should call the callback when the value is set via the DOM', () => {
			let testValue = 0;

			settings.buildControl();
			self[TEST_UTIL].control.onChange(() => {
				testValue++;
			});

			self[TEST_UTIL].control.changeDelay(0);
			settings.setValueViaDom();

			assert.is(testValue, 1);
		});

		it(
			'should call the callback when the value is set via the DOM and triggerChange is called',
			() => {
				let testValue = 0;

				settings.buildControl();
				self[TEST_UTIL].control.onChange(() => {
					testValue++;
				});

				self[TEST_UTIL].control.changeDelay(0);
				settings.setValueViaDom();
				self[TEST_UTIL].control.triggerChange(true);

				assert.is(testValue, 2);
			}
		);

		if (!settings.skipSameValue) {
			it(
				'should NOT call the onChange callback when the value is set via the DOM to the same value',
				() => {
					let testValue = 0;

					settings.buildControl();
					self[TEST_UTIL].control.onChange(() => {
						testValue++;
					});

					self[TEST_UTIL].control.changeDelay(0);
					self[TEST_UTIL].control.value(settings.validValue);
					settings.setValueViaDom();

					assert.is(testValue, 1);
				}
			);
		}

		it('should call the callback when triggerChange is called', () => {
			let testValue = 0;

			settings.buildControl();
			self[TEST_UTIL].control.onChange(() => {
				testValue++;
			});

			self[TEST_UTIL].control.triggerChange(true);

			assert.is(testValue, 1);
		});
	}

	changeDelay() {
		const self = this;

		self[TEST_UTIL].testMethod({
			methodName: 'changeDelay',
			defaultSettings: {
				container: self[TEST_UTIL].container
			},
			defaultValue: 0,
			testValue: 200
		});
	}
}

extendsTestRegister.register('FormControl', FormControlTests);
