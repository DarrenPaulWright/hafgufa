import { assert } from 'type-enforcer';
import ControlHeadingMixinTests from '../mixins/ControlHeadingMixinTests.js';

const TEST_TITLE = 'Test <br> Title &nbsp;';

const CONTROL = Symbol();
const TEST_UTIL = Symbol();

export default class FormControlTests extends ControlHeadingMixinTests {
	constructor(Control, testUtil, settings) {
		super(Control, testUtil, settings);

		const self = this;

		self[CONTROL] = Control;
		self[TEST_UTIL] = testUtil;
	}

	isRequired() {
		const self = this;

		describe('FormControl .isRequired', () => {
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
		});
	}

	newline() {
		const self = this;

		describe('FormControl newline', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'newline',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: false,
				testValue: true,
				testValueClass: 'newline'
			});
		});
	}

	onChange(settings) {
		const self = this;

		if (settings.onChange) {
			describe('FormControl .onChange (+)', () => {
				it('should NOT call the onChange callback when the value is set via the .value method', () => {
					let testValue = 0;

					settings.onChange.buildControl();
					self[TEST_UTIL].control.onChange(() => {
						testValue++;
					});

					self[TEST_UTIL].control.changeDelay(0);
					self[TEST_UTIL].control.value(settings.onChange.validValue);

					assert.is(testValue, 0);
				});

				it(
					'should call the onChange callback when the value is set via the .value method and triggerChange is called',
					() => {
						let testValue = 0;

						settings.onChange.buildControl();
						self[TEST_UTIL].control.onChange(() => {
							testValue++;
						});

						self[TEST_UTIL].control.value(settings.onChange.validValue);
						self[TEST_UTIL].control.triggerChange(true);

						assert.is(testValue, 1);
					}
				);

				it('should call the onChange callback when the value is set via the DOM', () => {
					let testValue = 0;

					settings.onChange.buildControl();
					self[TEST_UTIL].control.onChange(() => {
						testValue++;
					});

					self[TEST_UTIL].control.changeDelay(0);
					settings.onChange.setValueViaDom();

					assert.is(testValue, 1);
				});

				it(
					'should call the onChange callback when the value is set via the DOM and triggerChange is called',
					() => {
						let testValue = 0;

						settings.onChange.buildControl();
						self[TEST_UTIL].control.onChange(() => {
							testValue++;
						});

						self[TEST_UTIL].control.changeDelay(0);
						settings.onChange.setValueViaDom();
						self[TEST_UTIL].control.triggerChange(true);

						assert.is(testValue, 2);
					}
				);

				if (!settings.onChange.skipSameValue) {
					it(
						'should NOT call the onChange callback when the value is set via the DOM to the same value',
						() => {
							let testValue = 0;

							settings.onChange.buildControl();
							self[TEST_UTIL].control.onChange(() => {
								testValue++;
							});

							self[TEST_UTIL].control.changeDelay(0);
							self[TEST_UTIL].control.value(settings.onChange.validValue);
							settings.onChange.setValueViaDom();

							assert.is(testValue, 1);
						}
					);
				}

				it('should call the onChange callback when triggerChange is called', () => {
					let testValue = 0;

					settings.onChange.buildControl();
					self[TEST_UTIL].control.onChange(() => {
						testValue++;
					});

					self[TEST_UTIL].control.triggerChange(true);

					assert.is(testValue, 1);
				});
			});
		}
	}

	changeDelay() {
		const self = this;

		describe('FormControl .changeDelay', () => {
			self[TEST_UTIL].testMethod({
				methodName: 'changeDelay',
				defaultSettings: {
					container: self[TEST_UTIL].container
				},
				defaultValue: 0,
				testValue: 200
			});
		});
	}
}
